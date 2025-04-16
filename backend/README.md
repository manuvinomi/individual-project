# Skill Exchange Platform Backend API

This is the RESTful API backend for the Skill Exchange & Community Development Platform. It provides endpoints for user authentication, event management, and time banking functionality.

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/skill-exchange
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

3. Start the server:
   ```
   npm run dev
   ```

## API Testing with cURL

Below are examples of how to test the API endpoints using cURL commands.

### Authentication Endpoints

#### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Get current user profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Update user details
```bash
curl -X PUT http://localhost:5000/api/auth/updatedetails \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "bio": "This is my updated bio"
  }'
```

### Event Endpoints

#### Get all events
```bash
curl -X GET http://localhost:5000/api/events
```

#### Get events with filtering
```bash
curl -X GET "http://localhost:5000/api/events?category=Workshop&sort=date"
```

#### Get single event
```bash
curl -X GET http://localhost:5000/api/events/EVENT_ID_HERE
```

#### Create event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Workshop",
    "description": "Learn JavaScript basics",
    "category": "Workshop",
    "date": "2025-05-15T14:00:00.000Z",
    "time": "2:00 PM",
    "duration": 2,
    "location": "Community Center",
    "maxAttendees": 20,
    "timeCredits": 2,
    "isTimeCreditEarning": true
  }'
```

#### Update event
```bash
curl -X PUT http://localhost:5000/api/events/EVENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced JavaScript Workshop",
    "description": "Updated description"
  }'
```

#### Delete event
```bash
curl -X DELETE http://localhost:5000/api/events/EVENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Register for an event
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID_HERE/register \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Save an event
```bash
curl -X POST http://localhost:5000/api/events/EVENT_ID_HERE/save \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Unsave an event
```bash
curl -X DELETE http://localhost:5000/api/events/EVENT_ID_HERE/save \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Time Banking Endpoints

#### Get credit balance
```bash
curl -X GET http://localhost:5000/api/timebanking/balance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get transaction history
```bash
curl -X GET http://localhost:5000/api/timebanking/history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Complete a transaction (event organizer/admin)
```bash
curl -X PUT http://localhost:5000/api/timebanking/transactions/TRANSACTION_ID_HERE/complete \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Get transactions for an event (event organizer)
```bash
curl -X GET http://localhost:5000/api/timebanking/events/EVENT_ID_HERE/transactions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Models

### User Model
- name: User's full name
- email: User's email address (unique)
- password: Encrypted password
- profileImage: Profile picture
- bio: User biography
- skills: Array of skills the user has
- interests: Array of the user's interests
- location: User's general location
- availability: When the user is typically available
- timeCredits: Current time credit balance
- eventsAttended: Events the user has attended
- eventsOrganized: Events the user has organized
- savedEvents: Events the user has saved

### Event Model
- title: Event title
- description: Detailed description
- category: Event category
- date: Event date
- time: Event time
- duration: Event duration in hours
- location: Physical location
- isVirtual: Whether the event is virtual
- virtualLink: Link for virtual events
- image: Event image
- maxAttendees: Maximum number of attendees
- timeCredits: Credits earned/spent for this event
- isTimeCreditEarning: If true, attendees earn credits
- attendees: Array of users attending
- materialsNeeded: Materials required
- skillsRequired: Skills needed to participate
- skillsOffered: Skills being taught/shared
- organizer: User who created the event
- status: Event status (upcoming, ongoing, etc.)

### Transaction Model
- user: User associated with the transaction
- event: Related event
- credits: Number of credits (positive for earned, negative for spent)
- transactionType: Type of transaction (earning, spending, refund)
- status: Transaction status (pending, completed, cancelled)
- description: Description of the transaction
- createdAt: When the transaction was created
- completedAt: When the transaction was completed
