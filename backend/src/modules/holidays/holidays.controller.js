const holidaysService = require('./holidays.service')
const { success, created, error } = require('../../utils/response')

const declareHoliday = async (req, res) => {
  try {
    const holiday = await holidaysService.declareHoliday(req.user.id, req.body)
    return created(res, holiday, 'Holiday declared successfully')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getHolidaysByMess = async (req, res) => {
  try {
    const holidays = await holidaysService.getHolidaysByMess(req.params.messId)
    return success(res, holidays, 'Holidays fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyHolidays = async (req, res) => {
  try {
    const holidays = await holidaysService.getMyHolidays(req.user.id)
    return success(res, holidays, 'Holidays fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const deleteHoliday = async (req, res) => {
  try {
    const result = await holidaysService.deleteHoliday(req.user.id, req.params.id)
    return success(res, result, 'Holiday cancelled')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = { declareHoliday, getHolidaysByMess, getMyHolidays, deleteHoliday }
