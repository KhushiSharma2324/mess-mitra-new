const subscriptionsService = require('./subscriptions.service')
const { success, created, error, badRequest } = require('../../utils/response')

const requestSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionsService.requestSubscription(req.user.id, req.body)
    return created(res, subscription, 'Subscription request sent. Wait for owner approval.')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMySubscription = async (req, res) => {
  try {
    const subscription = await subscriptionsService.getMySubscription(req.user.id)
    return success(res, subscription, 'Subscription fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getSubscriptionHistory = async (req, res) => {
  try {
    const history = await subscriptionsService.getSubscriptionHistory(req.user.id)
    return success(res, history, 'Subscription history fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const cancelSubscription = async (req, res) => {
  try {
    const result = await subscriptionsService.cancelSubscription(req.user.id, req.params.id)
    return success(res, result, 'Subscription cancelled')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMessSubscriptions = async (req, res) => {
  try {
    const { status, paymentStatus, planId } = req.query
    const subscriptions = await subscriptionsService.getMessSubscriptions(req.user.id, {
      status,
      paymentStatus,
      planId,
    })
    return success(res, subscriptions, 'Subscriptions fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const approveSubscription = async (req, res) => {
  try {
    const result = await subscriptionsService.approveSubscription(req.user.id, req.params.id)
    return success(res, result, 'Subscription approved. Student is now active.')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const markPayment = async (req, res) => {
  try {
    const result = await subscriptionsService.markPayment(req.user.id, req.params.id)
    return success(res, result, 'Payment marked as paid')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const rejectSubscription = async (req, res) => {
  try {
    const result = await subscriptionsService.rejectSubscription(req.user.id, req.params.id)
    return success(res, result, 'Subscription rejected')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
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