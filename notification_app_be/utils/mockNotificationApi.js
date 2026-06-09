const env = require('../config/env');
const logger = require('../../logging_middleware/logger');

// Generate realistic mock notifications
const mockNotifications = [
  {
    id: "N1",
    type: "Placement",
    message: "Google Software Engineer role application deadline is tomorrow!",
    timestamp: "2026-06-09T11:40:00.000Z", // Very recent Placement (Score: 3,000,000 + ms)
    read: false
  },
  {
    id: "N2",
    type: "Result",
    message: "Mid-Term Exam Results for Data Structures have been published.",
    timestamp: "2026-06-09T11:42:00.000Z", // Extremely recent Result (Score: 2,000,000 + ms)
    read: false
  },
  {
    id: "N3",
    type: "Event",
    message: "Annual Hackathon briefing starts in the seminar hall.",
    timestamp: "2026-06-09T11:45:00.000Z", // Current Event (Score: 1,000,000 + ms)
    read: false
  },
  {
    id: "N4",
    type: "Placement",
    message: "Microsoft Interview invites are out. Check your email.",
    timestamp: "2026-06-09T11:00:00.000Z", // Older Placement (Score: 3,000,000 + ms)
    read: false
  },
  {
    id: "N5",
    type: "Placement",
    message: "Amazon Web Services PPT schedule updated.",
    timestamp: "2026-06-08T09:00:00.000Z", // Much older Placement (Score: 3,000,000 + ms)
    read: false
  },
  {
    id: "N6",
    type: "Result",
    message: "Placement test scores for TCS National Qualifier Test are live.",
    timestamp: "2026-06-09T10:30:00.000Z", // Result (Score: 2,000,000 + ms)
    read: false
  },
  {
    id: "N7",
    type: "Event",
    message: "Guest lecture by AI Researcher on Deep Learning applications.",
    timestamp: "2026-06-09T08:00:00.000Z", // Event (Score: 1,000,000 + ms)
    read: false
  },
  {
    id: "N8",
    type: "Placement",
    message: "Adobe hiring drive details for UX Designer role.",
    timestamp: "2026-06-07T12:00:00.000Z", // Very old Placement (Score: 3,000,000 + ms)
    read: false
  },
  {
    id: "N9",
    type: "Result",
    message: "Grade Sheet for Semester 5 is available in the student portal.",
    timestamp: "2026-06-09T09:15:00.000Z", // Result (Score: 2,000,000 + ms)
    read: false
  },
  {
    id: "N10",
    type: "Event",
    message: "Cultural Fest registration starts today at 2 PM.",
    timestamp: "2026-06-09T07:30:00.000Z", // Event (Score: 1,000,000 + ms)
    read: false
  },
  {
    // READ NOTIFICATION - Should be excluded by priority service
    id: "N11",
    type: "Placement",
    message: "De Shaw shortlist declared.",
    timestamp: "2026-06-09T11:30:00.000Z",
    read: true
  },
  {
    // READ NOTIFICATION - Should be excluded by priority service
    id: "N12",
    type: "Result",
    message: "Quiz 1 grades for Mathematics IV are out.",
    timestamp: "2026-06-09T11:10:00.000Z",
    read: true
  },
  {
    id: "N13",
    type: "Event",
    message: "CodeChef Chapter meetups scheduled for Friday.",
    timestamp: "2026-06-09T06:00:00.000Z", // Old Event (Score: 1,000,000 + ms)
    read: false
  },
  {
    id: "N14",
    type: "Result",
    message: "Re-evaluation results for Physics II declared.",
    timestamp: "2026-06-08T15:00:00.000Z", // Old Result (Score: 2,000,000 + ms)
    read: false
  },
  {
    id: "N15",
    type: "Event",
    message: "Weekly Sports Meet registration announcement.",
    timestamp: "2026-06-09T05:00:00.000Z", // Older Event (Score: 1,000,000 + ms)
    read: false
  }
];

// Request counter to simulate transient failures (e.g. 503 Service Unavailable)
let requestCount = 0;

function registerMockRoutes(app) {
  // OAuth2 Token endpoint
  app.post('/evaluation-service/oauth/token', (req, res) => {
    const { client_id, client_secret, grant_type } = req.body;
    
    // Support both client_id/client_secret and clientID/clientSecret payloads
    const cid = client_id || req.body.clientID;
    const csec = client_secret || req.body.clientSecret;

    if (cid !== env.CLIENT_ID || csec !== env.CLIENT_SECRET) {
      logger.warn(`Mock OAuth | Invalid client credentials. ID: ${cid}`);
      return res.status(401).json({
        error: "invalid_client",
        error_description: "Client authentication failed (invalid client ID or client secret)."
      });
    }

    logger.info(`Mock OAuth | Successfully issued access token for Client: ${cid}`);
    
    return res.status(200).json({
      access_token: "mock-access-token-998877",
      token_type: "Bearer",
      expires_in: 3600
    });
  });

  app.get('/evaluation-service/notifications', (req, res) => {
    requestCount += 1;
    
    // 1. Verify Authentication (Bypass if AUTH_ENABLED=false)
    if (env.AUTH_ENABLED === false) {
      logger.info(`Mock API | Authentication bypassed via AUTH_ENABLED=false config | IP: ${req.ip}`);
    } else {
      const authHeader = req.headers['authorization'];
      
      if (!authHeader) {
        logger.warn(`Mock API | Unauthorized access attempt from IP: ${req.ip} | Reason: Missing Authorization header`);
        return res.status(401).json({
          error: "Unauthorized",
          message: "Missing Authorization header. Expected Bearer token."
        });
      }

      const validTokens = ["Bearer mock-access-token-998877", "Bearer test-token"];
      if (!validTokens.includes(authHeader)) {
        logger.warn(`Mock API | Unauthorized access attempt from IP: ${req.ip} | Reason: Invalid token | Header: ${authHeader}`);
        return res.status(401).json({
          error: "Unauthorized",
          message: "Invalid Bearer token in Authorization header."
        });
      }
    }

    // 2. Simulate Transient Failures (e.g., every 3rd request fails to trigger retries)
    if (requestCount % 3 === 0) {
      logger.warn(`Mock API | Simulating transient 503 Service Unavailable error (Request Count: ${requestCount})`);
      return res.status(503).json({
        error: "Service Unavailable",
        message: "Evaluation database is currently busy. Please retry."
      });
    }

    // 3. Return Mock Data on success
    logger.info(`Mock API | Successfully served ${mockNotifications.length} notifications (Request Count: ${requestCount})`);
    return res.status(200).json(mockNotifications);
  });
}

module.exports = {
  registerMockRoutes,
  mockNotifications
};
