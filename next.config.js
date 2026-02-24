/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  api: {
    responseLimit: '8mb',
  },
}

module.exports = nextConfig
