const express = require('express')
const router = express.Router()
const {
  createPlan,
  getMyPlans,
  getPlansByMess,
  updatePlan,
  togglePlanStatus,
  deletePlan,
} = require('./plans.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.get('/my', authenticate, requireRole('OWNER'), getMyPlans)
router.get('/mess/:messId', getPlansByMess)
router.post('/', authenticate, requireRole('OWNER'), createPlan)
router.put('/:id', authenticate, requireRole('OWNER'), updatePlan)
router.patch('/:id/toggle', authenticate, requireRole('OWNER'), togglePlanStatus)
router.delete('/:id', authenticate, requireRole('OWNER'), deletePlan)

module.exports = router