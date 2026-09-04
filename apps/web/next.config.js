/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [],
  },
  output: 'standalone',
  // For Vercel deployment
  turbopack: {},
};

module.exports = nextConfig;
