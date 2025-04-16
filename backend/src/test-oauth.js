require('dotenv').config();
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Configure session
app.use(session({
  secret: 'test-session-secret',
  resave: false,
  saveUninitialized: true
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Configure passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Set up Google Strategy with explicit callback URL
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  proxy: true
}, (accessToken, refreshToken, profile, done) => {
  // Just return the profile for testing
  return done(null, profile);
}));

// Test routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Google OAuth Test</h1>
    <p>Callback URL configured as: ${process.env.GOOGLE_CALLBACK_URL}</p>
    <a href="/auth/google">Login with Google</a>
  `);
});

// Google OAuth routes
app.get('/auth/google', (req, res, next) => {
  console.log('Starting Google authentication...');
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    // Log the state of the request
    state: 'test-state',
    // Adding logging on the request
    authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
    accessType: 'offline',
    prompt: 'consent'
  })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  console.log('Google callback received');
  console.log('Query params:', req.query);
  
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/?error=true'
  }, (err, user) => {
    if (err) {
      console.error('Authentication error:', err);
      return res.redirect('/?error=auth_error');
    }
    
    if (!user) {
      console.error('No user returned');
      return res.redirect('/?error=no_user');
    }

    // Success - display the profile data
    res.send(`
      <h1>Authentication Success</h1>
      <pre>${JSON.stringify(user, null, 2)}</pre>
      <a href="/">Home</a>
    `);
  })(req, res, next);
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Google callback URL: ${process.env.GOOGLE_CALLBACK_URL}`);
});
