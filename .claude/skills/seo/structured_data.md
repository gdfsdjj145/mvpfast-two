---
name: structured_data
description: JSON-LD 结构化数据配置指南
author: MvpFast
---

# JSON-LD 结构化数据指南

JSON-LD 结构化数据帮助搜索引擎更好地理解页面内容，可以在搜索结果中显示丰富摘要（Rich Snippets）。

---

## 项目中的 JSON-LD 组件

位置：`src/components/seo/JsonLd.tsx`

### 可用组件

| 组件 | 用途 | 适用场景 |
|------|------|----------|
| `GlobalJsonLd` | 网站全局结构化数据 | 根布局 |
| `OrganizationJsonLd` | 组织/公司信息 | 关于页、根布局 |
| `WebsiteJsonLd` | 网站信息 | 根布局 |
| `ArticleJsonLd` | 文章信息 | 博客文章 |
| `ProductJsonLd` | 产品信息 | 产品详情、定价页 |
| `FaqJsonLd` | FAQ 列表 | FAQ 页面 |
| `BreadcrumbJsonLd` | 面包屑导航 | 多级页面 |
| `SoftwareApplicationJsonLd` | SaaS 应用 | 首页、产品页 |

---

## 使用方法

### 1. 全局结构化数据（根布局）

```tsx
// src/app/[local]/layout.tsx
import { GlobalJsonLd } from '@/components/seo';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <GlobalJsonLd />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. 文章页面

```tsx
// src/app/blog/[slug]/page.tsx
import { ArticleJsonLd } from '@/components/seo';

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        url={`${siteUrl}/blog/${params.slug}`}
        datePublished={post.date}
        dateModified={post.updatedAt}
        author={{ name: post.author, url: post.authorUrl }}
        image={post.image}
      />
      <article>
        {/* 文章内容 */}
      </article>
    </>
  );
}
```

### 3. FAQ 页面

```tsx
// src/app/[locale]/faq/page.tsx
import { FaqJsonLd } from '@/components/seo';
import { getTranslations } from 'next-intl/server';

export default async function FaqPage() {
  const t = await getTranslations('Faq');
  const items = t.raw('items') as Array<{ question: string; answer: string }>;

  return (
    <>
      <FaqJsonLd items={items} />
      <div>
        {items.map((item, index) => (
          <details key={index}>
            <summary>{item.question}</summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
```

### 4. 产品/定价页面

```tsx
// src/app/[locale]/pricing/page.tsx
import { ProductJsonLd, SoftwareApplicationJsonLd } from '@/components/seo';

export default function PricingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return (
    <>
      {/* SaaS 应用结构化数据 */}
      <SoftwareApplicationJsonLd
        name="MvpFast"
        description="快速构建 MVP 的 SaaS 模板"
        url={siteUrl}
        applicationCategory="DeveloperApplication"
        offers={{ price: 299, priceCurrency: 'CNY' }}
      />

      {/* 具体产品 */}
      <ProductJsonLd
        name="MvpFast 专业版"
        description="包含所有功能的完整版本"
        url={`${siteUrl}/pricing`}
        offers={{
          price: 299,
          priceCurrency: 'CNY',
          availability: 'InStock',
        }}
      />

      <div>{/* 定价内容 */}</div>
    </>
  );
}
```

### 5. 面包屑导航

```tsx
// src/app/blog/[category]/[slug]/page.tsx
import { BreadcrumbJsonLd } from '@/components/seo';

export default function BlogPost({ params }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const breadcrumbs = [
    { name: '首页', url: siteUrl },
    { name: '博客', url: `${siteUrl}/blog` },
    { name: params.category, url: `${siteUrl}/blog/${params.category}` },
    { name: '当前文章', url: `${siteUrl}/blog/${params.category}/${params.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      {/* 页面内容 */}
    </>
  );
}
```

---

## 自定义结构化数据

使用 `JsonLd` 组件传入任意 Schema.org 数据：

```tsx
import { JsonLd } from '@/components/seo';

// 本地商家
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: '我的公司',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '某某路123号',
    addressLocality: '上海',
    addressCountry: 'CN',
  },
  telephone: '+86-21-12345678',
}} />

// 视频
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: '产品演示',
  description: '了解如何使用我们的产品',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  uploadDate: '2024-01-01',
  duration: 'PT5M30S',
}} />

// 事件
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: '技术分享会',
  startDate: '2024-06-01T19:00:00+08:00',
  endDate: '2024-06-01T21:00:00+08:00',
  location: {
    '@type': 'Place',
    name: '线上',
    address: 'Zoom 会议',
  },
}} />
```

---

## 常用 Schema 类型

### 网站/组织

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "公司名称",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "公司描述",
  "sameAs": [
    "https://twitter.com/company",
    "https://github.com/company"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "contact@example.com",
    "contactType": "customer service"
  }
}
```

### 文章

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "description": "文章描述",
  "image": "https://example.com/image.jpg",
  "datePublished": "2024-01-01",
  "dateModified": "2024-01-15",
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "publisher": {
    "@type": "Organization",
    "name": "发布者",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

### SaaS 产品

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "产品名称",
  "description": "产品描述",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "299",
    "priceCurrency": "CNY"
  }
}
```

### FAQ

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "问题1？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案1"
      }
    },
    {
      "@type": "Question",
      "name": "问题2？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "答案2"
      }
    }
  ]
}
```

---

## 验证结构化数据

### Google 工具

1. **Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema Markup Validator**: https://validator.schema.org/

### 本地验证

```bash
# 查看页面 HTML 中的 JSON-LD
curl -s https://your-site.com | grep -A 50 'application/ld+json'
```

### 在浏览器中验证

```javascript
// 在浏览器控制台执行
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
scripts.forEach((script, i) => {
  console.log(`Schema ${i + 1}:`, JSON.parse(script.textContent));
});
```

---

## 最佳实践

### 1. 每个页面只添加相关的结构化数据

```tsx
// ✅ 好：文章页只添加 Article schema
<ArticleJsonLd {...articleData} />

// ❌ 差：文章页添加无关的 Product schema
<ProductJsonLd {...productData} />
```

### 2. 确保数据与页面内容一致

```tsx
// ✅ 标题一致
<ArticleJsonLd title={post.title} />
<h1>{post.title}</h1>

// ❌ 标题不一致会被搜索引擎惩罚
<ArticleJsonLd title="SEO 优化标题" />
<h1>实际显示标题</h1>
```

### 3. 使用完整的 URL

```tsx
// ✅ 使用完整 URL
url: `${siteUrl}/blog/${slug}`

// ❌ 使用相对路径
url: `/blog/${slug}`
```

### 4. 日期格式使用 ISO 8601

```tsx
// ✅ ISO 8601 格式
datePublished: "2024-01-15T10:00:00+08:00"

// ❌ 其他格式
datePublished: "2024年1月15日"
```

---

## 从 message 读取结构化数据

对于 FAQ 等可以在 message 中配置的数据：

```tsx
// src/app/[locale]/page.tsx
import { FaqJsonLd } from '@/components/seo';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('Faq');

  // 从 message 读取 FAQ 数据
  const faqItems = t.raw('items') as Array<{
    question: string;
    answer: string;
  }>;

  return (
    <>
      <FaqJsonLd items={faqItems} />
      {/* 页面内容 */}
    </>
  );
}
```

---

## 相关文件

| 文件 | 用途 |
|------|------|
| `src/components/seo/JsonLd.tsx` | JSON-LD 组件实现 |
| `src/components/seo/index.ts` | 组件导出 |
| `src/app/[local]/layout.tsx` | 全局结构化数据使用位置 |

---

## 相关技能

- `seo_config.md` - 静态页面 SEO 配置
- `dynamic_seo.md` - 动态页面 SEO 配置
