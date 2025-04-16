const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Please add an hourly rate in time credits'],
    min: [1, 'Hourly rate must be at least 1 credit']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Education',
      'Technology',
      'Home & Garden',
      'Health & Wellness',
      'Arts & Crafts',
      'Professional Services',
      'Transportation',
      'Childcare',
      'Cooking',
      'Other'
    ]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  availability: {
    type: String,
    maxlength: [100, 'Availability description cannot be more than 100 characters']
  },
  availabilityNotes: {
    type: String,
    maxlength: [500, 'Availability notes cannot be more than 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for service requests
ServiceSchema.virtual('requests', {
  ref: 'ServiceRequest',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Cascade delete requests when a service is deleted
ServiceSchema.pre('remove', async function(next) {
  await this.model('ServiceRequest').deleteMany({ service: this._id });
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
