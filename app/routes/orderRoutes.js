const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');



/**
 * GET /api/orders/status
 * Retrieves the current status of all orders
 * @returns {JSON} Array of all orders with their current status
 
 */
router.get('/status', orderController.getAllOrders);

/**
 * POST /api/orders/order
 * Creates a new drink order
 * 
 * @param {Object} req.body - Request body containing order details
 * @param {string} req.body.customerId - Unique identifier of the customer placing the order
 * @param {string} req.body.drinkType - Type of drink being ordered (must exist in config)
 * 
 * @returns {JSON} Success response with created order or error message
 * 
 
 */
router.post('/order', orderController.createOrder);


module.exports = router;