const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboardsServices');

// Route to get leaderboard data
router.get('/', async (req, res) => {
    try {
        // Call the service function to get leaderboard data
        const leaderboardData = await leaderboardService.getLeaderboardData();
        res.status(200).json(leaderboardData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({message:'An error occurred while fetching leaderboard data'});
    }
});
module.exports = router;