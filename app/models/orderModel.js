const config = require('../../config.json');

/**
 * UserModel class manages user orders and bar capacity
 * Handles order validation, creation, and status management
 */
class UserModel {
    constructor() {
        this.users = [];
        
        this.nextId = 0;
        
        this.capacity = 0;
    }

    /**
     * Get all user orders
     * @returns {Array} Array of all user orders
     */
    getAll() {
        return this.users;
    }

    /**
     * Validate order parameters
     * @param {string} customerId - Unique identifier for the customer
     * @param {string} drinkType - Type of drink being ordered
     * @returns {boolean} True if valid, false if invalid
     */
    validation(customerId, drinkType) {
        // Check if required fields are provided
        if (!customerId || !drinkType) {
            return false;
        } 
        
        console.log(config.drink);

        // Check if drink type exists in configuration
        if (!config.drink.some(item => item.name == drinkType.toLowerCase())) {
            return false;
        }
        
        return true;
    }

    /**
     * Create a new drink order
     * @param {Object} userData - Order data including customerId and drinkType
     * @returns {Object} Newly created order object
     */
    order(userData) {
        const newUser = {
            id: this.nextId++, 
            ...userData,       
            createdAt: new Date(), 
            updatedAt: new Date()  
        };
        
        this.users.push(newUser);
        
        this.capacity += this.getValue(userData.drinkType);
        
        return newUser;
    }

    /**
     * Get the capacity value of a drink type
     * @param {string} drink - Drink type name
     * @returns {number} Capacity value of the drink
     */
    getValue(drink) {
        return config.drink.find(item => 
            item.name.toUpperCase() === drink.toUpperCase()
        ).value;
    }

    /**
     * Mark an order as completed (drink served)
     * @param {number} id - Order ID to update
     * @returns {Object|null} Updated order object or null if not found
     */
    serverDrink(id) {
        // Find order index by ID
        const userIndex = this.users.findIndex(user => user.id === id);
        
        // Return null if order not found
        if (userIndex === -1) {
            return null;
        }

        this.users[userIndex] = {
            ...this.users[userIndex], 
            status: config.completedState, 
            updatedAt: new Date() 
        };
        
        this.capacity -= this.getValue(this.users[userIndex].drinkType);
    }

    /**
     * Check if bar capacity would be exceeded with new drink
     * @param {string} drinkType - Type of drink to check
     * @returns {boolean} True if bar would be over capacity, false otherwise
     */
    isBusy(drinkType) {
        const value = this.getValue(drinkType);

        return this.capacity + value > config.capacity;
    }

    /**
     * Check if customer already has an active order
     * @param {string} customerId - Customer identifier to check
     * @returns {Object|undefined} Active order if found, undefined otherwise
     */
    isDuplicate(customerId) {
        return this.users.find(user => 
            user.status === config.servingState && 
            user.customerId === customerId
        );
    }
}

module.exports = new UserModel();