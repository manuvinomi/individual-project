const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Direct database update function to ensure password works
const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB directly
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Generate a new salt and hash the password
    console.log('Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test@123', salt);
    
    // Update the admin user password directly in the database
    console.log('Updating admin password...');
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: 'super_admin@gmail.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password update result:', result);
    
    // Verify the password
    const adminUser = await mongoose.connection.db.collection('users').findOne(
      { email: 'super_admin@gmail.com' }
    );
    
    if (adminUser) {
      console.log('Admin user found:');
      console.log({
        email: adminUser.email,
        role: adminUser.role,
        passwordLength: adminUser.password ? adminUser.password.length : 0
      });
      
      // Test password verification
      const passwordMatch = await bcrypt.compare('Test@123', adminUser.password);
      console.log(`Password verification test: ${passwordMatch ? 'SUCCESS' : 'FAILED'}`);
    } else {
      console.log('Admin user not found');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// Run the script
resetAdminPassword();
