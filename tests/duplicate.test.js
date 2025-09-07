const request = require('supertest');
const app = require('../server');
const userModel = require('../app/models/orderModel');
const config = require('../config.json');

/**
 * Mock implementation of the orderModel module for testing
 * Simulates database operations with in-memory storage
 */
jest.mock('../app/models/orderModel', () => {
    const orders = [];

    return {
      
        validation: jest.fn(() => true),
        
       
        isDuplicate: jest.fn((customerId) => 
            orders.some(o => o.customerId === customerId)
        ),
        
        
        isBusy: jest.fn(() => false),
        
        /**
         * Mock order creation - adds new order to in-memory array
         * @param {Object} orderData - Order data
         * @param {string|number} orderData.customerId - Customer identifier
         * @param {string} orderData.drinkType - Type of drink
         * @param {string} orderData.status - Order status
         * @returns {Object} Newly created order with generated ID
         */
        order: jest.fn(({ customerId, drinkType, status }) => {
            const newOrder = { 
                id: orders.length + 1, // Auto-increment ID
                customerId, 
                drinkType, 
                status 
            };
            orders.push(newOrder);
            return newOrder;
        }),
        
        
        serverDrink: jest.fn(),
        
       
        __reset: () => orders.length = 0 
    };
});

/**
 * Test suite for POST /api/order endpoint
 * Tests realistic sequence of operations with duplicate detection
 */
describe('POST /api/order - realistic sequence', () => {

    
    beforeEach(() => {
        userModel.__reset(); // Clear all orders before each test
    });

    /**
     * Test case: Should automatically detect duplicate orders on second request
     * Verifies that the system prevents customers from placing multiple active orders
     */
    it('should detect duplicate automatically on second request', async () => {
        // First request - successful order creation
        const firstRes = await request(app)
            .post('/api/order')
            .send({ 
                customerId: 1, 
                drinkType: config.drink[0].name 
            });

        // Verify successful response
        expect(firstRes.statusCode).toBe(201); // Created
        expect(firstRes.body.success).toBe(true);
        expect(firstRes.body.data).toBeDefined();
        expect(firstRes.body.data.customerId).toBe(1);

        // Second request with same customerId - should be rejected as duplicate
        const secondRes = await request(app)
            .post('/api/order')
            .send({ 
                customerId: 1, 
                drinkType: config.drink[0].name
            });

        // Verify duplicate detection response
        expect(secondRes.statusCode).toBe(409); // Conflict
        expect(secondRes.body.success).toBe(false);
        expect(secondRes.body.error).toBe('This order is serving ...');
        
        // Additional verification: ensure only one order was created
        expect(userModel.order).toHaveBeenCalledTimes(1);
        expect(userModel.isDuplicate).toHaveBeenCalledTimes(2); // Called for both requests
    });
});