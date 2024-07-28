const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const db = require('./database');
const cron = require('node-cron');
const cors = require('cors');
const store=new session.MemoryStore();
const app = express();
const service = require('./services/leftoverServices');
const leftoversRoutes = require('./controllers/leftoverscontroller');
const reservationsRoutes = require('./controllers/reservationsController');
const cartRoutes = require('./controllers/cartcontrollers');
const restaurantsController = require('./controllers/restaurantsController');
const leaderboardController = require('./controllers/leaderboardsControllers');

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

 
app.use(express.json());
const logSession = (req, res, next) => {
  console.log('Session data:', req.session);
  next();
};

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
  if (req.method === "OPTIONS") {
      return res.status(200).end();
  } else {
      next();
  }
});

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  // saveUninitialized:true,

  cookie: {maxAge: 36000000, },
  store
}));
// Apply the middleware globally to log session data on every request
//app.use(logSession);
// Define routes
app.use('/leftovers', leftoversRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/cart', cartRoutes);
app.use('/restaurants', restaurantsController);
app.use('/leaderboards', leaderboardController);
const PORT = process.env.PORT || 3000;

const datab = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Password for your MySQL database
  database: 'project_db'
});

datab.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL');
});
// Serve static files from the 'public' directory

// Set up Multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/User/Documents/the project/Senior project/frontend/src/assets/uploads');// Specify the destination folder where files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name for storing
  }
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, '..', 'public')));
//app.use(express.static('frontend'))
app.post('/upload', upload.fields([
  { name: 'logo_path', maxCount: 1 },
  { name: 'license_path', maxCount: 1 }
]), (req, res) => {
  // Handle uploaded files
  console.log(req.files); // Object containing uploaded files with field names as keys
  res.status(200).json({ message: 'Files uploaded successfully', files: req.files });
});
// Session middleware


app.use(express.json());


app.post('/register', upload.fields([
  { name: 'logo_path', maxCount: 1 },
  { name: 'license_path', maxCount: 1 }

]), async (req, res) => {
  console.log(req.files)
  const { user_name, email, password, role, address, country, city, postal_code} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the plaintext password
  const userData = { user_name, email, password: hashedPassword, role };

  datab.query('INSERT INTO account SET ?', userData, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error registering user');
    }
    console.log('Response Object:', userData);
    if ((role === '2' || role === '3') && address && country && city && postal_code) {
      const { phone } = req.body;
      const additionalData = {
        account_id: result.insertId, 
        phone, 
        country,
        city, 
        postal_code, 
        address,  
        logo_path: 'uploads/' + req.files['logo_path'][0].filename,
        license_path: 'uploads/' + req.files['license_path'][0].filename // Adjust the path for logo
        // Adjust the path for license
      };

      const tableName = role === '2' ? 'restaurant' : 'organization';
      console.log(tableName)
      datab.query(`INSERT INTO ${tableName} SET ?`, additionalData, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send(`Error registering ${tableName}`);
        }
        const message = `${tableName.charAt(0).toUpperCase() + tableName.slice(1)} registered successfully`;
        res.status(201).json({ message }); // Send JSON response with success message
      });
    } else {
      res.status(201).json({ message: 'Userrrr registered successfully' });
    }
    
  });
});
// Route to handle user login
app.post('/login', (req, res) => {
  const { user_name, password } = req.body;
  // Query the database to find the user by their username
  datab.query('SELECT * FROM account WHERE status = ? AND user_name = ?', [1, user_name], async (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).json('Error logging in');
      }
      console.log("User found:", results);

      if (results.length === 0) {
          return res.status(401).json('Invalid username or password');
      }
      const user = results[0];
      // Verify the password using bcrypt
      const isPasswordValid = await bcrypt.compare(password, user.password);

      console.log("Password valid:", isPasswordValid);

      if (isPasswordValid) {
          // Password is correct
          // Set session data
          req.session.loggedIn = true;
          req.session.user = {
              account_id: user.account_id,
              role: user.role
          };
          // console.log("Session data after login:", req.session.user.account_id);
          // console.log("Session data after login:", req.session.user.role);
          console.log(req.session)

          return res.status(200).json({ session: req.session }); // Send user data as JSON
          
      } else {
          // Password is incorrect
          return res.status(401).json('Invalid username or password');
      }
  });
});

// Protect the /users route
app.get('/users', (req, res) => {
  // Redirect to login page if not logged in
  /*if (!req.session.loggedIn) {
    return res.redirect('/login.html');
  }*/
  // Check user role before allowing access
  /*if (req.session.user.role != 1) {
    return res.status(403).json({message:'Forbidden'});
  }*/
// Query to get restaurant users
datab.query('SELECT account.*, restaurant.* FROM account LEFT JOIN restaurant ON account.account_id = restaurant.account_id WHERE account.role = 2', (err, restaurantResults) => {
  if (err) {
      console.error(err);
      return res.status(500).json({message:'Error fetching restaurant users'});
  }
  // Query to get organization users
  datab.query('SELECT account.*, organization.* FROM account LEFT JOIN organization ON account.account_id = organization.account_id WHERE account.role = 3', (err, organizationResults) => {
      if (err) {
          console.error(err);
          return res.status(500).json({message:'Error fetching organization users'});
      }
      res.json({ restaurantUsers: restaurantResults, organizationUsers: organizationResults }); // Send JSON response with restaurant and organization user data
  });
});
});

// Define route to approve a user
app.put('/approve/:userId', (req, res) => {
  // Ensure user is authenticated before allowing to approve
  // if (!req.session.loggedIn) {
  //   return res.status(401).json({message:'Unauthorized'});
  // }
  const userId = req.params.userId;
  // Update user's status to '1'
  datab.query('UPDATE account SET status = ? WHERE account_id = ?', [1, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({message:'Error approving user'});
    }
    // res.sendStatus(200).json({message:'user approved successfully'}); // Send success response
    res.json({ message: 'User approved successfully' }); 
  });
});

// Define route to deactivate a user
app.put('/deactivate/:userId', (req, res) => {
  // Ensure user is authenticated before allowing to approve
  // if (!req.session.loggedIn) {
  //   return res.status(401).json('Unauthorized');
  // }

  const userId = req.params.userId;

  // Update user's status to '0'
  datab.query('UPDATE account SET status = ? WHERE account_id = ?', [2, userId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({message:'Error approving user'});
    }
    // res.sendStatus(200); // Send success response
    res.status(200).json({ message: 'User deactivated successfully' });
  });
});


// Define route to delete a user
app.put('/delete/:userId', (req, res) => {
  // Ensure user is authenticated before allowing to delete
  // if (!req.session.loggedIn) {
  //   return res.status(401).json({message:'Unauthorized'});
  // }

  const userId = req.params.userId;

  // Delete associated records in "restaurant" table
  datab.query('DELETE FROM restaurant WHERE account_id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Error deleting associated restaurant records:', err);
      return res.status(500).json({message:'Error deleting associated restaurant records'});
    }
    console.log('Deleted associated restaurant records');

    // Delete associated records in "organization" table
    datab.query('DELETE FROM organization WHERE account_id = ?', [userId], (err, result) => {
      if (err) {
        console.error('Error deleting associated organization records:', err);
        return res.status(500).json({message:'Error deleting associated organization records'});
      }
      console.log('Deleted associated organization records');

      // Now delete the user from the "account" table
      datab.query('DELETE FROM account WHERE account_id = ?', [userId], (err, result) => {
        if (err) {
          console.error('Error deleting user:', err);
          return res.status(500).send({message:'Error deleting user'});
        }
        console.log('Deleted user from account table');
        // res.sendStatus(200); // Send success response
        res.status(200).json({ message: 'User deleted successfully' });
      });
    });
  });
});

// Route to handle user logout
app.get('/logout', (req, res) => {
  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Failed to logout');
    }
    // res.redirect('/SignUp');
     res.sendStatus(200); // Redirect to login page after logout
  });
});

// add leftover

//app.post('/addleftover', upload.single('leftover_image_path'), (req, res) => {
  /*if (!req.session.loggedIn || !req.session.user || !req.session.user.account_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }*/
  /*const { type, name, quantity, expiry_date, status } = req.body;/*
  const account_id = req.session.user.account_id; // Get account_id from the session
*//*
  // Query the database to get the restaurant_id associated with the account_id
  datab.query('SELECT restaurant_id FROM restaurant WHERE account_id = ?', [account_id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error retrieving restaurant information' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Restaurant not found for the logged-in user' });
    }*/
    app.post('/addleftover/:userId', upload.single('leftover_image_path'), (req, res) => {
       // Log session object
       const userId=req.params.userId
       console.log('/addleftover called')
      if (!req.session ) {
          console.error('Session not found');
          return res.status(401).json({ error: 'Unauthorized' });
      }
      console.log(req.session)
      // const accountId = req?.session?.user?.account_id;
      // Now you have the restaurant_id, you can proceed with adding the leftover
        const { type, name, quantity, expiry_date, status } = req.body;

        // Query the database to get the restaurant_id associated with the account_id
        datab.query('SELECT restaurant_id FROM restaurant WHERE account_id = ?', [userId], (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error retrieving restaurant information' });
          }
          if (results.length === 0) {
            return res.status(404).json({ error: 'Restaurant not found for the logged-in user' });
          }
          const restaurantId = results[0].restaurant_id;
        const leftoverData = {
          type,
          name,
          quantity,
          expiry_date,
          status,
          restaurant_id: restaurantId, // Use the fetched restaurant_id
          leftover_image_path: 'uploads/' + req.file.filename
        };
    
        datab.query('INSERT INTO leftover SET ?', leftoverData, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error adding leftover' });
          }
          res.status(201).json({ message: 'Leftover added successfully' });
        });
      });
    });
    
    
  /*});*/
  

/*
// Define route to delete a leftover
app.delete('/deleteleftover/:leftoverId', (req, res) => {
  // Ensure user is authenticated before allowing to delete
  // if (!req.session.loggedIn) {
  //   return res.status(401).send('Unauthorized');
  // }

  const leftoverId = req.params.leftoverId;

  // Delete leftover record from the "leftover" table
  db.query('DELETE FROM leftover WHERE leftover_id = ?', [leftoverId], (err, result) => {
    if (err) {
      console.error('Error deleting leftover:', err);
      return res.status(500).send('Error deleting leftover');
    }
    console.log('Deleted leftover');
    res.sendStatus(200); // Send success response
  });
});
*/
// Edit leftover
// app.put('/editleftover/:leftoverId', upload.single('leftover_image_path'), (req, res) => {
//   const leftoverId = req.params.leftoverId;
//   const { type, name, quantity, expiry_date, status } = req.body;
//   const restaurant_id = req.body.restaurant_id; // Get restaurant_id from the request body
//   const updatedLeftoverData = {
//     type,
//     name,
//     quantity,
//     expiry_date,
//     status,
//     restaurant_id
//   };

//   // If a new image is uploaded, update the image path
//   if (req.file) {
//     updatedLeftoverData.leftover_image_path = 'uploads/' + req.file.filename;
//   }
//   // Update leftover record in the "leftover" table
//   datab.query('UPDATE leftover SET ? WHERE leftover_id = ?', [updatedLeftoverData, leftoverId], (err, result) => {
//     if (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Error updating leftover' }); // Return JSON error response
//     }
//     res.status(200).json({ message: 'Leftover updated successfully' }); // Return JSON success response
//   });
// });
app.put('/editleftover/:leftoverId', upload.single('leftover_image_path'), async (req, res) => {
  const leftoverId = req.params.leftoverId;
  const { type, name, quantity, status,expiry_date } = req.body;
  const userId = req.body.userId;
  try {
    // Get restaurant_id from userId
    const [restaurantResults] = await db.query('SELECT restaurant_id FROM restaurant WHERE account_id = ?', [userId]);
    if (restaurantResults.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const restaurant_id = restaurantResults[0].restaurant_id;
    // Prepare updated data
    const updatedLeftoverData = {
      type,
      name,
      quantity,
      status,
      restaurant_id,
      expiry_date
    };
    // Check if expiry_date is provided and is a valid date
    if (expiry_date && !isNaN(Date.parse(expiry_date))) {
      updatedLeftoverData.expiry_date = new Date(expiry_date).toISOString().split('T')[0]; // Ensure the date is formatted correctly
    } else {
      // Retain the previous expiry_date value if no new value is provided
      const [leftoverResults] = await db.query('SELECT expiry_date FROM leftover WHERE leftover_id = ?', [leftoverId]);
      if (leftoverResults.length > 0) {
        updatedLeftoverData.expiry_date = leftoverResults[0].expiry_date;
      } else {
        return res.status(400).json({ error: 'No expiry date provided and no previous expiry date found' });
      }
    }
    if (req.file) {
      updatedLeftoverData.leftover_image_path = 'uploads/' + req.file.filename;
    }
    // Log the data being updated
    console.log('Updated Leftover Data:', updatedLeftoverData);
    // Update leftover record
    await db.query('UPDATE leftover SET ? WHERE leftover_id = ?', [updatedLeftoverData, leftoverId]);
    res.status(200).json({ message: 'Leftover updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating leftover' });
  }
});
/*
// Select active leftovers
app.get('/selectactiveleftover', (req, res) => {
  // Query leftovers with status = 1
  datab.query('SELECT * FROM leftover WHERE status = ?', [1], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error selecting active leftovers' }); // Return JSON error response
    }
    res.status(200).json(results); // Return JSON response with active leftovers
  });
});
/*
// Select inactive leftovers
app.get('/selectinactiveleftover', (req, res) => {
  // Query leftovers with status not equal to 1
  db.query('SELECT * FROM leftover WHERE status != ?', [1], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error selecting inactive leftovers' }); // Return JSON error response
    }
    res.status(200).json(results); // Return JSON response with inactive leftovers
  });
});*/
cron.schedule('*/1 * * * *', async () => {
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

app.post('/:sender_id/complaint', async (req, res) => {
  try {
      const sender_id=req.params.sender_id;
      const {receiver_name, message } = req.body;
      // Get receiver ID from the database
      const [rows] = await db.query('SELECT account_id FROM account WHERE user_name = ?', [receiver_name]);
      if (rows.length === 0) {
          res.status(404).json({ error: 'Receiver not found' });
          return;
      }
      const receiver_id = rows[0].account_id;
      const INSERT_COMPLAINT_QUERY = `INSERT INTO complaint (sender_id, receiver_id, message) VALUES (?, ?, ?)`;
      await db.query(INSERT_COMPLAINT_QUERY, [sender_id, receiver_id, message]);
      res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});
app.get('/complaints', async (req, res) => {
  try {
    const GET_COMPLAINTS_QUERY = `
      SELECT 
        c.*, 
        sender.user_name AS sender_name,
        sender.email AS sender_email,
        receiver.user_name AS receiver_name,
        receiver.email AS receiver_email
      FROM 
        complaint AS c
      JOIN 
        account AS sender ON c.sender_id = sender.account_id
      JOIN 
        account AS receiver ON c.receiver_id = receiver.account_id
    `;
    
    const [complaints] = await db.query(GET_COMPLAINTS_QUERY);

    res.json({ complaints });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'An error occurred while fetching complaints' });
  }
});

app.post('/:sender_id/feedback', (req, res) => {
  const { message, rating } = req.body;
  const sender_id=req.params.sender_id;
  const INSERT_FEEDBACK_QUERY = `INSERT INTO feedback (message, rating, sender_id) VALUES (?, ?, ?)`;
  db.query(INSERT_FEEDBACK_QUERY, [message, rating, sender_id])
      .then(result => {
          res.status(201).json({ message: 'Feedback added successfully' });
      })
      .catch(err => {
          res.status(500).json({ error: err.message });
      });
});

app.get('/counts', async (req, res) => {
  try {
      const [restaurantRows] = await db.query('SELECT COUNT(*) AS total_restaurants FROM restaurant');
      const [organizationRows] = await db.query('SELECT COUNT(*) AS total_organizations FROM organization');
      const [leftoverRows] = await db.query('SELECT COUNT(*) AS total_leftovers FROM leftover');

      const [topRestaurants] = await db.query(`
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

      res.json({
          topRestaurants: topRestaurants,
          totalRestaurants: restaurantRows[0].total_restaurants,
          totalOrganizations: organizationRows[0].total_organizations,
          totalLeftovers: leftoverRows[0].total_leftovers
      });
  } catch (error) {
      console.error('Error fetching data from the database', error);
      res.status(500).json({ error: 'Error fetching data from the database' });
  }
});


app.get('/count/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const [reservedItemsRows] = await db.query(`
      SELECT 
        SUM(ri.reserved_quantity) AS total_reserved_quantity
      FROM 
        reservation AS rv
      LEFT JOIN 
        reserveditem AS ri ON rv.reservation_id = ri.reservation_id
      WHERE
        rv.restaurant_id = (SELECT restaurant_id FROM restaurant WHERE account_id = ?)
    `, [userId]);

    // Extract the total reserved quantity from the query result
    const totalReservedQuantity = reservedItemsRows[0].total_reserved_quantity || 0;

    res.json({
      totalReservedQuantity: totalReservedQuantity
    });
  } catch (error) {
    console.error('Error fetching data from the database', error);
    res.status(500).json({ error: 'Error fetching data from the database' });
  }
});
app.get('/feedback', async (req, res) => {
  try {
    const GET_FEEDBACK_QUERY = `
    SELECT 
    f.*, 
    a.user_name AS sender_name,
    a.email AS sender_email
  FROM 
    feedback AS f
  JOIN 
    account AS a ON f.sender_id = a.account_id
    `;

    const [feedbackRows] = await db.query(GET_FEEDBACK_QUERY);

    res.json({
      feedback: feedbackRows
    });
  } catch (error) {
    console.error('Error fetching feedback from the database', error);
    res.status(500).json({ error: 'Error fetching feedback from the database' });
  }
});

app.get('/restaurantsList', async (req, res) => {
  try {
    const GET_RESTAURANTS_QUERY = `
      SELECT 
        r.account_id,
        a.user_name AS user_name
      FROM 
        restaurant AS r
      JOIN 
        account AS a ON r.account_id = a.account_id
    `;
    
    const [restaurants] = await db.query(GET_RESTAURANTS_QUERY);

    res.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'An error occurred while fetching restaurants' });
  }
});
app.get('/organizationsList', async (req, res) => {
  try {
    const GET_ORGANIZATIONS_QUERY = `
      SELECT 
        o.account_id,
        a.user_name AS user_name
      FROM 
        organization AS o
      JOIN 
        account AS a ON o.account_id = a.account_id
    `;
    
    const [organizations] = await db.query(GET_ORGANIZATIONS_QUERY);

    res.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'An error occurred while fetching organizations' });
  }
});


app.get('/counts', async (req, res) => {
  try {
      const [restaurantRows] = await db.query('SELECT COUNT(*) AS total_restaurants FROM restaurant');
      const [organizationRows] = await db.query('SELECT COUNT(*) AS total_organizations FROM organization');
      const [leftoverquanity] = await db.query('SELECT SUM(leftover.quantity) AS total_leftovers FROM leftover');
      const[reservationRows]= await db.query('SELECT SUM(reserveditem.reserved_quantity) AS total_reservations FROM reserveditem')

      const [topRestaurants] = await db.query(`
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

      res.json({
          topRestaurants: topRestaurants,
          totalRestaurants: restaurantRows[0].total_restaurants,
          totalOrganizations: organizationRows[0].total_organizations,
          totalLeftovers: leftoverquanity[0].total_leftovers,
          totalreservations: reservationRows[0].total_reservations
      });
  } catch (error) {
      console.error('Error fetching data from the database', error);
      res.status(500).json({ error: 'Error fetching data from the database' });
  }
});


app.get('/restaurantsList/:accountId', async (req, res) => {
  try {
    const accountId = req.params.accountId;
    // Query to fetch user's country
    const GET_USER_COUNTRY_QUERY = 'SELECT country FROM organization WHERE account_id = ?';
    const [[{ country }]] = await db.query(GET_USER_COUNTRY_QUERY, [accountId]);

    // Query to fetch restaurants from the same country
    const GET_RESTAURANTS_QUERY = `
      SELECT 
        r.account_id,
        a.user_name AS user_name
      FROM 
        restaurant AS r
      JOIN 
        account AS a ON r.account_id = a.account_id
      WHERE r.country = ?
    `;
    
    const [restaurants] = await db.query(GET_RESTAURANTS_QUERY, [country]);

    res.json({ restaurants });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'An error occurred while fetching restaurants' });
  }
});
app.get('/organizationsList/:accountId', async (req, res) => {
  try {
    const accountId = req.params.accountId;

    // Query to fetch user's country
    const GET_USER_COUNTRY_QUERY = 'SELECT country FROM restaurants WHERE account_id = ?';
    const [[{ country }]] = await db.query(GET_USER_COUNTRY_QUERY, [accountId]);

    // Query to fetch organizations from the same country
    const GET_ORGANIZATIONS_QUERY = `
      SELECT 
        o.account_id,
        a.user_name AS user_name
      FROM 
        organization AS o
      JOIN 
        account AS a ON o.account_id = a.account_id
      WHERE o.country = ?
    `;
    
    const [organizations] = await db.query(GET_ORGANIZATIONS_QUERY, [country]);

    res.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'An error occurred while fetching organizations' });
  }
});

app.put('/editorganization/:userId', upload.single('logo_path'), async (req, res) => {
  const userId = req.params.userId;
  console.log(userId)
  const { phone, country, city, postal_code, address } = req.body;

  try {
    // Prepare updated data
    const updatedRestaurantData = {
      phone,
      country,
      city,
      postal_code,
      address
    };

    // If logo is uploaded, update the logo path
    if (req.file) {
      updatedRestaurantData.logo_path = 'uploads/' + req.file.filename;
    }

    // Log the data being updated
    console.log('Updated organization Data:', updatedRestaurantData);

    // Update restaurant record
    await db.query('UPDATE organization SET ? WHERE account_id = ?', [updatedRestaurantData, userId]);
    
    res.status(200).json({ message: 'organization profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating orgnization profile' });
  }
});
app.put('/editrestaurant/:userId', upload.single('logo_path'), async (req, res) => {
  const userId = req.params.userId;
  console.log(userId)
  const { phone, country, city, postal_code, address } = req.body;

  try {
    // Prepare updated data
    const updatedRestaurantData = {
      phone,
      country,
      city,
      postal_code,
      address
    };

    // If logo is uploaded, update the logo path
    if (req.file) {
      updatedRestaurantData.logo_path = 'uploads/' + req.file.filename;
    }

    // Log the data being updated
    console.log('Updated Restaurant Data:', updatedRestaurantData);

    // Update restaurant record
    await db.query('UPDATE restaurant SET ? WHERE account_id = ?', [updatedRestaurantData, userId]);
    
    res.status(200).json({ message: 'Restaurant profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating restaurant profile' });
  }
});
// end
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
