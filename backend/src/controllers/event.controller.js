const Event = require('../models/Event');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    let query = Event.find(JSON.parse(queryStr));

    // Search by title or description
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { location: searchRegex }
      ]);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Event.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const events = await query
      .populate({
        path: 'organizer',
        select: 'name profileImage'
      })
      .populate({
        path: 'attendees.user',
        select: 'name profileImage'
      });

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: events.length,
      pagination,
      total,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate({
        path: 'organizer',
        select: 'name profileImage bio'
      })
      .populate({
        path: 'attendees.user',
        select: 'name profileImage'
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
exports.createEvent = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.organizer = req.user.id;

    const event = await Event.create(req.body);

    // Add event to user's eventsOrganized array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { eventsOrganized: event._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this event`
      });
    }

    // Remove fields that shouldn't be updated directly
    if (req.body.attendees) delete req.body.attendees;
    if (req.body.organizer) delete req.body.organizer;

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Make sure user is event organizer or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this event`
      });
    }

    // Remove event from all users who saved it or are attending it
    await User.updateMany(
      { $or: [{ savedEvents: event._id }, { eventsAttended: event._id }] },
      { $pull: { savedEvents: event._id, eventsAttended: event._id } }
    );
    
    // Remove event from organizer's list
    await User.findByIdAndUpdate(
      event.organizer,
      { $pull: { eventsOrganized: event._id } }
    );

    // Delete all transactions related to this event
    await Transaction.deleteMany({ event: event._id });

    // Finally remove the event
    await event.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Check if event is full
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'This event is already full'
      });
    }

    // Check if user is already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.user.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'User already registered for this event'
      });
    }

    // Check time credit requirements if event requires spending credits
    if (!event.isTimeCreditEarning && event.timeCredits > 0) {
      const user = await User.findById(req.user.id);
      
      if (user.timeCredits < event.timeCredits) {
        return res.status(400).json({
          success: false,
          message: `You need ${event.timeCredits} time credits to register for this event. Current balance: ${user.timeCredits}`
        });
      }
    }

    // Add user to event attendees
    event.attendees.push({
      user: req.user.id,
      status: 'confirmed',
      joinedAt: Date.now()
    });

    await event.save();

    // Add event to user's attended events
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { eventsAttended: event._id } },
      { new: true }
    );

    // Create a pending transaction for time credits
    const transactionData = {
      user: req.user.id,
      event: event._id,
      credits: event.isTimeCreditEarning ? event.timeCredits : -event.timeCredits,
      transactionType: event.isTimeCreditEarning ? 'earning' : 'spending',
      status: 'pending',
      description: event.isTimeCreditEarning 
        ? `Pending credits for participating in event: ${event.title}`
        : `Spending credits to attend event: ${event.title}`
    };

    await Transaction.create(transactionData);

    // If spending credits, immediately deduct from user balance
    if (!event.isTimeCreditEarning && event.timeCredits > 0) {
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { timeCredits: -event.timeCredits } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Successfully registered for event',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel registration for an event
// @route   DELETE /api/events/:id/register
// @access  Private
exports.cancelRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Check if user is registered
    const attendeeIndex = event.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'User not registered for this event'
      });
    }

    // Remove user from event attendees
    event.attendees.splice(attendeeIndex, 1);
    await event.save();

    // Remove event from user's attended events
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { eventsAttended: event._id } }
    );

    // Find and update transaction
    const transaction = await Transaction.findOne({
      user: req.user.id,
      event: event._id,
      status: { $in: ['pending', 'completed'] }
    });

    if (transaction) {
      // If it was a spending transaction and completed, refund the credits
      if (transaction.transactionType === 'spending' && transaction.status === 'completed') {
        await User.findByIdAndUpdate(
          req.user.id,
          { $inc: { timeCredits: Math.abs(transaction.credits) } }
        );
        
        // Create a refund transaction
        await Transaction.create({
          user: req.user.id,
          event: event._id,
          credits: Math.abs(transaction.credits),
          transactionType: 'refund',
          status: 'completed',
          description: `Refund for cancelling event: ${event.title}`,
          completedAt: Date.now()
        });
      }
      
      // Mark original transaction as cancelled
      transaction.status = 'cancelled';
      await transaction.save();
    }

    res.status(200).json({
      success: true,
      message: 'Successfully cancelled registration',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save an event to user's saved events
// @route   POST /api/events/:id/save
// @access  Private
exports.saveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Add event to user's saved events
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedEvents: event._id } },
      { new: true }
    ).select('savedEvents');

    res.status(200).json({
      success: true,
      message: 'Event saved successfully',
      data: user.savedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an event from user's saved events
// @route   DELETE /api/events/:id/save
// @access  Private
exports.unsaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with id of ${req.params.id}`
      });
    }

    // Remove event from user's saved events
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedEvents: event._id } },
      { new: true }
    ).select('savedEvents');

    res.status(200).json({
      success: true,
      message: 'Event removed from saved events',
      data: user.savedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all event categories
// @route   GET /api/events/categories
// @access  Public
exports.getEventCategories = async (req, res, next) => {
  try {
    // Extract distinct categories from Event model
    const categories = await Event.distinct('category');

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};
