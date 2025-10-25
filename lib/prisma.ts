import { PrismaClient } from '@prisma/client'

// Global Prisma instance - created lazily on first use
declare global {
  var prismaGlobal: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    const dbVar = Object.keys(process.env).find(k => k.toLowerCase().includes('database'))
    console.error('❌ DATABASE_URL not found. Available:', dbVar || 'NONE')
    throw new Error('DATABASE_URL environment variable is required for database connection')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma =
  global.prismaGlobal ??
  (() => {
    const client = getPrismaClient()
    if (process.env.NODE_ENV !== 'production') {
      global.prismaGlobal = client
    }
    return client
  })()



