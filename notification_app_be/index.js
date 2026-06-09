const express = require('express');
const env = require('./config/env');
const logger = require('../logging_middleware/logger');
const expressLoggingMiddleware = require('./middleware/loggingMiddleware');
const apiService = require('./services/apiService');
const priorityService = require('./services/priorityService');
const MinHeap = require('./utils/minHeap');
const { registerMockRoutes, mockNotifications } = require('./utils/mockNotificationApi');

const app = express();

// Enable JSON body parsing for simulations
app.use(express.json());

// Enable HTTP logging middleware
app.use(expressLoggingMiddleware);

// Register evaluation service mock endpoints
registerMockRoutes(app);

// In-Memory MinHeap instance to demonstrate continuous stream scaling (Requirements Section 5)
const streamingTop10Heap = new MinHeap(10);

// Helper to seed the streaming heap with unread mock notifications
function seedStreamingHeap() {
  logger.info('Seeding in-memory Min-Heap with initial unread mock notifications...');
  
  // Filter unread and compute initial scores
  const unreadScored = mockNotifications
    .filter(n => !n.read)
    .map(n => ({
      id: n.id,
      type: n.type,
      message: n.message,
      timestamp: n.timestamp,
      calculatedPriorityScore: priorityService.calculatePriorityScore(n)
    }));
  
  // Push into heap
  unreadScored.forEach(n => streamingTop10Heap.push(n));
  logger.info(`Seeding complete. Heap size: ${streamingTop10Heap.size()}/${streamingTop10Heap.capacity}`);
}

// Seed the heap at startup
seedStreamingHeap();

/**
 * Route: GET /api/priority-inbox
 * Fulfills Requirements Section 4: Fetches notifications from the protected API,
 * filters, scores, sorts, and returns the top 10.
 */
app.get('/api/priority-inbox', async (req, res) => {
  try {
    logger.info('Fetching priority inbox from upstream evaluation service...');
    
    // 1. Fetch from protected API service
    const rawNotifications = await apiService.fetchNotifications();
    
    // 2. Process priority inbox (filtering, scoring, sorting, slicing Top 10)
    const priorityInbox = priorityService.processNotifications(rawNotifications);
    
    // 3. Return the result
    return res.status(200).json({
      success: true,
      count: priorityInbox.length,
      data: priorityInbox
    });
  } catch (err) {
    logger.unexpectedError(err, 'GET /api/priority-inbox controller failure');
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message
    });
  }
});

/**
 * Route: GET /priority-notifications
 * Fulfills follow-up requirement: Returns the Top 10 sorted unread notifications.
 */
app.get('/priority-notifications', async (req, res) => {
  try {
    logger.info('Fetching priority notifications...');
    const rawNotifications = await apiService.fetchNotifications();
    const priorityInbox = priorityService.processNotifications(rawNotifications);
    
    return res.status(200).json({
      count: priorityInbox.length,
      notifications: priorityInbox
    });
  } catch (err) {
    logger.unexpectedError(err, 'GET /priority-notifications controller failure');
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message
    });
  }
});

/**
 * Route: POST /api/notifications/stream
 * Fulfills Requirements Section 5: Demonstrates how to maintain the Top 10
 * continuously and efficiently using a Min-Heap without re-sorting everything.
 */
app.post('/api/notifications/stream', (req, res) => {
  try {
    const { id, type, message, timestamp, read } = req.body;
    
    // Simple validation
    if (!id || !type || !message || !timestamp) {
      return res.status(400).json({
        success: false,
        error: "Bad Request",
        message: "Missing required fields: id, type, message, timestamp"
      });
    }

    logger.info(`Received stream notification ${id} of type ${type}`);

    // If read, ignore (only unread notifications are considered)
    if (read === true) {
      logger.info(`Notification ${id} is already read. Ignoring for priority inbox.`);
      return res.status(200).json({
        success: true,
        message: "Notification is read. Top 10 unchanged.",
        currentTop10: streamingTop10Heap.toArraySorted()
      });
    }

    // 1. Calculate Priority Score
    const scoredNotification = {
      id,
      type,
      message,
      timestamp,
      calculatedPriorityScore: priorityService.calculatePriorityScore({ type, timestamp })
    };

    // 2. Insert into heap
    logger.top10GenerationStart();
    const inserted = streamingTop10Heap.push(scoredNotification);
    logger.top10GenerationComplete(streamingTop10Heap.size());

    // 3. Get sorted top 10 descending
    const updatedTop10 = streamingTop10Heap.toArraySorted();

    return res.status(200).json({
      success: true,
      insertedIntoInbox: inserted,
      message: inserted 
        ? `Notification ${id} entered the Top 10 priority inbox!` 
        : `Notification ${id} score too low to enter Top 10.`,
      currentTop10: updatedTop10
    });
  } catch (err) {
    logger.unexpectedError(err, 'POST /api/notifications/stream failure');
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message
    });
  }
});

// Start the Express server
const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`================================================================`);
  logger.info(` Campus Notifications Microservice running on port ${PORT}`);
  logger.info(` Environment: development`);
  logger.info(` Authentication Status: ${env.AUTH_ENABLED ? 'ENABLED' : 'DISABLED (BYPASSED)'}`);
  logger.info(` Protected API URL: ${env.EVALUATION_SERVICE_URL}/notifications`);
  logger.info(`================================================================`);
});
