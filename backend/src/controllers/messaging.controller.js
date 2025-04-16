const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const mongoose = require('mongoose');
const notificationController = require('./notification.controller');

// @desc    Get all conversations for a user
// @route   GET /api/messaging/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find all conversations where the user is a participant
  const conversations = await Conversation.find({
    participants: userId
  })
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar email'
    })
    .populate({
      path: 'relatedService',
      select: 'title imageUrl'
    })
    .sort({ updatedAt: -1 });

  // Format the conversations to include participant info
  const formattedConversations = conversations.map(conversation => {
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(
      p => p._id.toString() !== userId
    );

    return {
      _id: conversation._id,
      otherParticipant: otherParticipant || null,
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount.get(userId) || 0,
      relatedService: conversation.relatedService
    };
  });

  res.status(200).json({
    success: true,
    count: formattedConversations.length,
    data: formattedConversations
  });
});

// @desc    Get messages for a conversation
// @route   GET /api/messaging/conversations/:conversationId/messages
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  // Check if conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    return next(
      new ErrorResponse(`No conversation found with id ${conversationId}`, 404)
    );
  }

  // Mark all messages as read for this user
  await Message.updateMany(
    { 
      conversation: conversationId, 
      receiver: userId,
      read: false
    },
    { read: true }
  );

  // Reset unread count for this user
  const unreadMap = conversation.unreadCount;
  unreadMap.set(userId, 0);
  await Conversation.findByIdAndUpdate(conversationId, { 
    unreadCount: unreadMap 
  });

  // Get messages for the conversation
  const messages = await Message.find({ conversation: conversationId })
    .populate({
      path: 'sender',
      select: 'firstName lastName avatar'
    })
    .sort({ createdAt: 1 });

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Send a message
// @route   POST /api/messaging/conversations/:conversationId/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;

    if (!content) {
      return next(new ErrorResponse('Please provide message content', 400));
    }

    // Check if conversation exists and user is a participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId
    });

    if (!conversation) {
      return next(
        new ErrorResponse(`No conversation found with id ${conversationId}`, 404)
      );
    }

    // Find the receiver (the other participant)
    const receiverId = conversation.participants
      .find(id => id.toString() !== senderId)
      .toString();

    // Create the message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      content
    });

    // Populate sender details
    await message.populate({
      path: 'sender',
      select: 'firstName lastName avatar'
    });

    // Update conversation with last message and time
    const unreadMap = conversation.unreadCount || new Map();
    const currentUnread = unreadMap.get(receiverId) || 0;
    unreadMap.set(receiverId, currentUnread + 1);

    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessage: content,
        lastMessageAt: Date.now(),
        updatedAt: Date.now(),
        unreadCount: unreadMap
      }
    );

    // Create a notification for the recipient
    await notificationController.createNotification({
      type: 'message',
      content: `sent you a message: "${content.length > 30 ? content.substring(0, 30) + '...' : content}"`,
      senderId: senderId,
      receiverId: receiverId,
      entityId: conversationId,
      entityType: 'conversation'
    });

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return next(new ErrorResponse('Server error', 500));
  }
});

// @desc    Create a new conversation with a user
// @route   POST /api/messaging/conversations
// @access  Private
exports.createConversation = asyncHandler(async (req, res, next) => {
  const { recipientId, initialMessage, serviceId } = req.body;
  const senderId = req.user.id;

  if (!recipientId) {
    return next(new ErrorResponse('Please provide a recipient ID', 400));
  }

  if (!initialMessage) {
    return next(new ErrorResponse('Please provide an initial message', 400));
  }

  // Prevent creating conversation with yourself
  if (senderId === recipientId) {
    return next(
      new ErrorResponse('Cannot create a conversation with yourself', 400)
    );
  }

  // Check if recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new ErrorResponse('Recipient user not found', 404));
  }

  // Check if a conversation already exists between these users
  const existingConversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] }
  });

  let conversation;
  if (existingConversation) {
    conversation = existingConversation;
  } else {
    // Create a new conversation
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
      lastMessage: initialMessage,
      lastMessageAt: Date.now(),
      relatedService: serviceId || null
    });

    // Initialize unread count for recipient
    const unreadMap = new Map();
    unreadMap.set(recipientId, 1);
    conversation.unreadCount = unreadMap;
    await conversation.save();
  }

  // Create the first message
  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    receiver: recipientId,
    content: initialMessage
  });

  // Populate message with sender details
  await message.populate({
    path: 'sender',
    select: 'firstName lastName avatar'
  });

  // Return the conversation with complete details
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate({
      path: 'participants',
      select: 'firstName lastName avatar email'
    })
    .populate({
      path: 'relatedService',
      select: 'title imageUrl'
    });

  // Format the conversation response
  const otherParticipant = populatedConversation.participants.find(
    p => p._id.toString() !== senderId
  );

  const formattedConversation = {
    _id: populatedConversation._id,
    otherParticipant,
    lastMessage: populatedConversation.lastMessage,
    lastMessageAt: populatedConversation.lastMessageAt,
    unreadCount: 0, // Sender has no unread messages in a conversation they just created
    relatedService: populatedConversation.relatedService,
    firstMessage: message
  };

  res.status(201).json({
    success: true,
    data: formattedConversation
  });
});

// @desc    Delete a conversation
// @route   DELETE /api/messaging/conversations/:conversationId
// @access  Private
exports.deleteConversation = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  // Check if conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    return next(
      new ErrorResponse(`No conversation found with id ${conversationId}`, 404)
    );
  }

  // Delete all messages in the conversation
  await Message.deleteMany({ conversation: conversationId });

  // Delete the conversation
  await Conversation.findByIdAndDelete(conversationId);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark a conversation as read
// @route   PUT /api/messaging/conversations/:conversationId/read
// @access  Private
exports.markConversationAsRead = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user.id;

  // Check if conversation exists and user is a participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId
  });

  if (!conversation) {
    return next(
      new ErrorResponse(`No conversation found with id ${conversationId}`, 404)
    );
  }

  // Mark all messages as read for this user
  await Message.updateMany(
    { 
      conversation: conversationId, 
      receiver: userId,
      read: false
    },
    { read: true }
  );

  // Reset unread count for this user
  const unreadMap = conversation.unreadCount;
  unreadMap.set(userId, 0);
  await Conversation.findByIdAndUpdate(conversationId, { 
    unreadCount: unreadMap 
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread message count
// @route   GET /api/messaging/unread
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find all conversations for this user
  const conversations = await Conversation.find({
    participants: userId
  });

  // Calculate total unread messages across all conversations
  let totalUnread = 0;
  conversations.forEach(conversation => {
    totalUnread += conversation.unreadCount.get(userId) || 0;
  });

  res.status(200).json({
    success: true,
    data: { unreadCount: totalUnread }
  });
});
