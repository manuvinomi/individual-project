const User = require('../models/User');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Transaction = require('../models/Transaction');
const Post = require('../models/Post');
const Event = require('../models/Event');
const bcrypt = require('bcryptjs');

// @desc    Initialize admin user if doesn't exist
// @route   POST /api/admin/init
// @access  Public (only during setup)
exports.initializeAdmin = async (req, res, next) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'super_admin@gmail.com' });
    
    if (adminExists) {
      return res.status(200).json({
        success: true,
        message: 'Admin user already exists',
        data: {
          email: adminExists.email,
          role: adminExists.role
        }
      });
    }
    
    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test@123', salt);
    
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
    
    return res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const serviceCount = await Service.countDocuments();
    const activeServiceCount = await Service.countDocuments({ isActive: true });
    const pendingRequestCount = await ServiceRequest.countDocuments({ status: 'pending' });
    const completedRequestCount = await ServiceRequest.countDocuments({ status: 'completed' });
    const totalRequestCount = await ServiceRequest.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Post.aggregate([
      { $project: { commentCount: { $size: "$comments" } } },
      { $group: { _id: null, total: { $sum: "$commentCount" } } }
    ]);
    const eventCount = await Event.countDocuments();
    const upcomingEventCount = await Event.countDocuments({ date: { $gte: new Date() } });
    const transactionCount = await Transaction.countDocuments();
    const creditVolume = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: { $abs: "$credits" } } } }
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('firstName lastName email avatar createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent service requests
    const recentRequests = await ServiceRequest.find()
      .populate('service', 'title')
      .populate('requester', 'firstName lastName')
      .select('service requester status createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get time credits chart data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 9);

    const creditsByMonth = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          credits: "$credits",
          isEarning: { $cond: { if: { $gt: ["$credits", 0] }, then: true, else: false } }
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month", isEarning: "$isEarning" },
          total: { $sum: { $abs: "$credits" } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Process credit data for chart
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};
    
    // Initialize with zeros
    for (let i = 0; i < 9; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - 8 + i);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyData[monthKey] = { earned: 0, spent: 0, month: months[date.getMonth()] };
    }
    
    // Fill with actual data
    creditsByMonth.forEach(item => {
      const monthKey = `${item._id.year}-${item._id.month}`;
      if (monthlyData[monthKey]) {
        if (item._id.isEarning) {
          monthlyData[monthKey].earned = item.total;
        } else {
          monthlyData[monthKey].spent = item.total;
        }
      }
    });
    
    const timeCreditsChartData = {
      categories: Object.values(monthlyData).map(d => d.month),
      series: [
        {
          name: 'Credits Earned',
          data: Object.values(monthlyData).map(d => d.earned)
        },
        {
          name: 'Credits Spent',
          data: Object.values(monthlyData).map(d => d.spent)
        }
      ]
    };

    // Get service categories data
    const serviceCategories = await Service.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const serviceCategoriesChartData = {
      labels: serviceCategories.map(c => c._id),
      series: serviceCategories.map(c => c.count)
    };

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: userCount,
          newToday: recentUsers.filter(u => {
            const today = new Date();
            return u.createdAt.toDateString() === today.toDateString();
          }).length
        },
        services: {
          total: serviceCount,
          active: activeServiceCount
        },
        requests: {
          total: totalRequestCount,
          pending: pendingRequestCount,
          completed: completedRequestCount
        },
        posts: {
          total: postCount,
          comments: commentCount[0]?.total || 0
        },
        events: {
          total: eventCount,
          upcoming: upcomingEventCount
        },
        transactions: {
          total: transactionCount,
          volume: creditVolume[0]?.total || 0
        },
        recentUsers,
        recentRequests,
        timeCreditsChart: timeCreditsChartData,
        serviceCategoriesChart: serviceCategoriesChartData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(`Admin login attempt for email: ${email}`);

    // Validate email & password
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log(`User found with role: ${user.role}`);

    // Check if user is admin
    if (user.role !== 'admin') {
      console.log(`User ${email} is not an admin`);
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied: Admin rights required' 
      });
    }

    // Check if password matches
    try {
      const isMatch = await user.matchPassword(password);
      console.log(`Password match result: ${isMatch}`);
      
      if (!isMatch) {
        console.log('Password does not match');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
    } catch (err) {
      console.error('Error during password match:', err);
      return res.status(500).json({
        success: false,
        message: 'Error verifying credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();
    console.log('Login successful, token generated');

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    next(error);
  }
};
