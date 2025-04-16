const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Get all notifications for the current user
router.get('/', notificationController.getNotifications);

// Mark a specific notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', notificationController.deleteNotification);

// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

module.exports = router;
