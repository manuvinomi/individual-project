const axios = require('axios');
const dotenv = require('dotenv');
const colors = require('colors');
const fs = require('fs');

// Load env variables
dotenv.config();

// API base URL
const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

// Test data
const testService = {
  title: 'Web Development Tutoring',
  description: 'Learn React, Node.js and MongoDB from an experienced developer. I can help with project setup, debugging, and best practices.',
  category: 'Technology',
  hourlyRate: 5,
  location: 'Remote',
  availability: ['Monday', 'Wednesday', 'Friday'],
  skillLevel: 'Advanced'
};

const testEvent = {
  title: 'JavaScript Workshop',
  description: 'A hands-on workshop covering JavaScript fundamentals to advanced topics.',
  category: 'Education',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  time: '10:00 AM',
  duration: 3,
  location: 'Community Center',
  isVirtual: false,
  maxAttendees: 25
};

const testPost = {
  title: 'Looking for Gardening Tips',
  content: 'I recently started a small vegetable garden and would love some advice on organic pest control methods.',
  type: 'question'
};

// Variables to store created data IDs
let userId, token, serviceId, eventId, postId;

// Helper for logging
const logSuccess = (message) => console.log(colors.green(message));
const logError = (message) => console.log(colors.red(message));
const logInfo = (message) => console.log(colors.blue(message));
const logWarning = (message) => console.log(colors.yellow(message));

// Create axios instance with authentication
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    logInfo(`Token set: ${token.substring(0, 15)}...`);
  } else {
    delete api.defaults.headers.common['Authorization'];
    logInfo('Token cleared');
  }
};

// Save results to file for manual inspection
const saveResults = (filename, data) => {
  const resultsDir = './test-results';
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir);
  }
  
  const filePath = `${resultsDir}/${filename}`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  logInfo(`Results saved to ${filePath}`);
};

// MAIN TEST FUNCTION
async function testEndpoints() {
  try {
    logInfo('====== ENDPOINT TESTING AND DATA POPULATION SCRIPT ======');
    
    // 1. Register or log in a test user
    logInfo('\n=== TESTING AUTH ENDPOINTS ===');
    await testAuth();
    
    // 2. Try endpoints that might be already implemented
    await tryAllEndpoints();
    
    logInfo('\n====== ENDPOINT TESTING COMPLETED ======');
    logInfo('Analyzing API structure and test results...');
    
  } catch (error) {
    logError('Error running tests:');
    if (error.response) {
      logError(`Status: ${error.response.status}`);
      logError('Response data:');
      console.log(error.response.data);
    } else {
      logError(error.message);
    }
  }
}

// Try to authenticate with the API
async function testAuth() {
  try {
    // Try to register the test user
    try {
      logInfo('Registering test user...');
      const registerRes = await api.post('/auth/register', testUser);
      logSuccess('User registered successfully');
      console.log('Register response data:', registerRes.data);
      
      // Try to extract the token and user ID from the response
      if (registerRes.data.token) {
        token = registerRes.data.token;
        
        // Get user ID from different possible response structures
        if (registerRes.data.user && registerRes.data.user._id) {
          userId = registerRes.data.user._id;
        } else if (registerRes.data._id) {
          userId = registerRes.data._id;
        }
        
        logSuccess(`User registered with token: ${token.substring(0, 15)}...`);
        if (userId) logSuccess(`User ID: ${userId}`);
      } else {
        logWarning('No token received from registration');
      }
    } catch (error) {
      logWarning(`Registration error: ${error.message}`);
      if (error.response) {
        logWarning(`Status: ${error.response.status}`);
        
        // User might already exist, try to log in
        if (error.response.status === 400 || error.response.status === 409) {
          logInfo('User might already exist, trying to log in...');
          try {
            const loginRes = await api.post('/auth/login', {
              email: testUser.email,
              password: testUser.password
            });
            
            logSuccess('Login successful');
            console.log('Login response data:', loginRes.data);
            
            // Extract token from response
            if (loginRes.data.token) {
              token = loginRes.data.token;
              
              // Get user ID from different possible response structures
              if (loginRes.data.user && loginRes.data.user._id) {
                userId = loginRes.data.user._id;
              } else if (loginRes.data._id) {
                userId = loginRes.data._id;
              }
              
              logSuccess(`User logged in with token: ${token.substring(0, 15)}...`);
              if (userId) logSuccess(`User ID: ${userId}`);
            } else {
              logWarning('No token received from login');
            }
          } catch (loginError) {
            logError(`Login error: ${loginError.message}`);
            if (loginError.response) {
              logError(`Status: ${loginError.response.status}`);
              console.log('Login error response:', loginError.response.data);
            }
          }
        } else {
          console.log('Registration error response:', error.response.data);
        }
      }
    }
    
    // If we have a token, set it for future requests
    if (token) {
      setAuthToken(token);
      
      // Try to get current user profile
      try {
        logInfo('Fetching user profile with token...');
        const profileRes = await api.get('/users/me');
        logSuccess('User profile retrieved successfully');
        console.log('User profile:', profileRes.data);
        
        // If we got user profile but didn't have userId yet, set it now
        if (!userId && profileRes.data._id) {
          userId = profileRes.data._id;
          logSuccess(`User ID set from profile: ${userId}`);
        }
        
        // Save user profile for reference
        saveResults('user-profile.json', profileRes.data);
        
        return true;
      } catch (profileError) {
        logWarning(`Error fetching profile: ${profileError.message}`);
        if (profileError.response) {
          logWarning(`Status: ${profileError.response.status}`);
          console.log('Profile error response:', profileError.response.data);
        }
      }
    } else {
      logWarning('No authentication token available, some tests will be skipped');
    }
    
    return false;
  } catch (error) {
    logError('Auth testing failed completely');
    console.error(error);
    return false;
  }
}

// Try all possible API endpoints to see what's implemented
async function tryAllEndpoints() {
  const endpoints = [
    // Services endpoints
    { method: 'get', url: '/services', name: 'Get all services' },
    { method: 'get', url: '/services/my-services', name: 'Get my services', authRequired: true },
    { method: 'post', url: '/services', name: 'Create service', authRequired: true, data: testService },
    
    // Events endpoints
    { method: 'get', url: '/events', name: 'Get all events' },
    { method: 'post', url: '/events', name: 'Create event', authRequired: true, data: {
      ...testEvent,
      date: testEvent.date.toISOString().split('T')[0] // Format date for API
    }},
    { method: 'get', url: '/events/categories', name: 'Get event categories' },
    
    // Community/Posts endpoints
    { method: 'get', url: '/posts', name: 'Get all posts' },
    { method: 'post', url: '/posts', name: 'Create post', authRequired: true, data: testPost },
    
    // User endpoints
    { method: 'get', url: '/users', name: 'Get all users' },
    { method: 'get', url: '/users/me', name: 'Get my profile', authRequired: true },
    
    // Feedback endpoints
    { method: 'get', url: '/feedback', name: 'Get all feedback' },
    
    // Time Banking endpoints
    { method: 'get', url: '/timebanking/balance', name: 'Get time banking balance', authRequired: true },
    { method: 'get', url: '/timebanking/transactions', name: 'Get transactions', authRequired: true }
  ];
  
  const results = {
    working: [],
    notImplemented: [],
    error: []
  };
  
  for (const endpoint of endpoints) {
    if (endpoint.authRequired && !token) {
      logWarning(`Skipping ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.url}) - requires authentication`);
      continue;
    }
    
    logInfo(`Testing: ${endpoint.name} (${endpoint.method.toUpperCase()} ${endpoint.url})`);
    
    try {
      let response;
      
      if (endpoint.method === 'get') {
        response = await api.get(endpoint.url);
      } else if (endpoint.method === 'post') {
        response = await api.post(endpoint.url, endpoint.data);
      } else if (endpoint.method === 'put') {
        response = await api.put(endpoint.url, endpoint.data);
      } else if (endpoint.method === 'delete') {
        response = await api.delete(endpoint.url);
      }
      
      logSuccess(`✓ ${endpoint.name} - Status: ${response.status}`);
      
      // Store result
      results.working.push({
        name: endpoint.name,
        method: endpoint.method.toUpperCase(),
        url: endpoint.url,
        status: response.status,
        data: response.data
      });
      
      // Store IDs from responses for further testing
      if (endpoint.url === '/services' && endpoint.method === 'post' && response.data._id) {
        serviceId = response.data._id;
        logInfo(`Created service ID: ${serviceId}`);
      }
      
      if (endpoint.url === '/events' && endpoint.method === 'post' && response.data._id) {
        eventId = response.data._id;
        logInfo(`Created event ID: ${eventId}`);
      }
      
      if (endpoint.url === '/posts' && endpoint.method === 'post' && response.data._id) {
        postId = response.data._id;
        logInfo(`Created post ID: ${postId}`);
      }
      
    } catch (error) {
      // 404 usually means not implemented
      if (error.response && error.response.status === 404) {
        logWarning(`✗ ${endpoint.name} - Not implemented (404)`);
        results.notImplemented.push({
          name: endpoint.name,
          method: endpoint.method.toUpperCase(),
          url: endpoint.url
        });
      } else {
        logError(`✗ ${endpoint.name} - Error: ${error.message}`);
        results.error.push({
          name: endpoint.name,
          method: endpoint.method.toUpperCase(),
          url: endpoint.url,
          error: error.message,
          response: error.response ? error.response.data : null
        });
      }
    }
  }
  
  // Save all results
  saveResults('api-test-results.json', results);
  
  // Print summary
  logInfo('\n=== API ENDPOINT TEST SUMMARY ===');
  logSuccess(`Working endpoints: ${results.working.length}`);
  results.working.forEach(e => console.log(`  ✓ ${e.method} ${e.url}`));
  
  logWarning(`Not implemented endpoints: ${results.notImplemented.length}`);
  results.notImplemented.forEach(e => console.log(`  ✗ ${e.method} ${e.url}`));
  
  logError(`Endpoints with errors: ${results.error.length}`);
  results.error.forEach(e => console.log(`  ✗ ${e.method} ${e.url} - ${e.error}`));
  
  return results;
}

// Run the tests
testEndpoints().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
