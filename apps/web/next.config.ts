import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Internal workspace packages export raw TypeScript — let Next transpile them.
  transpilePackages: [
    '@dewasa-ayu/types',
    '@dewasa-ayu/constants',
    '@dewasa-ayu/wariga-engine',
    '@dewasa-ayu/ceremony-rules',
  ],
};

export default nextConfig;
