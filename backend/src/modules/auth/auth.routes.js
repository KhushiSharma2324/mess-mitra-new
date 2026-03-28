const express = require('express')
const router = express.Router()
const { register, login, getProfile, updateProfile, changePassword } = require('./auth.controller')
const { authenticate } = require('../../middlewares/auth.middleware')

router.post('/register', register)
router.post('/login', login)
router.get('/me', authenticate, getProfile)
router.put('/me', authenticate, updateProfile)
router.patch('/me/password', authenticate, changePassword)

module.exports = router