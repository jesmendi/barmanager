
const request = require('supertest');
const app = require('../server');
const config = require('../config.json');


/**
 * Mock implementation of the orderModel module for testing
 * Isolates tests from actual database operations by providing
 * controlled, predictable responses for the getAll method
 */
jest.mock('../app/models/orderModel', () => {
    return {
        getAll: jest.fn(() => {
            const config = require('../config.json'); // se requiere dentro del mock
            return [
                { id: 1, customerId: 1, drinkType: config.drink[0].name.toUpperCase(), status: config.servingState },
                { id: 2, customerId: 2, drinkType: config.drink[1].name.toUpperCase(), status: config.completedState },
            ];
        })
    };
});
/**
 * Test suite for GET /api/status endpoint
 * Tests the retrieval of order status information
 */

describe('GET /api/status', () => {
    /**
     * Test case: Should return a list of orders with correct structure and data
     * Verifies that the status endpoint returns the expected order information
     */
    it('should return a list of orders', async () => {
        const res = await request(app).get('/api/status');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBe(2);

        expect(res.body.data[0]).toMatchObject({
            id: 1,
            customerId: 1,
            drinkType: config.drink[0].name.toUpperCase(),
            status: config.servingState
        });
    });
});