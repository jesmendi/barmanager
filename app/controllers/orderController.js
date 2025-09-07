const orderModel = require('../models/orderModel');
const config = require('../../config.json');

class OrderController {
    
    /**
     * Get all orders from the system
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {JSON} Returns all orders or error message
     */
    async getAllOrders(req, res) {
        try {
            const orders = orderModel.getAll();
            res.json({
                data: orders,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error to get the orders',
            });
        }
    }

    /**
     * Create a new drink order
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body containing order details
     * @param {string} req.body.customerId - Unique identifier of the customer
     * @param {string} req.body.drinkType - Type of drink being ordered
     * @param {Object} res - Express response object
     * @returns {JSON} Returns success response with new order or error message
     */
    async createOrder(req, res) {
        try {
            const { customerId, drinkType } = req.body;

            // Validate if the drink type exists in the bar's service
            if (!orderModel.validation(customerId, drinkType)) {
                return res.status(400).json({
                    success: false,
                    error: 'This service does not exist in this bar',
                });
            }

            // Check if customer already has an active order
            if (orderModel.isDuplicate(customerId)) {
                return res.status(409).json({
                    success: false,
                    error: 'This order is serving ...',
                });
            }

            // Check if the bartender for this drink type is currently busy
            if (orderModel.isBusy(drinkType)) {
                return res.status(527).json({
                    success: false,
                    error: 'This barman is busy',
                });
            }
            
            // Get serving status from configuration
            const status = config.servingState;
            
            // Create new order with customer ID, drink type, and initial status
            const newOrder = orderModel.order({ 
                customerId, 
                drinkType, 
                status 
            });

            // Return success response with created order
            res.status(201).json({
                success: true,
                data: newOrder,
                message: 'Order created successfully',
            });

            /**
             * Simulate order completion process after configured time
             * @param {number} newOrder.id - The ID of the newly created order
             * @param {number} config.timeServing - Time in seconds to complete the order
             */
            setTimeout(() => {
                console.log(`Change order to completed on order ${newOrder.id}`);
                orderModel.serverDrink(newOrder.id); 
            }, config.timeServing * 1000);
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }

}

module.exports = new OrderController();