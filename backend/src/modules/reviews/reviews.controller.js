const reviewsService = require('./reviews.service')
const { success, created, error, badRequest } = require('../../utils/response')

const submitReview = async (req, res) => {
  try {
    const { deliveryOrderId, rating, foodRating, deliveryRating, comment } = req.body
    if (!deliveryOrderId) return badRequest(res, 'deliveryOrderId is required')
    if (!rating) return badRequest(res, 'rating is required')
    const review = await reviewsService.submitReview(req.user.id, {
      deliveryOrderId, rating, foodRating, deliveryRating, comment,
    })
    return created(res, review, 'Review submitted')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getReviewsByMess = async (req, res) => {
  try {
    const { limit } = req.query
    const result = await reviewsService.getReviewsByMess(req.params.messId, { limit })
    return success(res, result, 'Reviews fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getMyReviews = async (req, res) => {
  try {
    const reviews = await reviewsService.getMyReviews(req.user.id)
    return success(res, reviews, 'Your reviews fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

const getOwnerReviews = async (req, res) => {
  try {
    const result = await reviewsService.getOwnerReviews(req.user.id)
    return success(res, result, 'Reviews fetched')
  } catch (err) {
    return error(res, err.message, err.statusCode || 500)
  }
}

module.exports = { submitReview, getReviewsByMess, getMyReviews, getOwnerReviews }
