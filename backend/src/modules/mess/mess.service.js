const prisma = require('../../config/db')

const createMess = async (ownerId, data) => {
  const existing = await prisma.mess.findFirst({ where: { ownerId } })
  if (existing) {
    const err = new Error('You already have a mess. Only one mess per owner allowed in v1.')
    err.statusCode = 409
    throw err
  }

  const mess = await prisma.mess.create({
    data: {
      ownerId,
      name: data.name.trim(),
      description: data.description || null,
      address: data.address.trim(),
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      category: data.category,
      coverPhoto: data.coverPhoto || null,
      phone: data.phone.trim(),
      openingTime: data.openingTime,
      closingTime: data.closingTime,
      breakfastCutoff: data.breakfastCutoff || null,
      lunchCutoff: data.lunchCutoff || null,
      dinnerCutoff: data.dinnerCutoff || null,
    },
  })

  return mess
}

const getMyMess = async (ownerId) => {
  const mess = await prisma.mess.findFirst({
    where: { ownerId },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!mess) {
    const err = new Error('No mess found. Please create your mess first.')
    err.statusCode = 404
    throw err
  }

  return mess
}

const updateMess = async (ownerId, data) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.mess.update({
    where: { id: mess.id },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.address && { address: data.address.trim() }),
      ...(data.latitude !== undefined && { latitude: data.latitude }),
      ...(data.longitude !== undefined && { longitude: data.longitude }),
      ...(data.category && { category: data.category }),
      ...(data.coverPhoto !== undefined && { coverPhoto: data.coverPhoto }),
      ...(data.phone && { phone: data.phone.trim() }),
      ...(data.openingTime && { openingTime: data.openingTime }),
      ...(data.closingTime && { closingTime: data.closingTime }),
      ...(data.breakfastCutoff !== undefined && { breakfastCutoff: data.breakfastCutoff }),
      ...(data.lunchCutoff !== undefined && { lunchCutoff: data.lunchCutoff }),
      ...(data.dinnerCutoff !== undefined && { dinnerCutoff: data.dinnerCutoff }),
    },
  })

  return updated
}

const toggleMessStatus = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.mess.update({
    where: { id: mess.id },
    data: { isActive: !mess.isActive },
  })

  return updated
}

const getAllMess = async (filters = {}) => {
  const where = { isActive: true }

  if (filters.category) where.category = filters.category
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { address: { contains: filters.search, mode: 'insensitive' } },
    ]
  }

  const messList = await prisma.mess.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      category: true,
      coverPhoto: true,
      phone: true,
      openingTime: true,
      closingTime: true,
      avgRating: true,
      totalReviews: true,
      plans: {
        where: { isActive: true },
        select: { price: true },
        orderBy: { price: 'asc' },
        take: 1,
      },
    },
    orderBy: { avgRating: 'desc' },
  })

  return messList
}

const getMessById = async (messId) => {
  const mess = await prisma.mess.findUnique({
    where: { id: messId },
    include: {
      plans: {
        where: { isActive: true },
        orderBy: { price: 'asc' },
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: { name: true, profilePhoto: true },
          },
        },
      },

    },
  })

  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  return mess
}

module.exports = {
  createMess,
  getMyMess,
  updateMess,
  toggleMessStatus,
  getAllMess,
  getMessById,
}