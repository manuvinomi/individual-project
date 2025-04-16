const express = require('express');
const {
  getTransactionHistory,
  getCreditBalance,
  completeTransaction,
  getEventTransactions,
  getTimeBankingStats,
  createCreditAdjustment,
  getTransactions,
  transferCredits
} = require('../controllers/timebanking.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// User transaction routes
router.get('/history', getTransactionHistory);
router.get('/balance', getCreditBalance);
router.get('/transactions', getTransactions);
router.post('/transfer', transferCredits);

// Event organizer routes
router.get('/events/:eventId/transactions', getEventTransactions);

// Transaction management
router.put('/transactions/:id/complete', completeTransaction);

// Admin only routes
router.get('/stats', authorize('admin'), getTimeBankingStats);
router.post('/adjustments', authorize('admin'), createCreditAdjustment);

module.exports = router;
