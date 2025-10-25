import { PrismaClient } from '@prisma/client'

declare global {
  var prismaGlobal: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  // During build time on Vercel, DATABASE_URL might not exist yet
  // This is OK - we only need to initialize at runtime
  if (!process.env.DATABASE_URL) {
    if (process.env.VERCEL) {
      // Build time on Vercel - will be available at runtime
      console.warn('⚠️ DATABASE_URL not available during build (will be injected at runtime by Vercel)')
    } else {
      // Local or runtime - DATABASE_URL is required
      throw new Error('DATABASE_URL environment variable is required for database connection')
    }
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Global singleton - lazy initialize only when needed (at runtime)
let prismaInstance: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = getPrismaClient()
  }
  return prismaInstance
}

// For backward compatibility with existing imports: import { prisma } from '@/lib/prisma'
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    return Reflect.get(getPrisma(), prop as keyof PrismaClient)
  },
})



