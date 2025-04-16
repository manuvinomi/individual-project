const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

// Create JWT strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Check if the user exists based on the JWT payload
      const user = await User.findById(payload.id);

      if (user) {
        return done(null, user);
      }
      
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Setup Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile received:', {
          id: profile.id,
          displayName: profile.displayName,
          email: profile.emails ? profile.emails[0].value : 'No email provided',
          photo: profile.photos ? profile.photos[0].value : 'No photo'
        });
        
        // Check if the user already exists based on Google ID
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
          console.log('Existing user found with Google ID:', user.email);
        } else {
          // If no user with Google ID, check if user exists with same email
          const email = profile.emails[0].value;
          user = await User.findOne({ email });
          
          if (user) {
            // Update existing user with Google ID
            console.log('Existing user found with email, updating with Google ID:', email);
            user.googleId = profile.id;
            if (profile.photos && profile.photos[0].value) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
          } else {
            // Create a new user
            console.log('Creating new user with Google profile:', email);
            
            // Split displayName into firstName and lastName
            let firstName = '';
            let lastName = '';
            
            if (profile.displayName) {
              const nameParts = profile.displayName.split(' ');
              firstName = nameParts[0] || '';
              // Join the rest as lastName (in case there are multiple last names)
              lastName = nameParts.slice(1).join(' ') || '';
              
              // If no last name is provided, use a portion of the email as placeholder
              if (!lastName && email) {
                lastName = email.split('@')[0];
              }
            }
            
            user = await User.create({
              googleId: profile.id,
              firstName: firstName,
              lastName: lastName,
              email: profile.emails[0].value,
              avatar: profile.photos ? profile.photos[0].value : 'default-avatar.jpg',
              timeCredits: 5 // Give new users some starting credits
              // No password needed for Google auth
            });
            console.log('New user created:', user.email, user._id);
          }
        }

        return done(null, user);
      } catch (error) {
        if (error.message === 'invalid_grant') {
          console.error('Invalid grant error:', error);
          return done(null, false, { message: 'Invalid grant' });
        } else {
          console.error('Error in Google authentication strategy:', error);
          return done(error, false);
        }
      }
    }
  )
);

module.exports = passport;
