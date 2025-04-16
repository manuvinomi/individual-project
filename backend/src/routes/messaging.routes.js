const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
  deleteConversation,
  markConversationAsRead,
  getUnreadCount
} = require('../controllers/messaging.controller');

// Protect all routes
router.use(protect);

// Conversation routes
router.route('/conversations')
  .get(getConversations)
  .post(createConversation);

router.route('/conversations/:conversationId')
  .delete(deleteConversation);

router.route('/conversations/:conversationId/messages')
  .get(getMessages)
  .post(sendMessage);

router.route('/conversations/:conversationId/read')
  .put(markConversationAsRead);

router.route('/unread')
  .get(getUnreadCount);

module.exports = router;
