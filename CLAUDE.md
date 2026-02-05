# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

**mvpfast-web** is a full-stack SaaS template built with Next.js 15 (App Router), designed for rapid MVP development with Chinese market integrations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Frontend**: React 19, Tailwind CSS 4, DaisyUI 5
- **Database**: MongoDB via Prisma ORM
- **Auth**: NextAuth 5 (credentials, WeChat, phone/email) + RBAC
- **i18n**: next-intl (zh/en)
- **State**: Redux Toolkit
- **Docs/Blog**: Fumadocs with MDX
- **AI**: OpenRouter / SiliconFlow LLM
- **Storage**: Cloudflare R2
- **Package Manager**: pnpm

## Project Structure

项目使用 **Route Groups（路由组）** 分离两套独立的布局系统：

```
src/
├── app/
│   ├── (fumadocs)/           # Fumadocs 路由组（文档和博客）
│   │   ├── layout.tsx        # Fumadocs 根布局（含 html/body）
│   │   ├── layout.config.ts  # Fumadocs 配置
│   │   ├── docs/             # 文档页面 (/docs/*)
│   │   └── blog/             # 博客页面 (/blog/*)
│   │
│   ├── (main)/               # 主应用路由组
│   │   ├── layout.tsx        # 主应用根布局（含 html/body + SEO metadata）
│   │   ├── globals.css       # 全局样式 + DaisyUI 主题色
│   │   ├── [local]/          # 本地化路由 (/zh/*, /en/*)
│   │   │   ├── layout.tsx    # 语言子布局
│   │   │   ├── page.tsx      # 首页 Landing Page
│   │   │   ├── 403/          # 无权限页面
│   │   │   ├── auth/         # 认证（signin, signup）
│   │   │   ├── dashboard/    # 后台管理（受保护 + RBAC）
│   │   │   │   ├── layout.tsx      # Dashboard 布局 + 侧边栏
│   │   │   │   ├── home/           # 仪表盘首页
│   │   │   │   ├── users/          # 用户管理 (admin)
│   │   │   │   ├── roles/          # 角色管理 (admin)
│   │   │   │   ├── order/          # 订单管理 (admin)
│   │   │   │   ├── credits/        # 积分管理
│   │   │   │   ├── posts/          # 文章管理 (admin)
│   │   │   │   ├── redemption/     # 兑换码管理 (admin)
│   │   │   │   ├── settings/system/# 系统配置 (admin)
│   │   │   │   ├── ai-chat/        # AI 对话
│   │   │   │   ├── person/         # 个人信息
│   │   │   │   ├── my-orders/      # 我的订单
│   │   │   │   ├── share/          # 推广分享
│   │   │   │   └── user/           # 用户详情
│   │   │   └── pay/          # 支付页面
│   │   └── api/              # API 路由
│   │       ├── admin/        # 管理员 API (需鉴权)
│   │       │   ├── init/     # 项目初始化
│   │       │   ├── users/    # 用户 CRUD + 积分调整
│   │       │   ├── configs/  # 系统配置 CRUD + 审计
│   │       │   ├── posts/    # 文章 CRUD
│   │       │   ├── orders/   # 订单查询
│   │       │   ├── credits/  # 积分交易查询
│   │       │   └── redemption-codes/ # 兑换码管理
│   │       ├── user/         # 用户 API (需登录)
│   │       ├── wx/           # 微信（支付 + OAuth）
│   │       ├── openrouter/   # OpenRouter AI
│   │       ├── siliconflow/  # SiliconFlow AI
│   │       ├── upload/       # R2 文件上传
│   │       └── posts/        # 公开文章 API
│   │
│   ├── robots.ts             # robots.txt
│   └── sitemap.ts            # sitemap.xml
│
├── components/               # React 组件
│   ├── landingpage/          # 首页组件（Hero, Feature, Price, FAQ 等）
│   ├── weChat/               # 微信登录/支付组件
│   ├── seo/                  # JSON-LD 结构化数据
│   ├── theme/                # 主题切换
│   ├── dashboard/            # 后台组件（table 等）
│   ├── common/               # 通用组件（ImageUpload 等）
│   ├── analytics/            # Google Analytics
│   ├── Header.tsx            # 页头导航
│   ├── Footer.tsx            # 页脚
│   └── I18n.tsx              # 语言切换
│
├── models/                   # 数据库操作函数
│   ├── user.ts               # 用户 CRUD + 角色
│   ├── order.ts              # 订单管理
│   ├── credit.ts             # 积分系统（交易、赠送、消费）
│   ├── post.ts               # 文章 CRUD
│   ├── redemption.ts         # 兑换码管理
│   ├── systemConfig.ts       # 系统配置 upsert
│   ├── configAuditLog.ts     # 配置审计日志
│   ├── verification.ts       # 验证码
│   └── dbdemo.ts             # 演示数据
│
├── lib/                      # 工具库
│   ├── prisma.ts             # Prisma 客户端单例
│   ├── rbac.ts               # RBAC 角色权限系统
│   ├── auth-utils.ts         # 管理员鉴权 + 权限检查
│   ├── init-service.ts       # 项目初始化逻辑
│   ├── config-service.ts     # 系统配置读取（带缓存）
│   ├── pay.ts                # 微信支付 v3 API
│   ├── pay/sign.ts           # 支付签名
│   ├── r2.ts                 # Cloudflare R2 存储
│   ├── email.ts              # 邮件发送
│   ├── phone.ts              # 短信发送
│   ├── env.ts                # 环境变量校验
│   ├── generatorName.ts      # 随机昵称生成
│   ├── utils.ts              # 通用工具（cn, formatDate）
│   ├── api-handler.ts        # API 统一处理（预建）
│   ├── api-logger.ts         # API 日志中间件（预建）
│   ├── api-security.ts       # API 安全中间件（预建）
│   ├── security.ts           # 安全工具（预建）
│   ├── crypto.ts             # 加密工具（预建）
│   ├── errors.ts             # 错误类型（预建）
│   ├── logger.ts             # Pino 日志（预建）
│   └── rateLimit.ts          # 速率限制（预建）
│
├── hooks/                    # 自定义 Hooks
├── services/                 # 前端服务层（API 调用封装）
├── store/                    # Redux 状态管理
├── constants/                # 常量（config, routes, api, messages）
├── i18n/                     # 国际化配置 + 翻译文件
│   └── messages/
│       ├── zh.json / en.json           # 全局翻译
│       └── dashboard/zh.json / en.json # 后台翻译
├── styles/                   # 全局样式
├── types/                    # TypeScript 类型
├── auth.ts                   # NextAuth 配置
└── middleware.ts             # 路由中间件（i18n + 认证 + RBAC）

scripts/                      # 工具脚本
├── init-project.ts           # 项目初始化（修改 i18n、env、主题色等）
├── generate-logo.ts          # SVG Logo 生成
├── create-admin.ts           # 创建管理员账号
└── ...                       # 测试数据脚本

prisma/schema.prisma          # MongoDB schema
content/                      # MDX 内容（docs & blog）
mcp/                          # Model Context Protocol server
```

### 路由组说明

| 路由组 | URL 路径 | 布局系统 | SEO |
|--------|----------|----------|-----|
| `(fumadocs)` | `/docs/*`, `/blog/*` | Fumadocs UI | 独立 metadata |
| `(main)` | `/zh/*`, `/en/*`, `/api/*` | 自定义布局 | 完整 SEO 配置 |

**注意**: 路由组名称不会出现在 URL 中。

## Common Commands

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm dev:all          # 同时启动 dev + MCP

# 构建和部署
pnpm build            # 生产构建（含 prisma generate）
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # ESLint 检查
pnpm test             # Vitest 交互模式
pnpm test:run         # 运行测试
pnpm test:coverage    # 测试覆盖率

# Docker
pnpm docker:up        # 启动容器
pnpm docker:down      # 停止容器

# Prisma
npx prisma generate   # 生成 Prisma 客户端
npx prisma db push    # 推送 schema 到数据库
npx prisma studio     # 打开 Prisma Studio

# 工具脚本
npx tsx scripts/init-project.ts --name "MyProject" --domain "mysite.com" --color "#6366f1"
npx tsx scripts/generate-logo.ts --name "MyProject" --color "#6366f1"
npx tsx scripts/create-admin.ts admin@example.com
```

## Code Conventions

### TypeScript
- Use `.tsx` for components, `.ts` for utilities
- Define Props interfaces for components
- Avoid `any` - use proper types or generics

### Components
- PascalCase for component names
- Use next/image for image optimization
- Landing page 组件放 `src/components/landingpage/`
- 后台组件放 `src/components/dashboard/`

### Database (Prisma/MongoDB)
- Import Prisma client: `import prisma from "@/lib/prisma";`
- Function naming: `{action}{Table}{Type}` (e.g., `getUserList`, `createOrder`)
- Default pagination: limit=10, accept page/size/limit params
- See `src/models/` for reference implementations

### Styling
- Use Tailwind CSS utility classes
- Use DaisyUI components where applicable
- 主题色定义在 `src/app/(main)/globals.css` 的 `--p` 变量
- 强制亮色主题，不支持暗色模式

### API Routes
- Admin API 放 `src/app/(main)/api/admin/`，使用 `requireAdmin()` 鉴权
- User API 放 `src/app/(main)/api/user/`，使用 session 鉴权
- Public API 直接放 `src/app/(main)/api/`
- 标准返回格式: `{ success: true, data: {...} }` 或 `{ success: false, error: "..." }`

## RBAC 权限系统

系统使用基于角色的访问控制，定义在 `src/lib/rbac.ts`：

**角色**: `admin`（全部权限）、`user`（基础权限）

**权限列表**:
- `dashboard:access`, `profile:edit` — 基础
- `order:own`, `order:list`, `order:delete` — 订单
- `credit:own`, `credit:adjust` — 积分
- `user:list`, `user:edit` — 用户管理
- `post:manage` — 文章管理
- `redemption:manage` — 兑换码
- `system:manage` — 系统配置
- `upload:create`, `ai:chat` — 功能

**使用方式**:
- 中间件层: `src/middleware.ts` 根据 `ROUTE_PERMISSIONS` 自动拦截
- API 层: `requireAdmin()` 或 `requirePermission('xxx')` from `@/lib/auth-utils`
- 页面层: `hasPermission(role, 'xxx')` from `@/lib/rbac`

## Database Models

`prisma/schema.prisma` 中的模型：

| 模型 | 说明 |
|------|------|
| **User** | 核心用户（phone/email/WeChat, role, credits） |
| **Order** | 已完成订单 |
| **PayOrder** | 待支付订单 |
| **Promotion** | 推广追踪 |
| **VerificationCode** | 手机/邮箱验证码 |
| **VerificationWxQrCode** | 微信扫码登录 |
| **CreditTransaction** | 积分交易记录（充值/消费/退款） |
| **SystemConfig** | 系统配置（key-value, 分类, 审计） |
| **ConfigAuditLog** | 配置变更审计日志 |
| **RedemptionCode** | 兑换码（批量生成, 有效期, 使用次数） |
| **RedemptionRecord** | 兑换码使用记录 |
| **Post** | 博客文章（标题/slug/内容/分类/标签/状态） |
| **DbUserDemo** | 演示用户表 |

## Key Integrations

- **WeChat Pay**: v3 API (`src/lib/pay.ts`)
- **WeChat OAuth**: PC 扫码 + 移动端登录 (`src/components/weChat/`)
- **Aliyun SMS**: 手机验证码 (`src/lib/phone.ts`)
- **Email SMTP**: 邮箱验证码 (`src/lib/email.ts`)
- **OpenRouter / SiliconFlow**: AI 对话 (`src/app/(main)/api/openrouter/`, `siliconflow/`)
- **Cloudflare R2**: 文件上传存储 (`src/lib/r2.ts`)
- **Google Analytics**: 网站分析 (`src/components/analytics/`)

## Claude Code Skills

Skills are located in `.claude/skills/` and provide context-specific guidance.

### Project
- **`project/init.md`**: AI 引导式项目初始化（3 步：管理员账号 → 项目名+主题色 → 域名）
  - 修改 i18n、.env、globals.css 主题色、constants
  - 生成 SVG Logo 和 Favicon
  - 创建管理员账号 + 系统配置
- **`project/explain_structure.md`**: 项目结构深度说明
- **`project/add-page.md`**: 添加新页面（表单、列表、详情）
- **`project/add-route.md`**: 添加 API 路由（含模型层 + Server Actions）

### UI
- **`ui/modify_ui.md`**: DaisyUI 5 组件参考 + Tailwind CSS 4 + 动画

### SEO
- **`seo/seo_config.md`**: 静态 SEO 配置
- **`seo/dynamic_seo.md`**: 动态 SEO（文章、产品）
- **`seo/structured_data.md`**: JSON-LD 结构化数据

### Authentication
- **`auth/auth-flow.md`**: 认证流程（密码/验证码/微信 + RBAC）
- **`auth/wechat-login.md`**: 微信 OAuth 集成

### Database
- **`database/design_data_model.md`**: Prisma schema 设计指南

### Deployment
- **`deploy/check_env.md`**: 环境变量检查清单

## Development Notes

### 添加新页面

**主应用页面（需要国际化）**:
```bash
mkdir -p src/app/\(main\)/\[local\]/your-page
```

**后台管理页面（受 RBAC 保护）**:
```bash
mkdir -p src/app/\(main\)/\[local\]/dashboard/your-feature
```
然后在 `src/lib/rbac.ts` 的 `ROUTE_PERMISSIONS` 中添加权限映射。

**API 路由**:
```bash
mkdir -p src/app/\(main\)/api/your-endpoint
```

### SEO 配置

- 主应用 SEO: `src/app/(main)/layout.tsx` + `src/i18n/messages/*.json`
- 文档/博客 SEO: `src/app/(fumadocs)/layout.tsx`
- sitemap: `src/app/sitemap.ts`
- robots: `src/app/robots.ts`

### 关键文件位置

| 需求 | 文件位置 |
|------|----------|
| 修改主应用布局 | `src/app/(main)/layout.tsx` |
| 修改文档布局 | `src/app/(fumadocs)/layout.tsx` |
| 添加 Admin API | `src/app/(main)/api/admin/[name]/route.ts` |
| 添加 User API | `src/app/(main)/api/user/[name]/route.ts` |
| 添加页面 | `src/app/(main)/[local]/[name]/page.tsx` |
| 添加 Dashboard 页面 | `src/app/(main)/[local]/dashboard/[name]/page.tsx` |
| 添加组件 | `src/components/[category]/[Name].tsx` |
| 修改权限 | `src/lib/rbac.ts` |
| 修改认证逻辑 | `src/auth.ts` |
| 修改路由保护 | `src/middleware.ts` |
| 修改国际化 | `src/i18n/messages/[locale].json` |
| 修改全局样式/主题色 | `src/app/(main)/globals.css` |
| 添加数据库模型 | `prisma/schema.prisma` + `src/models/` |
| 系统配置管理 | `src/models/systemConfig.ts` + `src/lib/config-service.ts` |
