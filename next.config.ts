import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: ['*'],
    },
  },
  env: {
    MONGODB_URL: process.env.MONGODB_URL,
  },
};

export default nextConfig;
