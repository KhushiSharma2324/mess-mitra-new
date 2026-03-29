require('dotenv').config()
const express = require('express')
const path = require('path')
const cors = require('cors')
const { errorHandler, notFoundHandler } = require('./src/middlewares/error.middleware')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MessMitra API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', require('./src/modules/auth/auth.routes'))
app.use('/api/mess', require('./src/modules/mess/mess.routes'))
app.use('/api/plans', require('./src/modules/plans/plans.routes'))
app.use('/api/subscriptions', require('./src/modules/subscriptions/subscriptions.routes'))
app.use('/api/attendance', require('./src/modules/attendance/attendance.routes'))
app.use('/api/menu', require('./src/modules/menu/menu.routes'))
app.use('/api/delivery', require('./src/modules/delivery/delivery.routes'))
app.use('/api/reviews', require('./src/modules/reviews/reviews.routes'))
app.use('/api/holidays', require('./src/modules/holidays/holidays.routes'))
app.use('/api/upload', require('./src/modules/upload/upload.routes'))
console.log('Loading Chatbot API...');
app.use('/api/chat', require('./src/modules/chat/chat.routes'))

app.use(notFoundHandler)
app.use(errorHandler)

// Keep-alive ping to prevent Neon PostgreSQL from pausing after inactivity
const prismaKeepAlive = require('./src/config/db')
setInterval(async () => {
  try { await prismaKeepAlive.$queryRaw`SELECT 1` } catch {}
}, 4 * 60 * 1000) // ping every 4 minutes

app.listen(PORT, async () => {
  console.log(`✓ MessMitra API running on http://localhost:${PORT}`)
  console.log(`✓ Health check: http://localhost:${PORT}/health`)
  console.log(`✓ Environment: ${process.env.NODE_ENV}`)

  // Verify database connectivity on startup
  try {
    const prisma = require('./src/config/db')
    await prisma.$queryRaw`SELECT 1`
    const userCount = await prisma.user.count()
    const messCount = await prisma.mess.count()
    console.log(`✓ Database connected — ${userCount} users, ${messCount} mess providers`)
  } catch (err) {
    console.error(`✗ DATABASE CONNECTION FAILED: ${err.message}`)
    console.error(`  Check your DATABASE_URL in .env`)
  }
})