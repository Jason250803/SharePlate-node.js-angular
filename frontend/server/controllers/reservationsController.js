const express = require('express');
const reservationsrouter = express.Router();
const reservationServices = require('../services/reservationsServices');

reservationsrouter.get('/',async(req,res)=>{
    
})
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
});


module.exports=reservationsrouter;