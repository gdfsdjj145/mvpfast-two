# CLAUDE.md

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

**mvpfast-web** is a full-stack SaaS template built with Next.js 15 (App Router), designed for rapid MVP development with Chinese market integrations.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Frontend**: React 19, Tailwind CSS 4, DaisyUI 5
- **Database**: MongoDB via Prisma ORM
- **Auth**: NextAuth 5 (credentials, WeChat, phone/email)
- **i18n**: next-intl
- **Docs/Blog**: Fumadocs with MDX
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
│   │   ├── globals.css       # 全局样式
│   │   ├── [local]/          # 本地化路由 (/zh/*, /en/*)
│   │   │   ├── layout.tsx    # 语言子布局（仅 metadata）
│   │   │   ├── page.tsx      # 首页
│   │   │   ├── auth/         # 认证页面
│   │   │   ├── dashboard/    # 仪表板（受保护）
│   │   │   └── pay/          # 支付页面
│   │   └── api/              # API 路由
│   │
│   ├── error.tsx             # 全局错误边界
│   ├── global-error.tsx      # 全局错误处理
│   ├── not-found.tsx         # 404 页面
│   ├── robots.ts             # robots.txt 生成
│   └── sitemap.ts            # sitemap.xml 生成
│
├── components/               # React 组件
├── hooks/                    # 自定义 React hooks
├── i18n/                     # 国际化配置
├── lib/                      # 工具库（prisma, payment 等）
├── models/                   # 数据库操作函数
├── stores/                   # 全局状态管理
├── styles/                   # 全局样式
├── auth.ts                   # NextAuth 配置
└── middleware.ts             # Next.js 中间件

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
pnpm dev          # Start development server
pnpm build        # Production build
pnpm lint         # Run ESLint
pnpm mcp          # Run MCP server
pnpm dev:all      # Run dev server + MCP in parallel
```

## Code Conventions

### TypeScript
- Use `.tsx` for components, `.ts` for utilities
- Define Props interfaces for components
- Use `FC` type for functional components
- Avoid `any` - use proper types or generics

### Components
- PascalCase for component names
- Use React.memo for performance when needed
- Use React.lazy for code splitting
- Use next/image for image optimization

### Database (Prisma/MongoDB)
- Import Prisma client: `import prisma from "@/lib/prisma";`
- Function naming: `{action}{Table}{Type}` (e.g., `getUserList`, `createOrder`)
- Default pagination: limit=10, accept page/size/limit params
- See `src/models/` for reference implementations

### Styling
- Use Tailwind CSS utility classes
- Use DaisyUI components where applicable
- Global styles in `src/app/(main)/globals.css`

## Database Models

Key models in `prisma/schema.prisma`:
- **User**: Core user with phone/email/WeChat auth
- **Order**: Completed payment orders
- **PayOrder**: Pending payment orders
- **Promotion**: Referral/promotion tracking
- **VerificationCode**: Phone/email verification
- **VerificationWxQrCode**: WeChat QR login

## Key Integrations

- **WeChat Pay**: v3 API integration
- **Aliyun SMS**: Phone verification
- **WeChat OAuth**: QR code login flow

## Claude Code Skills

This project includes specialized skills for common development tasks. Skills are located in `.claude/skills/` and can be invoked using the Skill tool.

### UI Modification
- **`ui/modify_ui.md`**: Comprehensive guide for modifying UI components
  - Component updates and styling changes
  - DaisyUI integration guidelines
  - Tailwind CSS best practices
  - Responsive design patterns

### SEO Configuration
- **`seo/seo_config.md`**: Static SEO configuration for pages
  - Page-level metadata setup
  - Open Graph and Twitter Card configuration
  - Canonical URLs and alternate languages

- **`seo/dynamic_seo.md`**: Dynamic SEO for content pages
  - Database-driven metadata
  - Dynamic title and description generation
  - Structured data integration

- **`seo/structured_data.md`**: JSON-LD structured data implementation
  - Organization schema
  - Article and blog post schema
  - Product and offer schema
  - FAQ and breadcrumb schema

### Authentication
- **`auth/auth-flow.md`**: General authentication flow guide
  - Phone/email verification flow
  - Session management
  - Protected route setup

- **`auth/wechat-login.md`**: WeChat OAuth integration
  - QR code login implementation
  - WeChat API integration
  - User binding workflow

### Database
- **`database/design_data_model.md`**: Prisma schema design guide
  - MongoDB schema patterns
  - Model relationships
  - Index optimization
  - Migration best practices

### Project Management
- **`project/explain_structure.md`**: Project structure explanation
  - Route Groups architecture
  - File organization patterns
  - Naming conventions

- **`project/add-page.md`**: Adding new pages guide
  - Main app pages (i18n enabled)
  - Dashboard pages (protected)
  - Documentation pages (Fumadocs)

- **`project/add-route.md`**: Adding API routes
  - REST API patterns
  - Request validation
  - Error handling
  - Authentication middleware

### Deployment
- **`deploy/check_env.md`**: Environment configuration check
  - Required environment variables
  - Service connectivity tests
  - Database connection verification
  - Third-party API validation

### How to Use Skills

Skills provide context-specific guidance to Claude Code. When working on related tasks, Claude will automatically reference the appropriate skill files to follow project conventions and best practices.

## Development Notes

### 添加新页面

**主应用页面（需要国际化）**:
```bash
# 位置: src/app/(main)/[local]/your-page/page.tsx
mkdir -p src/app/\(main\)/\[local\]/your-page
```

**后台管理页面（受保护）**:
```bash
# 位置: src/app/(main)/[local]/dashboard/your-feature/page.tsx
mkdir -p src/app/\(main\)/\[local\]/dashboard/your-feature
```

**API 路由**:
```bash
# 位置: src/app/(main)/api/your-endpoint/route.ts
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
| 添加 API | `src/app/(main)/api/[name]/route.ts` |
| 添加页面 | `src/app/(main)/[local]/[name]/page.tsx` |
| 添加组件 | `src/components/[category]/[Name].tsx` |
| 修改国际化 | `src/i18n/messages/[locale].json` |
| 修改全局样式 | `src/app/(main)/globals.css` |
