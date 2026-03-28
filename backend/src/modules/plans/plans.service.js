const prisma = require('../../config/db')

const createPlan = async (ownerId, data) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Create your mess first before adding plans')
    err.statusCode = 404
    throw err
  }

  const validMealTypes = ['BREAKFAST', 'LUNCH', 'DINNER']
  const validFoodCategories = ['VEG', 'NONVEG', 'EGG', 'VEGAN']
  const validDurations = ['WEEKLY', 'MONTHLY', 'CUSTOM']

  if (!data.name || data.name.trim().length < 2) {
    const err = new Error('Plan name must be at least 2 characters')
    err.statusCode = 400
    throw err
  }

  if (!data.mealTypes || !Array.isArray(data.mealTypes) || data.mealTypes.length === 0) {
    const err = new Error('At least one meal type is required')
    err.statusCode = 400
    throw err
  }

  const invalidMealTypes = data.mealTypes.filter(m => !validMealTypes.includes(m))
  if (invalidMealTypes.length > 0) {
    const err = new Error(`Invalid meal types: ${invalidMealTypes.join(', ')}`)
    err.statusCode = 400
    throw err
  }

  if (!validFoodCategories.includes(data.foodCategory)) {
    const err = new Error('Food category must be VEG, NONVEG, EGG, or VEGAN')
    err.statusCode = 400
    throw err
  }

  if (!validDurations.includes(data.duration)) {
    const err = new Error('Duration must be WEEKLY, MONTHLY, or CUSTOM')
    err.statusCode = 400
    throw err
  }

  if (!data.price || isNaN(data.price) || Number(data.price) <= 0) {
    const err = new Error('Valid price is required')
    err.statusCode = 400
    throw err
  }

  if (!data.maxSlots || isNaN(data.maxSlots) || Number(data.maxSlots) <= 0) {
    const err = new Error('Valid max slots is required')
    err.statusCode = 400
    throw err
  }

  const plan = await prisma.plan.create({
    data: {
      messId: mess.id,
      name: data.name.trim(),
      mealTypes: data.mealTypes,
      foodCategory: data.foodCategory,
      duration: data.duration,
      price: data.price,
      pricePerMeal: data.pricePerMeal || null,
      maxSlots: Number(data.maxSlots),
      description: data.description || null,
    },
  })

  return plan
}

const getMyPlans = async (ownerId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const plans = await prisma.plan.findMany({
    where: { messId: mess.id },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: {
          subscriptions: { where: { status: 'ACTIVE' } },
        },
      },
    },
  })

  return plans
}

const getPlansByMess = async (messId) => {
  const mess = await prisma.mess.findUnique({ where: { id: messId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const plans = await prisma.plan.findMany({
    where: { messId, isActive: true },
    orderBy: { price: 'asc' },
  })

  return plans
}

const updatePlan = async (ownerId, planId, data) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const plan = await prisma.plan.findFirst({
    where: { id: planId, messId: mess.id },
  })

  if (!plan) {
    const err = new Error('Plan not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.plan.update({
    where: { id: planId },
    data: {
      ...(data.name && { name: data.name.trim() }),
      ...(data.mealTypes && { mealTypes: data.mealTypes }),
      ...(data.foodCategory && { foodCategory: data.foodCategory }),
      ...(data.duration && { duration: data.duration }),
      ...(data.price && { price: data.price }),
      ...(data.pricePerMeal !== undefined && { pricePerMeal: data.pricePerMeal }),
      ...(data.maxSlots && { maxSlots: Number(data.maxSlots) }),
      ...(data.description !== undefined && { description: data.description }),
    },
  })

  return updated
}

const togglePlanStatus = async (ownerId, planId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const plan = await prisma.plan.findFirst({
    where: { id: planId, messId: mess.id },
  })

  if (!plan) {
    const err = new Error('Plan not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  const updated = await prisma.plan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  })

  return updated
}

const deletePlan = async (ownerId, planId) => {
  const mess = await prisma.mess.findFirst({ where: { ownerId } })
  if (!mess) {
    const err = new Error('Mess not found')
    err.statusCode = 404
    throw err
  }

  const plan = await prisma.plan.findFirst({
    where: { id: planId, messId: mess.id },
  })

  if (!plan) {
    const err = new Error('Plan not found or does not belong to your mess')
    err.statusCode = 404
    throw err
  }

  const activeSubscriptions = await prisma.subscription.count({
    where: { planId, status: 'ACTIVE' },
  })

  if (activeSubscriptions > 0) {
    const err = new Error(`Cannot delete plan with ${activeSubscriptions} active subscriber(s). Deactivate it instead.`)
    err.statusCode = 400
    throw err
  }

  await prisma.plan.delete({ where: { id: planId } })

  return { message: 'Plan deleted successfully' }
}

module.exports = {
  createPlan,
  getMyPlans,
  getPlansByMess,
  updatePlan,
  togglePlanStatus,
  deletePlan,
}