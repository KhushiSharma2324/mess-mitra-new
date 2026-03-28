const express = require('express')
const router = express.Router()
const { declareHoliday, getHolidaysByMess, getMyHolidays, deleteHoliday } = require('./holidays.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.get('/mess/:messId', getHolidaysByMess)
router.get('/my', authenticate, requireRole('OWNER'), getMyHolidays)
router.post('/', authenticate, requireRole('OWNER'), declareHoliday)
router.delete('/:id', authenticate, requireRole('OWNER'), deleteHoliday)

module.exports = router
