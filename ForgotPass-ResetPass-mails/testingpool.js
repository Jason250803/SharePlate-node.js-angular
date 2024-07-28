// testingpool.js

const pool = require('./utils/db');

// Attempt to get a connection from the pool
pool.getConnection(function(err, connection) {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }

  console.log('Connected to database.');

  // Execute a test query
  connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    connection.release(); // Release the connection back to the pool

    if (error) {
      console.error('Error executing query:', error.stack);
      return;
    }

    console.log('The solution is: ', results[0].solution);

    // Close the pool
    pool.end(function (err) {
      if (err) {
        console.error('Error closing the pool:', err.stack);
      }
      console.log('Pool closed.');
    });
  });
});
