const prisma = require('../../config/db')
const { addWeeks, addMonths } = require('../../utils/date')

const requestSubscription = async (userId, data) => {
  if (!data.planId) {
    const err = new Error('Plan ID is required')
    err.statusCode = 400
    throw err
  }

  if (!data.deliveryAddress || data.deliveryAddress.trim().length < 5) {
    const err = new Error('Valid delivery address is required')
    err.statusCode = 400
    throw err
  }

  const plan = await prisma.plan.findUnique({
    where: { id: data.planId },
    include: { mess: true },
  })

  if (!plan) {
    const err = new Error('Plan not found')
    err.statusCode = 404
    throw err
  }

  if (!plan.isActive) {
    const err = new Error('This plan is no longer available')
    err.statusCode = 400
    throw err
  }

  if (!plan.mess.isActive) {
    const err = new Error('This mess is not currently active')
    err.statusCode = 400
    throw err
  }

  if (plan.currentSlots >= plan.maxSlots) {
    const err = new Error('This plan is fully booked. No slots available.')
    err.statusCode = 400
    throw err
  }

  const existingActive = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PENDING'] },
    },
  })

  if (existingActive) {
    const err = new Error(
      existingActive.status === 'PENDING'
        ? 'You already have a pending subscription request. Wait for owner approval.'
        : 'You are already subscribed to a mess. Cancel your current subscription first.'
    )
    err.statusCode = 409
    throw err
  }

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      planId: data.planId,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      deliveryAddress: data.deliveryAddress.trim(),
      deliveryLat: data.deliveryLat || null,
      deliveryLng: data.deliveryLng || null,
      specialInstructions: data.specialInstructions || null,
    },
    include: {
      plan: {
        include: { mess: { select: { name: true, phone: true } } },
      },
    },
  })

  return subscription
}

const getMySubscription = async (userId) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PENDING', 'PAUSED'] },
    },
    include: {
      plan: {
        include: {
          mess: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
              coverPhoto: true,
              breakfastCutoff: true,
              lunchCutoff: true,
              dinnerCutoff: true,
            },
          },
        },
      },
    },
  })

  return subscription
}

const getSubscriptionHistory = async (userId) => {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      plan: {
        include: {
          mess: { select: { name: true, address: true } },
        },
      },
    },
  })

  return subscriptions
}

const cancelSubscription = async (userId, subscriptionId) => {
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, userId },
  })

  if (!subscription) {
    const err = new Error('Subscription not found')
    err.statusCode = 404
    throw err
  }

  if (!['ACTIVE', 'PENDING'].includes(subscription.status)) {
    const err = new Error('Only active or pending subscriptions can be cancelled')
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'CANCELLED' },
  })

  if (subscription.status === 'ACTIVE') {
    await prisma.plan.update({
      where: { id: subscription.planId },
      data: { currentSlots: { decrement: 1 } },
    })
  }

  return updated
}

const getMessSubscriptions = async (ownerId, filters = {}) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const where = {
    plan: { messId: mess.id },
  }

  if (filters.status) where.status = filters.status
  if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus
  if (filters.planId) where.planId = filters.planId

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true, profilePhoto: true },
      },
      plan: {
        select: { id: true, name: true, mealTypes: true, price: true, duration: true },
      },
    },
  })

  return subscriptions
}

const approveSubscription = async (ownerId, subscriptionId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    const err = new Error('Subscription not found')
    err.statusCode = 404
    throw err
  }

  if (subscription.plan.messId !== mess.id) {
    const err = new Error('This subscription does not belong to your mess')
    err.statusCode = 403
    throw err
  }

  if (subscription.status !== 'PENDING') {
    const err = new Error('Only pending subscriptions can be approved')
    err.statusCode = 400
    throw err
  }

  if (subscription.paymentStatus !== 'PAID') {
    const err = new Error('Cannot approve — student has not paid yet. Mark payment first.')
    err.statusCode = 400
    throw err
  }

  if (subscription.plan.currentSlots >= subscription.plan.maxSlots) {
    const err = new Error('Plan is fully booked. Cannot approve.')
    err.statusCode = 400
    throw err
  }

  const startDate = new Date()
  let endDate

  if (subscription.plan.duration === 'WEEKLY') {
    endDate = addWeeks(startDate, 1)
  } else if (subscription.plan.duration === 'MONTHLY') {
    endDate = addMonths(startDate, 1)
  } else {
    endDate = addMonths(startDate, 1)
  }

  const [updated] = await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'ACTIVE', startDate, endDate },
    }),
    prisma.plan.update({
      where: { id: subscription.planId },
      data: { currentSlots: { increment: 1 } },
    }),
  ])

  return updated
}

const markPayment = async (ownerId, subscriptionId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    const err = new Error('Subscription not found')
    err.statusCode = 404
    throw err
  }

  if (subscription.plan.messId !== mess.id) {
    const err = new Error('This subscription does not belong to your mess')
    err.statusCode = 403
    throw err
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { paymentStatus: 'PAID' },
  })

  return updated
}

const rejectSubscription = async (ownerId, subscriptionId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId },
    include: { plan: true },
  })

  if (!subscription) {
    const err = new Error('Subscription not found')
    err.statusCode = 404
    throw err
  }

  if (subscription.plan.messId !== mess.id) {
    const err = new Error('This subscription does not belong to your mess')
    err.statusCode = 403
    throw err
  }

  if (subscription.status !== 'PENDING') {
    const err = new Error('Only pending subscriptions can be rejected')
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'CANCELLED' },
  })

  return updated
}

module.exports = {
  requestSubscription,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getMessSubscriptions,
  approveSubscription,
  markPayment,
  rejectSubscription,
}