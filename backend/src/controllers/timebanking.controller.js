const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get user's time banking history
// @route   GET /api/timebanking/history
// @access  Private
exports.getTransactionHistory = async (req, res, next) => {
  try {
    // Look for transactions where user is either sender or receiver
    const transactions = await Transaction.find({
      $or: [
        { user: req.user.id },
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    })
    .populate({
      path: 'relatedService',
      select: 'title description hourlyRate'
    })
    .populate({
      path: 'relatedRequest',
      select: 'status requestedHours feedback'
    })
    .sort('-createdAt');
    
    // Enhance transaction data with user information
    let enhancedTransactions = [];
    
    if (transactions && transactions.length > 0) {
      enhancedTransactions = await Promise.all(
        transactions.map(async transaction => {
          const transObj = transaction.toObject();
          
          // Only try to populate event if it exists
          if (transaction.event) {
            const event = await Event.findById(transaction.event)
              .select('title date category')
              .lean();
              
            if (event) {
              transObj.event = event;
            }
          }
          
          return transObj;
        })
      );
    }

    console.log(`Found ${enhancedTransactions.length} transactions for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      count: enhancedTransactions.length,
      data: enhancedTransactions
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    next(error);
  }
};

// @desc    Get user's current time credit balance
// @route   GET /api/timebanking/balance
// @access  Private
exports.getCreditBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('timeCredits');

    res.status(200).json({
      success: true,
      data: {
        timeCredits: user.timeCredits
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for current user
// @route   GET /api/timebanking/transactions
// @access  Private
exports.getTransactions = async (req, res, next) => {
  try {
    // Add validation for req.user
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated or user ID not found'
      });
    }

    // Use async/await with try/catch for better error handling
    const transactions = await Transaction.find({
      $or: [
        { user: req.user.id },
        { senderId: req.user.id },
        { receiverId: req.user.id }
      ]
    })
      .sort('-createdAt')
      .populate({
        path: 'relatedService',
        select: 'title description hourlyRate'
      })
      .populate({
        path: 'relatedRequest',
        select: 'status requestedHours'
      })
      .lean();  // Convert to plain JS object for better performance
    
    console.log(`Found ${transactions.length} transactions for user ${req.user.id} in getTransactions`);

    // Return empty array if no transactions found
    return res.status(200).json({
      success: true,
      count: transactions ? transactions.length : 0,
      data: transactions || []
    });
  } catch (error) {
    console.error('Error in getTransactions:', error.message);
    
    // Return a proper error response instead of calling next(error)
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching transactions'
    });
  }
};

// @desc    Complete a pending transaction (admin or event organizer)
// @route   PUT /api/timebanking/transactions/:id/complete
// @access  Private
exports.completeTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate({
        path: 'event',
        select: 'organizer title'
      });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check if user is admin or the event organizer
    const isOrganizer = transaction.event.organizer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOrganizer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this transaction'
      });
    }

    // Check if transaction is already completed
    if (transaction.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is already completed'
      });
    }

    // Check if transaction is cancelled
    if (transaction.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete a cancelled transaction'
      });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = Date.now();
    await transaction.save();

    // If it's an earning transaction, update user's time credits
    if (transaction.transactionType === 'earning') {
      await User.findByIdAndUpdate(
        transaction.user,
        { $inc: { timeCredits: transaction.credits } }
      );
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending transactions for an event (for event organizer)
// @route   GET /api/timebanking/events/:eventId/transactions
// @access  Private
exports.getEventTransactions = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these transactions'
      });
    }

    const transactions = await Transaction.find({
      event: req.params.eventId
    }).populate({
      path: 'user',
      select: 'name email profileImage'
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time banking statistics (admin only)
// @route   GET /api/timebanking/stats
// @access  Private/Admin
exports.getTimeBankingStats = async (req, res, next) => {
  try {
    // Total credits in the system
    const totalCreditsResult = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$timeCredits' } } }
    ]);
    
    const totalCredits = totalCreditsResult.length > 0 ? totalCreditsResult[0].total : 0;

    // Total number of transactions by type
    const transactionsByType = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$transactionType', count: { $sum: 1 }, totalCredits: { $sum: '$credits' } } }
    ]);

    // Users with most credits
    const topUsers = await User.find({})
      .select('name timeCredits')
      .sort('-timeCredits')
      .limit(10);

    // Most popular events for time banking
    const popularEvents = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$event', count: { $sum: 1 }, totalCredits: { $sum: '$credits' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Populate event details for popular events
    const populatedEvents = await Event.populate(popularEvents, {
      path: '_id',
      select: 'title category date'
    });

    res.status(200).json({
      success: true,
      data: {
        totalCredits,
        transactionsByType,
        topUsers,
        popularEvents: populatedEvents.map(item => ({
          event: item._id,
          count: item.count,
          totalCredits: item.totalCredits
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a manual credit adjustment (admin only)
// @route   POST /api/timebanking/adjustments
// @access  Private/Admin
exports.createCreditAdjustment = async (req, res, next) => {
  try {
    const { userId, credits, reason } = req.body;

    if (!userId || !credits || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, credits and reason for adjustment'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: userId,
      credits,
      transactionType: credits > 0 ? 'earning' : 'spending',
      status: 'completed',
      description: `Manual adjustment: ${reason}`,
      completedAt: Date.now()
    });

    // Update user's credit balance
    await User.findByIdAndUpdate(
      userId,
      { $inc: { timeCredits: credits } }
    );

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transfer time credits to another user
// @route   POST /api/timebanking/transfer
// @access  Private
exports.transferCredits = async (req, res, next) => {
  try {
    const { recipientEmail, amount, description } = req.body;

    // Validate input
    if (!recipientEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide recipient email'
      });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid positive amount'
      });
    }

    const transferAmount = parseInt(amount);

    // Find sender (current user)
    const sender = await User.findById(req.user.id).select('firstName lastName timeCredits');

    if (!sender) {
      return res.status(404).json({
        success: false,
        error: 'Sender not found'
      });
    }

    // Check if sender has enough credits
    if (sender.timeCredits < transferAmount) {
      return res.status(400).json({
        success: false,
        error: `Insufficient time credits. You have ${sender.timeCredits}, trying to transfer ${transferAmount}`
      });
    }

    // Find recipient by email
    const recipient = await User.findOne({ email: recipientEmail }).select('firstName lastName timeCredits');

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found with that email address'
      });
    }

    // Can't transfer to yourself
    if (recipient._id.toString() === sender._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot transfer credits to yourself'
      });
    }

    // Perform the transfer (deduct from sender)
    await User.findByIdAndUpdate(
      sender._id,
      { $inc: { timeCredits: -transferAmount } }
    );

    // Add to recipient
    await User.findByIdAndUpdate(
      recipient._id,
      { $inc: { timeCredits: transferAmount } }
    );

    // Create transaction records
    const senderName = `${sender.firstName} ${sender.lastName}`;
    const recipientName = `${recipient.firstName} ${recipient.lastName}`;
    const transferDescription = description || `Time credits transfer to ${recipientName}`;

    // Create sender's transaction (spending)
    const senderTransaction = await Transaction.create({
      user: sender._id,
      credits: -transferAmount,
      transactionType: 'transfer',
      description: transferDescription,
      status: 'completed',
      completedAt: Date.now(),
      senderId: sender._id,
      receiverId: recipient._id,
      senderName,
      receiverName: recipientName
    });

    // Create recipient's transaction (earning)
    const recipientTransaction = await Transaction.create({
      user: recipient._id,
      credits: transferAmount,
      transactionType: 'transfer',
      description: `Time credits received from ${senderName}`,
      status: 'completed',
      completedAt: Date.now(),
      senderId: sender._id,
      receiverId: recipient._id,
      senderName,
      receiverName: recipientName
    });

    res.status(200).json({
      success: true,
      message: `Successfully transferred ${transferAmount} credits to ${recipientName}`,
      data: {
        sender: {
          id: sender._id,
          name: senderName,
          remainingCredits: sender.timeCredits - transferAmount
        },
        recipient: {
          id: recipient._id,
          name: recipientName
        },
        amount: transferAmount,
        transactions: [senderTransaction._id, recipientTransaction._id]
      }
    });
  } catch (error) {
    console.error('Error transferring time credits:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while transferring time credits'
    });
  }
};
