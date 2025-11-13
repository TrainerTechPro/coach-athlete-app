import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with error handling for build time
export const prisma = globalForPrisma.prisma ?? (() => {
  try {
    return new PrismaClient()
  } catch (error) {
    console.warn('Prisma client initialization failed during build:', error)
    return new PrismaClient()
  }
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma