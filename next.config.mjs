import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  swcMinify: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    unoptimized: true,
    domains: ['localhost'], // 如果您在本地开发，保留这个
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 允许所有域名，您可以根据需要限制
      },
    ],
  },
  // 如果您使用了 Contentlayer，可能需要以下配置
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
};

export default withContentlayer(nextConfig);
