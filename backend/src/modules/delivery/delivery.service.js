const prisma = require('../../config/db')
const { getToday } = require('../../utils/date')

const generateDeliveryOrders = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const today = getToday()

  const holiday = await prisma.holiday.findFirst({
    where: { messId: mess.id, date: today },
  })

  if (holiday) {
    const err = new Error(`Today is a holiday: ${holiday.reason || 'No service'}. Cannot generate orders.`)
    err.statusCode = 400
    throw err
  }

  const attendanceLogs = await prisma.attendanceLog.findMany({
    where: {
      date: today,
      status: 'PRESENT',
      subscription: {
        plan: { messId: mess.id },
        status: 'ACTIVE',
      },
      deliveryOrder: null,
    },
    include: {
      subscription: {
        select: {
          deliveryAddress: true,
          deliveryLat: true,
          deliveryLng: true,
          specialInstructions: true,
        },
      },
    },
  })

  if (attendanceLogs.length === 0) {
    const err = new Error('No attendance records found for today or orders already generated')
    err.statusCode = 400
    throw err
  }

  const orders = await prisma.$transaction(
    attendanceLogs.map((log) =>
      prisma.deliveryOrder.create({
        data: {
          attendanceLogId: log.id,
          messId: mess.id,
          deliveryAddress: log.subscription.deliveryAddress,
          deliveryLat: log.subscription.deliveryLat,
          deliveryLng: log.subscription.deliveryLng,
          status: 'PENDING',
        },
      })
    )
  )

  return { generated: orders.length, orders }
}

const getTodayOrders = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const today = getToday()

  const orders = await prisma.deliveryOrder.findMany({
    where: {
      messId: mess.id,
      createdAt: { gte: today },
    },
    include: {
      attendanceLog: {
        include: {
          subscription: {
            include: {
              user: { select: { id: true, name: true, phone: true } },
            },
          },
        },
      },
      partner: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const summary = {
    total: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    ASSIGNED: orders.filter((o) => o.status === 'ASSIGNED').length,
    PICKED_UP: orders.filter((o) => o.status === 'PICKED_UP').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    FAILED: orders.filter((o) => o.status === 'FAILED').length,
  }

  return { summary, orders }
}

const assignDeliveryPartner = async (ownerId, orderId, partnerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const order = await prisma.deliveryOrder.findFirst({
    where: { id: orderId, messId: mess.id },
  })

  if (!order) {
    const err = new Error('Delivery order not found')
    err.statusCode = 404
    throw err
  }

  if (!['PENDING', 'ASSIGNED'].includes(order.status)) {
    const err = new Error('Can only assign partners to pending or already assigned orders')
    err.statusCode = 400
    throw err
  }

  const partner = await prisma.user.findFirst({
    where: { id: partnerId, role: 'DELIVERY', isActive: true },
  })

  if (!partner) {
    const err = new Error('Delivery partner not found or inactive')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: {
      partnerId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    },
    include: {
      partner: { select: { id: true, name: true, phone: true } },
    },
  })

  return updated
}

const bulkAssignPartner = async (ownerId, orderIds, partnerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const partner = await prisma.user.findFirst({
    where: { id: partnerId, role: 'DELIVERY', isActive: true },
  })

  if (!partner) {
    const err = new Error('Delivery partner not found or inactive')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.deliveryOrder.updateMany({
    where: {
      id: { in: orderIds },
      messId: mess.id,
      status: { in: ['PENDING', 'ASSIGNED'] },
    },
    data: {
      partnerId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
    },
  })

  return { assigned: updated.count }
}

const getMyOrders = async (partnerId) => {
  const today = getToday()

  const orders = await prisma.deliveryOrder.findMany({
    where: {
      partnerId,
      createdAt: { gte: today },
      status: { in: ['ASSIGNED', 'PICKED_UP'] },
    },
    include: {
      attendanceLog: {
        include: {
          subscription: {
            include: {
              user: { select: { name: true, phone: true } },
              plan: { select: { name: true, mealTypes: true } },
            },
          },
        },
      },
      mess: { select: { name: true, address: true, phone: true } },
    },
    orderBy: { assignedAt: 'asc' },
  })

  return orders
}

const markPickedUp = async (partnerId, orderId) => {
  const order = await prisma.deliveryOrder.findFirst({
    where: { id: orderId, partnerId },
  })

  if (!order) {
    const err = new Error('Order not found or not assigned to you')
    err.statusCode = 404
    throw err
  }

  if (order.status !== 'ASSIGNED') {
    const err = new Error('Order must be in ASSIGNED status to mark as picked up')
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: { status: 'PICKED_UP', pickedUpAt: new Date() },
  })

  return updated
}

const markDelivered = async (partnerId, orderId) => {
  const order = await prisma.deliveryOrder.findFirst({
    where: { id: orderId, partnerId },
  })

  if (!order) {
    const err = new Error('Order not found or not assigned to you')
    err.statusCode = 404
    throw err
  }

  if (order.status !== 'PICKED_UP') {
    const err = new Error('Order must be picked up before marking as delivered')
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: { status: 'DELIVERED', deliveredAt: new Date() },
  })

  return updated
}

const markFailed = async (partnerId, orderId, failureReason) => {
  const order = await prisma.deliveryOrder.findFirst({
    where: { id: orderId, partnerId },
  })

  if (!order) {
    const err = new Error('Order not found or not assigned to you')
    err.statusCode = 404
    throw err
  }

  if (!['ASSIGNED', 'PICKED_UP'].includes(order.status)) {
    const err = new Error('Cannot mark this order as failed')
    err.statusCode = 400
    throw err
  }

  const updated = await prisma.deliveryOrder.update({
    where: { id: orderId },
    data: {
      status: 'FAILED',
      failureReason: failureReason || 'No reason provided',
    },
  })

  return updated
}

const getDeliveryPartners = async (ownerId) => {
  const partners = await prisma.user.findMany({
    where: { role: 'DELIVERY', isActive: true },
    select: {
      id: true,
      name: true,
      phone: true,
      profilePhoto: true,
    },
  })

  return partners
}

module.exports = {
  generateDeliveryOrders,
  getTodayOrders,
  assignDeliveryPartner,
  bulkAssignPartner,
  getMyOrders,
  markPickedUp,
  markDelivered,
  markFailed,
  getDeliveryPartners,
}
