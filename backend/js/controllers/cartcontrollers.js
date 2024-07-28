const express = require('express');
const cartRouter = express.Router();
const cartService = require('../services/cartServices');

cartRouter.post('/:userId', async (req, res) => {
    try {
        const { leftoverId, reservedQuantity } = req.body;
        const userId = req.params.userId;
        
        // Retrieve organization ID based on the provided user ID
        const organizationId = await cartService.getOrganizationIdByAccountId(userId);
        
        // Add item to cart using the retrieved organization ID
        await cartService.addToCart(leftoverId, reservedQuantity, organizationId);
        
        res.status(201).json({message:'Item added to cart successfully'});
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({message:'An error occurred while adding item to cart'});
    }
});/*{
    "leftoverId":83,
    "reservedQuantity":1
}*/

cartRouter.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Retrieve organization ID based on the provided user ID
        const organizationId = await cartService.getOrganizationIdByAccountId(userId);
        
        // Get cart items using the retrieved organization ID
        const cartItems = await cartService.getCartItems(organizationId);
        
        res.json(cartItems);
    } catch (error) {
        console.error('Error getting cart items:', error);
        res.status(500).json({message:'An error occurred while getting cart items'});
    }
});


cartRouter.put('/:cartItemId', async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const updatedQuantity = req.body.reservedQuantity;
        await cartService.updateCartItem(cartItemId, updatedQuantity);
        res.status(200).json({message:'Cart item updated successfully'});
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({message:'An error occurred while updating cart item'});
    }
});

cartRouter.delete('/:cartItemId', async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        await cartService.removeFromCart(cartItemId);
        res.status(200).json({message:'Cart item removed successfully'});
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({message:'An error occurred while removing cart item'});
    }
});

cartRouter.post('/confirm/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Call the function to retrieve organization ID based on user ID
        const organizationId = await cartService.getOrganizationIdByAccountId(userId);

        // If organizationId is not found, handle the error
        if (!organizationId) {
            return res.status(404).json({message:'Organization not found for the provided user ID'});
        }

        const { pickupDates, pickupTimes, leftoversList } = req.body;
        const pickupDatesJSON = JSON.stringify(pickupDates);
        const pickupTimesJSON = JSON.stringify(pickupTimes);
        const leftoversListJSON = JSON.stringify(leftoversList);
        
        // Call the cart service to confirm the cart
        await cartService.confirmCart(organizationId, pickupDatesJSON, pickupTimesJSON, leftoversListJSON);
        
        // If successful, send success response
        res.status(200).json({message:'Cart confirmed successfully'});
    } catch (error) {
        // If an error occurs, log the error and send an error response
        console.error('Error confirming cart:', error);
        res.status(500).json({message:'Cart confirmed successfully'});
    }
});/*{            
    "pickupDates": ["2024-06-27", "2024-06-28"],
    "pickupTimes": ["10:00:00","11:00:00"],
    "leftoversList": [
        {"restaurantId": 1,"leftoverId": 113},
        {"restaurantId": 2,"leftoverId": 83},...
    ]
}
*/ 
module.exports = cartRouter;