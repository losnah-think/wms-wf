import { PrismaClient } from '@prisma/client'

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Available env vars:', 
    Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('PRISMA') || k.includes('DB')))
  throw new Error('DATABASE_URL environment variable is required')
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

