const express = require('express');
const reservationsRouter = express.Router();
const reservationService = require('../services/reservationsServices');

reservationsRouter.get('/restaurant/:accountId', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        // Call the function to retrieve restaurant ID based on account ID
        const restaurantId = await reservationService.getRestaurantIdByAccountId(accountId);
        // If restaurantId is not found, handle the error
        if (!restaurantId) {
            return res.status(404).json({message:'Restaurant not found for the provided account ID'});
        }
        const reservations = await reservationService.getReservationsForRestaurant(restaurantId);
        res.json(reservations);
    } catch (error) {
        console.error('Error getting reservations for restaurant:', error);
        res.status(500).json({message:'An error occurred while fetching reservations for restaurant'});
    }
});

reservationsRouter.get('/organization/:accountId', async (req, res) => {
    try {
        const accountId = req.params.accountId;
        const organizationId = await reservationService.getOrganizationIdByAccountId(accountId);
        console.log(organizationId)
        if(!organizationId){
            return res.status(404).json('Organization not found for the provided account ID')
        }
        const reservations=await reservationService.getOrganizationReservations(organizationId);
        res.json
        res.json(reservations);
    } catch (error) {
        console.error('Error fetching organization reservations:', error);
        res.status(500).json('An error occurred while fetching organization reservations');
    }
});
module.exports = reservationsRouter;

/*
reservationsrouter.post('/', async (req, res) => {
    try {
        // Extract reservation details from the request body
        const { pickup_date, pickup_time, reservation_status, leftover_id, reserved_quantity } = req.body;
        
        // Call service function to make the reservation
        await reservationServices.makeReservation(pickup_date, pickup_time,reservation_status, leftover_id, reserved_quantity);

        // Respond with success message
        res.status(201).send('Reservation made successfully');
    } catch (error) {
        console.error('Error making reservation:', error);
        res.status(500).send('An error occurred while making the reservation');
    }
});*/
