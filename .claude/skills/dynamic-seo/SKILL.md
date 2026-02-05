---
name: dynamic-seo
description: 动态页面的 SEO 配置指南（博客、产品详情等）。用户说"文章SEO"、"动态页面SEO"时使用。
author: MvpFast
user-invocable: true
---

# 动态页面 SEO 指南

对于博客文章、产品详情、用户生成内容等动态页面，无法预先在 message JSON 中配置 SEO。本指南介绍如何处理这类场景。

---

## 动态 SEO vs 静态 SEO

| 类型 | 数据来源 | 示例页面 |
|------|----------|----------|
| 静态 SEO | message JSON | 首页、定价页、关于页 |
| 动态 SEO | 数据库/CMS/MDX | 博客文章、产品详情、文档 |

---

## 博客文章 SEO

### MDX 博客文章

```typescript
// src/app/blog/[slug]/page.tsx
import { getPost } from '@/lib/blog';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  if (!post) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.description,
    keywords: post.tags?.join(', '),
    authors: [{ name: post.author }],

    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.updatedAt || post.date,
      authors: [post.author],
      tags: post.tags,
      images: post.image ? [{
        url: post.image.startsWith('http') ? post.image : `${siteUrl}${post.image}`,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}
```

### 数据库博客文章

```typescript
// src/app/[locale]/blog/[id]/page.tsx
import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations('Metadata');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!post) {
    return { title: '文章未找到' };
  }

  // 获取对应语言的内容
  const title = locale === 'zh' ? post.titleZh : post.titleEn;
  const description = locale === 'zh' ? post.descriptionZh : post.descriptionEn;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      title,
      description,
      url: `${siteUrl}/${locale}/blog/${id}`,
      publishedTime: post.createdAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    },
  };
}
```

---

## 产品详情页 SEO

```typescript
// src/app/[locale]/products/[id]/page.tsx
import prisma from '@/lib/prisma';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    return { title: '产品未找到' };
  }

  const title = locale === 'zh' ? product.nameZh : product.nameEn;
  const description = locale === 'zh' ? product.descriptionZh : product.descriptionEn;

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      title,
      description,
      url: `${siteUrl}/${locale}/products/${id}`,
      images: product.image ? [{
        url: product.image,
        alt: title,
      }] : undefined,
    },
  };
}
```

---

## 动态生成 sitemap

对于动态页面，需要更新 `sitemap.ts`：

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { getBlogPosts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const locales = ['zh', 'en'];

  const entries: MetadataRoute.Sitemap = [];

  // 静态页面
  const staticPages = ['', '/pricing', '/about'];
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${baseUrl}/${loc}${page}`])
          ),
        },
      });
    }
  }

  // 动态博客文章
  const posts = await getBlogPosts();
  for (const post of posts) {
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.date,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // 动态产品页面
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true },
  });
  for (const product of products) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/products/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
```

---

## SEO 优化建议

### 1. 标题优化

```typescript
// 好的标题
title: `${post.title} | ${siteName}`
// 或者使用 Next.js template
title: {
  absolute: post.title,  // 不使用 template
}
```

### 2. 描述生成

```typescript
// 自动从内容生成描述
function generateDescription(content: string, maxLength = 160): string {
  const text = content
    .replace(/[#*`\[\]]/g, '')  // 移除 markdown 符号
    .replace(/\n+/g, ' ')        // 换行变空格
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength - 3).trim() + '...';
}
```

### 3. 图片处理

```typescript
// 确保图片 URL 是完整的
function getImageUrl(image: string | undefined, siteUrl: string): string {
  if (!image) return `${siteUrl}/og-image.png`;
  if (image.startsWith('http')) return image;
  return `${siteUrl}${image.startsWith('/') ? '' : '/'}${image}`;
}
```

### 4. 多语言处理

```typescript
// 根据 locale 返回正确的语言代码
function getOgLocale(locale: string): string {
  const localeMap: Record<string, string> = {
    'zh': 'zh_CN',
    'en': 'en_US',
    'ja': 'ja_JP',
  };
  return localeMap[locale] || 'en_US';
}
```

---

## 常见问题

### Q: 动态页面需要添加到 message.json 吗？

A: 不需要。动态页面的 SEO 数据来自数据库/CMS，但可以在 message 中添加一些通用配置（如 404 提示文本）。

### Q: 如何处理分页页面？

```typescript
// 分页页面使用 canonical 指向第一页
export async function generateMetadata({ searchParams }) {
  const page = searchParams.page || 1;

  return {
    alternates: {
      canonical: page === 1 ? '/blog' : undefined,
    },
    robots: page > 1 ? { index: false } : undefined,
  };
}
```

### Q: 如何处理 noindex 页面？

```typescript
return {
  robots: {
    index: false,
    follow: true,
  },
};
```

---

## 相关技能

- `seo-config` - 静态页面 SEO 配置
- `structured-data` - JSON-LD 结构化数据
