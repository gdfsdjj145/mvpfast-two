/**
 * robots.txt 生成
 *
 * Next.js 15 动态生成 robots.txt
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next';

/**
 * 获取网站基础 URL
 */
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://example.com';
}

/**
 * 生成 robots.txt 配置
 *
 * 默认配置:
 * - 允许所有搜索引擎抓取
 * - 禁止抓取 /api/ 路径
 * - 禁止抓取 /dashboard/ 私有页面
 * - 指向 sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/pay/',
          '/auth/',
          '/_next/',
          '/private/',
        ],
      },
      // 特定搜索引擎的规则 (可选)
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/pay/', '/auth/'],
      },
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/pay/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
