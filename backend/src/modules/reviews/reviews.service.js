const prisma = require('../../config/db')

const submitReview = async (userId, { deliveryOrderId, rating, foodRating, deliveryRating, comment }) => {
  if (!rating || rating < 1 || rating > 5) {
    const err = new Error('Rating must be between 1 and 5')
    err.statusCode = 400
    throw err
  }

  const deliveryOrder = await prisma.deliveryOrder.findUnique({
    where: { id: deliveryOrderId },
    include: {
      attendanceLog: {
        include: { subscription: true },
      },
    },
  })

  if (!deliveryOrder) {
    const err = new Error('Delivery order not found')
    err.statusCode = 404
    throw err
  }

  if (deliveryOrder.attendanceLog.subscription.userId !== userId) {
    const err = new Error('This delivery does not belong to you')
    err.statusCode = 403
    throw err
  }

  if (deliveryOrder.status !== 'DELIVERED') {
    const err = new Error('You can only review after the meal has been delivered')
    err.statusCode = 400
    throw err
  }

  const existing = await prisma.review.findFirst({
    where: { userId, deliveryOrderId },
  })

  if (existing) {
    const err = new Error('You have already reviewed this delivery')
    err.statusCode = 409
    throw err
  }

  const review = await prisma.review.create({
    data: {
      userId,
      messId: deliveryOrder.messId,
      deliveryOrderId,
      rating,
      foodRating: foodRating || null,
      deliveryRating: deliveryRating || null,
      comment: comment || null,
    },
  })

  const allReviews = await prisma.review.aggregate({
    where: { messId: deliveryOrder.messId, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await prisma.mess.update({
    where: { id: deliveryOrder.messId },
    data: {
      avgRating: Math.round((allReviews._avg.rating || 0) * 10) / 10,
      totalReviews: allReviews._count.rating,
    },
  })

  return review
}

const getReviewsByMess = async (messId, filters = {}) => {
  const reviews = await prisma.review.findMany({
    where: { messId, isVisible: true },
    orderBy: { createdAt: 'desc' },
    take: filters.limit ? Number(filters.limit) : 20,
    include: {
      user: { select: { name: true, profilePhoto: true } },
    },
  })

  const summary = await prisma.review.aggregate({
    where: { messId, isVisible: true },
    _avg: { rating: true, foodRating: true, deliveryRating: true },
    _count: { rating: true },
  })

  return { summary, reviews }
}

const getMyReviews = async (userId) => {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      mess: { select: { name: true, coverPhoto: true } },
    },
  })

  return reviews
}

const getOwnerReviews = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  return getReviewsByMess(mess.id)
}

module.exports = { submitReview, getReviewsByMess, getMyReviews, getOwnerReviews }
