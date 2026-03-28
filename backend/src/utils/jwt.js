const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = '7d'

const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET)
  } catch (err) {
    return null
  }
}

module.exports = {
  generateToken,
  verifyToken,
}