const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const notificationController = require('./notification.controller');

// @desc    Get all services
// @route   GET /api/services
// @access  Private
exports.getServices = asyncHandler(async (req, res, next) => {
  // Add caching headers to prevent too frequent requests
  res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
  res.set('Surrogate-Control', 'max-age=600'); // CDN cache for 10 minutes
  
  let query = {};
  
  // Filter by userId if provided
  if (req.query.userId) {
    query.user = req.query.userId;
  }
  
  // Filter by category if provided
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Filter by search term if provided
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }
  
  const services = await Service.find(query)
    .populate({
      path: 'user',
      select: 'firstName lastName avatar location email bio',
      model: 'User'
    });
  
  res.status(200).json(services);
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Private
exports.getServiceById = asyncHandler(async (req, res, next) => {
  // Add validation to prevent ObjectId casting errors
  if (!req.params.id || req.params.id === 'undefined') {
    return next(new ErrorResponse(`Invalid service ID`, 400));
  }
  
  const service = await Service.findById(req.params.id)
    .populate({
      path: 'user',
      select: 'firstName lastName avatar email location bio',
      model: 'User'
    });
  
  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }
  
  // Modify the response to include provider field
  const serviceWithProvider = {
    ...service.toObject(),
    provider: service.user
  };
  
  res.status(200).json(serviceWithProvider);
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private
exports.createService = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  
  const service = await Service.create(req.body);
  
  res.status(201).json(service);
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is service owner
  if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this service`, 401));
  }
  
  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json(service);
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is service owner
  if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this service`, 401));
  }
  
  await service.remove();
  
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get logged in user's services
// @route   GET /api/services/my-services
// @access  Private
exports.getMyServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find({ user: req.user.id });
  
  res.status(200).json(services);
});

// @desc    Create a service request
// @route   POST /api/services/:id/request
// @access  Private
exports.createServiceRequest = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  
  if (!service) {
    return next(new ErrorResponse(`Service not found with id of ${req.params.id}`, 404));
  }
  
  // Calculate total cost
  const totalCost = req.body.duration * service.hourlyRate;
  
  // Check if user has enough time credits
  const user = await User.findById(req.user.id);
  if (user.timeCredits < totalCost) {
    return next(new ErrorResponse(`You don't have enough time credits. Need ${totalCost}, have ${user.timeCredits}`, 400));
  }
  
  // Create request
  const request = await ServiceRequest.create({
    service: req.params.id,
    provider: service.user,
    requester: req.user.id,
    requestedHours: req.body.duration,
    requestDetails: req.body.description,
    requestedDate: new Date(req.body.date + ' ' + req.body.time),
    status: 'pending'
  });
  
  // Place time credits on hold (deduct from user but not yet give to provider)
  await User.findByIdAndUpdate(
    req.user.id,
    { $inc: { timeCredits: -totalCost } },
    { new: true }
  );
  
  // Create transaction record for the hold
  await Transaction.create({
    user: req.user.id,
    credits: -totalCost,
    transactionType: 'spending',
    description: `Hold for service request: ${service.title}`,
    status: 'pending',
    event: null, // Placeholder - consider updating Transaction model to make event optional
    relatedService: service._id,
    relatedRequest: request._id,
    senderId: req.user.id,
    receiverId: service.user,
    senderName: `${user.firstName} ${user.lastName}`,
    receiverName: 'Service Provider' // This will be updated when we fetch the provider details
  });
  
  // Fetch provider details
  const provider = await User.findById(service.user);
  const providerName = provider ? `${provider.firstName} ${provider.lastName}` : 'Service Provider';
  
  // Create pending transaction for the provider
  await Transaction.create({
    user: service.user,
    credits: totalCost,
    transactionType: 'earning',
    description: `Pending payment for service: ${service.title}`,
    status: 'pending',
    event: null, // Placeholder - consider updating Transaction model to make event optional
    relatedService: service._id,
    relatedRequest: request._id,
    senderId: req.user.id,
    receiverId: service.user,
    senderName: `${user.firstName} ${user.lastName}`,
    receiverName: providerName
  });
  
  // Create a notification for the service provider
  await notificationController.createNotification({
    type: 'service_request',
    content: `requested your service: ${service.title}`,
    senderId: req.user.id,
    receiverId: service.user,
    entityId: request._id,
    entityType: 'request'
  });
  
  res.status(201).json(request);
});

// @desc    Get logged in user's service requests
// @route   GET /api/services/my-requests
// @access  Private
exports.getMyRequests = asyncHandler(async (req, res, next) => {
  const requests = await ServiceRequest.find({ requester: req.user.id })
    .populate({
      path: 'service',
      select: 'title description hourlyRate'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName avatar'
    });
  
  res.status(200).json(requests);
});

// @desc    Get incoming service requests for logged in user
// @route   GET /api/services/incoming-requests
// @access  Private
exports.getIncomingRequests = asyncHandler(async (req, res, next) => {
  const requests = await ServiceRequest.find({ provider: req.user.id })
    .populate({
      path: 'service',
      select: 'title description hourlyRate'
    })
    .populate({
      path: 'requester',
      select: 'firstName lastName avatar'
    });
  
  res.status(200).json(requests);
});

// @desc    Update request status (accept/reject)
// @route   PUT /api/services/requests/:id
// @access  Private
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  
  if (!status || !['accepted', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Please provide a valid status (accepted/rejected)', 400));
  }
  
  let request = await ServiceRequest.findById(req.params.id)
    .populate({
      path: 'service',
      select: 'title description hourlyRate'
    });
  
  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is the service provider
  if (request.provider.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this request`, 401));
  }
  
  // If rejecting, refund the time credits to requester
  if (status === 'rejected' && request.status === 'pending') {
    const totalCost = request.requestedHours * request.service.hourlyRate;
    
    // Refund time credits to requester
    await User.findByIdAndUpdate(
      request.requester,
      { $inc: { timeCredits: totalCost } },
      { new: true }
    );
    
    // Create transaction record for the refund
    await Transaction.create({
      user: request.requester,
      credits: totalCost,
      transactionType: 'refund',
      description: `Refund for rejected service request: ${request.service.title}`,
      status: 'completed',
      relatedService: request.service._id,
      relatedRequest: request._id
    });
    
    // Cancel the pending transaction for provider
    await Transaction.findOneAndUpdate(
      { 
        user: request.provider,
        relatedRequest: request._id,
        transactionType: 'earning',
        status: 'pending'
      },
      { status: 'cancelled' },
      { new: true }
    );
  }
  
  // If accepting, no credit changes are needed yet
  // Credits remain held from requester and pending for provider
  if (status === 'accepted' && request.status === 'pending') {
    // First, find and update any existing pending transaction for the provider
    const existingProviderTransaction = await Transaction.findOne({
      user: request.provider,
      relatedRequest: request._id,
      transactionType: 'earning',
      status: 'pending'
    });

    if (existingProviderTransaction) {
      // Update the existing transaction description to show it's been accepted
      existingProviderTransaction.description = `Accepted payment for service: ${request.service.title} (pending completion)`;
      await existingProviderTransaction.save();
    } else {
      // If no transaction exists (which would be unusual), create one
      await Transaction.create({
        user: request.provider,
        credits: request.requestedHours * request.service.hourlyRate,
        transactionType: 'earning',
        description: `Accepted payment for service: ${request.service.title} (pending completion)`,
        status: 'pending',
        relatedService: request.service._id,
        relatedRequest: request._id,
        senderId: request.requester,
        receiverId: request.provider
      });
    }

    // Now find and remove any duplicate "Hold for service request" transaction for the provider
    // These might be created during the initial service request process
    const holdTransactions = await Transaction.find({
      user: request.provider,
      relatedRequest: request._id,
      description: { $regex: `Hold for service request: ${request.service.title}` }
    });

    // If we found more than one pending transaction, remove the extras
    if (holdTransactions.length > 0) {
      for (const transaction of holdTransactions) {
        await Transaction.findByIdAndDelete(transaction._id);
      }
    }
  }
  
  request = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  )
    .populate({
      path: 'service',
      select: 'title description hourlyRate'
    })
    .populate({
      path: 'requester',
      select: 'firstName lastName avatar email'
    });
  
  res.status(200).json(request);
});

// @desc    Mark service as completed and submit review
// @route   PUT /api/services/requests/:id/complete
// @access  Private
exports.completeService = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;
  
  let request = await ServiceRequest.findById(req.params.id)
    .populate({
      path: 'service',
      select: 'title description hourlyRate user'
    })
    .populate({
      path: 'requester',
      select: 'firstName lastName'
    })
    .populate({
      path: 'provider',
      select: 'firstName lastName'
    });
  
  if (!request) {
    return next(new ErrorResponse(`Request not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user is authorized (must be the requester)
  if (request.requester._id.toString() !== req.user.id) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to complete this request`, 401));
  }
  
  // Only allow completion of accepted requests
  if (request.status !== 'accepted') {
    return next(new ErrorResponse(`Request must be in 'accepted' status to be completed (current: ${request.status})`, 400));
  }
  
  // Check if rating is provided
  if (!rating || rating < 1 || rating > 5) {
    return next(new ErrorResponse('Please provide a valid rating (1-5)', 400));
  }
  
  // Update the request with completion and feedback
  request = await ServiceRequest.findByIdAndUpdate(
    req.params.id,
    { status: 'completed', completedAt: Date.now(), feedback: { rating, comment: comment || '' } },
    { new: true, runValidators: true }
  );
  
  // Calculate the total credits to transfer
  // Ensure we have valid numbers by using defaults if values are missing
  const hourlyRate = request.service.hourlyRate || 1;
  const requestedHours = request.requestedHours || 1; 
  const totalCredits = parseInt(requestedHours) * parseInt(hourlyRate);
  
  // Log the values to verify they're correct
  console.log(`Completing service with hourlyRate: ${hourlyRate}, requestedHours: ${requestedHours}, totalCredits: ${totalCredits}`);
  
  // Verify that totalCredits is a valid number
  if (isNaN(totalCredits)) {
    console.error('Error: totalCredits is NaN', { 
      hourlyRate, 
      requestedHours, 
      serviceData: request.service, 
      requestData: request
    });
    return next(new ErrorResponse('Could not calculate credits amount due to invalid data', 400));
  }
  
  // First, find and update any existing pending transactions
  // Find transactions for the provider first
  const pendingProviderTransactions = await Transaction.find({
    user: request.provider,
    relatedRequest: request._id,
    status: 'pending'
  });
  
  // Find transactions for the requester
  const pendingRequesterTransactions = await Transaction.find({
    user: request.requester,
    relatedRequest: request._id,
    status: 'pending'
  });
  
  console.log(`Found ${pendingProviderTransactions.length} pending provider transactions and ${pendingRequesterTransactions.length} pending requester transactions`);
  
  // If we have pending transactions, update them instead of creating new ones
  if (pendingProviderTransactions.length > 0) {
    // Update the first pending transaction and mark it as completed
    const providerTransaction = pendingProviderTransactions[0];
    providerTransaction.status = 'completed';
    providerTransaction.description = `Payment for completed service: ${request.service.title} (Rating: ${rating}/5)`;
    await providerTransaction.save();
    
    // Remove any duplicates
    if (pendingProviderTransactions.length > 1) {
      for (let i = 1; i < pendingProviderTransactions.length; i++) {
        await Transaction.findByIdAndDelete(pendingProviderTransactions[i]._id);
      }
    }
  } else {
    // Create a new transaction for the provider if none exists
    await Transaction.create({
      user: request.provider._id,
      credits: totalCredits,
      transactionType: 'earning',
      description: `Payment for completed service: ${request.service.title} (Rating: ${rating}/5)`,
      status: 'completed',
      relatedService: request.service._id,
      relatedRequest: request._id,
      senderId: request.requester._id,
      receiverId: request.provider._id,
      senderName: `${request.requester.firstName} ${request.requester.lastName}`,
      receiverName: `${request.provider.firstName} ${request.provider.lastName}`
    });
  }
  
  // Also update the requester's pending transactions, marking them as completed
  if (pendingRequesterTransactions.length > 0) {
    pendingRequesterTransactions[0].status = 'completed';
    pendingRequesterTransactions[0].description = `Payment for completed service: ${request.service.title} (Rating: ${rating}/5)`;
    await pendingRequesterTransactions[0].save();
    
    // Remove any duplicates
    if (pendingRequesterTransactions.length > 1) {
      for (let i = 1; i < pendingRequesterTransactions.length; i++) {
        await Transaction.findByIdAndDelete(pendingRequesterTransactions[i]._id);
      }
    }
  }
  
  // Update the provider's time credits balance
  try {
    const provider = await User.findById(request.provider);
    if (!provider) {
      console.error(`Provider with ID ${request.provider} not found`);
      return next(new ErrorResponse(`Provider not found`, 404));
    }
    
    console.log(`Updating provider ${provider._id} time credits: Current=${provider.timeCredits}, Adding=${totalCredits}`);
    
    // Make sure to use the provider's _id directly, not the request.provider which might be a string
    await User.findByIdAndUpdate(
      provider._id,
      { $inc: { timeCredits: totalCredits } }
    );
    
    console.log(`Successfully updated provider time credits`);
  } catch (error) {
    console.error('Error updating provider time credits:', error);
    return next(new ErrorResponse(`Failed to update provider time credits: ${error.message}`, 500));
  }
  
  res.status(200).json(request);
});

// @desc    Get all service categories
// @route   GET /api/services/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res, next) => {
  const categories = [
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
  ];
  
  res.status(200).json(categories.map((name, index) => ({
    id: index + 1,
    name
  })));
});
