// services/cartService.js

const db = require('../database');
//const organizationBaskets = new Map();

module.exports.getOrganizationIdByAccountId = async (accountId) => {
    try {
        // Query the database to get the organization ID associated with the account ID
        const [organizationIdResult] = await db.query(`
            SELECT organization_id
            FROM organization
            WHERE account_id = ?;
        `, [accountId]);

        // Check if a restaurant ID was found
        if (!organizationIdResult || !organizationIdResult.length) {
            throw new Error('Organization not found for the provided account ID');
        }

        return organizationIdResult[0].organization_id;
    } catch (error) {
        console.error('Error fetching organization ID:', error);
        throw error;
    }
};


module.exports.addToCart = async (leftoverId, reservedQuantity, organizationId) => {
    let basketId;

    // Check if a basket exists for the organization in the database
    const [existingBasket] = await db.query('SELECT basket_id FROM basket WHERE organization_id = ?', [organizationId]);
    console.log(existingBasket)
    if (existingBasket && existingBasket.length > 0) {
        // If a basket already exists, use its ID
        basketId = existingBasket[0].basket_id;
    } else {
        // If no basket exists, create a new one
        const [result] = await db.query('INSERT INTO basket (organization_id) VALUES (?)', [organizationId]);
        basketId = result.insertId;
    }
    // Insert a new item into the basket with the specified leftover ID and reserved quantity
    await db.query('INSERT INTO basketitem (leftover_id, bquantity, basket_id) VALUES (?, ?, ?)', [leftoverId, reservedQuantity, basketId]);
};

// module.exports.getCartItems = async (organizationId) =>{
//     // Retrieve all items in the organization's cart
//     const basketIdQuery = 'SELECT basket_id FROM basket WHERE organization_id = ?';
//     const [basketIdRows] = await db.query(basketIdQuery, [organizationId]);
//     if (!basketIdRows || basketIdRows.length === 0) {
//         throw new Error('No cart found for the organization. Please add items to the cart.');
//     }
//     const basketId = basketIdRows[0].basket_id;
//     const cartItemsQuery = `SELECT bi.basket_item_id, bi.bquantity, l.*, a.user_name, r.address
//     FROM basketitem bi 
//     LEFT JOIN leftover l ON bi.leftover_id = l.leftover_id 
//     LEFT JOIN restaurant r ON l.restaurant_id = r.restaurant_id
//     LEFT JOIN account a ON r.account_id = a.account_id
//     WHERE bi.basket_id = 16;`;
//     const [cartItems] = await db.query(cartItemsQuery, [basketId]);
//     return cartItems;
// };
module.exports.getCartItems = async (organizationId) =>{
    // Retrieve all items in the organization's cart
    const basketIdQuery = 'SELECT basket_id FROM basket WHERE organization_id = ?';
    const [basketIdRows] = await db.query(basketIdQuery, [organizationId]);
    if (!basketIdRows || basketIdRows.length === 0) {
        throw new Error('No cart found for the organization. Please add items to the cart.');
    }
    const basketId = basketIdRows[0].basket_id;
    const cartItemsQuery = `SELECT bi.basket_item_id, bi.bquantity, l.*, a.user_name, r.address, r.city ,r.country
    FROM basketitem bi
    LEFT JOIN leftover l ON bi.leftover_id = l.leftover_id
    LEFT JOIN restaurant r ON l.restaurant_id = r.restaurant_id
    LEFT JOIN account a ON r.account_id = a.account_id
    LEFT JOIN basket b ON bi.basket_id = b.basket_id
    WHERE b.organization_id = ? AND l.status= 1;` 
    const [cartItems] = await db.query(cartItemsQuery, [organizationId]);
    return cartItems;
};
module.exports.updateCartItem = async (cartItemId, updatedQuantity) => {
    // Update the quantity of a specific cart item
    await db.query('UPDATE basketitem SET bquantity = ? WHERE basket_item_id = ?', [updatedQuantity, cartItemId]);
};      
module.exports.removeFromCart = async (cartItemId) => {
    // Remove a specific item from the cart
    await db.query('DELETE FROM basketitem WHERE basket_item_id = ?', [cartItemId]);
};      
// services/cartService.js
module.exports.confirmCart = async (organizationId, pickupDates, pickupTimes, leftoversList) => {
    try { 
    console.log('Organization ID:', organizationId);
    console.log('Pickup Dates:', pickupDates);
    console.log('Pickup Times:', pickupTimes);
    console.log('Leftovers List:', leftoversList);
        console.log('Inside confirmCart function');
        // Call the stored procedure to confirm the cart for multiple restaurants
        await db.query('CALL confirm_cart_for_multiple_restaurants(?, ?, ?, ?)', [organizationId, pickupDates, pickupTimes, leftoversList]);
        // Optionally, handle success response if needed
        console.log('after procedure call')
        return;
    } catch (error) {
        console.error('Services:Error in confirmCart function:', error);
        throw error;
    }
};