const axios = require('axios');
const env = require('../config/env');
const logger = require('../../logging_middleware/logger');

// Create an Axios instance
const apiClient = axios.create({
  baseURL: env.EVALUATION_SERVICE_URL,
  timeout: 10000 // 10 seconds timeout
});

// Counter for outbound API requests to generate correlation IDs
let apiReqCount = 0;

// Memory cache for OAuth access token
let cachedAccessToken = null;
let isFetchingToken = false;
let tokenRequestsQueue = [];

// Helper to fetch OAuth2 token from mock or actual service
async function getAccessToken() {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  // If a request is already fetching the token, queue subsequent ones
  if (isFetchingToken) {
    return new Promise((resolve, reject) => {
      tokenRequestsQueue.push({ resolve, reject });
    });
  }

  isFetchingToken = true;
  logger.info('Fetching new OAuth2 access token using clientID and clientSecret...');
  
  try {
    // Note: Use a separate axios instance/direct call to prevent interceptor recursion
    const response = await axios.post(`${env.EVALUATION_SERVICE_URL}/oauth/token`, {
      clientID: env.CLIENT_ID,
      clientSecret: env.CLIENT_SECRET
    }, {
      timeout: 5000
    });

    cachedAccessToken = response.data.access_token;
    logger.info('OAuth2 access token successfully retrieved and cached.');
    
    // Resolve queued requests
    tokenRequestsQueue.forEach(q => q.resolve(cachedAccessToken));
    tokenRequestsQueue = [];
    isFetchingToken = false;
    
    return cachedAccessToken;
  } catch (error) {
    logger.error(`OAuth2 token exchange failed: ${error.message}`);
    tokenRequestsQueue.forEach(q => q.reject(error));
    tokenRequestsQueue = [];
    isFetchingToken = false;
    throw error;
  }
}

// Request Interceptor
apiClient.interceptors.request.use(
  async (config) => {
    apiReqCount += 1;
    const reqId = `API-OUT-${Date.now()}-${apiReqCount}`;
    
    // Track timing and request ID
    config.metadata = {
      startTime: process.hrtime(),
      reqId: reqId
    };

    try {
      if (env.AUTH_ENABLED !== false) {
        // Get OAuth2 token and attach to headers
        const token = await getAccessToken();
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      logger.error(`Failed to inject authorization header: ${err.message}`);
      return Promise.reject(err);
    }
    
    // Log API request start
    logger.apiReqStart(`${config.baseURL || ''}${config.url || ''}`, config.method.toUpperCase(), reqId);
    
    return config;
  },
  (error) => {
    logger.unexpectedError(error, 'Axios Request Interceptor Error');
    return Promise.reject(error);
  }
);

// Response & Retry Interceptor
apiClient.interceptors.response.use(
  (response) => {
    const config = response.config;
    const metadata = config.metadata || {};
    const { startTime, reqId } = metadata;
    
    // Calculate response duration
    let durationMs = 0;
    if (startTime) {
      const diff = process.hrtime(startTime);
      durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    }
    
    // Log API response received
    logger.apiResReceived(
      `${config.baseURL || ''}${config.url || ''}`,
      config.method.toUpperCase(),
      reqId,
      response.status,
      durationMs
    );
    
    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Check if configuration exists (e.g. not a network-level cancel error without config)
    if (!config) {
      logger.unexpectedError(error, 'Axios Client Error without Config');
      return Promise.reject(error);
    }
    
    const metadata = config.metadata || {};
    const { startTime, reqId } = metadata;
    
    // Calculate response duration
    let durationMs = 0;
    if (startTime) {
      const diff = process.hrtime(startTime);
      durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    }

    // Initialize retry counter if not present
    config.retryCount = config.retryCount || 0;
    
    const maxRetries = env.API_RETRY_COUNT;
    const baseDelay = env.API_RETRY_DELAY_MS;
    
    // Check if error is transient, unauthorized, or server error
    const isNetworkError = !error.response;
    const isServerError = error.response && error.response.status >= 500 && error.response.status < 600;
    const isUnauthorized = error.response && error.response.status === 401;
    
    // Handle 401 Unauthorized: refresh token and retry
    if (isUnauthorized && config.retryCount < maxRetries) {
      config.retryCount += 1;
      logger.warn(`API call returned 401 Unauthorized. Clearing token cache and retrying ${config.retryCount}/${maxRetries}... | Req ID: ${reqId}`);
      
      cachedAccessToken = null; // Clear token cache
      
      try {
        const token = await getAccessToken();
        config.headers['Authorization'] = `Bearer ${token}`;
        
        // Reset timing and retry request
        config.metadata.startTime = process.hrtime();
        return apiClient(config);
      } catch (tokenErr) {
        logger.error(`Token refresh failed during retry: ${tokenErr.message}`);
        return Promise.reject(tokenErr);
      }
    }
    
    // Handle transient errors (5xx, network errors)
    const canRetry = isNetworkError || isServerError;
    
    if (canRetry && config.retryCount < maxRetries) {
      config.retryCount += 1;
      
      // Calculate delay with exponential backoff (e.g., delay * 2^retryCount)
      const backoffDelay = baseDelay * Math.pow(2, config.retryCount - 1);
      
      logger.warn(`API call failed (Transient error). Retrying ${config.retryCount}/${maxRetries} in ${backoffDelay}ms... | Req ID: ${reqId} | Error: ${error.message}`);
      
      // Log API failure for the specific attempt
      logger.apiFailure(
        `${config.baseURL || ''}${config.url || ''}`,
        config.method.toUpperCase(),
        reqId,
        `Attempt ${config.retryCount} failed: ${error.message}`,
        durationMs
      );
      
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      
      // Reset start time for the retried request to get accurate timing
      config.metadata.startTime = process.hrtime();
      
      // Re-run the request
      return apiClient(config);
    }
    
    // If we reach here, we cannot retry anymore or it's a non-retriable error
    logger.apiFailure(
      `${config.baseURL || ''}${config.url || ''}`,
      config.method.toUpperCase(),
      reqId || 'N/A',
      error.message,
      durationMs
    );
    
    return Promise.reject(error);
  }
);

// Encapsulated Service Layer
const apiService = {
  fetchNotifications: async () => {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      // Return details in a standardized format
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  }
};

module.exports = apiService;
