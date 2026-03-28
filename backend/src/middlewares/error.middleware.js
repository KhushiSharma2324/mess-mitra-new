const { error } = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message)

  if (err.code === 'P2002') return error(res, 'A record with this value already exists', 409)
  if (err.code === 'P2025') return error(res, 'Record not found', 404)
  if (err.code === 'P2003') return error(res, 'Related record not found', 400)
  if (err.name === 'ValidationError') return error(res, err.message, 400)

  return error(res, err.message || 'Internal server error', err.statusCode || 500)
}

const notFoundHandler = (req, res) => {
  if (req.path.startsWith('/api/')) {
    return error(res, `Route ${req.method} ${req.url} not found`, 404)
  }
  res.status(404).send('Page not found')
}

module.exports = { errorHandler, notFoundHandler }