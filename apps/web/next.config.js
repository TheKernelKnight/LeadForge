/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig