// app.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const authController = require('./authController');
const mailsController = require('./mailsController');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./utils/errorHandler');
const cors=require('cors');
app.use(cors({
  origin: 'http://localhost:4200', // Adjust this if your frontend runs on a different URL or port
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
}));
// Body parser
app.use(bodyParser.json());

// Forgot Password
app.post('/forgotPassword', authController.forgotPassword);

// Reset Password
app.post('/resetPass/:token', authController.resetPassword);

// Approve Restaurant mail
app.post('/approveRestaurant/:res_id', mailsController.approveRestaurant);

// Approve Organization mail
app.post('/approveOrganization/:org_id', mailsController.approveOrganization);

// Deactivation mail
app.post('/deactivatemail/:acct_id', mailsController.deactivatemail);

// Activation mail
app.post('/activatemail/:acct_id', mailsController.activatemail);

// Deletion mail
app.post('/deletemail/:acct_id', mailsController.deletemail);

// Rejection mail
app.post('/rejectmail/:acct_id', mailsController.rejectmail);

// Warning mail
app.post('/warningmail/:complaintId', mailsController.sendWarningMail );


// Error handling middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
