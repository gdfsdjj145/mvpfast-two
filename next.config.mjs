import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  swcMinify: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
    esmExternals: 'loose'
  },
  serverOptions: {
    maxHeaderSize: 32768,
  },
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
        source: '/:path*',
        headers: [
          {
            key: 'Accept-Encoding',
            value: 'gzip, deflate, br',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'supports-color': false,
      };
    }
    return config;
  },
};

export default withContentlayer(nextConfig);

