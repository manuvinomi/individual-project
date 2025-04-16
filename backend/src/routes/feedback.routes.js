const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import controllers
const {
  submitFeedback,
  getUserFeedback,
  getMyFeedback,
  reportIssue,
  getFeedbackForService,
  getAllFeedback,
  getMyRequestsFeedback
} = require('../controllers/feedback.controller');

// Public routes (with optional authentication)
router.get('/', getAllFeedback);
router.get('/user/:userId', getUserFeedback);
router.get('/service/:serviceId', getFeedbackForService);

// Protected routes
router.use(protect);

router.post('/:serviceRequestId', submitFeedback);
router.get('/me', getMyFeedback);
router.get('/my-requests', getMyRequestsFeedback);
router.post('/report', reportIssue);

module.exports = router;
