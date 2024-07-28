const db = require('../database');

// Function to get leaderboard data
module.exports.getLeaderboardData = async () => {
    try {
        const [leaderboardData] = await db.query(`
            SELECT 
                r.restaurant_id, 
                r.logo_path, 
                a.user_name AS restaurant_name, 
                SUM(ri.reserved_quantity) AS total_reserved_quantity
            FROM 
                restaurant AS r
            LEFT JOIN 
                reservation AS rv ON r.restaurant_id = rv.restaurant_id
            LEFT JOIN 
                reserveditem AS ri ON rv.reservation_id = ri.reservation_id
            LEFT JOIN 
                account AS a ON r.account_id = a.account_id
            GROUP BY 
                r.restaurant_id
            ORDER BY 
                total_reserved_quantity DESC
            LIMIT 3
        `);

        return leaderboardData;
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        throw error;
    }
};