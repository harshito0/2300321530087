const logger = require('../../logging_middleware/logger');

// Weights defined by the requirements
const TYPE_WEIGHTS = {
  placement: 3,
  result: 2,
  event: 1
};

/**
 * Calculates priority score for a single notification.
 * Formula: score = (typeWeight * 1000000) + timestampValue
 * @param {Object} notification 
 * @returns {number} calculated priority score
 */
function calculatePriorityScore(notification) {
  const typeKey = (notification.type || '').toLowerCase();
  const weight = TYPE_WEIGHTS[typeKey] || 0;
  
  // Accept both string timestamps (parsed to ms) or unix epoch numbers
  const timestampValue = new Date(notification.timestamp).getTime();
  
  if (isNaN(timestampValue)) {
    return weight * 10000000000000;
  }
  
  return (weight * 10000000000000) + timestampValue;
}

/**
 * Process raw notifications list to generate sorted, prioritized unread notifications.
 * @param {Array} notifications 
 * @returns {Array} processed & sorted notifications
 */
function processNotifications(notifications) {
  const startTime = process.hrtime();
  
  logger.notificationProcessingStart('api_service');
  
  if (!Array.isArray(notifications)) {
    logger.warn('Notifications payload is not an array, returning empty priority inbox.');
    logger.notificationProcessingComplete(0, 0);
    return [];
  }

  // Filter: Keep only unread notifications (read = false)
  const unreadNotifications = notifications.filter(n => n.read === false);
  
  // Calculate priority score for each unread notification
  const scoredNotifications = unreadNotifications.map(notification => {
    const score = calculatePriorityScore(notification);
    return {
      id: notification.id,
      type: notification.type,
      message: notification.message,
      timestamp: notification.timestamp,
      calculatedPriorityScore: score
    };
  });
  
  // Log start of sorting operations
  logger.sortingOperationsStart(scoredNotifications.length, 'descending priority score');
  const sortStartTime = process.hrtime();
  
  // Sort descending: highest score first
  scoredNotifications.sort((a, b) => b.calculatedPriorityScore - a.calculatedPriorityScore);
  
  const sortDiff = process.hrtime(sortStartTime);
  const sortDurationMs = (sortDiff[0] * 1e3 + sortDiff[1] * 1e-6).toFixed(2);
  logger.sortingOperationsComplete(sortDurationMs);
  
  // Generate Top 10
  logger.top10GenerationStart();
  const top10 = scoredNotifications.slice(0, 10);
  logger.top10GenerationComplete(top10.length);

  const totalDiff = process.hrtime(startTime);
  const totalDurationMs = (totalDiff[0] * 1e3 + totalDiff[1] * 1e-6).toFixed(2);
  logger.notificationProcessingComplete(scoredNotifications.length, totalDurationMs);

  return top10;
}

module.exports = {
  calculatePriorityScore,
  processNotifications,
  TYPE_WEIGHTS
};
