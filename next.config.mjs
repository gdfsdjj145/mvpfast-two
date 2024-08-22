import { withContentlayer } from 'next-contentlayer'

/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default withContentlayer(nextConfig);
