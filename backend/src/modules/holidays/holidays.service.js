const prisma = require('../../config/db')
const { getToday } = require('../../utils/date')

const declareHoliday = async (ownerId, { date, reason }) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  if (!date) {
    const err = new Error('Date is required')
    err.statusCode = 400
    throw err
  }

  const holidayDate = new Date(date)
  const today = getToday()

  if (holidayDate < today) {
    const err = new Error('Cannot declare holiday for a past date')
    err.statusCode = 400
    throw err
  }

  const existing = await prisma.holiday.findFirst({
    where: { messId: mess.id, date: holidayDate },
  })

  if (existing) {
    const err = new Error('Holiday already declared for this date')
    err.statusCode = 409
    throw err
  }

  const holiday = await prisma.holiday.create({
    data: {
      messId: mess.id,
      date: holidayDate,
      reason: reason || null,
    },
  })

  return holiday
}

const getHolidaysByMess = async (messId) => {
  const today = getToday()

  const holidays = await prisma.holiday.findMany({
    where: {
      messId,
      date: { gte: today },
    },
    orderBy: { date: 'asc' },
  })

  return holidays
}

const getMyHolidays = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  return getHolidaysByMess(mess.id)
}

const deleteHoliday = async (ownerId, holidayId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const holiday = await prisma.holiday.findFirst({
    where: { id: holidayId, messId: mess.id },
  })

  if (!holiday) {
    const err = new Error('Holiday not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  await prisma.holiday.delete({ where: { id: holidayId } })

  return { message: 'Holiday cancelled successfully' }
}

module.exports = {
  declareHoliday,
  getHolidaysByMess,
  getMyHolidays,
  deleteHoliday,
}
