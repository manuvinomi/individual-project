/**
 * One-time utility script to fix completed service requests that are missing transaction records
 * This ensures all your completed services are properly credited in your time bank
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables - make sure we get the right .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Import models AFTER connecting to MongoDB
const Service = require('../models/Service');
const ServiceRequest = require('../models/ServiceRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Function to update completed transactions
const updateCompletedTransactions = async () => {
  try {
    console.log('Starting transaction update for completed service requests...');
    
    // Find all completed service requests
    const completedRequests = await ServiceRequest.find({ status: 'completed' })
      .populate({
        path: 'service',
        select: 'title description hourlyRate'
      })
      .populate({
        path: 'provider',
        select: 'firstName lastName'
      })
      .populate({
        path: 'requester',
        select: 'firstName lastName'
      });
    
    console.log(`Found ${completedRequests.length} completed service requests`);
    
    // Process each completed request
    for (const request of completedRequests) {
      console.log(`Processing request ID: ${request._id}, Service: ${request.service?.title || 'Unknown'}`);
      
      // Skip if we don't have all required data
      if (!request.service || !request.provider || !request.requester) {
        console.log(`Skipping request ${request._id} - Missing required data`);
        continue;
      }
      
      // Calculate cost
      const totalCost = request.requestedHours * request.service.hourlyRate;
      console.log(`Request cost: ${totalCost} credits`);
      
      // Check if there are any transactions for this request
      const existingTransactions = await Transaction.find({ relatedRequest: request._id });
      console.log(`Request ${request._id}: Found ${existingTransactions.length} existing transactions`);
      
      // If no transactions exist for this request, create them
      if (existingTransactions.length === 0) {
        console.log(`Creating new transactions for request ${request._id}`);
        
        // Get names for transaction records
        const providerName = request.provider ? 
          `${request.provider.firstName} ${request.provider.lastName}` : 'Service Provider';
        const requesterName = request.requester ? 
          `${request.requester.firstName} ${request.requester.lastName}` : 'Service Requester';
        
        try {
          // Create earning transaction for provider
          await Transaction.create({
            user: request.provider._id,
            credits: totalCost,
            transactionType: 'earning',
            description: `Payment received for service: ${request.service.title}`,
            status: 'completed',
            completedAt: request.completedAt || request.updatedAt || Date.now(),
            relatedService: request.service._id,
            relatedRequest: request._id,
            senderId: request.requester._id,
            receiverId: request.provider._id,
            senderName: requesterName,
            receiverName: providerName
          });
          
          // Create spending transaction for requester
          await Transaction.create({
            user: request.requester._id,
            credits: -totalCost,
            transactionType: 'spending',
            description: `Payment sent for service: ${request.service.title}`,
            status: 'completed',
            completedAt: request.completedAt || request.updatedAt || Date.now(),
            relatedService: request.service._id,
            relatedRequest: request._id,
            senderId: request.requester._id,
            receiverId: request.provider._id,
            senderName: requesterName,
            receiverName: providerName
          });
          
          console.log(`Created transactions for request ${request._id}`);
        } catch (err) {
          console.error(`Error creating transactions for request ${request._id}:`, err);
        }
      } else {
        // Update existing transactions to completed status
        console.log(`Updating existing transactions for request ${request._id}`);
        try {
          await Transaction.updateMany(
            { relatedRequest: request._id },
            { 
              status: 'completed',
              completedAt: request.completedAt || request.updatedAt || Date.now()
            }
          );
          console.log(`Updated transactions for request ${request._id}`);
        } catch (err) {
          console.error(`Error updating transactions for request ${request._id}:`, err);
        }
      }
    }
    
    console.log('Completed updating transactions for all completed service requests');
    
  } catch (error) {
    console.error('Error updating transactions:', error);
  } finally {
    // Disconnect from the database
    setTimeout(() => {
      mongoose.connection.close();
      console.log('Database connection closed');
    }, 1000); // Give a second for any pending operations to complete
  }
};

// Run the update
updateCompletedTransactions();
