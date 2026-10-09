const { Router } = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const reviewJobsController = require('../controllers/review-jobs.controller');

const router = Router();

router.use(authenticate);

router.get('/', reviewJobsController.listByRepository);
router.get('/:id', reviewJobsController.get);
router.post('/:id/cancel', reviewJobsController.cancel);
router.post('/:id/retry', reviewJobsController.retry);
router.delete('/:id', reviewJobsController.remove);

module.exports = router;
