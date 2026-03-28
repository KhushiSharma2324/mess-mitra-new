const getToday = () => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

const getTodayString = () => {
  return new Date().toISOString().split('T')[0]
}

const getCurrentTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const isBeforeCutoff = (cutoffTime) => {
  if (!cutoffTime) return true
  const current = getCurrentTime()
  return current < cutoffTime
}

const addDays = (date, days) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const addMonths = (date, months) => {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7)
}

const isExpired = (endDate) => {
  return new Date() > new Date(endDate)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

module.exports = {
  getToday,
  getTodayString,
  getCurrentTime,
  isBeforeCutoff,
  addDays,
  addMonths,
  addWeeks,
  isExpired,
  formatDate,
}