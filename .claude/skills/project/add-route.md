---
name: add-route
description: 指导 AI 如何在 mvpfast-web 项目中生成 API 路由、数据库模型和 Model 层
author: MvpFast
---

# API 路由生成指南

这个技能指导 AI 如何根据用户需求生成完整的后端 API，包括数据库模型、Model 层和 API 路由。

---

## 快速理解

当用户说类似以下需求时，使用本技能：
- "帮我创建一个反馈 API"
- "新增一个订单接口"
- "做一个用户管理的后端"
- "生成 CRUD 接口"

---

## 生成流程（完整后端）

```
1. 数据库模型 (prisma/schema.prisma)
       ↓
2. 生成 Prisma Client (npx prisma generate)
       ↓
3. Model 层 (src/models/[feature].ts)
       ↓
4. API 路由 (src/app/(main)/api/[feature]/route.ts)
   或 Server Actions (src/app/(main)/[local]/[feature]/actions.ts)
```

---

## API 路由分类

项目的 API 路由按访问权限分为三类：

| 分类 | 路径 | 权限要求 | 说明 |
|------|------|----------|------|
| 管理后台 | `/api/admin/[feature]` | RBAC 权限检查 | 管理员操作 |
| 用户侧 | `/api/user/[feature]` | 需要登录 | 用户自己的数据 |
| 公开 | `/api/[feature]` | 无需认证 | 公开访问 |

---

## 第一步：数据库模型

### 位置
`prisma/schema.prisma`

### 模板

```prisma
model Feedback {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  created_time DateTime @db.Date @default(now())

  // 业务字段
  name         String
  email        String
  phone        String?
  message      String
  status       String   @default("pending")  // pending, processing, resolved

  // 关联字段（可选）
  userId       String?  @db.ObjectId
}
```

### 字段类型对照

| Prisma 类型 | MongoDB 类型 | 说明 |
|-------------|-------------|------|
| `String` | string | 字符串 |
| `Int` | int | 整数 |
| `Float` | double | 浮点数 |
| `Boolean` | bool | 布尔值 |
| `DateTime` | date | 日期时间 |
| `String?` | string | 可选字符串 |
| `String[]` | array | 字符串数组 |
| `Json` | object | JSON 对象 |

### 常用修饰符

```prisma
@id                    // 主键
@default(auto())       // 自动生成 ID
@map("_id")           // 映射到 MongoDB _id
@db.ObjectId          // MongoDB ObjectId 类型
@default(now())       // 默认当前时间
@unique               // 唯一约束
@default("value")     // 默认值
@@unique([field1, field2])  // 复合唯一
@@index([field])      // 索引
```

### 添加模型后执行

```bash
npx prisma generate   # 生成 Prisma Client
npx prisma db push    # 推送到数据库（开发环境）
```

---

## 第二步：Model 层

### 位置
`src/models/[feature].ts`

### 模板

```ts
// src/models/feedback.ts
import prisma from '@/lib/prisma';
import { Feedback, Prisma } from '@prisma/client';

// 类型定义
export type FeedbackCreateInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  status?: string;
};

export type FeedbackUpdateInput = Partial<Omit<Feedback, 'id' | 'created_time'>>;

// 创建记录
export async function createFeedback(data: FeedbackCreateInput) {
  return prisma.feedback.create({
    data: {
      ...data,
      created_time: new Date(),
    },
  });
}

// 根据 ID 获取
export async function getFeedbackById(id: string) {
  return prisma.feedback.findUnique({
    where: { id },
  });
}

// 查询列表（带分页和搜索）
export async function getFeedbackList(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}) {
  const { page = 1, pageSize = 10, status, keyword } = params;
  const skip = (page - 1) * pageSize;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: 'insensitive' } },
      { email: { contains: keyword, mode: 'insensitive' } },
      { message: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.feedback.count({ where }),
    prisma.feedback.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { created_time: 'desc' },
    }),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

// 更新记录
export async function updateFeedback(id: string, data: FeedbackUpdateInput) {
  return prisma.feedback.update({
    where: { id },
    data,
  });
}

// 删除记录
export async function deleteFeedback(id: string) {
  return prisma.feedback.delete({
    where: { id },
  });
}
```

### 命名约定

| 操作 | 函数命名 | 示例 |
|------|---------|------|
| 创建 | `create{Model}` | `createFeedback` |
| 查询单个 | `get{Model}ById` | `getFeedbackById` |
| 查询列表 | `get{Model}List` | `getFeedbackList` |
| 更新 | `update{Model}` | `updateFeedback` |
| 删除 | `delete{Model}` | `deleteFeedback` |
| 批量删除 | `deleteMany{Model}s` | `deleteManyFeedbacks` |

---

## 第三步：API 路由

### 管理后台 API（需 RBAC 权限）

位置: `src/app/(main)/api/admin/[feature]/route.ts`

```ts
// src/app/(main)/api/admin/feedback/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth-utils';
import {
  createFeedback,
  getFeedbackList,
} from '@/models/feedback';

// GET - 获取列表（需权限）
export async function GET(request: NextRequest) {
  try {
    await requirePermission('feedback:manage');

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const status = searchParams.get('status') || undefined;
    const keyword = searchParams.get('keyword') || undefined;

    const result = await getFeedbackList({ page, pageSize, status, keyword });

    return NextResponse.json({
      code: 0,
      data: result,
      message: '获取成功',
    });
  } catch (error: any) {
    if (error?.message === 'Forbidden') {
      return NextResponse.json(
        { code: -1, data: null, message: '权限不足' },
        { status: 403 }
      );
    }
    console.error('获取反馈列表失败:', error);
    return NextResponse.json(
      { code: -1, data: null, message: '获取失败' },
      { status: 500 }
    );
  }
}

// POST - 创建
export async function POST(request: NextRequest) {
  try {
    await requirePermission('feedback:manage');

    const data = await request.json();

    // 验证必填字段
    const requiredFields = ['name', 'email', 'message'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { code: -1, data: null, message: `缺少必填字段: ${field}` },
          { status: 400 }
        );
      }
    }

    const feedback = await createFeedback(data);

    return NextResponse.json(
      { code: 0, data: feedback, message: '创建成功' },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.message === 'Forbidden') {
      return NextResponse.json(
        { code: -1, data: null, message: '权限不足' },
        { status: 403 }
      );
    }
    console.error('创建反馈失败:', error);
    return NextResponse.json(
      { code: -1, data: null, message: '创建失败' },
      { status: 500 }
    );
  }
}
```

### 用户侧 API（需登录）

位置: `src/app/(main)/api/user/[feature]/route.ts`

```ts
// src/app/(main)/api/user/feedback/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/auth';
import { createFeedback } from '@/models/feedback';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { code: -1, message: '请先登录' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const feedback = await createFeedback({
      ...data,
      userId: session.user.id,
    });

    return NextResponse.json(
      { code: 0, data: feedback, message: '提交成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('提交反馈失败:', error);
    return NextResponse.json(
      { code: -1, data: null, message: '提交失败' },
      { status: 500 }
    );
  }
}
```

### 公开 API（无需认证）

位置: `src/app/(main)/api/[feature]/route.ts`

```ts
// src/app/(main)/api/feedback/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { createFeedback } from '@/models/feedback';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 公开接口需要更严格的验证
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { code: -1, data: null, message: '请填写完整信息' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { code: -1, data: null, message: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    const feedback = await createFeedback(data);

    return NextResponse.json(
      { code: 0, data: feedback, message: '提交成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('创建反馈失败:', error);
    return NextResponse.json(
      { code: -1, data: null, message: '提交失败' },
      { status: 500 }
    );
  }
}
```

### 单个资源路由（[id]）

```ts
// src/app/(main)/api/admin/feedback/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { requirePermission } from '@/lib/auth-utils';
import {
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
} from '@/models/feedback';

// GET - 获取单个
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('feedback:manage');
    const feedback = await getFeedbackById(params.id);

    if (!feedback) {
      return NextResponse.json(
        { code: -1, data: null, message: '记录不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ code: 0, data: feedback, message: '获取成功' });
  } catch (error: any) {
    if (error?.message === 'Forbidden') {
      return NextResponse.json({ code: -1, message: '权限不足' }, { status: 403 });
    }
    return NextResponse.json({ code: -1, message: '获取失败' }, { status: 500 });
  }
}

// PUT - 更新
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('feedback:manage');
    const data = await request.json();

    const existing = await getFeedbackById(params.id);
    if (!existing) {
      return NextResponse.json(
        { code: -1, data: null, message: '记录不存在' },
        { status: 404 }
      );
    }

    const feedback = await updateFeedback(params.id, data);
    return NextResponse.json({ code: 0, data: feedback, message: '更新成功' });
  } catch (error: any) {
    if (error?.message === 'Forbidden') {
      return NextResponse.json({ code: -1, message: '权限不足' }, { status: 403 });
    }
    return NextResponse.json({ code: -1, message: '更新失败' }, { status: 500 });
  }
}

// DELETE - 删除
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission('feedback:manage');

    const existing = await getFeedbackById(params.id);
    if (!existing) {
      return NextResponse.json(
        { code: -1, data: null, message: '记录不存在' },
        { status: 404 }
      );
    }

    await deleteFeedback(params.id);
    return NextResponse.json({ code: 0, data: null, message: '删除成功' });
  } catch (error: any) {
    if (error?.message === 'Forbidden') {
      return NextResponse.json({ code: -1, message: '权限不足' }, { status: 403 });
    }
    return NextResponse.json({ code: -1, message: '删除失败' }, { status: 500 });
  }
}
```

---

## 或者使用 Server Actions

### 位置
`src/app/(main)/[local]/[feature]/actions.ts`

### 模板

```ts
'use server';
import { auth } from '@/auth';
import {
  createFeedback,
  getFeedbackList,
  updateFeedback,
  deleteFeedback,
} from '@/models/feedback';

// 响应类型
type ActionResponse<T = any> = {
  success: boolean;
  data?: T;
  message: string;
};

// 获取列表
export async function getList(
  page: number = 1,
  pageSize: number = 10,
  keyword: string = ''
) {
  return getFeedbackList({ page, pageSize, keyword });
}

// 提交反馈
export async function submitFeedback(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<ActionResponse> {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, message: '请填写完整信息' };
    }

    await createFeedback(data);
    return { success: true, message: '提交成功' };
  } catch (error) {
    console.error('提交反馈失败:', error);
    return { success: false, message: '提交失败，请稍后重试' };
  }
}
```

---

## RBAC 权限集成

### 添加新权限

如果新功能需要权限控制，需要更新 `src/lib/rbac.ts`：

```ts
// 1. 在 PERMISSIONS 中添加新权限
export const PERMISSIONS = {
  // ... 现有权限
  'feedback:manage': 'feedback:manage',
} as const;

// 2. 在 ROLE_PERMISSIONS 的 admin 角色中添加
admin: [
  // ... 现有权限
  PERMISSIONS['feedback:manage'],
],

// 3. 如果需要路由级权限检查，添加到 ROUTE_PERMISSIONS
export const ROUTE_PERMISSIONS: Record<string, string> = {
  // ... 现有映射
  '/dashboard/feedback': 'feedback:manage',
};
```

### 在 API 中使用

```ts
import { requirePermission, requireAdmin } from '@/lib/auth-utils';

// 检查特定权限
await requirePermission('feedback:manage');

// 检查管理员（拥有所有权限）
await requireAdmin();
```

---

## API 设计规范

### 响应格式

```ts
// 成功响应
{
  code: 0,
  data: { ... },
  message: '操作成功'
}

// 失败响应
{
  code: -1,
  data: null,
  message: '错误信息'
}

// 分页数据
{
  code: 0,
  data: {
    items: [...],
    pagination: {
      total: 100,
      page: 1,
      pageSize: 10,
      totalPages: 10
    }
  },
  message: '获取成功'
}
```

### HTTP 状态码

| 状态码 | 含义 | 使用场景 |
|--------|------|---------|
| 200 | 成功 | GET, PUT, DELETE 成功 |
| 201 | 已创建 | POST 成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未授权 | 需要登录 |
| 403 | 禁止访问 | RBAC 权限不足 |
| 404 | 不存在 | 资源不存在 |
| 500 | 服务器错误 | 服务端异常 |

---

## 生成检查清单

### 生成完整后端功能

- [ ] **确认数据字段和权限要求**
- [ ] **修改 `prisma/schema.prisma`** 添加模型
- [ ] **运行 `npx prisma generate`**
- [ ] **创建 `src/models/[feature].ts`** Model 层
- [ ] **创建 API 路由或 Server Actions**
  - 管理 API: `src/app/(main)/api/admin/[feature]/route.ts`
  - 用户 API: `src/app/(main)/api/user/[feature]/route.ts`
  - 公开 API: `src/app/(main)/api/[feature]/route.ts`
  - Server Actions: `src/app/(main)/[local]/[feature]/actions.ts`
- [ ] **如需 RBAC 权限**: 更新 `src/lib/rbac.ts`
- [ ] **测试接口**

### 文件结构示例（反馈功能）

```
prisma/
└── schema.prisma          # 添加 Feedback 模型

src/
├── lib/
│   └── rbac.ts            # 添加 feedback:manage 权限（如需）
│
├── models/
│   └── feedback.ts        # Model 层 CRUD
│
├── app/(main)/
│   ├── api/
│   │   ├── admin/feedback/
│   │   │   ├── route.ts       # 管理端 GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts   # 管理端 GET, PUT, DELETE
│   │   │
│   │   └── feedback/
│   │       └── route.ts       # 公开 POST（用户提交）
│   │
│   └── [local]/
│       └── dashboard/
│           └── feedback/
│               ├── page.tsx   # 后台列表
│               ├── actions.ts # 后台操作
│               └── modal/
│                   └── AddModal.tsx
```

---

## 高级用法

### 文件上传（Cloudflare R2）

```ts
import { uploadToR2 } from '@/lib/r2';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json(
      { code: -1, message: '请选择文件' },
      { status: 400 }
    );
  }

  const result = await uploadToR2(file, 'uploads');
  return NextResponse.json({ code: 0, data: result });
}
```

### MongoDB 聚合查询

```ts
// 在 model 层
export async function getStatistics() {
  return prisma.feedback.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });
}
```
