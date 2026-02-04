---
name: explain-structure
description: 深入理解 mvpfast-web 项目结构、技术栈、路由系统、API 和配置文件。用户问"项目结构"、"代码在哪"时使用。
author: MvpFast
user-invocable: true
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
