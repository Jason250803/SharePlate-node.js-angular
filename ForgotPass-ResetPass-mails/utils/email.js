const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const pool = require('./db'); // Import the pool object

class Email {
  constructor(user=null, url=null) {
    if(user){
    this.to = user.email;
    this.firstName = user.user_name.split(' ')[0];};
    this.url = url;
    this.from = `Share Plate <${process.env.EMAIL_FROM}>`;
  }
 

  createTransport() {
    // Use SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    return transporter;
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),

    };

    // 3) Create a transport and send email
    await this.createTransport().sendMail(mailOptions);
  }
   //welcome mail
  async sendWelcome() {
    await this.send('welcome', 'Welcome to our family!');
  }
   // password reset request mail
  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
  }
  //approve of restaurant mail
  async sendApproveRestaurant() {
    await this.send('approve_restaurant', 'Request Approved');
  }

  //approve of organization mail
  async sendApproveOrganization() {
    await this.send('approve_organization', 'Request Approved');
  }

   //deactivate mail
   async sendDeactivate() {
    await this.send('deactivate', 'Temporary Account Deactivation Notification');
  }

   //deletion mail
   async sendDelete() {
    await this.send('delete', 'Permanent Account Deletion Notification');
  }

  //activate mail
  async sendActivate() {
    await this.send('activate', 'Account Activated');
  }

   //reject mail
   async sendReject() {
    await this.send('reject', 'Request Rejected');
  }
  

  // send warning mail
async sendWarning(complaint) {
  console.log("Send warning got function triggered");
  // 1) Fetch complaint data
  

  if (!complaint || complaint.length === 0) {
    throw new Error('Complaint not found');
  }
  console.log("The complaint",complaint);

  const message=complaint.message;
  const receiver_id=complaint.receiver_id;
  console.log("Receiver ID : ",receiver_id);

  // 2) Fetch receiver's email and name
  //const receiver =  pool.query('SELECT email, user_name FROM account WHERE account_id = ?', receiver_id);
  pool.query('SELECT email,user_name FROM account WHERE account_id = ?', receiver_id, async (error, results) => {
    if (error) {
      console.error("Query error:", error);
      return next(new AppError('There was an error processing your request. Please try again later.', 500));
    }
    
    console.log("Query result:", results);
    const rows = results[0]; // Access rows attribute of the result object

    if (!rows || rows.length === 0) {
      return next(new AppError('There is no user with that email address', 404));
    }

    const receiver = results[0];
    console.log("THIS IS THE RECEIVER",receiver);
    
    const receiverEmail = receiver.email;
    const receiverName = receiver.user_name.split(' ')[0];
  
    // 3) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/warning.pug`, {
      receiverName,
      message,
    });
  
    // 4) Send email
    const mailOptions = {
      from: this.from,
      to: receiverEmail,
      subject: 'Complaint Warning',
      html,
      text: message,
    };
  
    await this.createTransport().sendMail(mailOptions);
   
    
    });

}


}

module.exports = Email;
