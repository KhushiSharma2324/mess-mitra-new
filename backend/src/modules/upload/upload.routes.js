const express = require('express')
const router = express.Router()
const { upload, uploadProfilePhoto, uploadMessPhoto } = require('./upload.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.post('/profile', authenticate, upload.single('photo'), uploadProfilePhoto)
router.post('/mess', authenticate, requireRole('OWNER'), upload.single('photo'), uploadMessPhoto)

module.exports = router
