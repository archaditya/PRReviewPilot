const express = require('express');
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/trigger', (req, res, next) => reviewController.triggerReview(req, res, next));
router.get('/', (req, res, next) => reviewController.listReviews(req, res, next));
router.get('/:id', (req, res, next) => reviewController.getReviewDetails(req, res, next));
router.patch('/:jobId/findings/:findingId', (req, res, next) => reviewController.updateFindingStatus(req, res, next));

module.exports = router;
