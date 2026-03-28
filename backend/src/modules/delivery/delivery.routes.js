const express = require('express')
const router = express.Router()
const {
  generateDeliveryOrders,
  getTodayOrders,
  assignDeliveryPartner,
  bulkAssignPartner,
  getMyOrders,
  markPickedUp,
  markDelivered,
  markFailed,
  getDeliveryPartners,
} = require('./delivery.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.post('/generate', authenticate, requireRole('OWNER'), generateDeliveryOrders)
router.get('/today', authenticate, requireRole('OWNER'), getTodayOrders)
router.get('/partners', authenticate, requireRole('OWNER'), getDeliveryPartners)
router.patch('/:id/assign', authenticate, requireRole('OWNER'), assignDeliveryPartner)
router.post('/bulk-assign', authenticate, requireRole('OWNER'), bulkAssignPartner)

router.get('/my', authenticate, requireRole('DELIVERY'), getMyOrders)
router.patch('/:id/pickup', authenticate, requireRole('DELIVERY'), markPickedUp)
router.patch('/:id/deliver', authenticate, requireRole('DELIVERY'), markDelivered)
router.patch('/:id/fail', authenticate, requireRole('DELIVERY'), markFailed)

module.exports = router
