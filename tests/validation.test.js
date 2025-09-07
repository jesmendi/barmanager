const request = require('supertest');
const app = require('../server');
const config = require('../config.json');

/**
 * Mock implementation of the orderModel module for testing
 * Provides controlled mock functions to isolate tests from actual database operations
 * Each function is mocked individually to allow precise control over test scenarios
 */
jest.mock('../app/models/orderModel', () => ({
    
    validation: jest.fn(),
    
    
    isDuplicate: jest.fn(),
    
    
    isBusy: jest.fn(),
    
    
    order: jest.fn(),
    
    
    serverDrink: jest.fn(),
}));

const orderModel = require('../app/models/orderModel');

/**
 * Test suite for POST /api/order endpoint (createOrder functionality)
 * Tests validation failure scenarios for order creation
 */
describe('POST /api/order (createOrder) - Validation Failure Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks(); 
    });

    /**
     * Test case: Should return 400 Bad Request when validation fails due to non-existent drink
     * Verifies that the system properly rejects invalid drink types
     */
    it('should return 400 if validation fails - drink does not exist', async () => {
        // Mock the validation function to return false (invalid drink)
        orderModel.validation.mockReturnValue(false);

        // Make API request with non-existent drink type
        const res = await request(app)
            .post('/api/order')   
            .send({ 
                customerId: 1, 
                drinkType: 'nodrink' // Invalid drink type that doesn't exist in config
            });

        /**
         * Verify response:
         * - HTTP Status 400 (Bad Request) indicates invalid input
         * - success: false confirms operation failed
         * - Error message matches expected validation failure message
         */
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('This service does not exist in this bar');
       
    });

    /**
     * Test case: Should return 400 Bad Request when validation fails due to missing customerId
     * Verifies that the system properly handles missing required fields
     */
    it('should return 400 if validation fails - no customerId provided', async () => {
        orderModel.validation.mockReturnValue(false);

        // Make API request with missing customerId field
        const res = await request(app)
            .post('/api/order')   
            .send({ 
                drinkType: config.drink[0].name // Valid drink but missing customerId
            });

        /**
         * Verify response:
         * - HTTP Status 400 (Bad Request) for missing required field
         * - success: false indicates operation failure
         * - Consistent error message for validation failures
         */
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('This service does not exist in this bar');
        
  
    });

   
});