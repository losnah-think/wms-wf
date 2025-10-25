// Load .env files early in the build process
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: './prisma/.env' })
}

const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static export to allow dynamic rendering for i18n
  // output: 'standalone',
  // Image optimization
  images: {
    unoptimized: false,
  },
}

module.exports = withNextIntl(nextConfig)
