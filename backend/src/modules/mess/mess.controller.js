const messService = require('./mess.service')
const { success, created, error, badRequest } = require('../../utils/response')

const createMess = async (req, res) => {
  try {
    const required = ['name', 'address', 'category', 'phone', 'openingTime', 'closingTime']
    const missing = required.filter((f) => !req.body[f])
    if (missing.length > 0) {
      return badRequest(res, `Missing required fields: ${missing.join(', ')}`)
    }

    const validCategories = ['PURE_VEG', 'NONVEG', 'BOTH']
    if (!validCategories.includes(req.body.category)) {
      return badRequest(res, 'Category must be PURE_VEG, NONVEG, or BOTH')
    }

    const mess = await messService.createMess(req.user.id, req.body)
    return created(res, mess, 'Mess created successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyMess = async (req, res) => {
  try {
    const mess = await messService.getMyMess(req.user.id)
    return success(res, mess, 'Mess fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const updateMess = async (req, res) => {
  try {
    const mess = await messService.updateMess(req.user.id, req.body)
    return success(res, mess, 'Mess updated successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const toggleMessStatus = async (req, res) => {
  try {
    const mess = await messService.toggleMessStatus(req.user.id)
    return success(res, mess, `Mess is now ${mess.isActive ? 'active' : 'inactive'}`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getAllMess = async (req, res) => {
  try {
    const { category, search } = req.query
    const messList = await messService.getAllMess({ category, search })
    return success(res, messList, 'Mess list fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMessById = async (req, res) => {
  try {
    const mess = await messService.getMessById(req.params.id)
    return success(res, mess, 'Mess detail fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = {
  createMess,
  getMyMess,
  updateMess,
  toggleMessStatus,
  getAllMess,
  getMessById,
}