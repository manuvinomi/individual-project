const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  updateDetails, 
  updatePassword, 
  googleAuth, 
  googleCallback 
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const passport = require('passport');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Auth routes are working',
    googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL
  });
});

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

// New route to handle the callback code from frontend
router.get('/google/callback/handle', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'No authorization code provided'
      });
    }
    
    console.log('Received authorization code from frontend:', code);
    
    // Use Google OAuth2 directly instead of passport authenticate
    const { OAuth2Client } = require('google-auth-library');
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );
    
    try {
      // Exchange the code for tokens
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      
      // Get user info with the access token
      const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
      const response = await oauth2Client.request({ url });
      const profile = response.data;
      
      console.log('Google profile received:', {
        id: profile.id,
        displayName: profile.name,
        email: profile.email,
        photo: profile.picture
      });
      
      // Check if the user already exists based on Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('Existing user found with Google ID:', user.email);
      } else {
        // If no user with Google ID, check if user exists with same email
        const email = profile.email;
        user = await User.findOne({ email });
        
        if (user) {
          // Update existing user with Google ID
          console.log('Existing user found with email, updating with Google ID:', email);
          user.googleId = profile.id;
          if (profile.picture) {
            user.profileImage = profile.picture;
          }
          await user.save();
        } else {
          // Create a new user
          console.log('Creating new user with Google profile:', email);
          user = await User.create({
            googleId: profile.id,
            name: profile.name,
            email: profile.email,
            profileImage: profile.picture || 'default-avatar.jpg'
            // No password needed for Google auth
          });
          console.log('New user created:', user.email, user._id);
        }
      }
      
      // Generate JWT token
      const token = user.getSignedJwtToken();
      console.log('User authenticated via Google:', user.email);
      
      // Return token and user data
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          _id: user._id,
          firstName: user.name ? user.name.split(' ')[0] : '',
          lastName: user.name ? user.name.split(' ')[1] || '' : '',
          name: user.name,
          email: user.email,
          avatar: user.profileImage,
          profileImage: user.profileImage
        }
      });
    } catch (error) {
      console.error('Google token exchange error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authentication error',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in Google callback handler:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
