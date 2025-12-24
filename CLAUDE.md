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

```
src/
├── app/            # Next.js App Router pages
│   ├── [local]/    # Localized routes
│   ├── api/        # API endpoints
│   ├── blog/       # Blog pages (MDX)
│   └── docs/       # Documentation pages
├── components/     # React components
├── hooks/          # Custom React hooks
├── i18n/           # Internationalization config
├── lib/            # Utilities (prisma, payment, etc.)
├── models/         # Database API functions
├── stores/         # Global state management
├── styles/         # Global styles
├── auth.ts         # NextAuth configuration
└── middleware.ts   # Next.js middleware

prisma/schema.prisma  # MongoDB schema
content/              # MDX content for docs & blog
mcp/                  # Model Context Protocol server
```

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
- Global styles in `src/styles/`

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

## Development Notes

- API routes are in `src/app/api/`
- Protected routes use NextAuth session checks
- i18n messages are in `src/i18n/messages/`
- Content for docs/blog is in `content/` directory
