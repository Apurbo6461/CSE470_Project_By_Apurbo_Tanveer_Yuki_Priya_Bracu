const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', feedbackController.getFeedback);

// Protected routes
router.use(protect);
router.post('/', feedbackController.submitFeedback);
router.post('/:feedbackId/helpful', feedbackController.markHelpful);
router.post('/:feedbackId/report', feedbackController.reportFeedback);

module.exports = router;