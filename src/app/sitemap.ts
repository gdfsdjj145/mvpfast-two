/**
 * sitemap.xml 生成
 *
 * Next.js 15 动态生成 sitemap.xml
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';
import { APP_CONFIG } from '@/constants/config';

/**
 * 获取网站基础 URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';
}

/**
 * 页面优先级配置
 */
const PAGE_PRIORITIES = {
  home: 1.0,
  features: 0.9,
  pricing: 0.9,
  blog: 0.8,
  docs: 0.7,
  about: 0.6,
  contact: 0.6,
  legal: 0.3,
} as const;

/**
 * 页面更新频率配置
 */
const CHANGE_FREQUENCIES = {
  home: 'daily',
  features: 'weekly',
  pricing: 'weekly',
  blog: 'daily',
  docs: 'weekly',
  about: 'monthly',
  contact: 'monthly',
  legal: 'yearly',
} as const;

/**
 * 静态页面列表
 */
const STATIC_PAGES = [
  { path: '', priority: PAGE_PRIORITIES.home, changeFrequency: CHANGE_FREQUENCIES.home },
  { path: '/blog', priority: PAGE_PRIORITIES.blog, changeFrequency: CHANGE_FREQUENCIES.blog },
  { path: '/docs', priority: PAGE_PRIORITIES.docs, changeFrequency: CHANGE_FREQUENCIES.docs },
] as const;

/**
 * 生成 sitemap.xml
 *
 * 包含:
 * - 静态页面 (首页、博客、文档等)
 * - 多语言版本 (zh, en)
 * - 动态内容 (可扩展博客文章、文档页面等)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const locales = APP_CONFIG.SUPPORTED_LOCALES;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // 添加静态页面
  for (const page of STATIC_PAGES) {
    // 为每个语言版本生成 URL
    for (const locale of locales) {
      const url = page.path
        ? `${baseUrl}/${locale}${page.path}`
        : `${baseUrl}/${locale}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency as 'daily' | 'weekly' | 'monthly' | 'yearly',
        priority: page.priority,
        // 添加语言替代版本
        alternates: {
          languages: Object.fromEntries(
            locales.map((loc) => [
              loc,
              page.path ? `${baseUrl}/${loc}${page.path}` : `${baseUrl}/${loc}`,
            ])
          ),
        },
      });
    }
  }

  // TODO: 添加动态博客文章
  // const posts = await getBlogPosts();
  // for (const post of posts) {
  //   entries.push({
  //     url: `${baseUrl}/blog/${post.slug}`,
  //     lastModified: post.updatedAt,
  //     changeFrequency: 'weekly',
  //     priority: 0.7,
  //   });
  // }

  // TODO: 添加动态文档页面
  // const docs = await getDocPages();
  // for (const doc of docs) {
  //   entries.push({
  //     url: `${baseUrl}/docs/${doc.slug}`,
  //     lastModified: doc.updatedAt,
  //     changeFrequency: 'weekly',
  //     priority: 0.6,
  //   });
  // }

  return entries;
}
