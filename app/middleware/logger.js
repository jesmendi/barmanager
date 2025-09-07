// src/middleware/simpleLogger.js
const fs = require('fs');
const path = require('path');
const os = require('os');


/**
 * Directory where log files will be stored
 */
const logsDir = process.env.NODE_ENV === 'test' 
    ? path.join(os.tmpdir(), 'barmanager-test-logs')
    : path.join(__dirname, '../logs');
/**
 * Current date in YYYY-MM-DD format for log file naming
 */
const date = new Date().toISOString().split('T')[0];

/**
 * Full path to today's log file
 */
const logFile = path.join(logsDir, `log-${date}.log`);

/**
 * Ensure logs directory exists
 * 
 */
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { 
        recursive: true,  // Create parent directories if needed
        mode: 0o775       
    });
}

/**
 * Ensure log file exists
 * Creates empty file if it doesn't exist
 */
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, ''); // Create empty file
}

/**
 * Express middleware function for request logging
 * Logs request method, URL, timestamp, and request body
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.method - HTTP method (GET, POST, etc.)
 * @param {Object} req.originalUrl - Request URL
 * @param {Object} req.body - Request body data (if any)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function to continue middleware chain
 */
const logger = (req, res, next) => {
    
    // Current timestamp in ISO format for precise logging
    const timestamp = new Date().toISOString();
    
    /**
     * Stringify request body if exists, otherwise use empty object
     * Only includes body if it has keys to avoid logging empty bodies
     */
    const bodyString = Object.keys(req.body || {}).length > 0 
        ? JSON.stringify(req.body) 
        : '{}';
   
    const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} - ${bodyString}\n`;
  
    fs.appendFile(logFile, logMessage, (err) => {
        if (err) {
            // Log filesystem errors to console but don't break the application
            console.error('Error writing to log file:', err);
        } 
    });
    
    next();
};

// Export the logger middleware for use in Express application
module.exports = logger;