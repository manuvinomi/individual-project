const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Public
exports.getAllFeedback = asyncHandler(async (req, res, next) => {
  // Find service requests with feedback
  const serviceRequests = await ServiceRequest.find({
    'feedback.rating': { $exists: true }
  })
  .populate({
    path: 'provider',
    select: 'firstName lastName avatar'
  })
  .populate({
    path: 'requester',
    select: 'firstName lastName avatar'
  })
  .populate({
    path: 'service',
    select: 'title description'
  })
  .sort('-feedback.createdAt');
  
  // Extract feedback and related information
  const allFeedback = serviceRequests.map(req => ({
    id: req._id,
    rating: req.feedback.rating,
    comment: req.feedback.comment,
    createdAt: req.feedback.createdAt,
    service: req.service,
    provider: req.provider,
    requester: req.requester
  }));
  
  res.status(200).json({
    success: true,
    count: allFeedback.length,
    data: allFeedback
  });
});

// @desc    Submit feedback for a service request
// @route   POST /api/feedback/:serviceRequestId
// @access  Private
exports.submitFeedback = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorResponse('Please provide a valid rating between 1 and 5', 400));
  }
  
  const serviceRequest = await ServiceRequest.findById(req.params.serviceRequestId);
  
  if (!serviceRequest) {
    return next(new ErrorResponse(`Service request not found with id of ${req.params.serviceRequestId}`, 404));
  }
  
  // Make sure user is the requester
  if (serviceRequest.requester.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to submit feedback for this service request`, 401));
  }
  
  // Make sure service is completed
  if (serviceRequest.status !== 'completed') {
    return next(new ErrorResponse(`Cannot submit feedback for a service that is not completed`, 400));
  }
  
  // Check if feedback already exists
  if (serviceRequest.feedback && serviceRequest.feedback.rating) {
    return next(new ErrorResponse(`Feedback already submitted for this service request`, 400));
  }
  
  // Add feedback to service request
  serviceRequest.feedback = {
    rating,
    comment,
    createdAt: Date.now()
  };
  
  await serviceRequest.save();
  
  res.status(200).json(serviceRequest);
});

// @desc    Get feedback for a specific user
// @route   GET /api/feedback/user/:userId
// @access  Public (with optional authentication)
exports.getUserFeedback = asyncHandler(async (req, res, next) => {
  // Add validation to prevent ObjectId casting errors
  if (!req.params.userId || req.params.userId === 'undefined') {
    return next(new ErrorResponse(`Invalid user ID`, 400));
  }

  const user = await User.findById(req.params.userId);
  
  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.userId}`, 404));
  }
  
  // Find all completed service requests where the user is the provider
  const serviceRequests = await ServiceRequest.find({
    provider: req.params.userId,
    status: 'completed',
    'feedback.rating': { $exists: true }
  })
    .populate({
      path: 'service',
      select: 'title'
    })
    .populate({
      path: 'requester',
      select: 'firstName lastName avatar'
    });
  
  // Extract feedback from service requests
  const feedbacks = serviceRequests.map(request => ({
    _id: request._id,
    service: request.service,
    reviewer: request.requester,
    rating: request.feedback.rating,
    comment: request.feedback.comment,
    createdAt: request.feedback.createdAt
  }));
  
  res.status(200).json(feedbacks);
});

// @desc    Get feedback for the logged in user
// @route   GET /api/feedback/me
// @access  Private
exports.getMyFeedback = asyncHandler(async (req, res, next) => {
  // Find all completed service requests where the user is the provider
  const serviceRequests = await ServiceRequest.find({
    provider: req.user.id,
    status: 'completed',
    'feedback.rating': { $exists: true }
  })
    .populate({
      path: 'service',
      select: 'title'
    })
    .populate({
      path: 'requester',
      select: 'firstName lastName avatar'
    });
  
  // Extract feedback from service requests
  const feedbacks = serviceRequests.map(request => ({
    _id: request._id,
    service: request.service,
    reviewer: request.requester,
    rating: request.feedback.rating,
    comment: request.feedback.comment,
    createdAt: request.feedback.createdAt
  }));
  
  res.status(200).json(feedbacks);
});

// @desc    Report an issue
// @route   POST /api/feedback/report
// @access  Private
exports.reportIssue = asyncHandler(async (req, res, next) => {
  const { title, description, category, relatedServiceId } = req.body;
  
  if (!title || !description) {
    return next(new ErrorResponse('Please provide a title and description for the issue', 400));
  }
  
  // In a real application, you would save this to a database
  // For now, we'll just return a success message
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Issue reported successfully',
      issueId: Math.floor(Math.random() * 1000000) // Simulated ID
    }
  });
});

// @desc    Get feedback for a specific service
// @route   GET /api/feedback/service/:serviceId
// @access  Public (with optional authentication)
exports.getFeedbackForService = asyncHandler(async (req, res, next) => {
  // Add validation to prevent ObjectId casting errors
  if (!req.params.serviceId || req.params.serviceId === 'undefined') {
    return next(new ErrorResponse(`Invalid service ID`, 400));
  }

  // Find all completed service requests related to this service
  const serviceRequests = await ServiceRequest.find({
    service: req.params.serviceId,
    status: 'completed',
    'feedback.rating': { $exists: true }
  })
    .populate({
      path: 'requester',
      select: 'firstName lastName avatar'
    });
  
  // Extract feedback from service requests
  const feedbacks = serviceRequests.map(request => ({
    _id: request._id,
    reviewer: request.requester,
    rating: request.feedback.rating,
    comment: request.feedback.comment,
    createdAt: request.feedback.createdAt
  }));
  
  res.status(200).json(feedbacks);
});

// @desc    Get feedback for service requests submitted by the current user
// @route   GET /api/feedback/my-requests
// @access  Private
exports.getMyRequestsFeedback = async (req, res, next) => {
  try {
    // Find all completed service requests made by the current user
    const serviceRequests = await ServiceRequest.find({
      requester: req.user.id,
      status: 'completed',
      'feedback.rating': { $exists: true }
    })
      .populate({
        path: 'service',
        select: 'title description imageUrl'
      })
      .populate({
        path: 'provider',
        select: 'firstName lastName avatar'
      })
      .sort({ updatedAt: -1 });
    
    // Extract feedback from service requests
    const feedbacks = serviceRequests.map(request => ({
      _id: request._id,
      service: request.service,
      provider: request.provider,
      rating: request.feedback.rating,
      comment: request.feedback.comment,
      createdAt: request.feedback.timestamp || request.updatedAt,
      status: request.status
    }));

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Error fetching user request feedbacks:', error);
    next(error);
  }
};
