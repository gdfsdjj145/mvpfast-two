---
name: auth-flow
description: 指导 AI 理解和修改 mvpfast-web 项目的完整登录认证流程。用户说"修改登录"、"认证问题"、"权限问题"时使用。
author: MvpFast
user-invocable: true
---

# 登录认证流程指南

这个技能指导 AI 理解项目的完整登录认证系统，包括多种登录方式、RBAC 权限控制和 NextAuth 集成。

---

## 快速理解

当用户说类似以下需求时，使用本技能：
- "修改登录流程"
- "添加新的登录方式"
- "登录页面样式调整"
- "Session 相关问题"
- "用户认证问题"
- "权限不足/RBAC 问题"

---

## 支持的登录方式

| 登录方式 | 适用场景 | 实现方式 |
|---------|---------|---------|
| 邮箱+密码 | 通用 | bcrypt 密码验证 |
| 微信扫码 | PC 端 | WxLogin SDK + 开放平台 |
| 微信快捷登录 | 移动端 | 公众号 OAuth |
| 手机验证码 | 通用 | 阿里云短信 |
| 邮箱验证码 | 通用 | SMTP 邮件 |

---

## 核心文件

```
src/
├── auth.ts                              # ⭐ NextAuth 主配置（含 password 提供者）
├── middleware.ts                        # 路由保护中间件（i18n + RBAC）
├── lib/
│   ├── rbac.ts                          # ⭐ RBAC 权限定义（角色、权限、路由映射）
│   ├── auth-utils.ts                    # ⭐ 权限检查工具（requireAdmin, requirePermission）
│   └── init-service.ts                  # 系统初始化（创建 admin 账号）
├── components/
│   └── weChat/
│       ├── WeChatPc.tsx                 # PC端微信扫码
│       └── WeChatMobile.tsx             # 移动端微信登录
├── app/(main)/
│   ├── [local]/auth/signin/
│   │   ├── page.tsx                     # ⭐ 登录页面
│   │   └── actions.ts                   # 验证码发送/校验
│   └── api/
│       ├── auth/[...nextauth]/route.ts  # NextAuth API
│       └── wx/callback/route.ts         # 微信回调
├── config.ts                            # 登录方式配置
└── models/
    └── user.ts                          # 用户模型（含 role 字段）

prisma/schema.prisma                     # User 模型（含 password, role, credits）
```

---

## 认证架构

```
用户请求
  ↓
middleware.ts（路由中间件）
  ├── 公开路由 → 直接通过
  ├── 受保护路由 → 检查 session
  │   ├── 无 session → 重定向到 /auth/signin
  │   └── 有 session → RBAC 权限检查
  │       ├── 有权限 → 通过
  │       └── 无权限 → 403 重定向
  └── API 路由
      ├── auth() 获取 session
      ├── requireAdmin() 检查管理员
      └── requirePermission('xxx') 检查特定权限
```

---

## RBAC 权限系统

### 角色

| 角色 | 说明 | 权限 |
|------|------|------|
| `admin` | 管理员 | 所有权限 |
| `user` | 普通用户 | dashboard:access, profile:edit, order:own, credit:own, upload:create, ai:chat |

### 权限检查工具

```ts
// src/lib/auth-utils.ts

// 获取当前用户角色
const role = await getSessionRole(); // 'admin' | 'user' | null

// 检查是否管理员（抛异常）
const session = await requireAdmin();

// 检查是否管理员（不抛异常）
const isAdminUser = await isAdmin(); // boolean

// 检查特定权限（抛异常）
const session = await requirePermission('post:manage');

// 获取客户端信息（IP、User-Agent）
const { ip, userAgent } = getClientInfo(request);
```

### 路由级权限映射

在 `src/lib/rbac.ts` 中定义 `ROUTE_PERMISSIONS`，middleware 自动检查：

```ts
export const ROUTE_PERMISSIONS: Record<string, string> = {
  '/dashboard/users': 'user:list',
  '/dashboard/roles': 'user:edit',
  '/dashboard/order': 'order:list',
  '/dashboard/credits': 'credit:own',
  '/dashboard/redemption': 'redemption:manage',
  '/dashboard/posts': 'post:manage',
  '/dashboard/settings/system': 'system:manage',
};
```

---

## 登录页面配置

**位置**: `src/config.ts`

```ts
export const config = {
  loginType: 'wx',                    // 默认登录方式
  loginTypes: ['wx', 'phone', 'email'], // 可用的登录方式
};
```

---

## NextAuth 配置

**位置**: `src/auth.ts`

关键配置：
- **Credentials 提供者**: 支持验证码登录（phone/email + code）和密码登录（email + password）
- **Session 策略**: JWT（token 中包含 role 字段）
- **回调**:
  - `jwt`: 将 user.id 写入 token.sub
  - `session`: 从数据库读取完整用户信息（含 role），写入 session

```ts
// session.user 结构
{
  id: string;
  email: string | null;
  phone: string | null;
  wechatOpenId: string | null;
  wechatUnionId: string | null;
  nickName: string;
  avatar: string | null;
  role: string;        // 'admin' | 'user'
  credits: number;     // 积分余额
}
```

---

## User 数据模型

**位置**: `prisma/schema.prisma`

```prisma
model User {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  avatar        String?
  created_time  DateTime @db.Date @default(now())
  credits       Int      @default(0)          // 积分余额
  email         String?
  nickName      String
  password      String?                       // bcrypt 哈希密码
  phone         String?
  role          String   @default("user")     // 'admin' | 'user'
  totalSpent    Float    @default(0)          // 累计消费
  wechatOpenId  String?
  wechatUnionId String?

  @@unique([wechatOpenId, phone, email])
}
```

---

## 验证码 Server Actions

**位置**: `src/app/(main)/[local]/auth/signin/actions.ts`

```ts
'use server';

// 发送验证码
export async function sendCode(
  type: string,              // 'phone' | 'email'
  params: { identifier: string }
) {
  // 生成 6 位验证码
  // 存入 VerificationCode 表（5 分钟过期）
  // 通过短信或邮件发送
}

// 验证码校验
export async function verifyCode(
  type: string,
  params: { identifier: string; code: string }
) {
  // 查询未过期的验证码
  // 返回 true/false
}
```

---

## 获取当前用户

### 服务端（Server Component / API Route）

```ts
import { auth } from '@/auth';

// Server Component
export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return <div>欢迎, {session.user.nickName}</div>;
}

// API Route
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  // session.user.role 可判断角色
}
```

### 客户端

```tsx
'use client';
import { useSession } from 'next-auth/react';

export function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>加载中...</div>;
  if (!session) return <div>未登录</div>;

  return (
    <div>
      欢迎, {session.user.nickName}
      {session.user.role === 'admin' && <span>（管理员）</span>}
    </div>
  );
}
```

---

## 登出

```tsx
import { signOut } from 'next-auth/react';

<button onClick={() => signOut({ callbackUrl: '/' })}>
  退出登录
</button>
```

---

## 受保护路由

### Middleware 保护

`src/middleware.ts` 中的配置：

```ts
// 受保护路由（需要登录）
const protectedRoutes = ['/pay', '/dashboard'];

// 公开路由（无需登录）
const publicRoutes = ['/docs', '/blog', '/api/auth', '/auth/signin'];
```

### Dashboard RBAC 保护

Dashboard 路由自动通过 `ROUTE_PERMISSIONS` 映射检查权限。无权限时重定向到首页。

---

## 环境变量

```bash
# Auth（必需）
AUTH_SECRET=your-secret-key
AUTH_URL=https://www.example.com

# 网站 URL
NEXT_PUBLIC_SITE_URL=https://www.example.com

# 微信开放平台 (PC端扫码)
NEXT_PUBLIC_WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPID=wxxxxxxxxxxx
WECHAT_OPEN_APPSECRET=xxxxxxxxxxxxxxxx

# 微信公众号 (移动端)
NEXT_PUBLIC_WECHAT_APPID=wxxxxxxxxxxx

# 阿里云短信
ALIYUN_ACCESS_KEY_ID=your-key-id
ALIYUN_ACCESS_KEY_SECRET=your-key-secret
ALIYUN_SMS_SIGN_NAME=签名名称
ALIYUN_SMS_TEMPLATE_CODE=SMS_xxxxxxxx

# 邮件
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_USER=user@example.com
MAIL_PASS=password
```

---

## 添加新登录方式

1. 在 `config.loginTypes` 添加新类型
2. 在登录页面 `LOGIN_HASH` 添加显示文字
3. 在 `auth.ts` 的 `authorize` 函数添加处理逻辑
4. 如需要，创建对应的验证/发送逻辑

---

## 添加新的 RBAC 权限

1. 在 `src/lib/rbac.ts` 的 `PERMISSIONS` 中添加新权限
2. 在 `ROLE_PERMISSIONS` 中分配给相应角色
3. 如需路由级保护，添加到 `ROUTE_PERMISSIONS`
4. 在 API 路由中使用 `requirePermission('new:permission')`

---

## 修改检查清单

- [ ] `src/config.ts` - 登录方式配置
- [ ] `src/app/(main)/[local]/auth/signin/page.tsx` - 登录页面
- [ ] `src/app/(main)/[local]/auth/signin/actions.ts` - 验证码逻辑
- [ ] `src/auth.ts` - NextAuth 配置
- [ ] `src/lib/rbac.ts` - RBAC 权限定义
- [ ] `src/lib/auth-utils.ts` - 权限检查工具
- [ ] `src/middleware.ts` - 路由保护
- [ ] `src/components/weChat/` - 微信组件
- [ ] `prisma/schema.prisma` - 用户模型
- [ ] `.env` - 环境变量
