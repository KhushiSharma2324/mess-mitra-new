const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Retry wrapper for Neon cold-start resilience
const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn() }
    catch (err) {
      if (i === retries - 1) throw err
      console.warn(`DB retry ${i + 1}/${retries}: ${err.message}`)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)))
    }
  }
}

module.exports = prisma
module.exports.withRetry = withRetry