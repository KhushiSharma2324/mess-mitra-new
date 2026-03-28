const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

const created = (res, data = null, message = 'Created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
  })
}

const error = (res, message = 'Something went wrong', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  })
}

const badRequest = (res, message = 'Bad request', errors = null) => {
  return res.status(400).json({
    success: false,
    message,
    errors,
  })
}

const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    success: false,
    message,
  })
}

const forbidden = (res, message = 'Access denied') => {
  return res.status(403).json({
    success: false,
    message,
  })
}

const notFound = (res, message = 'Not found') => {
  return res.status(404).json({
    success: false,
    message,
  })
}

const conflict = (res, message = 'Conflict') => {
  return res.status(409).json({
    success: false,
    message,
  })
}

module.exports = {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
}