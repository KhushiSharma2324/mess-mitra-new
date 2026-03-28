const authService = require('./auth.service')
const { validateRegister, validateLogin } = require('./auth.validator')
const { success, created, error, badRequest } = require('../../utils/response')

const register = async (req, res) => {
  try {
    const errors = validateRegister(req.body)
    if (errors.length > 0) {
      return badRequest(res, 'Validation failed', errors)
    }

    const { name, email, phone, password, role } = req.body
    const result = await authService.registerUser({ name, email, phone, password, role })

    return created(res, result, 'Account created successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const login = async (req, res) => {
  try {
    const errors = validateLogin(req.body)
    if (errors.length > 0) {
      return badRequest(res, 'Validation failed', errors)
    }

    const { email, password } = req.body
    const result = await authService.loginUser({ email, password })

    return success(res, result, 'Login successful')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id)
    return success(res, user, 'Profile fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await authService.updateProfile(req.user.id, { name, phone })
    return success(res, user, 'Profile updated')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return badRequest(res, 'Current password and new password are required')
    }

    const result = await authService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
    })

    return success(res, result, 'Password changed successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = { register, login, getProfile, updateProfile, changePassword }