const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  EVALUATION_SERVICE_URL: process.env.EVALUATION_SERVICE_URL || 'http://localhost:3000/evaluation-service',
  CLIENT_ID: process.env.CLIENT_ID || 'c857b680-b7fe-4234-8c67-778511411e71',
  CLIENT_SECRET: process.env.CLIENT_SECRET || 'kqHVAaWhMApppsPs',
  API_RETRY_COUNT: parseInt(process.env.API_RETRY_COUNT || '3', 10),
  API_RETRY_DELAY_MS: parseInt(process.env.API_RETRY_DELAY_MS || '1000', 10),
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  AUTH_ENABLED: process.env.AUTH_ENABLED !== 'false' // Default is true unless set explicitly to 'false'
};

module.exports = config;
