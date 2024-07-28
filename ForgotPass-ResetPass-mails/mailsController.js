const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/AppError');
const Email = require('./utils/email');
const pool = require('./utils/db');

// Approve Restaurant Mail
exports.approveRestaurant = catchAsync(async (req, res, next) => {
  console.log("Approve Restaurant Mail function triggered");
  
  const res_id = req.params.res_id;
  console.log("ID of restaurant from request body:", res_id);

  if (!res_id) {
    return next(new AppError('no restaurant_id', 400));
  }

  // 1) Check if the email exists in the account table
  pool.query('SELECT * FROM account WHERE account_id = ?', res_id, async (error, results) => {
    if (error) {
      console.error("Query error:", error);
      return next(new AppError('There was an error processing your request. Please try again later.', 500));
    }
    
    console.log("Query result:", results);
    const rows = results[0]; // Access rows attribute of the result object

    if (!rows || rows.length === 0) {
      return next(new AppError('There is no user with that id', 404));
    }

    const user = results[0];
    console.log("THIS IS THE RESTAURANT",user);
    
    try {
      // 2) Send approve mail to restaurant's email
      const url = `http://localhost:4200/home-page`;
      new Email(user, url).sendApproveRestaurant(); // Passing user email to Email constructor
       
      res.status(200).json({
        status: 'success',
        message: 'Mail sent to the email!',
      });
    } catch (err) {
      console.error("Email sending error:", err);
      return next(new AppError('There was an error sending the email. Please try again later.', 500));
    }
  });
});


// Approve Organization Mail
exports.approveOrganization = catchAsync(async (req, res, next) => {
    console.log("Approve Organization Mail function triggered");
    
    const org_id = req.params.org_id;
    console.log("ID of organization from request body:", org_id);
  
    if (!org_id) {
      return next(new AppError('no organization_id', 400));
    }
  
    // 1) Check if the email exists in the account table
    pool.query('SELECT * FROM account WHERE account_id = ?', org_id, async (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }
      
      console.log("Query result:", results);
      const rows = results[0]; // Access rows attribute of the result object
  
      if (!rows || rows.length === 0) {
        return next(new AppError('There is no user with that id', 404));
      }
  
      const user = results[0];
      console.log("THIS IS THE ORGANIZATION",user);
      
      try {
        // 2) Send approve mail to organization's email
        const url = `http://localhost:4200/home-page`;
        new Email(user, url).sendApproveOrganization(); // Passing user email to Email constructor
         
        res.status(200).json({
          status: 'success',
          message: 'Mail sent to the email!',
        });
      } catch (err) {
        console.error("Email sending error:", err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
      }
    });
  });
  
  
  // Deactivation Mail
exports.deactivatemail = catchAsync(async (req, res, next) => {
    console.log("Deactivation Mail function triggered");
    
    const acct_id = req.params.acct_id;
    console.log("ID of account from request body:", acct_id);
  
    if (!acct_id) {
      return next(new AppError('no account_id', 400));
    }
  
    // 1) Check if the email exists in the account table
    pool.query('SELECT * FROM account WHERE account_id = ?', acct_id, async (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }
      
      console.log("Query result:", results);
      const rows = results[0]; // Access rows attribute of the result object
  
      if (!rows || rows.length === 0) {
        return next(new AppError('There is no user with that id', 404));
      }
  
      const user = results[0];
      console.log("THIS IS THE ACCOUNT : ",user);
      
      try {
        // 2) Send approve mail to account's email
      
        new Email(user).sendDeactivate(); // Passing user email to Email constructor
         
        res.status(200).json({
          status: 'success',
          message: 'Mail sent to the email!',
        });
      } catch (err) {
        console.error("Email sending error:", err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
      }
    });
  });

  // Deletion Mail
  exports.deletemail = catchAsync(async (req, res, next) => {
    console.log("Deletion Mail function triggered");
    
    const acct_id = req.params.acct_id;
    console.log("ID of account from request body:", acct_id);
  
    if (!acct_id) {
      return next(new AppError('no account_id', 400));
    }
  
    // 1) Check if the email exists in the account table
    pool.query('SELECT * FROM account WHERE account_id = ?', acct_id, async (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }
      
      console.log("Query result:", results);
      const rows = results[0]; // Access rows attribute of the result object
  
      if (!rows || rows.length === 0) {
        return next(new AppError('There is no user with that id', 404));
      }
  
      const user = results[0];
      console.log("THIS IS THE ACCOUNT : ",user);
      
      try {
        // 2) Send approve mail to account's email
        new Email(user).sendDelete(); // Passing user email to Email constructor
         
        res.status(200).json({
          status: 'success',
          message: 'Mail sent to the email!',
        });
      } catch (err) {
        console.error("Email sending error:", err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
      }
    });
  });
  

  // Activate Mail
exports.activatemail = catchAsync(async (req, res, next) => {
    console.log("Activation Mail function triggered");
    
    const acct_id = req.params.acct_id;
    console.log("ID of account from request body:", acct_id);
  
    if (!acct_id) {
      return next(new AppError('no account_id', 400));
    }
  
    // 1) Check if the email exists in the account table
    pool.query('SELECT * FROM account WHERE account_id = ?', acct_id, async (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }
      console.log("Query result:", results);
      const rows = results[0]; // Access rows attribute of the result object
  
      if (!rows || rows.length === 0) {
        return next(new AppError('There is no user with that id', 404));
      }
  
      const user = results[0];
      console.log("THIS IS THE ACCOUNT : ",user);
      
      try {
        // 2) Send approve mail to account's email
        const url = `http://localhost:4200/home-page`;
        new Email(user, url).sendActivate(); // Passing user email to Email constructor
         
        res.status(200).json({
          status: 'success',
          message: 'Mail sent to the email!',
        });
      } catch (err) {
        console.error("Email sending error:", err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
      }
    });
  });

    // Rejection Mail
    exports.rejectmail = catchAsync(async (req, res, next) => {
      console.log("Rejection Mail function triggered");
      
      const acct_id = req.params.acct_id;
      console.log("ID of account from request params:", acct_id);
  
      if (!acct_id) {
        return next(new AppError('No account_id provided', 400));
      }
  
      // 1) Check if the email exists in the account table
      pool.query('SELECT * FROM account WHERE account_id = ?', [acct_id], async (error, results) => {
          if (error) {
              console.error("Query error:", error);
              return next(new AppError('There was an error processing your request. Please try again later.', 500));
          }
          
          console.log("Query result:", results);
          const rows = results[0]; // Access rows attribute of the result object
  
          if (!rows) {
              console.log("No user found with the provided account_id:", acct_id);
              return next(new AppError('There is no user with that id', 404));
          }
  
          const user = results[0];
          console.log("THIS IS THE ACCOUNT:", user);
          
          try {
              console.log("Starting to send rejection email");
              // 2) Send rejection mail to account's email
              const email = new Email(user);
              await email.sendReject(); // Ensure this is awaited
              console.log("Rejection email sent successfully");
  
              res.status(200).json({
                  status: 'success',
                  message: 'Rejection mail sent to the email!',
              });
          } catch (err) {
              console.error("Email sending error:", err);
              return next(new AppError('There was an error sending the email. Please try again later.', 500));
          }
      });
  });

  
  // Warning mail
exports.sendWarningMail = catchAsync(async (req, res, next) => {
    const  complaintId = req.params.complaintId;
    console.log("Complaint ID",complaintId);
    pool.query('SELECT * FROM complaint WHERE complaint_id = ?', complaintId, async (error, results) => {
        if (error) {
          console.error("Query error:", error);
          return next(new AppError('There was an error processing your request. Please try again later.', 500));
        }
        
        console.log("Query result:", results);
        const rows = results[0]; // Access rows attribute of the result object
    
        if (!rows || rows.length === 0) {
          return next(new AppError('There is no user with that email address', 404));
        }
    
        const complaint = results[0];
        console.log("THIS IS THE COMPLAINT",complaint);
        
        const email = new Email();
        await email.sendWarning(complaint);
      
        res.status(200).json({
          status: 'success',
          message: 'Warning mail sent successfully',
        });
        });
      });
   
  
  