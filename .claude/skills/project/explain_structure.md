---
name: explain_structure
description: 深入理解 mvpfast-web 项目结构、技术栈、路由系统、API 和配置文件
author: MvpFast
---

# MVPFast 项目结构指南

这个技能帮助 AI 全面理解 mvpfast-web 项目的架构和代码组织方式。

## 技术栈概览

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 15.3.2 |
| 语言 | TypeScript | 5.x |
| 前端 | React | 19.1.0 |
| CSS | Tailwind CSS + DaisyUI | 4.x + 5.x |
| 数据库 | MongoDB | via Prisma |
| ORM | Prisma | 5.14.0 |
| 认证 | NextAuth | 5.0.0-beta.20 |
| 国际化 | next-intl | 3.26.x |
| 文档/博客 | Fumadocs + MDX | 15.x |
| 状态管理 | Redux Toolkit | 2.2.6 |
| 包管理 | pnpm | - |

## 项目目录结构详解

```
mvpfast-web/
├── .claude/                    # Claude Code 配置
│   ├── skills/                 # 自定义技能
│   └── settings.local.json     # 本地设置
│
├── content/                    # MDX 内容（Fumadocs）
│   ├── blog/                   # 博客文章
│   └── docs/                   # 文档页面
│
├── mcp/                        # Model Context Protocol 服务器
│   └── server.ts               # MCP 入口
│
├── prisma/
│   └── schema.prisma           # 数据库模型定义
│
├── src/
│   ├── app/                    # Next.js App Router
│   ├── auth.ts                 # NextAuth 配置
│   ├── components/             # React 组件
│   ├── config.ts               # 应用配置
│   ├── constants/              # 常量定义
│   ├── hooks/                  # 自定义 Hooks
│   ├── i18n/                   # 国际化配置
│   ├── lib/                    # 工具库
│   ├── middleware.ts           # 路由中间件
│   ├── models/                 # 数据库操作函数
│   ├── services/               # 业务服务层
│   ├── store/                  # Redux 状态管理
│   ├── styles/                 # 全局样式
│   └── types/                  # TypeScript 类型定义
│
├── __tests__/                  # 测试文件
├── package.json                # 依赖和脚本
├── next.config.mjs             # Next.js 配置
├── tsconfig.json               # TypeScript 配置
├── tailwind.config.js          # Tailwind 配置（如有）
├── vitest.config.ts            # Vitest 测试配置
├── Dockerfile                  # Docker 构建
└── docker-compose.yml          # Docker Compose 配置
```

---

## 路由系统（App Router）

### 路由结构 `src/app/`

```
src/app/
├── [local]/                    # 动态语言路由段 (en, zh)
│   ├── layout.tsx              # 本地化根布局
│   ├── page.tsx                # 首页 (Landing Page)
│   │
│   ├── auth/                   # 认证相关
│   │   └── signin/
│   │       ├── page.tsx        # 登录页面
│   │       └── actions.ts      # Server Actions
│   │
│   ├── dashboard/              # 用户仪表板（受保护）
│   │   ├── layout.tsx          # Dashboard 布局（侧边栏等）
│   │   ├── home/page.tsx       # /dashboard/home
│   │   ├── order/page.tsx      # /dashboard/order
│   │   ├── share/page.tsx      # /dashboard/share
│   │   ├── user/page.tsx       # /dashboard/user
│   │   ├── person/page.tsx     # /dashboard/person
│   │   └── dbdemo/page.tsx     # /dashboard/dbdemo
│   │
│   └── pay/                    # 支付页面（受保护）
│       ├── page.tsx            # 支付页面
│       └── actions.tsx         # 支付 Server Actions
│
├── api/                        # API 路由
│   ├── auth/[...nextauth]/     # NextAuth API
│   ├── health/                 # 健康检查
│   ├── orders/                 # 订单 API
│   ├── wx/                     # 微信相关 API
│   └── yungou/                 # 云购相关
│
├── blog/                       # 博客（非本地化）
├── docs/                       # 文档（非本地化）
│
├── layout.tsx                  # 根布局
├── globals.css                 # 全局样式
├── error.tsx                   # 错误边界
├── global-error.tsx            # 全局错误处理
├── not-found.tsx               # 404 页面
├── robots.ts                   # robots.txt 生成
└── sitemap.ts                  # sitemap.xml 生成
```

### 添加新页面的方法

#### 1. 添加普通页面（需要国际化）

在 `src/app/[local]/` 下创建文件夹和 `page.tsx`：

```bash
# 例如添加 /about 页面
mkdir -p src/app/[local]/about
touch src/app/[local]/about/page.tsx
```

```tsx
// src/app/[local]/about/page.tsx
export default function AboutPage() {
  return <div>关于我们</div>;
}
```

#### 2. 添加受保护页面（需要登录）

1. 在 `src/app/[local]/dashboard/` 下创建
2. 会自动继承 dashboard 的布局和认证保护
3. 或在 `middleware.ts` 的 `protectedRoutes` 数组中添加路径

```tsx
// 在 middleware.ts 中添加保护
const protectedRoutes = ['/pay', '/dashboard', '/new-protected-route'];
```

#### 3. 添加 API 端点

在 `src/app/api/` 下创建 `route.ts`：

```bash
mkdir -p src/app/api/my-endpoint
touch src/app/api/my-endpoint/route.ts
```

```ts
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

---

## API 结构详解

### API 位置

所有 API 端点位于 `src/app/api/`

### 现有 API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/[...nextauth]` | ALL | NextAuth 认证 API |
| `/api/health` | GET | 健康检查（用于部署监控） |
| `/api/orders` | GET/POST | 订单管理 |
| `/api/wx/*` | - | 微信相关（支付、OAuth） |
| `/api/yungou/*` | - | 云购业务 |

### API 开发约定

1. **文件命名**: 始终使用 `route.ts`
2. **导出方法**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
3. **使用工具库**:
   - `src/lib/api-handler.ts` - 统一 API 处理
   - `src/lib/api-logger.ts` - API 日志
   - `src/lib/api-security.ts` - 安全验证
   - `src/lib/rateLimit.ts` - 速率限制

---

## 配置文件说明

### `next.config.mjs`

Next.js 主配置，包含：
- MDX 支持（Fumadocs）
- 国际化插件（next-intl）
- 安全响应头配置
- 图片域名白名单
- CORS 配置

### `tsconfig.json`

TypeScript 配置：
- 路径别名: `@/*` → `./src/*`
- Prisma 客户端路径
- 严格模式开启

### `prisma/schema.prisma`

数据库模型定义，关键模型：
- `User`: 用户（手机/邮箱/微信认证）
- `Order`: 已完成订单
- `PayOrder`: 待支付订单
- `Promotion`: 推广追踪
- `VerificationCode`: 验证码
- `VerificationWxQrCode`: 微信扫码

### `src/auth.ts`

NextAuth 配置：
- 凭证提供者（手机/邮箱/微信）
- JWT 会话策略
- Prisma 适配器
- 回调函数配置

### `src/middleware.ts`

路由中间件：
- 国际化路由处理
- 认证状态检查
- 受保护路由重定向
- 公开路由列表

### `src/i18n/routing.ts`

国际化路由配置：
- 支持语言: `['en', 'zh']`
- 默认语言: `'en'`
- 路径配置

---

## 组件结构

### `src/components/`

```
components/
├── landingpage/            # 首页组件
│   ├── HeroComponent.tsx       # 英雄区
│   ├── FeatureComponent.tsx    # 功能展示
│   ├── PriceComponent.tsx      # 定价
│   ├── FaqComponents.tsx       # FAQ
│   ├── CaseComponent.tsx       # 案例
│   ├── BrandComponent.tsx      # 品牌
│   └── AdminComponent.tsx      # 管理后台入口
│
├── dashboard/              # 仪表板组件
│   └── table.tsx               # 数据表格
│
├── weChat/                 # 微信集成
│   ├── WeChatMobile.tsx        # 移动端微信
│   ├── WeChatMobilePay.tsx     # 移动支付
│   ├── WeChatPcPay.tsx         # PC 支付
│   └── WeChatH5Pay.tsx         # H5 支付
│
├── seo/                    # SEO 组件
├── theme/                  # 主题切换
│
├── Header.tsx              # 页头导航
├── Footer.tsx              # 页脚
├── I18n.tsx                # 语言切换
├── PayQrcode.tsx           # 支付二维码
└── PageProgressBar.tsx     # 页面加载进度条
```

---

## 工具库 (`src/lib/`)

| 文件 | 用途 |
|------|------|
| `prisma.ts` | Prisma 客户端单例 |
| `pay.ts` | 支付核心逻辑 |
| `pay/sign.ts` | 支付签名 |
| `phone.ts` | 手机号处理/短信 |
| `email.ts` | 邮件发送 |
| `api-handler.ts` | API 统一处理器 |
| `api-logger.ts` | API 请求日志 |
| `api-security.ts` | API 安全验证 |
| `security.ts` | 安全工具函数 |
| `crypto.ts` | 加密解密 |
| `env.ts` | 环境变量验证 |
| `errors.ts` | 错误类型定义 |
| `logger.ts` | 日志工具（Pino） |
| `rateLimit.ts` | 速率限制 |
| `seo.ts` | SEO 工具 |
| `utils.ts` | 通用工具函数 |
| `generatorName.ts` | 随机昵称生成 |

---

## 数据库操作 (`src/models/`)

数据库操作函数存放位置，命名约定：`{action}{Table}{Type}`

```ts
// 示例
import prisma from "@/lib/prisma";

export async function getUserList(page = 1, limit = 10) {
  return prisma.user.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
}

export async function createOrder(data: OrderInput) {
  return prisma.order.create({ data });
}
```

---

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器 (localhost:3000)
pnpm dev:all          # 同时启动 dev + MCP 服务器

# 构建和部署
pnpm build            # 生产构建（包含 prisma generate）
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # ESLint 检查
pnpm test:run         # 运行测试
pnpm test:coverage    # 测试覆盖率

# Docker
pnpm docker:build     # 构建 Docker 镜像
pnpm docker:up        # 启动容器
pnpm docker:down      # 停止容器

# Prisma
npx prisma generate   # 生成 Prisma 客户端
npx prisma db push    # 推送 schema 到数据库
npx prisma studio     # 打开 Prisma Studio
```

---

## 开发指南快速参考

### 添加新功能的典型流程

1. **数据模型**: 更新 `prisma/schema.prisma`
2. **生成客户端**: `npx prisma generate`
3. **数据库函数**: 在 `src/models/` 添加操作函数
4. **API 端点**: 在 `src/app/api/` 创建 route.ts
5. **页面**: 在 `src/app/[local]/` 创建页面
6. **组件**: 在 `src/components/` 添加可复用组件
7. **国际化**: 在 `src/i18n/messages/` 添加文本

### 环境变量（参考 `.env.example`）

```env
# 数据库
DATABASE_URL="mongodb://..."

# NextAuth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# 微信
WECHAT_APP_ID="..."
WECHAT_APP_SECRET="..."

# 阿里云短信
ALIYUN_ACCESS_KEY_ID="..."
ALIYUN_ACCESS_KEY_SECRET="..."
```

---

## 关键文件快速定位

| 需求 | 文件位置 |
|------|----------|
| 修改认证逻辑 | `src/auth.ts` |
| 添加路由保护 | `src/middleware.ts` |
| 修改数据库模型 | `prisma/schema.prisma` |
| 添加 API | `src/app/api/[name]/route.ts` |
| 添加页面 | `src/app/[local]/[name]/page.tsx` |
| 添加组件 | `src/components/[category]/[Name].tsx` |
| 修改国际化 | `src/i18n/messages/[locale].json` |
| 添加全局样式 | `src/app/globals.css` |
| 修改 SEO | `src/lib/seo.ts`, `src/app/robots.ts`, `src/app/sitemap.ts` |
| 修改安全配置 | `next.config.mjs`, `src/lib/security.ts` |
