const express = require('express')
const router = express.Router()
const {
  publishMenuItem,
  publishBulkMenu,
  getMenuByMess,
  getMyMenu,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
} = require('./menu.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.get('/mess/:messId', getMenuByMess)
router.get('/my', authenticate, requireRole('OWNER'), getMyMenu)
router.post('/', authenticate, requireRole('OWNER'), publishMenuItem)
router.post('/bulk', authenticate, requireRole('OWNER'), publishBulkMenu)
router.put('/:id', authenticate, requireRole('OWNER'), updateMenuItem)
router.patch('/:id/toggle', authenticate, requireRole('OWNER'), toggleItemAvailability)
router.delete('/:id', authenticate, requireRole('OWNER'), deleteMenuItem)

module.exports = router
