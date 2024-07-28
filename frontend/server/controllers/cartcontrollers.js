const express = require('express');
const cartRouter = express.Router();
const cartService = require('../services/cartServices');

cartRouter.post('/', async (req, res) => {
    try {
        const { leftoverId, reservedQuantity,organizationId } = req.body;
        //const organizationId = req.organizationId; // Ensure organizationId is retrieved
        await cartService.addToCart(leftoverId, reservedQuantity, organizationId);
        res.status(201).send('Item added to cart successfully');
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).send('An error occurred while adding item to cart');
    }
});

cartRouter.get('/', async (req, res) => {
    try {
        organizationId =3;
        //const organizationId = req.organizationId; // Ensure organizationId is retrieved
        const cartItems = await cartService.getCartItems(organizationId);
        //console.log('Organization ID:', organizationId);
        res.json(cartItems);
    } catch (error) {
        console.error('Error getting cart items:', error);
        res.status(500).send('An error occurred while getting cart items');
    }
});


cartRouter.put('/:cartItemId', async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        const updatedQuantity = req.body.quantity;
        await cartService.updateCartItem(cartItemId, updatedQuantity);
        res.status(200).send('Cart item updated successfully');
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).send('An error occurred while updating cart item');
    }
});

cartRouter.delete('/:cartItemId', async (req, res) => {
    try {
        const cartItemId = req.params.cartItemId;
        await cartService.removeFromCart(cartItemId);
        res.status(200).send('Cart item removed successfully');
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).send('An error occurred while removing cart item');
    }
});

cartRouter.post('/confirm', async (req, res) => {
    try {
        await cartService.confirmCart(req.organizationId);
        res.status(200).send('Cart confirmed successfully');
    } catch (error) {
        console.error('Error confirming cart:', error);
        res.status(500).send('An error occurred while confirming cart');
    }
});

module.exports = cartRouter;
