const { verifyToken } = require('../utils/jwt')
const { unauthorized } = require('../utils/response')
const prisma = require('../config/db')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'No token provided')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return unauthorized(res, 'Invalid or expired token')
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
      },
    })

    if (!user) {
      return unauthorized(res, 'User not found')
    }

    if (!user.isActive) {
      return unauthorized(res, 'Account is deactivated')
    }

    req.user = user
    next()
  } catch (err) {
    return unauthorized(res, 'Authentication failed')
  }
}

module.exports = { authenticate }