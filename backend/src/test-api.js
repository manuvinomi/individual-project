const axios = require('axios');
const colors = require('colors');

// Base URL
const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let eventId = '';

// Test user
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

// Test event
const testEvent = {
  title: 'JavaScript Workshop',
  description: 'Learn JavaScript basics and advanced concepts in this interactive workshop',
  category: 'Workshop',
  date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  time: '2:00 PM',
  duration: 2,
  location: 'Community Center',
  maxAttendees: 20,
  timeCredits: 2,
  isTimeCreditEarning: true
};

// Helper to log responses
const logResponse = (title, data) => {
  console.log('\n' + colors.yellow.bold(`=== ${title} ===`));
  console.log(colors.green(JSON.stringify(data, null, 2)));
};

// Helper for error handling
const handleError = (error, title) => {
  console.log('\n' + colors.red.bold(`=== ERROR: ${title} ===`));
  if (error.response) {
    // Server responded with a status other than 200 range
    console.log(colors.red('Response data:'), error.response.data);
    console.log(colors.red('Status code:'), error.response.status);
  } else if (error.request) {
    // Request was made but no response received
    console.log(colors.red('No response received'));
  } else {
    // Something happened in setting up the request
    console.log(colors.red('Error message:'), error.message);
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log(colors.cyan.bold('\n=== STARTING API TESTS ===\n'));
    
    // Health check
    console.log(colors.cyan('Testing API health...'));
    const health = await axios.get(`${API_URL}/health`);
    logResponse('Health Check', health.data);
    
    // Registration
    console.log(colors.cyan('\nRegistering test user...'));
    try {
      const register = await axios.post(`${API_URL}/auth/register`, testUser);
      logResponse('User Registration', register.data);
      token = register.data.token;
      userId = register.data.data._id;
    } catch (error) {
      // If user already exists, try login instead
      if (error.response && error.response.status === 400) {
        console.log(colors.yellow('User already exists, attempting login...'));
        const login = await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        logResponse('User Login', login.data);
        token = login.data.token;
        userId = login.data.data._id;
      } else {
        throw error;
      }
    }
    
    // Create an event
    console.log(colors.cyan('\nCreating test event...'));
    const createEvent = await axios.post(
      `${API_URL}/events`,
      testEvent,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('Event Creation', createEvent.data);
    eventId = createEvent.data.data._id;
    
    // Get all events
    console.log(colors.cyan('\nFetching all events...'));
    const events = await axios.get(`${API_URL}/events`);
    logResponse('All Events', events.data);
    
    // Get event by ID
    console.log(colors.cyan('\nFetching event by ID...'));
    const event = await axios.get(`${API_URL}/events/${eventId}`);
    logResponse('Single Event', event.data);
    
    // Save event
    console.log(colors.cyan('\nSaving event...'));
    const saveEvent = await axios.post(
      `${API_URL}/events/${eventId}/save`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('Save Event', saveEvent.data);
    
    // Get user profile
    console.log(colors.cyan('\nFetching user profile...'));
    const profile = await axios.get(
      `${API_URL}/auth/me`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('User Profile', profile.data);
    
    // Get time credit balance
    console.log(colors.cyan('\nFetching time credit balance...'));
    const balance = await axios.get(
      `${API_URL}/timebanking/balance`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('Time Credit Balance', balance.data);
    
    // Register for event
    console.log(colors.cyan('\nRegistering for event...'));
    const register = await axios.post(
      `${API_URL}/events/${eventId}/register`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('Event Registration', register.data);
    
    // Get transaction history
    console.log(colors.cyan('\nFetching transaction history...'));
    const transactions = await axios.get(
      `${API_URL}/timebanking/history`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    logResponse('Transaction History', transactions.data);
    
    console.log(colors.green.bold('\n=== ALL TESTS COMPLETED SUCCESSFULLY ===\n'));
  } catch (error) {
    handleError(error, 'Test Failed');
  }
};

// Run the tests
runTests();
