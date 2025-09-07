const request = require('supertest');
const app = require('../server');
const userModel = require('../app/models/orderModel');
const config = require('../config.json');

/**
 * Mock implementation of the orderModel module for testing
 * Simulates database operations with in-memory storage to isolate tests
 * from actual database dependencies
 */
jest.mock('../app/models/orderModel', () => {
    // Internal in-memory array to simulate order storage
    const orders = [];

    return {
        
        validation: jest.fn(() => true),
        
        
        isDuplicate: jest.fn((customerId) => 
            orders.some(o => o.customerId === customerId)
        ),
        
        
        isBusy: jest.fn(() => false),
        
        /**
         * Mock order creation - adds new order to in-memory storage
         * @param {Object} orderData - Order data containing customer and drink information
         * @param {string|number} orderData.customerId - Unique customer identifier
         * @param {string} orderData.drinkType - Type of drink being ordered
         * @param {string} orderData.status - Initial status of the order
         * @returns {Object} Newly created order object with generated ID
         */
        order: jest.fn(({ customerId, drinkType, status }) => {
            const newOrder = { 
                id: orders.length + 1, // Auto-incrementing ID based on current order count
                customerId, 
                drinkType, 
                status 
            };
            orders.push(newOrder); // Add to simulated storage
            return newOrder;
        }),
        
        
        serverDrink: jest.fn(),
        
        
        __reset: () => orders.length = 0 // Reset order array to empty state
    };
});

/**
 * Test suite for POST /api/order endpoint
 * Tests basic order acceptance functionality in realistic scenarios
 */
describe('POST /api/order - realistic sequence', () => {

    
    beforeEach(() => {
        userModel.__reset(); // Clear all mock orders before each test
    });

    /**
     * Test case: Should successfully accept a valid order
     * Verifies that the system can process order requests correctly
     */
    it('should accept the order', async () => {
        const firstRes = await request(app)
            .post('/api/order')
            .send({ 
                customerId: 1, 
                drinkType: config.drink[0].name 
            });

      
        expect(firstRes.statusCode).toBe(201);
        expect(firstRes.body.success).toBe(true);

        
    });
});