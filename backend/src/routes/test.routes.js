const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Create test notifications
router.post('/notifications', testController.createTestNotifications);

module.exports = router;
