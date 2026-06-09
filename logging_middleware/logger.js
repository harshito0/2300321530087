const winston = require('winston');

// Determine log level from environment or default to info
const logLevel = process.env.LOG_LEVEL || 'info';

// Custom format for clean console logs
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let metaStr = '';
    if (Object.keys(metadata).length > 0) {
      metaStr = ` | ${JSON.stringify(metadata)}`;
    }
    return `[${timestamp}] [${level}]: ${message}${metaStr}`;
  })
);

// Create the winston logger instance
const winstonLogger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Reusable business logic logging helpers to prevent direct console.log usage
const logger = {
  // General logs
  info: (msg, meta = {}) => winstonLogger.info(msg, meta),
  warn: (msg, meta = {}) => winstonLogger.warn(msg, meta),
  error: (msg, meta = {}) => winstonLogger.error(msg, meta),
  debug: (msg, meta = {}) => winstonLogger.debug(msg, meta),

  // API Client logging helpers
  apiReqStart: (url, method, reqId) => {
    winstonLogger.info(`API request start | Request ID: ${reqId} | Method: ${method} | URL: ${url}`, {
      reqId,
      method,
      url,
      stage: 'API_REQUEST_START'
    });
  },

  apiResReceived: (url, method, reqId, status, durationMs) => {
    winstonLogger.info(`API response received | Request ID: ${reqId} | Method: ${method} | URL: ${url} | Status: ${status} | Duration: ${durationMs}ms`, {
      reqId,
      method,
      url,
      status,
      durationMs,
      stage: 'API_RESPONSE_RECEIVED'
    });
  },

  apiFailure: (url, method, reqId, errorMessage, durationMs) => {
    winstonLogger.error(`API failure | Request ID: ${reqId} | Method: ${method} | URL: ${url} | Error: ${errorMessage} | Duration: ${durationMs}ms`, {
      reqId,
      method,
      url,
      error: errorMessage,
      durationMs,
      stage: 'API_FAILURE'
    });
  },

  // Notification processing lifecycle logs
  notificationProcessingStart: (source) => {
    winstonLogger.info(`Notification processing start | Source: ${source}`, {
      source,
      stage: 'NOTIFICATION_PROCESSING_START'
    });
  },

  notificationProcessingComplete: (count, durationMs) => {
    winstonLogger.info(`Notification processing completion | Processed: ${count} notifications | Duration: ${durationMs}ms`, {
      count,
      durationMs,
      stage: 'NOTIFICATION_PROCESSING_COMPLETE'
    });
  },

  // Sorting and Top 10 operations
  sortingOperationsStart: (count, criteria) => {
    winstonLogger.info(`Sorting operations start | Sorting ${count} notifications | Criteria: ${criteria}`, {
      count,
      criteria,
      stage: 'SORTING_OPERATIONS_START'
    });
  },

  sortingOperationsComplete: (durationMs) => {
    winstonLogger.info(`Sorting operations complete | Duration: ${durationMs}ms`, {
      durationMs,
      stage: 'SORTING_OPERATIONS_COMPLETE'
    });
  },

  top10GenerationStart: () => {
    winstonLogger.info(`Top 10 generation start`, {
      stage: 'TOP_10_GENERATION_START'
    });
  },

  top10GenerationComplete: (resultCount) => {
    winstonLogger.info(`Top 10 generation complete | Generated ${resultCount} items`, {
      resultCount,
      stage: 'TOP_10_GENERATION_COMPLETE'
    });
  },

  // Unexpected errors
  unexpectedError: (err, context = '') => {
    const errorMsg = err instanceof Error ? err.stack : JSON.stringify(err);
    winstonLogger.error(`Unexpected error | Context: ${context} | Error: ${errorMsg}`, {
      context,
      error: errorMsg,
      stage: 'UNEXPECTED_ERROR'
    });
  }
};

module.exports = logger;
