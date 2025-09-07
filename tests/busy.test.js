const request = require('supertest');
const app = require('../server');
const config = require('../config.json');

/**
 * Mock implementation of the orderModel module
 * Simulates database operations for testing purposes
 */
jest.mock('../app/models/orderModel', () => {
    const config = require('../config.json');
    const orders = [];

    return {
       
        validation: jest.fn(() => true),
     
        isDuplicate: jest.fn(customerId => 
            orders.some(o => o.customerId === customerId)
        ),

        isBusy: jest.fn(() => {
            const totalOccupied = orders.reduce((sum, o) => {
                const drink = config.drink.find(d => 
                    d.name.toUpperCase() === o.drinkType.toUpperCase()
                );
                return sum + (drink ? drink.value : 0);
            }, 0);

            return totalOccupied >= config.capacity;
        }),

        /**
         * Mock order creation - adds new order to in-memory array
         * @param {Object} orderData - Order data including customerId, drinkType, status
         * @param {string} orderData.customerId - Customer identifier
         * @param {string} orderData.drinkType - Type of drink
         * @param {string} orderData.status - Order status (default: servingState)
         * @returns {Object} Newly created order
         */
        order: jest.fn(({ customerId, drinkType, status = config.servingState }) => {
            const newOrder = { 
                id: orders.length + 1, 
                customerId, 
                drinkType, 
                status 
            };
            orders.push(newOrder);
            return newOrder;
        }),

        
        serverDrink: jest.fn(),
        
        
        __reset: () => { orders.length = 0; }
    };
});

const userModel = require('../app/models/orderModel');

/**
 * Test suite for POST /api/order endpoint
 * Tests global barman capacity limit with combined drink values
 */
describe('POST /api/order - barman global capacity limit (combined drink values)', () => {
    
    /**
     * Before each test, reset the mock order storage
     * Ensures test isolation and clean state
     */
    beforeEach(() => {
        userModel.__reset();
    });

    /**
     * Test case: Should allow orders until global capacity limit is reached
     * Verifies that the system correctly handles combined drink values
     */
    it('should allow orders until busy limit is reached combining all drinks', async () => {
        let totalOccupied = 0; // Tracks cumulative capacity usage
        let customerId = 1;    // Starting customer ID

        /**
         * Phase 1: Fill capacity with various drink combinations
         * Continuously add orders until no more drinks fit within capacity
         */
        while (true) {
            const nextDrink = config.drink.find(d => 
                totalOccupied + d.value <= config.capacity
            );
            
            if (!nextDrink) break;

            /**
             * Make API request to create new order
             * @param {string} customerId - Unique customer identifier
             * @param {string} drinkType - Drink type in uppercase
             */
            const res = await request(app)
                .post('/api/order')
                .send({ 
                    customerId: customerId.toString(), 
                    drinkType: nextDrink.name.toUpperCase() 
                });

            // Verify successful order creation
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);

            // Update tracking variables
            totalOccupied += nextDrink.value;
            customerId++;
        }

        /**
         * Phase 2: Verify capacity limit enforcement
         * Attempt to create one more order should fail with 527 status
         */
        const busyRes = await request(app)
            .post('/api/order')
            .send({ 
                customerId: customerId.toString(), 
                drinkType: config.drink[0].name.toUpperCase() 
            }); 

        expect(busyRes.statusCode).toBe(527);
        expect(busyRes.body.success).toBe(false);
        expect(busyRes.body.error).toBe('This barman is busy');
    });
});