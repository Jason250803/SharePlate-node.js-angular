// restaurantsController.js

const mysql = require('mysql');

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'project_db'
});
// Controller function to search restaurants by location
// Controller function to search restaurants by location  
exports.searchRestaurantsByLocation= (req, res) => { 
  const { location } = req.query; 
  const [country, city] = location.split(',');

  // SQL query to search for restaurants by location
  const query = `
    SELECT * FROM restaurant
    WHERE country = ? AND city = ?;
  `;

  // Execute the query
  pool.query(query, [country, city], (error, results) => {
    if (error) {
      console.error('Error searching restaurants:', error);
      res.status(500).json({ error: 'An error occurred while searching restaurants' });
    } else {
      res.json(results);
    }
  });
};

