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
| AI | OpenRouter + SiliconFlow | - |
| 存储 | Cloudflare R2 | - |
| 包管理 | pnpm | - |

## 项目目录结构详解

项目使用 **Route Groups（路由组）** 分离两套独立的布局系统：

```
mvpfast-web/
├── .claude/                    # Claude Code 配置
│   ├── skills/                 # 自定义技能
│   │   ├── project/            # 项目管理（init, add-page, add-route, explain_structure）
│   │   ├── auth/               # 认证（auth-flow, wechat-login）
│   │   ├── database/           # 数据库（design_data_model）
│   │   ├── deploy/             # 部署（check_env）
│   │   ├── seo/                # SEO（seo_config, dynamic_seo, structured_data）
│   │   └── ui/                 # UI（modify_ui）
│   └── settings.local.json     # 本地设置
│
├── content/                    # MDX 内容（Fumadocs）
│   ├── blog/                   # 博客文章
│   └── docs/                   # 文档页面
│
├── mcp/                        # Model Context Protocol 服务器
│   └── server.ts               # MCP 入口
│
├── scripts/                    # 开发/管理脚本
│   ├── init-project.ts         # 项目初始化（修改 env/i18n/theme/constants）
│   ├── generate-logo.ts        # SVG Logo 生成
│   ├── create-admin.ts         # 创建管理员
│   ├── create-test-data.ts     # 创建测试数据
│   ├── create-test-users.ts    # 创建测试用户
│   ├── cleanup-test-data.ts    # 清理测试数据
│   ├── test-api-integration.ts # API 集成测试
│   ├── test-redemption.ts      # 兑换码测试
│   └── verify-migration.ts     # 迁移验证
│
├── prisma/
│   └── schema.prisma           # 数据库模型定义（11 个模型）
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (fumadocs)/         # Fumadocs 路由组（文档和博客）
│   │   ├── (main)/             # 主应用路由组
│   │   ├── error.tsx           # 全局错误边界
│   │   ├── global-error.tsx    # 全局错误处理
│   │   ├── not-found.tsx       # 404 页面
│   │   ├── robots.ts           # robots.txt 生成
│   │   └── sitemap.ts          # sitemap.xml 生成
│   │
│   ├── auth.ts                 # NextAuth 配置（credentials + password + WeChat）
│   ├── components/             # React 组件
│   ├── config.ts               # 应用配置（登录方式等）
│   ├── constants/              # 常量定义
│   ├── hooks/                  # 自定义 Hooks
│   ├── i18n/                   # 国际化配置
│   ├── lib/                    # 工具库
│   ├── middleware.ts           # 路由中间件（i18n + RBAC）
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
├── vitest.config.ts            # Vitest 测试配置
├── Dockerfile                  # Docker 构建
└── docker-compose.yml          # Docker Compose 配置
```

---

## 路由组系统（Route Groups）

### 为什么使用路由组？

项目使用两套完全不同的布局系统：
- **Fumadocs**: 用于文档和博客，有自己的 UI 组件库
- **主应用**: 自定义布局，包含完整的 SEO、认证、国际化等

路由组让这两套系统完全独立，各自有自己的根布局（包含 `<html>` 和 `<body>` 标签）。

### 路由组结构

```
src/app/
├── (fumadocs)/                 # Fumadocs 路由组
│   ├── layout.tsx              # 根布局（含 html/body + fumadocs metadata）
│   ├── layout.config.ts        # Fumadocs 配置
│   ├── docs/                   # /docs/* 路由
│   │   ├── layout.tsx          # Docs 子布局
│   │   └── [...slug]/page.tsx  # 文档页面
│   └── blog/                   # /blog/* 路由
│       ├── layout.tsx          # Blog 子布局
│       ├── page.tsx            # 博客列表
│       └── [...slug]/page.tsx  # 博客文章
│
└── (main)/                     # 主应用路由组
    ├── layout.tsx              # 根布局（含 html/body + 完整 SEO metadata）
    ├── globals.css             # 全局样式（DaisyUI 主题色 --p）
    ├── [local]/                # 本地化路由 (/zh/*, /en/*)
    │   ├── layout.tsx          # 语言子布局（仅 metadata，无 html/body）
    │   ├── page.tsx            # 首页（Landing Page）
    │   ├── auth/signin/        # 登录页面
    │   ├── dashboard/          # 仪表板（受 RBAC 保护）
    │   │   ├── layout.tsx      # Dashboard 布局（侧边栏 + 顶栏）
    │   │   ├── home/           # 首页概览
    │   │   ├── users/          # 用户管理 (admin)
    │   │   ├── user/           # 单用户管理 (admin)
    │   │   ├── roles/          # 角色权限管理 (admin)
    │   │   ├── order/          # 订单管理 (admin)
    │   │   ├── my-orders/      # 我的订单
    │   │   ├── posts/          # 文章管理 (admin)
    │   │   ├── ai-chat/        # AI 对话
    │   │   ├── credits/        # 积分管理
    │   │   ├── redemption/     # 兑换码管理 (admin)
    │   │   ├── share/          # 推广分享
    │   │   ├── person/         # 个人资料
    │   │   ├── settings/system/# 系统设置 (admin)
    │   │   └── dbdemo/         # 数据库示例
    │   └── pay/                # 支付页面
    └── api/                    # API 路由
        ├── auth/[...nextauth]/ # NextAuth API
        ├── admin/              # 管理后台 API（需 RBAC 权限）
        │   ├── init/           # 系统初始化（自锁）
        │   ├── users/          # 用户 CRUD
        │   ├── posts/          # 文章 CRUD
        │   ├── orders/         # 订单管理
        │   ├── configs/        # 系统配置 CRUD
        │   ├── credits/        # 积分管理
        │   └── redemption-codes/ # 兑换码管理
        ├── user/               # 用户侧 API
        │   ├── orders/         # 我的订单
        │   ├── credits/        # 我的积分
        │   └── redeem/         # 兑换码使用
        ├── posts/              # 公开文章 API
        ├── search/             # 搜索 API
        ├── upload/             # 文件上传（R2）
        ├── openrouter/         # OpenRouter AI API
        ├── siliconflow/        # SiliconFlow AI API
        ├── wx/                 # 微信相关（OAuth、支付）
        ├── orders/             # 订单 API
        ├── yungou/             # 云购支付回调
        └── health/             # 健康检查
```

### 路由组对照表

| 路由组 | URL 路径 | 布局系统 | SEO | 说明 |
|--------|----------|----------|-----|------|
| `(fumadocs)` | `/docs/*`, `/blog/*` | Fumadocs UI | 独立配置 | 文档和博客 |
| `(main)` | `/zh/*`, `/en/*` | 自定义布局 | 完整 SEO | 主应用页面 |
| `(main)` | `/api/*` | 无布局 | 无 | API 端点 |

**重要**: 路由组名称（括号内的部分）不会出现在 URL 中。

---

## RBAC 权限系统

### 权限定义

| 权限 | 说明 | 角色 |
|------|------|------|
| `dashboard:access` | 访问控制台 | admin, user |
| `profile:edit` | 编辑个人资料 | admin, user |
| `order:own` | 查看自己的订单 | admin, user |
| `credit:own` | 查看自己的积分 | admin, user |
| `upload:create` | 上传文件 | admin, user |
| `ai:chat` | 使用 AI 对话 | admin, user |
| `user:list` | 查看用户列表 | admin |
| `user:edit` | 编辑用户信息 | admin |
| `order:list` | 查看所有订单 | admin |
| `order:delete` | 删除订单 | admin |
| `credit:adjust` | 调整用户积分 | admin |
| `post:manage` | 管理文章 | admin |
| `redemption:manage` | 管理兑换码 | admin |
| `system:manage` | 管理系统配置 | admin |

### 路由权限映射

Dashboard 路由根据 `ROUTE_PERMISSIONS` 映射自动检查权限：
- `/dashboard/users` → `user:list`
- `/dashboard/roles` → `user:edit`
- `/dashboard/order` → `order:list`
- `/dashboard/credits` → `credit:own`
- `/dashboard/redemption` → `redemption:manage`
- `/dashboard/posts` → `post:manage`
- `/dashboard/settings/system` → `system:manage`

### 权限检查方式

```ts
// API 路由中
import { requireAdmin, requirePermission } from '@/lib/auth-utils';

// 检查管理员权限
const session = await requireAdmin();

// 检查特定权限
const session = await requirePermission('post:manage');
```

---

## 数据库模型（Prisma）

### 模型清单

| 模型 | 说明 | 关键字段 |
|------|------|----------|
| `User` | 用户 | phone, email, password, role, credits, totalSpent |
| `Order` | 已完成订单 | orderId, orderType, price, creditAmount |
| `PayOrder` | 待支付订单 | 支付状态追踪 |
| `Promotion` | 推广追踪 | promoter, promotionPrice |
| `CreditTransaction` | 积分流水 | type(recharge/consume/refund), amount, balance |
| `SystemConfig` | 系统配置 | key, value, type, category |
| `ConfigAuditLog` | 配置审计日志 | configKey, action, oldValue, newValue |
| `RedemptionCode` | 兑换码 | code, creditAmount, batchId, maxUses |
| `RedemptionRecord` | 兑换记录 | codeId, userId |
| `Post` | 文章 | title, slug, content, status(draft/published) |
| `DbUserDemo` | 测试示例 | 开发用 |
| `VerificationCode` | 验证码 | identifier, code, expires_at |
| `VerificationWxQrCode` | 微信扫码 | scene_str, openid |

### 数据库操作函数（src/models/）

| 文件 | 主要功能 |
|------|----------|
| `user.ts` | 用户 CRUD、角色管理、统计 |
| `order.ts` | 订单 CRUD、搜索、统计 |
| `credit.ts` | 充值/消费/退款、流水查询、初始积分赠送 |
| `post.ts` | 文章 CRUD、发布管理、浏览计数 |
| `redemption.ts` | 兑换码生成/使用/批量管理 |
| `systemConfig.ts` | 配置 CRUD、缓存 |
| `configAuditLog.ts` | 审计日志记录 |

---

## 组件结构

```
src/components/
├── common/                    # 通用组件
│   └── ImageUpload.tsx            # 图片上传（R2）
│
├── landingpage/               # 首页组件
│   ├── HeroComponent.tsx          # 英雄区
│   ├── FeatureComponent.tsx       # 功能展示
│   ├── FeaturesCardComponent.tsx  # 功能卡片
│   ├── FeaturesGridComponent.tsx  # 功能网格
│   ├── PriceComponent.tsx         # 定价
│   ├── FaqComponents.tsx          # FAQ
│   ├── FaqListComponent.tsx       # FAQ 列表
│   ├── CaseComponent.tsx          # 案例
│   ├── BrandComponent.tsx         # 品牌
│   └── AdminComponent.tsx         # 管理入口
│
├── dashboard/                 # 仪表板组件
│   └── table.tsx                  # 数据表格
│
├── weChat/                    # 微信集成
│   ├── WeChatPc.tsx               # PC端微信扫码
│   ├── WeChatMobile.tsx           # 移动端微信登录
│   ├── WeChatPcPay.tsx            # PC 支付
│   ├── WeChatMobilePay.tsx        # 移动支付
│   └── WeChatH5Pay.tsx            # H5 支付
│
├── seo/                       # SEO 组件
├── theme/                     # 主题切换
├── analytics/                 # 分析组件
│
├── Header.tsx                 # 页头导航
├── Footer.tsx                 # 页脚
├── I18n.tsx                   # 语言切换
├── PayQrcode.tsx              # 支付二维码
├── ClipboardBtn.tsx           # 剪贴板按钮
└── PageProgressBar.tsx        # 页面加载进度条
```

---

## 工具库 (`src/lib/`)

### 核心库

| 文件 | 用途 |
|------|------|
| `prisma.ts` | Prisma 客户端单例 |
| `rbac.ts` | RBAC 权限系统（14 权限、2 角色） |
| `auth-utils.ts` | 认证工具（requireAdmin, requirePermission, getClientInfo） |
| `init-service.ts` | 系统初始化业务逻辑 |
| `config-service.ts` | 系统配置服务（缓存 + CRUD） |

### 功能库

| 文件 | 用途 |
|------|------|
| `pay.ts` | 微信支付核心逻辑 |
| `pay/sign.ts` | 支付签名工具 |
| `phone.ts` | 手机号处理/短信发送 |
| `email.ts` | 邮件发送 |
| `r2.ts` | Cloudflare R2 文件存储 |
| `seo.ts` | SEO 工具函数 |
| `generatorName.ts` | 随机昵称生成 |
| `utils.ts` | 通用工具函数 |
| `env.ts` | 环境变量验证 |

### 基础设施库（预置可用）

| 文件 | 用途 |
|------|------|
| `api-handler.ts` | API 统一处理器 |
| `api-logger.ts` | API 请求日志 |
| `api-security.ts` | API 安全验证 |
| `security.ts` | 安全工具函数 |
| `crypto.ts` | 加密解密 |
| `errors.ts` | 错误类型定义 |
| `logger.ts` | 日志工具（Pino） |
| `rateLimit.ts` | 速率限制 |

---

## API 结构详解

### API 分类

#### 管理后台 API（`/api/admin/*`，需 RBAC 权限）

| 端点 | 方法 | 描述 | 权限 |
|------|------|------|------|
| `/api/admin/init` | POST | 系统初始化（自锁） | 无需认证 |
| `/api/admin/users` | GET/POST | 用户列表/创建 | user:list |
| `/api/admin/users/[id]` | GET/PUT/DELETE | 用户详情/更新/删除 | user:edit |
| `/api/admin/users/[id]/credits` | POST | 调整用户积分 | credit:adjust |
| `/api/admin/posts` | GET/POST | 文章列表/创建 | post:manage |
| `/api/admin/posts/[id]` | GET/PUT/DELETE | 文章详情/更新/删除 | post:manage |
| `/api/admin/orders` | GET | 订单列表 | order:list |
| `/api/admin/configs` | GET/POST | 配置列表/创建 | system:manage |
| `/api/admin/configs/[key]` | GET/PUT/DELETE | 配置详情/更新/删除 | system:manage |
| `/api/admin/configs/public` | GET | 公开配置 | 无需认证 |
| `/api/admin/credits` | GET | 积分统计 | credit:adjust |
| `/api/admin/redemption-codes` | GET/POST | 兑换码列表/创建 | redemption:manage |
| `/api/admin/redemption-codes/[id]` | PUT/DELETE | 兑换码更新/删除 | redemption:manage |
| `/api/admin/redemption-codes/batch` | POST | 批量生成兑换码 | redemption:manage |

#### 用户侧 API（`/api/user/*`，需登录）

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/user/orders` | GET | 我的订单 |
| `/api/user/credits` | GET | 我的积分 |
| `/api/user/redeem` | POST | 使用兑换码 |

#### 公开 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/posts` | GET | 已发布文章列表 |
| `/api/posts/[slug]` | GET | 文章详情 |
| `/api/search` | GET | 搜索 |
| `/api/health` | GET | 健康检查 |
| `/api/upload` | POST | 文件上传（R2） |

#### AI API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/openrouter/chat` | POST | OpenRouter 对话 |
| `/api/openrouter/models` | GET | OpenRouter 模型列表 |
| `/api/siliconflow/chat` | POST | SiliconFlow 对话 |
| `/api/siliconflow/models` | GET | SiliconFlow 模型列表 |

#### 支付 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/wx/create-wechat-order` | POST | 创建微信支付订单 |
| `/api/wx/query-wechat-order` | GET | 查询支付状态 |
| `/api/wx/callback` | POST | 微信支付回调 |
| `/api/wx/code` | GET | 微信 QR 码 |
| `/api/yungou/notify` | POST | 云购支付回调 |
| `/api/orders` | GET | 订单列表 |

---

## SEO 配置说明

### 布局层级与 Metadata

```
(main)/layout.tsx          → 主应用全局 SEO（从 i18n messages 读取）
  └── [local]/layout.tsx   → 语言相关 metadata（locale, alternates）
        └── page.tsx       → 页面级 metadata（可选）

(fumadocs)/layout.tsx      → 文档/博客全局 SEO
  └── docs/layout.tsx      → 文档 metadata
  └── blog/layout.tsx      → 博客 metadata
```

### SEO 配置位置

| 配置 | 位置 |
|------|------|
| 主应用全局 SEO | `src/app/(main)/layout.tsx` |
| 语言相关 SEO | `src/app/(main)/[local]/layout.tsx` |
| SEO 文本内容 | `src/i18n/messages/*.json` |
| 文档/博客 SEO | `src/app/(fumadocs)/layout.tsx` |
| sitemap | `src/app/sitemap.ts`（使用 NEXT_PUBLIC_SITE_URL） |
| robots | `src/app/robots.ts` |

---

## 配置文件说明

### `next.config.mjs`

- MDX 支持（Fumadocs）
- 国际化插件（next-intl）
- 安全响应头配置
- 图片域名白名单
- CORS 配置

### `src/middleware.ts`

路由中间件，功能：
- i18n 路由处理
- RBAC 权限检查（dashboard 路由按 ROUTE_PERMISSIONS 映射）
- 受保护路由: `/pay/*`, `/dashboard/*`
- 公开路由: `/docs/*`, `/blog/*`, `/api/auth/*`, `/auth/signin`
- 开发模式跳过认证检查

### `prisma/schema.prisma`

数据库模型定义，11 个业务模型 + 2 个验证模型。

### `src/auth.ts`

NextAuth 配置：
- 凭证提供者（手机/邮箱验证码 + 密码登录 + 微信）
- JWT 会话策略
- Session 回调包含 role 字段（用于 RBAC）

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

# 项目脚本
npx tsx scripts/init-project.ts --name "项目名" --domain "example.com" --color "#6366f1"
npx tsx scripts/generate-logo.ts --name "项目名" --color "#6366f1"
npx tsx scripts/create-admin.ts
```

---

## 环境变量（参考 `.env.example`）

```env
# 数据库
DATABASE_URL="mongodb+srv://..."

# 认证
AUTH_SECRET="your-secret"
AUTH_URL="http://localhost:3000"

# 网站
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# AI（按需）
OPENROUTER_API_KEY="..."
SILICONFLOW_API_KEY="..."

# Cloudflare R2 存储（按需）
R2_ENDPOINT="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="..."
R2_PUBLIC_DOMAIN="..."

# 微信（按需）
NEXT_PUBLIC_WECHAT_APPID="..."
WECHAT_MCHID="..."
WECHAT_SERIAL_NO="..."
WECHAT_PRIVATE_KEY="..."

# 阿里云短信（按需）
ALIYUN_ACCESS_KEY_ID="..."
ALIYUN_ACCESS_KEY_SECRET="..."
ALIYUN_SMS_SIGN_NAME="..."
ALIYUN_SMS_TEMPLATE_CODE="..."

# 邮件（按需）
MAIL_HOST="..."
MAIL_PORT="..."
MAIL_USER="..."
MAIL_PASS="..."
```

---

## 关键文件快速定位

| 需求 | 文件位置 |
|------|----------|
| 修改认证逻辑 | `src/auth.ts` |
| 添加路由保护 | `src/middleware.ts` |
| 修改 RBAC 权限 | `src/lib/rbac.ts` |
| 修改权限检查工具 | `src/lib/auth-utils.ts` |
| 修改数据库模型 | `prisma/schema.prisma` |
| 添加管理 API | `src/app/(main)/api/admin/[name]/route.ts` |
| 添加用户 API | `src/app/(main)/api/user/[name]/route.ts` |
| 添加公开 API | `src/app/(main)/api/[name]/route.ts` |
| 添加页面 | `src/app/(main)/[local]/[name]/page.tsx` |
| 添加 Dashboard 页面 | `src/app/(main)/[local]/dashboard/[name]/page.tsx` |
| 添加组件 | `src/components/[category]/[Name].tsx` |
| 修改国际化 | `src/i18n/messages/[locale].json` |
| 添加全局样式 | `src/app/(main)/globals.css` |
| 修改主题色 | `src/app/(main)/globals.css` → `--p` 变量 |
| 修改主应用 SEO | `src/app/(main)/layout.tsx` |
| 修改文档 SEO | `src/app/(fumadocs)/layout.tsx` |
| 修改 sitemap | `src/app/sitemap.ts` |
| 修改 robots | `src/app/robots.ts` |
| 修改系统配置 | `src/lib/config-service.ts` + `src/models/systemConfig.ts` |
| 文件上传 | `src/lib/r2.ts` + `src/app/(main)/api/upload/route.ts` |
