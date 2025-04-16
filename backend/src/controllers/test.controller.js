const Notification = require('../models/Notification');
const User = require('../models/User');

// Create test notifications for development purposes
exports.createTestNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete any existing test notifications for this user
    await Notification.deleteMany({ 
      receiver: userId,
      content: { $regex: 'Test notification' }
    });
    
    // Create a set of test notifications
    const notificationTypes = [
      'message', 
      'service_request', 
      'time_credit', 
      'community_post', 
      'event'
    ];
    
    const notifications = [];
    
    for (let i = 0; i < notificationTypes.length; i++) {
      const type = notificationTypes[i];
      const isRead = i % 2 === 0; // Make some read, some unread
      
      const notification = await Notification.create({
        type,
        content: `Test notification for ${type}`,
        sender: userId, // Using the same user as sender for simplicity
        receiver: userId,
        entityId: i === 0 ? "000000000000000000000001" : null, // Mock ID for first notification
        entityType: i === 0 ? "conversation" : null,
        read: isRead
      });
      
      // Populate sender details
      await notification.populate('sender', 'firstName lastName avatar');
      
      notifications.push(notification);
    }
    
    return res.status(201).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
    
  } catch (error) {
    console.error('Error creating test notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
