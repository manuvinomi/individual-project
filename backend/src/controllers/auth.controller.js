const User = require('../models/User');
const Event = require('../models/Event'); // Assuming Event model is defined in this file
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // Instead of assuming populated fields exist, we'll handle them more safely
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Use lean() to get a plain JS object and handle the population separately
    const userObj = user.toObject();
    
    // Now populate related data if needed
    if (userObj.eventsAttended && userObj.eventsAttended.length > 0) {
      userObj.eventsAttended = await Event.find({ _id: { $in: userObj.eventsAttended } })
        .select('title date').lean();
    }
    
    if (userObj.eventsOrganized && userObj.eventsOrganized.length > 0) {
      userObj.eventsOrganized = await Event.find({ _id: { $in: userObj.eventsOrganized } })
        .select('title date').lean();
    }
    
    if (userObj.savedEvents && userObj.savedEvents.length > 0) {
      userObj.savedEvents = await Event.find({ _id: { $in: userObj.savedEvents } })
        .select('title date').lean();
    }

    res.status(200).json({
      success: true,
      data: userObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      bio: req.body.bio,
      skills: req.body.skills,
      interests: req.body.interests,
      location: req.body.location,
      availability: req.body.availability,
      phone: req.body.phone,
      avatar: req.body.avatar
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate Google OAuth
// @route   GET /api/auth/google
// @access  Public
exports.googleAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    // Add state parameter to prevent CSRF
    state: Math.random().toString(36).substring(2, 15)
  })(req, res, next);
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  // Use passport's authenticate method with a custom callback
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.error('Google auth error:', err);
      
      // Handle invalid_grant error specifically
      if (err.code === 'invalid_grant') {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=expired_code`);
      }
      
      return res.redirect(`${process.env.FRONTEND_URL}/login?success=false&error=${encodeURIComponent(err.message || 'Authentication failed')}`);
    }
    
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?success=false&error=user_not_found`);
    }

    try {
      // Create JWT token and redirect to frontend dashboard with token
      const token = user.getSignedJwtToken();
      console.log('User authenticated via Google:', user.email);
      
      // Redirect to the dashboard with token
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?source=google&token=${token}`);
    } catch (error) {
      console.error('Token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?success=false&error=token_generation_failed`);
    }
  })(req, res, next);
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    data: user
  });
};
