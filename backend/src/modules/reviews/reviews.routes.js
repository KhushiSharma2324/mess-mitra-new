const express = require('express')
const router = express.Router()
const { submitReview, getReviewsByMess, getMyReviews, getOwnerReviews } = require('./reviews.controller')
const { authenticate } = require('../../middlewares/auth.middleware')
const { requireRole } = require('../../middlewares/role.middleware')

router.get('/mess/:messId', getReviewsByMess)
router.get('/my', authenticate, requireRole('STUDENT'), getMyReviews)
router.get('/owner', authenticate, requireRole('OWNER'), getOwnerReviews)
router.post('/', authenticate, requireRole('STUDENT'), submitReview)

module.exports = router
