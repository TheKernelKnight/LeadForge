/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: process.env.VERCEL ? undefined : 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig