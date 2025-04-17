const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Connect to the database
    await connectDB();
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'super_admin@gmail.com' });
    
    if (adminExists) {
      console.log('Admin user already exists. Updating password...');
      
      // Generate password hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@123', salt);
      
      // Update admin password
      adminExists.password = hashedPassword;
      await adminExists.save();
      
      console.log('Admin user password updated successfully!');
      console.log({
        email: adminExists.email,
        password: 'Test@123',
        role: adminExists.role,
        id: adminExists._id
      });
    } else {
      // Generate password hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Test@123', salt);
      
      // Create admin user
      const admin = await User.create({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'super_admin@gmail.com',
        password: hashedPassword,
        role: 'admin',
        timeCredits: 100,
        skills: ['System Administration'],
        location: 'Global',
        availability: 'flexible'
      });
      
      console.log('Admin user created successfully!');
      console.log({
        email: admin.email,
        password: 'Test@123',
        role: admin.role,
        id: admin._id
      });
    }
    
    // Disconnect from database
    mongoose.disconnect();
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdminUser();
