const fs = require('fs')
const path = require('path')

// Load .env file
require('dotenv').config()

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set')
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PRISMA')))
  process.exit(1)
}

console.log('DATABASE_URL is set:', process.env.DATABASE_URL.substring(0, 50) + '...')

// Run prisma generate
try {
  require('child_process').execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: process.env
  })
  console.log('✓ Prisma client generated successfully')
} catch (error) {
  console.error('✗ Failed to generate Prisma client:', error.message)
  process.exit(1)
}
