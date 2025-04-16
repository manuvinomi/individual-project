# Skill Exchange & Community Development Platform

A modern web application designed to facilitate skill sharing, time banking, and community development. This platform enables users to exchange services based on time credits rather than money, promoting equity and accessibility for all community members.

## Features

### Core Functionality
- **User Authentication**: Secure registration and login system with profile management
- **Skill Exchange**: Browse, search, and request services from community members
- **Time Banking**: Exchange skills based on time credits, with 1 hour of any service valued equally
- **Community Board**: Central hub for posts, events, and community announcements
- **Messaging System**: Direct communication between users for coordinating service exchanges
- **Feedback System**: Rating and review mechanism for completed services

### User Experience
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Accessibility**: Designed with accessibility in mind to ensure all users can navigate and use the platform
- **Modern UI**: Clean, intuitive interface built with Material-UI components

## Tech Stack

### Frontend
- **React**: JavaScript library for building the user interface
- **React Router**: Navigation and routing between pages
- **Material-UI**: Component library for consistent and attractive UI elements
- **Context API**: State management for user authentication, time banking, services, etc.
- **Axios**: HTTP client for API requests

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express**: Web server framework
- **MongoDB**: NoSQL database for storing user data, services, and time credits
- **JWT**: Authentication mechanism for securing API endpoints

## Project Structure

The project is organized into the following directories:

```
frontend/
├── public/                # Public assets and index.html
├── src/                   # Source files
│   ├── assets/            # Images, icons, and other static assets
│   ├── components/        # Reusable UI components
│   │   ├── auth/          # Authentication components (Login, Register)
│   │   ├── community/     # Community features (CommunityBoard)
│   │   ├── feedback/      # Feedback system components
│   │   ├── layout/        # Layout components (Navigation, Footer)
│   │   ├── messages/      # Messaging system components
│   │   ├── profile/       # User profile components
│   │   ├── services/      # Service browsing and exchange components
│   │   └── timebank/      # Time banking components
│   ├── contexts/          # Context providers for state management
│   ├── pages/             # Full pages composed of multiple components
│   ├── api/               # API services and configuration
│   ├── utils/             # Utility functions
│   └── App.js             # Main application component
│
backend/
├── src/                   # Source files
│   ├── config/            # Configuration files (db, passport)
│   ├── controllers/       # Request handlers for each route
│   ├── middleware/        # Custom middleware (auth, error handling)
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── utils/             # Utility functions
│   └── server.js          # Main server entry point
├── uploads/               # Storage for uploaded files
└── test-api.js            # Test script for API endpoints
```

## Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB (local installation or Atlas account)
- Google Developer account (for Google authentication)

### Setting Up the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skill_exchange
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   FRONTEND_URL=http://localhost:3000
   ```
   
   > Note: You need to set up a Google OAuth project to get the Google client ID and secret.

4. Start the backend server:
   ```
   npm run dev
   ```

### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

### Testing the API

The backend includes a test script to verify all API endpoints are working correctly:

```
cd backend
npm test
```

## Setting Up Google Authentication

1. Go to the [Google Developer Console](https://console.developers.google.com/)
2. Create a new project
3. Enable the Google+ API and Google People API
4. Set up the OAuth consent screen
5. Create OAuth 2.0 credentials:
   - For development: Set the authorized JavaScript origin to `http://localhost:5000`
   - Add redirect URIs: `http://localhost:5000/api/auth/google/callback`
6. Copy the Client ID and Client Secret to your backend `.env` file

## API Documentation

The backend provides the following API endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get logged in user profile
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback

### User Management

- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin or owner)
- `DELETE /api/users/:id` - Delete user (admin or owner)

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `PUT /api/events/:id/register` - Register for an event
- `PUT /api/events/:id/save` - Save an event to user profile

### Time Banking

- `GET /api/timebanking/balance` - Get user's current time credit balance
- `GET /api/timebanking/history` - Get user's transaction history
- `POST /api/timebanking/transactions` - Create a new transaction
- `PUT /api/timebanking/transactions/:id/complete` - Mark a transaction as complete

## Future Enhancements

- **Mobile App**: Native mobile applications for iOS and Android
- **Real-time Notifications**: Push notifications for service requests and messages
- **Service Categories**: Expanded categorization and filtering options
- **Community Events Calendar**: Integrated calendar for scheduling and promoting community events
- **Resource Sharing**: Expand beyond skills to include tool lending and resource sharing
- **Impact Metrics**: Analytics to track community engagement and platform impact

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
