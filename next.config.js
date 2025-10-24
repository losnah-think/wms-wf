// Load environment variables
require('dotenv').config()

// Generate Prisma client if DATABASE_URL is set
if (process.env.DATABASE_URL) {
  try {
    require('child_process').execSync('npx prisma generate', { 
      stdio: 'pipe',
      env: process.env
    })
  } catch (error) {
    console.warn('⚠️  Prisma generate failed, using cached client:', error.message)
  }
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
