const mongoose = require('mongoose');

const ServiceRequestSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  requester: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  requestedHours: {
    type: Number,
    required: [true, 'Please add requested hours'],
    min: [0.5, 'Requested hours must be at least 0.5']
  },
  requestDetails: {
    type: String,
    required: [true, 'Please add request details'],
    maxlength: [1000, 'Request details cannot be more than 1000 characters']
  },
  requestedDate: {
    type: Date,
    required: [true, 'Please add a requested date']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Feedback comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
