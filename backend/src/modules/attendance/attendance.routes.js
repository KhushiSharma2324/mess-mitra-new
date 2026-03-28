const express = require('express')
const router = express.Router()
const {
  markAttendance,
  getMyAttendance,
  getTodayAttendance,
  getMessAttendanceToday,
  getMessAttendanceSummary,
} = require('./attendance.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.post('/mark', authenticate, requireRole('STUDENT'), markAttendance)
router.get('/me', authenticate, requireRole('STUDENT'), getMyAttendance)
router.get('/me/today', authenticate, requireRole('STUDENT'), getTodayAttendance)

router.get('/mess/today', authenticate, requireRole('OWNER'), getMessAttendanceToday)
router.get('/mess/summary', authenticate, requireRole('OWNER'), getMessAttendanceSummary)

module.exports = router
