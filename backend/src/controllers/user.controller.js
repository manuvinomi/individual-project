const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Finding resource
    let query = User.find(JSON.parse(queryStr));

    // Search by name or email
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query = query.or([
        { name: searchRegex },
        { email: searchRegex },
        { skills: searchRegex },
        { interests: searchRegex }
      ]);
    }

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    } else {
      // By default, don't return password
      query = query.select('-password');
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const users = await query;

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
      count: users.length,
      pagination,
      total,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User not found with id of ${req.params.id}`
      });
    }

    // Find events where this user is the organizer
    const userOrganizerEvents = await Event.find({ organizer: user._id });
    
    if (userOrganizerEvents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user who is an organizer of events. Transfer ownership or delete events first.'
      });
    }

    // Remove user from any events they're attending
    await Event.updateMany(
      { 'attendees.user': user._id },
      { $pull: { attendees: { user: user._id } } }
    );

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's profile 
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('eventsAttended', 'title date category location')
      .populate('eventsOrganized', 'title date category location')
      .populate('savedEvents', 'title date category location');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved events
// @route   GET /api/users/saved-events
// @access  Private
exports.getSavedEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('savedEvents')
      .populate({
        path: 'savedEvents',
        select: 'title description date location category image timeCredits isTimeCreditEarning maxAttendees attendees'
      });

    res.status(200).json({
      success: true,
      count: user.savedEvents.length,
      data: user.savedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's registered events
// @route   GET /api/users/registered-events
// @access  Private
exports.getRegisteredEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('eventsAttended')
      .populate({
        path: 'eventsAttended',
        select: 'title description date location category image timeCredits isTimeCreditEarning maxAttendees attendees'
      });

    res.status(200).json({
      success: true,
      count: user.eventsAttended.length,
      data: user.eventsAttended
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's organized events
// @route   GET /api/users/organized-events
// @access  Private
exports.getOrganizedEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('eventsOrganized')
      .populate({
        path: 'eventsOrganized',
        select: 'title description date location category image timeCredits isTimeCreditEarning maxAttendees attendees'
      });

    res.status(200).json({
      success: true,
      count: user.eventsOrganized.length,
      data: user.eventsOrganized
    });
  } catch (error) {
    next(error);
  }
};
