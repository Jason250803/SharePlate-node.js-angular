// services/cartService.js

const db = require('../database');
const organizationBaskets = new Map();

module.exports.addToCart = async (leftoverId, reservedQuantity, organizationId) => {
    let basketId;
    //const organizationId=2;
    // Check if a basket ID exists for the organization in memory
    if (organizationBaskets.has(organizationId)) {
        basketId = organizationBaskets.get(organizationId);
    } else {
        // Check if a basket exists for the organization in the database
        const [existingBasket] = await db.query('SELECT basket_id FROM basket WHERE organization_id = ?', [organizationId]);

        if (existingBasket.length === 0) {
            // If no basket exists, create a new one
            const [result] = await db.query('INSERT INTO basket (organization_id) VALUES (?)', [organizationId]);
            basketId = result.insertId;
        } else {
            // If a basket already exists, use its ID
            basketId = existingBasket[0].basket_id;
        }

        // Store the basket ID in memory for future use
        organizationBaskets.set(organizationId, basketId);
    }
    // Insert a new item into the basket with the specified leftover ID and reserved quantity
    await db.query('INSERT INTO basketitem (leftover_id, quantity, basket_id) VALUES (?, ?, ?)', [leftoverId, reservedQuantity, basketId]);
};
/*module.exports.addToCart = async (leftoverId, reservedQuantity, organizationId) => {
    // Check if a basket exists for the organization
    const [existingBasket] = await db.query('SELECT basket_id FROM basket WHERE organization_id = ?', [organizationId]);

    let basketId;
    if (existingBasket.length === 0) {
        // If no basket exists, create a new one
        //const [result] = await db.query('INSERT INTO basket (organization_id) VALUES (?)', [organizationId]);
        organizationId=1;
        const [result] = await db.query('INSERT INTO basket (organization_id) VALUES (?)',[organizationId]);
        basketId = result.insertId;
    } else {
        // If a basket already exists, use its ID
        basketId = existingBasket[0].basket_id;
    }

    // Insert a new item into the basket with the specified leftover ID and reserved quantity
    await db.query('INSERT INTO basketitem (leftover_id, quantity, basket_id) VALUES (?, ?, ?)', [leftoverId, reservedQuantity, basketId]);
};*/


module.exports.getCartItems = async (organizationId) =>{
    // Retrieve all items in the organization's cart
    const basketIdQuery = 'SELECT basket_id FROM basket WHERE organization_id = ?';
    const [basketIdRows] = await db.query(basketIdQuery, [organizationId]);
    const basketId = basketIdRows[0].basket_id;
    const cartItemsQuery = 'SELECT bi.basket_item_id, bi.quantity, l.* FROM basketitem bi INNER JOIN leftover l ON bi.leftover_id = l.leftover_id WHERE bi.basket_id = ?';
    const [cartItems] = await db.query(cartItemsQuery, [basketId]);
    return cartItems;
};


module.exports.updateCartItem = async (cartItemId, updatedQuantity) => {
    // Update the quantity of a specific cart item
    await db.query('UPDATE basketitem SET quantity = ? WHERE basket_item_id = ?', [updatedQuantity, cartItemId]);
};
module.exports.removeFromCart = async (cartItemId) => {
    // Remove a specific item from the cart
    await db.query('DELETE FROM basketitem WHERE basket_item_id = ?', [cartItemId]);
};

module.exports.confirmCart = async (organizationId) => {
    // Perform actions to confirm the cart (e.g., making a reservation)
    // This can involve updating the reservation status and handling the leftover quantity
    // Add your logic here
};
