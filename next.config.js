const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static export to allow dynamic rendering for i18n
  // output: 'standalone',
  experimental: {
    // Optimize build for Vercel deployment
    optimizeCss: true,
  },
  // Image optimization
  images: {
    unoptimized: false,
  },
}

module.exports = withNextIntl(nextConfig)
