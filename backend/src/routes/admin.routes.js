const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  initializeAdmin,
  getDashboardStats,
  adminLogin
} = require('../controllers/admin.controller');

// Public routes
router.post('/init', initializeAdmin);
router.post('/login', adminLogin);

// Protected admin routes
router.get('/stats', protect, authorize('admin'), getDashboardStats);

module.exports = router;
