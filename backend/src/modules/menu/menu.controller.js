const menuService = require('./menu.service')
const { success, created, error, badRequest } = require('../../utils/response')

const publishMenuItem = async (req, res) => {
  try {
    const item = await menuService.publishMenuItem(req.user.id, req.body)
    return created(res, item, 'Menu item published')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const publishBulkMenu = async (req, res) => {
  try {
    const { items } = req.body
    if (!items) return badRequest(res, 'items array is required')
    const result = await menuService.publishBulkMenu(req.user.id, items)
    return created(res, result, `${result.length} menu items published`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMenuByMess = async (req, res) => {
  try {
    const { date, mealType, foodCategory } = req.query
    const menu = await menuService.getMenuByMess(req.params.messId, {
      date,
      mealType,
      foodCategory,
    })
    return success(res, menu, 'Menu fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyMenu = async (req, res) => {
  try {
    const { date, mealType } = req.query
    const menu = await menuService.getMyMenu(req.user.id, { date, mealType })
    return success(res, menu, 'Menu fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const updateMenuItem = async (req, res) => {
  try {
    const item = await menuService.updateMenuItem(req.user.id, req.params.id, req.body)
    return success(res, item, 'Menu item updated')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const deleteMenuItem = async (req, res) => {
  try {
    const result = await menuService.deleteMenuItem(req.user.id, req.params.id)
    return success(res, result, 'Menu item deleted')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const toggleItemAvailability = async (req, res) => {
  try {
    const item = await menuService.toggleItemAvailability(req.user.id, req.params.id)
    return success(res, item, `Item is now ${item.isAvailable ? 'available' : 'unavailable'}`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
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
