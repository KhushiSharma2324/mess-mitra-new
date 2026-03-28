const prisma = require('../../config/db')
const { getToday, isBeforeCutoff } = require('../../utils/date')

const markAttendance = async (userId, { mealType }) => {
  if (!mealType || !['BREAKFAST', 'LUNCH', 'DINNER'].includes(mealType)) {
    const err = new Error('Meal type must be BREAKFAST, LUNCH, or DINNER')
    err.statusCode = 400
    throw err
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: {
      plan: {
        include: {
          mess: true,
        },
      },
    },
  })

  if (!subscription) {
    const err = new Error('No active subscription found. Subscribe to a mess first.')
    err.statusCode = 403
    throw err
  }

  if (subscription.paymentStatus !== 'PAID') {
    const err = new Error('Your payment is pending. Contact your mess owner.')
    err.statusCode = 403
    throw err
  }

  if (!subscription.plan.mealTypes.includes(mealType)) {
    const err = new Error(`Your plan does not include ${mealType}. Upgrade your plan.`)
    err.statusCode = 400
    throw err
  }

  const today = getToday()
  const mess = subscription.plan.mess

  const holiday = await prisma.holiday.findFirst({
    where: {
      messId: mess.id,
      date: today,
    },
  })

  if (holiday) {
    const err = new Error(`Today is a holiday: ${holiday.reason || 'No service today'}`)
    err.statusCode = 400
    throw err
  }

  let cutoffTime = null
  if (mealType === 'BREAKFAST') cutoffTime = mess.breakfastCutoff
  if (mealType === 'LUNCH') cutoffTime = mess.lunchCutoff
  if (mealType === 'DINNER') cutoffTime = mess.dinnerCutoff

  if (cutoffTime && !isBeforeCutoff(cutoffTime)) {
    const err = new Error(`Attendance window for ${mealType} is closed. Cutoff was ${cutoffTime}.`)
    err.statusCode = 400
    throw err
  }

  const existing = await prisma.attendanceLog.findFirst({
    where: {
      subscriptionId: subscription.id,
      date: today,
      mealType,
    },
  })

  if (existing) {
    const err = new Error(`You have already marked attendance for ${mealType} today.`)
    err.statusCode = 409
    throw err
  }

  const log = await prisma.attendanceLog.create({
    data: {
      subscriptionId: subscription.id,
      date: today,
      mealType,
      status: 'PRESENT',
    },
  })

  return log
}

const getMyAttendance = async (userId, filters = {}) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  })

  if (!subscription) {
    return []
  }

  const where = { subscriptionId: subscription.id }

  if (filters.month && filters.year) {
    const start = new Date(filters.year, filters.month - 1, 1)
    const end = new Date(filters.year, filters.month, 0)
    where.date = { gte: start, lte: end }
  }

  const logs = await prisma.attendanceLog.findMany({
    where,
    orderBy: { date: 'desc' },
  })

  return logs
}

const getTodayAttendance = async (userId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: 'ACTIVE' },
  })

  if (!subscription) return []

  const today = getToday()

  const logs = await prisma.attendanceLog.findMany({
    where: {
      subscriptionId: subscription.id,
      date: today,
    },
    include: {
      deliveryOrder: {
        include: {
          partner: {
            select: { id: true, name: true, phone: true },
          },
        },
      },
    },
  })

  return logs
}

const getMessAttendanceToday = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const today = getToday()

  const logs = await prisma.attendanceLog.findMany({
    where: {
      date: today,
      subscription: {
        plan: { messId: mess.id },
        status: 'ACTIVE',
      },
    },
    include: {
      subscription: {
        include: {
          user: {
            select: { id: true, name: true, phone: true, profilePhoto: true },
          },
          plan: {
            select: { name: true, mealTypes: true },
          },
        },
      },
    },
    orderBy: { markedAt: 'asc' },
  })

  const summary = {
    BREAKFAST: 0,
    LUNCH: 0,
    DINNER: 0,
    total: logs.length,
  }

  logs.forEach((log) => {
    summary[log.mealType]++
  })

  return { summary, logs }
}

const getMessAttendanceSummary = async (ownerId, filters = {}) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const where = {
    subscription: {
      plan: { messId: mess.id },
      status: 'ACTIVE',
    },
  }

  if (filters.startDate && filters.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    }
  } else {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    where.date = { gte: sevenDaysAgo }
  }

  if (filters.mealType) where.mealType = filters.mealType

  const logs = await prisma.attendanceLog.findMany({
    where,
    orderBy: { date: 'desc' },
    select: {
      date: true,
      mealType: true,
      status: true,
    },
  })

  const grouped = {}
  logs.forEach((log) => {
    const dateStr = log.date.toISOString().split('T')[0]
    if (!grouped[dateStr]) {
      grouped[dateStr] = { date: dateStr, BREAKFAST: 0, LUNCH: 0, DINNER: 0, total: 0 }
    }
    grouped[dateStr][log.mealType]++
    grouped[dateStr].total++
  })

  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date))
}

module.exports = {
  markAttendance,
  getMyAttendance,
  getTodayAttendance,
  getMessAttendanceToday,
  getMessAttendanceSummary,
}
