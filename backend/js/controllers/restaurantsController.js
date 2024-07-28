// restaurantsController.js

const express = require('express');
const router = express.Router();
const restaurantService = require('../services/restaurantService');

router.get('/search/:userId', async (req, res) => {
    const { userId } = req.params; // Get the userId from the route parameters
    try {
        // Retrieve organization's country based on userId
        const country = await restaurantService.getOrganizationCountryByUserId(userId);
        
        // Get restaurants by country
        const restaurants = await restaurantService.getRestaurantsByCountry(country);
        
        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
//http://localhost:2995/api/restaurants/search?country={{organizationCountry}} use this when logged in

router.get('/searchLeftovers/:userId', async (req, res) => {
    const {userId}=req.params
    const  country  = await restaurantService.getOrganizationCountryByUserId(userId);
    const { type } = req.query; // Get the type from query parameters
    console.log(userId)
    console.log("country:",country);
    console.log("type:",type);
    
    try {
        const leftovers = await restaurantService.getLeftoversByCountryAndType(country, type);
        res.json(leftovers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

router.get('/leftoversbycountry/:userId',async(req,res)=>{
    const {userId}=req.params
    const  country  = await restaurantService.getOrganizationCountryByUserId(userId);
    console.log(userId)
    console.log("country for leftovers:",country);
    try {
        const leftovers = await restaurantService.getleftoversbyCountry(country);
        res.json(leftovers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
