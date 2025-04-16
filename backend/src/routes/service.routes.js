const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import controllers
const {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices,
  createServiceRequest,
  getMyRequests,
  getIncomingRequests,
  updateRequestStatus,
  completeService,
  getCategories
} = require('../controllers/service.controller');

// Public routes
router.get('/', getServices);
router.get('/categories', getCategories);

// Protected routes - require authentication
router.use(protect);

// User-specific service routes
router.get('/my-services', getMyServices);
router.get('/my-requests', getMyRequests);
router.get('/incoming-requests', getIncomingRequests);

// Service CRUD operations
router.post('/', createService);

// Service by ID routes
router.get('/:id', getServiceById);
router.put('/:id', updateService);
router.delete('/:id', deleteService);

// Service request routes
router.post('/:id/request', createServiceRequest);
router.put('/requests/:id', updateRequestStatus);
router.put('/requests/:id/complete', completeService);

module.exports = router;
