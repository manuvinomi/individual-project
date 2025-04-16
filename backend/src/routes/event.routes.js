const express = require('express');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  saveEvent,
  unsaveEvent,
  getEventCategories
} = require('../controllers/event.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get event categories
router.get('/categories', getEventCategories);

// Event CRUD operations
router.route('/')
  .get(getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

// Event registration
router.route('/:id/register')
  .post(protect, registerForEvent)
  .delete(protect, cancelRegistration);

// Saved events
router.route('/:id/save')
  .post(protect, saveEvent)
  .delete(protect, unsaveEvent);

module.exports = router;
