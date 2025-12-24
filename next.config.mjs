import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const withMDX = createMDX({});

/**
 * 安全响应头配置
 * @see https://owasp.org/www-project-secure-headers/
 */
const securityHeaders = [
  // 防止 MIME 类型嗅探
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // 防止点击劫持
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // XSS 保护 (旧版浏览器)
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // 控制 Referer 头信息
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // 限制浏览器功能
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // DNS 预取控制
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
];

// 生产环境添加 HSTS
if (process.env.NODE_ENV === 'production') {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  });
}

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        // 应用于所有路由
        source: '/:path*',
        headers: [
          {
            key: 'Accept-Encoding',
            value: 'gzip, deflate, br',
          },
          ...securityHeaders,
        ],
      },
      {
        // API 路由的 CORS 配置
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // 生产环境应限制具体域名
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
};

export default withMDX(withNextIntl(nextConfig));

