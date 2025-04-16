const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  getSavedEvents,
  getRegisteredEvents,
  getOrganizedEvents
} = require('../controllers/user.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// User profile routes
router.get('/profile', getUserProfile);
router.get('/saved-events', getSavedEvents);
router.get('/registered-events', getRegisteredEvents);
router.get('/organized-events', getOrganizedEvents);

// Admin only routes
router.use(authorize('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
