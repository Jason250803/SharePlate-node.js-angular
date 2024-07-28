const express =require('express'),
app=express(),
bodyParser=require('body-parser') 
require('express-async-errors');
const cron = require('node-cron');
const cors=require('cors');
const fileupload=require('express-fileupload')
const multer=require('multer')
const path=require('path')  
const service=require('../server/services/leftoverServices');
const db= require('./database');
const leftoversRoutes =require('./controllers/leftoverscontroller');
const reservationsRoutes = require('./controllers/reservationsController');
const cartRoutes =require('./controllers/cartcontrollers');
// Import controllers
const restaurantsController = require('./controllers/restaurantsController');
const CountryStateCity = require('country-state-city');
//const cities = require('cities-list');
// Route to search restaurants by location
app.get('/api/restaurants/search', restaurantsController.searchRestaurantsByLocation);
// Define a route to serve images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
/*middleware
Middleware functions in Express are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. Middleware functions can perform the following tasks:
Execute any code.
Make changes to the request and the response objects.
End the request-response cycle.
Call the next middleware function in the stack.*/
app.use(cors())
app.use(bodyParser.json())//this will convert the incoming request body into json format
app.use('/api/leftovers',leftoversRoutes)
app.use('/api/reservations', reservationsRoutes);
app.use('/api/cart',cartRoutes);
app.use((err,req,res,next)=>{//global error handling   
    console.log(err)
    res.status(err.status || 500).send('something went wrong!')
})//not enough for everything eg:wrong query because we have used async // {works with express5}//we can download express-async-errors
app.use(express.static('public'));

db.query("SELECT 1")//since we are uing the promising wrapping we can work with the query as a promise 
.then(()=>{console.log("db connection succeeded")
app.listen(2995 ,()=>{
    console.log('server started at 2995')
})
})//success callback function
.catch(err =>console.log("db connection failed \n" +err)) 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cb(null, 'C:/Users/User/project/public/images/uploadedimages');
        cb(null, 'C:/Users/User/angtest/src/assets/public/images/uploadedimages');},
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// Initialize multer middleware
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
    // Multer adds a 'file' or 'files' object to the request object
    const imagePath = req.file.path; // Get the path of the uploaded image
    res.json({ imagePath: imagePath }); // Send the image path back to the client
});

cron.schedule('*/10 * * * *', async () => {
    try {
        const currentTime = new Date().toLocaleString();
        console.log(`[${currentTime}] Running cron job...`);
        const expiredLeftovers = await service.getExpiredLeftovers();
        for (const leftover of expiredLeftovers) {
            await service.updateLeftoverStatus(leftover.leftover_id, 3);
        }
        console.log(`[${currentTime}] Cron job completed successfully.`);
    } catch (error) {
        console.error(`[${currentTime}] Error running cron job:`, error);
    }
});
/*const citiesList = require('cities-list');
const Country = require('country-state-city').Country; 
let State = require('country-state-city').State;
const City = require('country-state-city').City; 
// Route to fetch cities based on the selected country and state
app.get('/cities/:country/:state', (req, res) => {
    try {
        const country = req.params.country;
        const state = req.params.state;
        const cities = City.getCitiesOfState(country, state);
        
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        res.status(500).json({ error: 'An error occurred while fetching cities' });
    }
});
//let Country = require('country-state-city').Country;
//console.log(City.getCitiesOfCountry('United States'));  
//console.log(City.getCitiesOfCountry('CA'));
//console.log(City.getCitiesOfCountry('Germany'));
//console.log(Country.getAllCountries())
//console.log(State.getStatesOfCountry("US"))
//console.log(City.getCitiesOfState("US","WA"))
//console.log(Country.getCountryByCode("AR"))
//console.log(State.getStatesOfCountry("LB"))
// Get a specific country by its code
//const countryCode = 'US'; // Example country code for the United States
//const countryByCode = State.getStatesOfCountry(countryCode);
//const state=State.getStateByCodeAndCountry("WA","US")
//const cit=City.getCitiesOfCountry("LB");
//console.log(state);
//console.log(cit);
*/



