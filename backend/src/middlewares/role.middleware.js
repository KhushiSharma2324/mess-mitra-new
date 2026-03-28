const { forbidden } = require('../utils/response')

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbidden(res, 'Not authenticated')
    }

    if (!roles.includes(req.user.role)) {
      return forbidden(res, `Access denied. Required role: ${roles.join(' or ')}`)
    }

    next()
  }
}

module.exports = { requireRole }