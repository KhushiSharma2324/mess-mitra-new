const plansService = require('./plans.service')
const { success, created, error, badRequest } = require('../../utils/response')

const createPlan = async (req, res) => {
  try {
    const plan = await plansService.createPlan(req.user.id, req.body)
    return created(res, plan, 'Plan created successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyPlans = async (req, res) => {
  try {
    const plans = await plansService.getMyPlans(req.user.id)
    return success(res, plans, 'Plans fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getPlansByMess = async (req, res) => {
  try {
    const plans = await plansService.getPlansByMess(req.params.messId)
    return success(res, plans, 'Plans fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const updatePlan = async (req, res) => {
  try {
    const plan = await plansService.updatePlan(req.user.id, req.params.id, req.body)
    return success(res, plan, 'Plan updated successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const togglePlanStatus = async (req, res) => {
  try {
    const plan = await plansService.togglePlanStatus(req.user.id, req.params.id)
    return success(res, plan, `Plan is now ${plan.isActive ? 'active' : 'inactive'}`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const deletePlan = async (req, res) => {
  try {
    const result = await plansService.deletePlan(req.user.id, req.params.id)
    return success(res, result, 'Plan deleted')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = {
  createPlan,
  getMyPlans,
  getPlansByMess,
  updatePlan,
  togglePlanStatus,
  deletePlan,
}