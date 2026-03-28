const attendanceService = require('./attendance.service')
const { success, created, error, badRequest } = require('../../utils/response')

const markAttendance = async (req, res) => {
  try {
    const { mealType } = req.body
    if (!mealType) return badRequest(res, 'mealType is required')
    const log = await attendanceService.markAttendance(req.user.id, { mealType })
    return created(res, log, `Attendance marked for ${mealType}`)
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query
    const logs = await attendanceService.getMyAttendance(req.user.id, { month, year })
    return success(res, logs, 'Attendance history fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getTodayAttendance = async (req, res) => {
  try {
    const logs = await attendanceService.getTodayAttendance(req.user.id)
    return success(res, logs, "Today's attendance fetched")
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMessAttendanceToday = async (req, res) => {
  try {
    const result = await attendanceService.getMessAttendanceToday(req.user.id)
    return success(res, result, "Today's demand fetched")
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMessAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate, mealType } = req.query
    const result = await attendanceService.getMessAttendanceSummary(req.user.id, {
      startDate,
      endDate,
      mealType,
    })
    return success(res, result, 'Attendance summary fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = {
  markAttendance,
  getMyAttendance,
  getTodayAttendance,
  getMessAttendanceToday,
  getMessAttendanceSummary,
}
