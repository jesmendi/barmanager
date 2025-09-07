/**
 * Global error handling middleware for Express applications
 * Handles all errors that occur during request processing
 * 
 * @param {Error} err - The error object thrown by previous middleware or routes
 * @param {Object} req - Express request object containing client request information
 * @param {Object} res - Express response object for sending responses to client
 * @param {Function} next - Express next function to pass control to next middleware
 * @returns {JSON} JSON response with error details
 */
const errorHandler = (err, req, res, next) => {
    // Log detailed error information to console for debugging
    console.error('Error:', err);
    
    /**
     * Send standardized error response to client
     * Includes different detail levels based on environment
     */
    res.status(500).json({
        success: false,
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' 
            ? err.message  // Detailed error message in development
            : 'Something went wrong'  // Generic message in production
    });
};

/**
 * Middleware to handle 404 errors for non-existent endpoints
 * Catches all requests to routes that are not defined
 * 
 * @param {Object} req - Express request object containing client request information
 * @param {Object} res - Express response object for sending responses to client
 * @param {Function} next - Express next function (not used here as this is final middleware)
 * @returns {JSON} JSON response indicating endpoint not found
 */
const notFound = (req, res, next) => {
    /**
     * Send 404 response for undefined routes
     * Uses 404 status code (Not Found) as per HTTP standards
     */
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
};

// Export middleware functions for use in other parts of the application
module.exports = {
    errorHandler,
    notFound
};