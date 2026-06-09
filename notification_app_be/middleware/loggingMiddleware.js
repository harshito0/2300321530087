const logger = require('../../logging_middleware/logger');

// Simple counter for request correlation IDs (or we could use crypto.randomUUID/uuid)
let requestCounter = 0;

function expressLoggingMiddleware(req, res, next) {
  requestCounter += 1;
  const reqId = `REQ-${Date.now()}-${requestCounter}`;
  req.id = reqId; // Attach to request object for downstream usage
  
  const startTime = process.hrtime();
  const { method, originalUrl } = req;

  // Log API request start
  logger.info(`Incoming request | ID: ${reqId} | Method: ${method} | URL: ${originalUrl}`, {
    reqId,
    method,
    url: originalUrl,
    stage: 'EXPRESS_REQUEST_START'
  });

  // Once response finishes, calculate duration and log response received
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const { statusCode } = res;

    if (statusCode >= 400) {
      logger.error(`API response failure | ID: ${reqId} | Method: ${method} | URL: ${originalUrl} | Status: ${statusCode} | Duration: ${durationMs}ms`, {
        reqId,
        method,
        url: originalUrl,
        statusCode,
        durationMs,
        stage: 'EXPRESS_RESPONSE_FAILURE'
      });
    } else {
      logger.info(`Outgoing response | ID: ${reqId} | Method: ${method} | URL: ${originalUrl} | Status: ${statusCode} | Duration: ${durationMs}ms`, {
        reqId,
        method,
        url: originalUrl,
        statusCode,
        durationMs,
        stage: 'EXPRESS_RESPONSE_SUCCESS'
      });
    }
  });

  // If request triggers error
  res.on('error', (err) => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    logger.unexpectedError(err, `Express Request Error | ID: ${reqId} | Method: ${method} | URL: ${originalUrl} | Duration: ${durationMs}ms`);
  });

  next();
}

module.exports = expressLoggingMiddleware;
