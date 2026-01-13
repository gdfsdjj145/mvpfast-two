---
name: seo_config
description: 通过 next-intl message 配置国际化 SEO（路由组架构）
author: MvpFast
---

# SEO 配置指南

本项目使用 **Route Groups（路由组）** 分离布局系统，SEO 配置分布在两个路由组中：

- `(main)` 路由组：主应用 SEO（使用 next-intl message 系统）
- `(fumadocs)` 路由组：文档/博客 SEO（独立配置）

---

## 项目 SEO 架构

```
src/app/
├── (fumadocs)/               # Fumadocs 路由组
│   └── layout.tsx            # 文档/博客 SEO（静态 metadata）
│
├── (main)/                   # 主应用路由组
│   ├── layout.tsx            # 主应用全局 SEO（从 i18n 读取）
│   └── [local]/
│       └── layout.tsx        # 语言相关 metadata（locale, alternates）
│
├── sitemap.ts                # 全站 sitemap
└── robots.ts                 # robots.txt

src/i18n/messages/
├── zh.json                   # 中文 SEO 配置
└── en.json                   # 英文 SEO 配置
```

---

## 核心原则

1. **单一数据源**: 主应用 SEO 配置在 message JSON 文件中
2. **天然 i18n**: 每种语言的 SEO 在对应语言文件中维护
3. **AI 友好**: 修改 JSON 比修改 TypeScript 代码更简单可靠
4. **路由组隔离**: 文档/博客与主应用 SEO 完全独立

---

## Message 结构规范

### 全局 SEO 配置

```json
// src/i18n/messages/zh.json
{
  "Metadata": {
    "title": "MvpFast - 快速构建你的MVP",
    "description": "基于 Next.js 15 的全栈 SaaS 模板，集成登录、支付、博客等功能",
    "keywords": "nextjs, saas, 模板, mvp, 快速开发",

    "og": {
      "siteName": "MvpFast",
      "type": "website",
      "image": "/og-image.png"
    },

    "twitter": {
      "card": "summary_large_image",
      "site": "@mvpfast",
      "creator": "@mvpfast"
    }
  }
}
```

### 页面级 SEO 配置

```json
{
  "Pages": {
    "pricing": {
      "title": "定价方案",
      "description": "选择适合你的 MvpFast 套餐，一次购买永久使用",
      "keywords": "定价, 套餐, 购买"
    },
    "blog": {
      "title": "博客",
      "description": "技术文章、产品更新和开发教程",
      "keywords": "博客, 技术文章, 教程"
    },
    "docs": {
      "title": "文档",
      "description": "MvpFast 使用指南和 API 文档",
      "keywords": "文档, 指南, API"
    },
    "dashboard": {
      "title": "控制台",
      "description": "管理你的账户和订单",
      "noIndex": true
    }
  }
}
```

---

## Layout 中读取 SEO 配置

### 主应用根布局 (src/app/(main)/layout.tsx)

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    keywords: t('keywords'),

    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: siteUrl,
      siteName: t('title'),
      title: t('title'),
      description: t('description'),
      images: [{
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: t('title'),
      }],
    },

    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${siteUrl}/og-image.png`],
    },

    alternates: {
      canonical: siteUrl,
      languages: {
        'zh-CN': `${siteUrl}/zh`,
        'en-US': `${siteUrl}/en`,
      },
    },
  };
}
```

### 语言子布局 (src/app/(main)/[local]/layout.tsx)

```typescript
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(
  props: { params: Promise<{ local: string }> }
): Promise<Metadata> {
  const { local: locale } = await props.params;
  const t = await getTranslations('Metadata');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    // Open Graph - 根据语言设置 locale
    openGraph: {
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
    },

    // 语言替代版本
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'zh-CN': `${siteUrl}/zh`,
        'en-US': `${siteUrl}/en`,
      },
    },
  };
}
```

### Fumadocs 布局 (src/app/(fumadocs)/layout.tsx)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'MvpFast 文档',
    template: '%s | MvpFast',
  },
  description: 'MvpFast 使用指南、API 文档和技术博客',
  keywords: '文档, 指南, API, 博客, MvpFast',
  openGraph: {
    type: 'website',
    siteName: 'MvpFast Docs',
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### 页面级 Metadata

```typescript
// src/app/(main)/[local]/pricing/page.tsx
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.pricing');

  return {
    title: t('title'),  // 会自动应用 template: "%s | MvpFast"
    description: t('description'),
    keywords: t('keywords'),
  };
}
```

---

## 完整 Message 配置模板

### 中文配置 (zh.json)

```json
{
  "Metadata": {
    "title": "MvpFast - 快速构建你的MVP",
    "description": "NextJs的开发模板，包含登录、支付、文章、博客和微信开发等模块功能，让你快速打造网站应用",
    "keywords": "开发模板, NextJs, React, TailwindCss, MongoDB, 微信登录, 微信支付, SaaS模板"
  },

  "Pages": {
    "pricing": {
      "title": "定价方案",
      "description": "选择适合你的 MvpFast 套餐方案",
      "keywords": "定价, 套餐, 购买"
    },
    "blog": {
      "title": "博客",
      "description": "技术文章和产品更新",
      "keywords": "博客, 技术文章"
    },
    "docs": {
      "title": "文档中心",
      "description": "MvpFast 使用指南",
      "keywords": "文档, 指南"
    },
    "about": {
      "title": "关于我们",
      "description": "了解 MvpFast 团队",
      "keywords": "关于, 团队"
    }
  }
}
```

### 英文配置 (en.json)

```json
{
  "Metadata": {
    "title": "MvpFast - Build your MVP fast",
    "description": "NextJs development template with login, payment, blog and WeChat integration, helping you build web applications quickly",
    "keywords": "template, NextJs, React, TailwindCss, MongoDB, SaaS template, WeChat login"
  },

  "Pages": {
    "pricing": {
      "title": "Pricing",
      "description": "Choose the MvpFast plan that suits you",
      "keywords": "pricing, plans, purchase"
    },
    "blog": {
      "title": "Blog",
      "description": "Technical articles and product updates",
      "keywords": "blog, articles"
    },
    "docs": {
      "title": "Documentation",
      "description": "MvpFast user guide",
      "keywords": "docs, guide"
    },
    "about": {
      "title": "About Us",
      "description": "Learn about the MvpFast team",
      "keywords": "about, team"
    }
  }
}
```

---

## SEO 配置检查清单

### 基础配置

- [ ] `Metadata.title` - 网站标题（包含品牌名）
- [ ] `Metadata.description` - 网站描述（150-160 字符最佳）
- [ ] `Metadata.keywords` - 关键词（逗号分隔）

### 页面配置

对于每个公开页面：
- [ ] `Pages.{pageName}.title` - 页面标题
- [ ] `Pages.{pageName}.description` - 页面描述
- [ ] `Pages.{pageName}.keywords` - 页面关键词（可选）

### 私有页面

对于 dashboard 等私有页面，添加 `noIndex: true`：
```json
"dashboard": {
  "title": "控制台",
  "description": "管理账户",
  "noIndex": true
}
```

---

## 常见 SEO 修改场景

### 场景 1: 修改网站标题和描述

**用户**: "把网站标题改成'我的SaaS应用'，描述改成'一站式解决方案'"

**操作**:
```json
// src/i18n/messages/zh.json
{
  "Metadata": {
    "title": "我的SaaS应用",
    "description": "一站式解决方案",
    ...
  }
}

// src/i18n/messages/en.json
{
  "Metadata": {
    "title": "My SaaS App",
    "description": "All-in-one solution",
    ...
  }
}
```

### 场景 2: 为新页面添加 SEO

**用户**: "给联系我们页面添加 SEO 配置"

**操作**:
```json
// zh.json
{
  "Pages": {
    "contact": {
      "title": "联系我们",
      "description": "有问题？联系我们的客服团队",
      "keywords": "联系, 客服, 支持"
    }
  }
}

// 在页面中使用
// src/app/(main)/[local]/contact/page.tsx
export async function generateMetadata() {
  const t = await getTranslations('Pages.contact');
  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 场景 3: 添加社交媒体账号

**用户**: "添加 Twitter 账号 @myapp"

**操作**:
```json
{
  "Metadata": {
    "twitter": {
      "site": "@myapp",
      "creator": "@myapp"
    }
  }
}
```

然后在 layout.tsx 中读取：
```typescript
twitter: {
  card: 'summary_large_image',
  site: t.raw('twitter.site') || undefined,
  creator: t.raw('twitter.creator') || undefined,
}
```

---

## 注意事项

1. **保持双语同步**: 修改中文配置后，同步修改英文配置
2. **描述长度**: SEO 描述建议 150-160 字符
3. **关键词**: 用逗号分隔，3-10 个为宜
4. **标题模板**: 根布局使用 `template: "%s | 品牌名"`，页面只需提供页面标题
5. **私有页面**: 对于 dashboard、auth 等页面，设置 `noIndex: true`

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `src/i18n/messages/zh.json` | 中文 SEO 配置 |
| `src/i18n/messages/en.json` | 英文 SEO 配置 |
| `src/app/(main)/layout.tsx` | 主应用全局 SEO 配置 |
| `src/app/(main)/[local]/layout.tsx` | 语言相关 metadata |
| `src/app/(fumadocs)/layout.tsx` | 文档/博客 SEO 配置 |
| `src/app/sitemap.ts` | sitemap.xml 生成 |
| `src/app/robots.ts` | robots.txt 配置 |
| `src/components/seo/JsonLd.tsx` | 结构化数据组件 |
