const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false
  },
  credits: {
    type: Number,
    required: true,
    description: 'Positive value for credits earned, negative for credits spent'
  },
  transactionType: {
    type: String,
    required: true,
    enum: ['earning', 'spending', 'refund', 'transfer'],
    description: 'Type of transaction: earning (providing service), spending (receiving service), refund, or direct transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  relatedService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: String,
  receiverName: String
});

// Create index for faster querying
TransactionSchema.index({ user: 1, event: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
