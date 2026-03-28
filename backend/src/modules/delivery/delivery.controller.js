const deliveryService = require('./delivery.service')
const { success, created, error, badRequest } = require('../../utils/response')

const generateDeliveryOrders = async (req, res) => {
  try {
    const result = await deliveryService.generateDeliveryOrders(req.user.id)
    return created(res, result, `${result.generated} delivery orders generated`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getTodayOrders = async (req, res) => {
  try {
    const result = await deliveryService.getTodayOrders(req.user.id)
    return success(res, result, "Today's orders fetched")
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const assignDeliveryPartner = async (req, res) => {
  try {
    const { partnerId } = req.body
    if (!partnerId) return badRequest(res, 'partnerId is required')
    const order = await deliveryService.assignDeliveryPartner(req.user.id, req.params.id, partnerId)
    return success(res, order, 'Delivery partner assigned')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const bulkAssignPartner = async (req, res) => {
  try {
    const { orderIds, partnerId } = req.body
    if (!orderIds || !partnerId) return badRequest(res, 'orderIds and partnerId are required')
    const result = await deliveryService.bulkAssignPartner(req.user.id, orderIds, partnerId)
    return success(res, result, `${result.assigned} orders assigned`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyOrders = async (req, res) => {
  try {
    const orders = await deliveryService.getMyOrders(req.user.id)
    return success(res, orders, 'Your orders fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const markPickedUp = async (req, res) => {
  try {
    const order = await deliveryService.markPickedUp(req.user.id, req.params.id)
    return success(res, order, 'Order marked as picked up')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const markDelivered = async (req, res) => {
  try {
    const order = await deliveryService.markDelivered(req.user.id, req.params.id)
    return success(res, order, 'Order marked as delivered')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const markFailed = async (req, res) => {
  try {
    const { failureReason } = req.body
    const order = await deliveryService.markFailed(req.user.id, req.params.id, failureReason)
    return success(res, order, 'Order marked as failed')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await deliveryService.getDeliveryPartners(req.user.id)
    return success(res, partners, 'Delivery partners fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
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
