const express = require('express')
const router = express.Router()
const {
  requestSubscription,
  getMySubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getMessSubscriptions,
  approveSubscription,
  markPayment,
  rejectSubscription,
} = require('./subscriptions.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.post('/', authenticate, requireRole('STUDENT'), requestSubscription)
router.get('/me', authenticate, requireRole('STUDENT'), getMySubscription)
router.get('/me/history', authenticate, requireRole('STUDENT'), getSubscriptionHistory)
router.patch('/:id/cancel', authenticate, requireRole('STUDENT'), cancelSubscription)

router.get('/mess', authenticate, requireRole('OWNER'), getMessSubscriptions)
router.patch('/:id/approve', authenticate, requireRole('OWNER'), approveSubscription)
router.patch('/:id/payment', authenticate, requireRole('OWNER'), markPayment)
router.patch('/:id/reject', authenticate, requireRole('OWNER'), rejectSubscription)

module.exports = router