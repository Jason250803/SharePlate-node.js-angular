// authController.js
const crypto = require('crypto');
const catchAsync = require('./utils/catchAsync');
const AppError = require('./utils/AppError');
const Email = require('./utils/email');
const pool = require('./utils/db');
const bcrypt = require('bcrypt');

const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes
  return { resetTokenHashed, resetExpires };
};


// Forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log("Forgot password function triggered");
  console.log("Request body:", req.body);
  console.log(req.body)
  const { email } = req.body;
  console.log("Email from request body:", email);

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // 1) Check if the email exists in the account table
  pool.query('SELECT * FROM account WHERE email = ?', [email], async (error, results) => {
    if (error) {
      console.error("Query error:", error);
      return next(new AppError('There was an error processing your request. Please try again later.', 500));
    }
    
    console.log("Query result:", results);
    const rows = results[0]; // Access rows attribute of the result object

    if (!rows || rows.length === 0) {
      return next(new AppError('There is no user with that email address', 404));
    }

    const user = results[0];
    console.log("THIS IS THE USER", user);
    
    // 2) Generate the random reset token
    const { resetTokenHashed, resetExpires } = generateResetToken();
    console.log("Reset Token Hash In Forgot Password Route:", resetTokenHashed);

    // Save the reset token and expiration time to the database
    pool.query('UPDATE account SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [
      resetTokenHashed,
      resetExpires,
      email,
    ], async (error, results) => {
      if (error) {
        console.error("Update query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }
      console.log("Reset expires:", resetExpires);

      try {
        // 3) Send reset token to user's email
        //const resetURL = `http://localhost:4200/resetPassword/${resetTokenHashed}`;
        const resetURL =`http://localhost:4200/resetPassword?token=${resetTokenHashed}`;
        console.log("resetURL:",resetURL)
        
        new Email(user, resetURL).sendPasswordReset(); // Passing user email to Email constructor
         
        res.status(200).json({
          status: 'success',
          message: 'Token sent to the email!',
          resetToken: resetTokenHashed // Include the reset token in the response
        });
      } catch (err) {
        console.error("Email sending error:", err);
        return next(new AppError('There was an error sending the email. Please try again later.', 500));
      }
    });
  });
});

  

// Reset Password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetTokenHashed = req.params.token;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return next(new AppError('Please provide password and password confirmation', 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  try {
    // Find user with the token
    pool.query('SELECT * FROM account WHERE reset_token = ? AND reset_token_expires > NOW()', [resetTokenHashed], async (error, results) => {
      if (error) {
        console.error("Query error:", error);
        return next(new AppError('There was an error processing your request. Please try again later.', 500));
      }

      if (!results || results.length === 0) {
        return next(new AppError('Token is invalid or has expired', 400));
      }

      const user = results[0];
     

      try {
        // Update password and reset token
        const hashedPassword = await bcrypt.hash(password,10);
        console.log("Hashed Password",hashedPassword);
        const updateQuery = 'UPDATE account SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE account_id = ?';
        console.log("Update query:", updateQuery);
        console.log("Update parameters:", [hashedPassword, user.account_id]);
        
        pool.query(updateQuery, [
          hashedPassword,
          user.account_id,
        ], (error, results) => {
          if (error) {
            console.error("Update query error:", error);
            return next(new AppError('There was an error processing your request. Please try again later.', 500));
          }

          res.status(200).json({
            status: 'success',
            message: 'Password reset successful',
          })
        
         });
      } catch (err) {
        console.error("Error", err);
        return next(new AppError('There was an error changing the password. Please try again later.', 500));
      }
    });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return next(new AppError('There was an error processing your request. Please try again later.', 500));
  }
 
});




