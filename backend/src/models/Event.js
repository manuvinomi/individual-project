const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'Skill Sharing',
      'Workshop',
      'Community Service',
      'Meetup',
      'Training',
      'Social',
      'Education',
      'Environmental',
      'Technology',
      'Art',
      'Health',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please add a date']
  },
  time: {
    type: String,
    required: [true, 'Please add a time']
  },
  duration: {
    type: Number,
    required: [true, 'Please specify duration in hours']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String
  },
  image: {
    type: String,
    default: 'default-event.jpg'
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Please specify maximum number of attendees']
  },
  timeCredits: {
    type: Number,
    required: [true, 'Please specify time credits value'],
    default: 1
  },
  isTimeCreditEarning: {
    type: Boolean,
    default: false,
    description: 'If true, attendees earn credits. If false, attending costs credits.'
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      default: 'confirmed'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  materialsNeeded: {
    type: String
  },
  skillsRequired: [{
    type: String
  }],
  skillsOffered: [{
    type: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to get current number of attendees
EventSchema.virtual('currentAttendees').get(function() {
  return this.attendees.length;
});

// Virtual property to check if event is full
EventSchema.virtual('isFull').get(function() {
  return this.attendees.length >= this.maxAttendees;
});

// Middleware to prevent saving if full
EventSchema.pre('save', function(next) {
  // Only check if this is an update to attendees
  if (this.isModified('attendees') && this.isFull && this.attendees.length > this.maxAttendees) {
    const error = new Error('Event is already full');
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
