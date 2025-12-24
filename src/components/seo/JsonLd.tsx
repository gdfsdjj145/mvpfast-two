/**
 * JSON-LD 结构化数据组件
 *
 * 用于向页面添加 Schema.org 结构化数据，提升 SEO
 *
 * @example
 * ```tsx
 * import { JsonLd, OrganizationJsonLd, ArticleJsonLd } from '@/components/seo/JsonLd';
 *
 * // 通用 JSON-LD
 * <JsonLd data={customSchema} />
 *
 * // 预设组件
 * <OrganizationJsonLd />
 * <ArticleJsonLd title="文章标题" ... />
 * ```
 */

'use client';

import { APP_CONFIG } from '@/constants/config';

// ============================================
// 类型定义
// ============================================

/**
 * JSON-LD 组织数据
 */
export interface OrganizationData {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    email?: string;
    contactType?: string;
  };
}

/**
 * JSON-LD 文章数据
 */
export interface ArticleData {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    name: string;
    url?: string;
  };
  publisher?: OrganizationData;
}

/**
 * JSON-LD 产品数据
 */
export interface ProductData {
  name: string;
  description: string;
  url: string;
  image?: string;
  brand?: string;
  offers?: {
    price: number;
    priceCurrency: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  };
}

/**
 * JSON-LD FAQ 数据
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * JSON-LD 面包屑数据
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

// ============================================
// 工具函数
// ============================================

/**
 * 获取网站基础 URL
 */
function getSiteUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';
}

/**
 * 获取默认配置
 */
function getDefaultConfig() {
  const siteUrl = getSiteUrl();
  return {
    siteUrl,
    siteName: APP_CONFIG.NAME,
    description: APP_CONFIG.DESCRIPTION,
    defaultImage: `${siteUrl}/og-image.png`,
    logo: `${siteUrl}/logo.png`,
  };
}

// ============================================
// Schema 创建函数
// ============================================

/**
 * 创建组织结构化数据
 */
function createOrganizationSchema(data?: Partial<OrganizationData>): object {
  const config = getDefaultConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data?.name || config.siteName,
    url: data?.url || config.siteUrl,
    logo: data?.logo || config.logo,
    description: data?.description || config.description,
    sameAs: data?.sameAs || [],
    ...(data?.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: data.contactPoint.telephone,
        email: data.contactPoint.email,
        contactType: data.contactPoint.contactType || 'customer service',
      },
    }),
  };
}

/**
 * 创建网站结构化数据
 */
function createWebsiteSchema(): object {
  const config = getDefaultConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    url: config.siteUrl,
    description: config.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${config.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 创建文章结构化数据
 */
function createArticleSchema(data: ArticleData): object {
  const config = getDefaultConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image || config.defaultImage,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: data.author.name,
      url: data.author.url,
    },
    publisher: data.publisher
      ? {
          '@type': 'Organization',
          name: data.publisher.name,
          url: data.publisher.url,
          logo: {
            '@type': 'ImageObject',
            url: data.publisher.logo || config.logo,
          },
        }
      : {
          '@type': 'Organization',
          name: config.siteName,
          url: config.siteUrl,
          logo: {
            '@type': 'ImageObject',
            url: config.logo,
          },
        },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
  };
}

/**
 * 创建产品结构化数据
 */
function createProductSchema(data: ProductData): object {
  const config = getDefaultConfig();

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image || config.defaultImage,
    brand: data.brand
      ? {
          '@type': 'Brand',
          name: data.brand,
        }
      : undefined,
    offers: data.offers
      ? {
          '@type': 'Offer',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
          availability: data.offers.availability
            ? `https://schema.org/${data.offers.availability}`
            : undefined,
        }
      : undefined,
  };
}

/**
 * 创建 FAQ 结构化数据
 */
function createFaqSchema(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * 创建面包屑结构化数据
 */
function createBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 创建 SaaS 软件应用结构化数据
 */
function createSoftwareApplicationSchema(data: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.applicationCategory || 'BusinessApplication',
    operatingSystem: data.operatingSystem || 'Web',
    offers: data.offers
      ? {
          '@type': 'Offer',
          price: data.offers.price,
          priceCurrency: data.offers.priceCurrency,
        }
      : undefined,
  };
}

// ============================================
// 通用 JSON-LD 组件
// ============================================

interface JsonLdProps {
  /** 结构化数据对象 */
  data: object;
}

/**
 * 通用 JSON-LD 组件
 *
 * @example
 * ```tsx
 * <JsonLd data={{
 *   '@context': 'https://schema.org',
 *   '@type': 'WebPage',
 *   name: '页面名称',
 * }} />
 * ```
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============================================
// 预设 JSON-LD 组件
// ============================================

interface OrganizationJsonLdProps {
  data?: Partial<OrganizationData>;
}

/**
 * 组织结构化数据组件
 *
 * @example
 * ```tsx
 * // 使用默认配置
 * <OrganizationJsonLd />
 *
 * // 自定义配置
 * <OrganizationJsonLd data={{
 *   name: '公司名称',
 *   sameAs: ['https://twitter.com/...'],
 * }} />
 * ```
 */
export function OrganizationJsonLd({ data }: OrganizationJsonLdProps) {
  return <JsonLd data={createOrganizationSchema(data)} />;
}

/**
 * 网站结构化数据组件
 *
 * 包含网站基本信息和搜索功能
 */
export function WebsiteJsonLd() {
  return <JsonLd data={createWebsiteSchema()} />;
}

interface ArticleJsonLdProps extends ArticleData {}

/**
 * 文章结构化数据组件
 *
 * @example
 * ```tsx
 * <ArticleJsonLd
 *   title="如何快速构建 MVP"
 *   description="本文介绍..."
 *   url="https://example.com/blog/mvp-guide"
 *   datePublished="2024-01-01"
 *   author={{ name: "张三" }}
 * />
 * ```
 */
export function ArticleJsonLd(props: ArticleJsonLdProps) {
  return <JsonLd data={createArticleSchema(props)} />;
}

interface ProductJsonLdProps extends ProductData {}

/**
 * 产品结构化数据组件
 *
 * @example
 * ```tsx
 * <ProductJsonLd
 *   name="专业版"
 *   description="适合中小企业的完整解决方案"
 *   url="https://example.com/pricing"
 *   offers={{ price: 99, priceCurrency: 'CNY' }}
 * />
 * ```
 */
export function ProductJsonLd(props: ProductJsonLdProps) {
  return <JsonLd data={createProductSchema(props)} />;
}

interface FaqJsonLdProps {
  items: FaqItem[];
}

/**
 * FAQ 结构化数据组件
 *
 * @example
 * ```tsx
 * <FaqJsonLd items={[
 *   { question: "如何注册?", answer: "点击注册按钮..." },
 *   { question: "支持哪些支付方式?", answer: "支持微信支付..." },
 * ]} />
 * ```
 */
export function FaqJsonLd({ items }: FaqJsonLdProps) {
  return <JsonLd data={createFaqSchema(items)} />;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * 面包屑结构化数据组件
 *
 * @example
 * ```tsx
 * <BreadcrumbJsonLd items={[
 *   { name: "首页", url: "https://example.com" },
 *   { name: "博客", url: "https://example.com/blog" },
 *   { name: "文章标题", url: "https://example.com/blog/post" },
 * ]} />
 * ```
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  return <JsonLd data={createBreadcrumbSchema(items)} />;
}

interface SoftwareApplicationJsonLdProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
  };
}

/**
 * 软件应用结构化数据组件
 *
 * 适用于 SaaS 产品
 *
 * @example
 * ```tsx
 * <SoftwareApplicationJsonLd
 *   name="MVP Fast"
 *   description="快速构建 MVP 的 SaaS 模板"
 *   url="https://example.com"
 *   offers={{ price: 0, priceCurrency: "CNY" }}
 * />
 * ```
 */
export function SoftwareApplicationJsonLd(props: SoftwareApplicationJsonLdProps) {
  return <JsonLd data={createSoftwareApplicationSchema(props)} />;
}

// ============================================
// 组合组件
// ============================================

/**
 * 网站全局结构化数据
 *
 * 包含组织和网站信息，适合放在根布局中
 *
 * @example
 * ```tsx
 * // 在 layout.tsx 中
 * <GlobalJsonLd />
 * ```
 */
export function GlobalJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
    </>
  );
}

// 导出所有组件
export default JsonLd;
