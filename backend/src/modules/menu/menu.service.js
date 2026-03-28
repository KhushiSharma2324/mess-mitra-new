const prisma = require('../../config/db')
const { getToday } = require('../../utils/date')

const publishMenuItem = async (ownerId, data) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const validMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
  const validFoodCategories = ['VEG', 'NONVEG', 'EGG', 'VEGAN']

  if (!data.itemName || data.itemName.trim().length < 2) {
    const err = new Error('Item name must be at least 2 characters')
    err.statusCode = 400
    throw err
  }

  if (!validMealTypes.includes(data.mealType)) {
    const err = new Error('Meal type must be BREAKFAST, LUNCH, or DINNER')
    err.statusCode = 400
    throw err
  }

  if (!validFoodCategories.includes(data.foodCategory)) {
    const err = new Error('Food category must be VEG, NONVEG, EGG, or VEGAN')
    err.statusCode = 400
    throw err
  }

  const availableDate = data.availableDate ? new Date(data.availableDate) : getToday()

  const item = await prisma.menuItem.create({
    data: {
      messId: mess.id,
      itemName: data.itemName.trim(),
      mealType: data.mealType,
      foodCategory: data.foodCategory,
      availableDate,
      isAvailable: true,
    },
  })

  return item
}

const publishBulkMenu = async (ownerId, items) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Items array is required')
    err.statusCode = 400
    throw err
  }

  const created = await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.create({
        data: {
          messId: mess.id,
          itemName: item.itemName.trim(),
          mealType: item.mealType,
          foodCategory: item.foodCategory,
          availableDate: item.availableDate ? new Date(item.availableDate) : getToday(),
          isAvailable: true,
        },
      })
    )
  )

  return created
}

const getMenuByMess = async (messId, filters = {}) => {
  const mess = await prisma.mess.findUnique({ where: { id: messId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const where = { messId }

  if (filters.date) {
    where.availableDate = new Date(filters.date)
  } else {
    where.availableDate = getToday()
  }

  if (filters.mealType) where.mealType = filters.mealType
  if (filters.foodCategory) where.foodCategory = filters.foodCategory

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ mealType: 'asc' }, { createdAt: 'asc' }],
  })

  const grouped = {
    BREAKFAST: items.filter((i) => i.mealType === 'BREAKFAST'),
    LUNCH: items.filter((i) => i.mealType === 'LUNCH'),
    DINNER: items.filter((i) => i.mealType === 'DINNER'),
  }

  return grouped
}

const getMyMenu = async (ownerId, filters = {}) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  return getMenuByMess(mess.id, filters)
}

const updateMenuItem = async (ownerId, itemId, data) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, messId: mess.id },
  })

  if (!item) {
    const err = new Error('Menu item not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.menuItem.update({
    where: { id: itemId },
    data: {
      ...(data.itemName && { itemName: data.itemName.trim() }),
      ...(data.mealType && { mealType: data.mealType }),
      ...(data.foodCategory && { foodCategory: data.foodCategory }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    },
  })

  return updated
}

const deleteMenuItem = async (ownerId, itemId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, messId: mess.id },
  })

  if (!item) {
    const err = new Error('Menu item not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  await prisma.menuItem.delete({ where: { id: itemId } })

  return { message: 'Menu item deleted' }
}

const toggleItemAvailability = async (ownerId, itemId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, messId: mess.id },
  })

  if (!item) {
    const err = new Error('Menu item not found')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.menuItem.update({
    where: { id: itemId },
    data: { isAvailable: !item.isAvailable },
  })

  return updated
}

module.exports = {
  publishMenuItem,
  publishBulkMenu,
  getMenuByMess,
  getMyMenu,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
}
