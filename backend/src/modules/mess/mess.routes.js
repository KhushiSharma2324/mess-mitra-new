const express = require('express')
const router = express.Router()
const {
  createMess,
  getMyMess,
  updateMess,
  toggleMessStatus,
  getAllMess,
  getMessById,
} = require('./mess.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.get('/', getAllMess)
router.get('/my', authenticate, requireRole('OWNER'), getMyMess)
router.get('/:id', getMessById)
router.post('/', authenticate, requireRole('OWNER'), createMess)
router.put('/my', authenticate, requireRole('OWNER'), updateMess)
router.patch('/my/toggle', authenticate, requireRole('OWNER'), toggleMessStatus)

module.exports = router