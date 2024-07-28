/*const bcrypt = require('bcrypt');

const adminPassword = 'admin123';

// Generate a salt and hash the password
bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
        console.error(err);
    } else {
        // Print the hashed password
        console.log('Hashed Password:', hash);
    }
});*/
const crypto = require('crypto');

// Generate a random string of 32 characters
const generateRandomString = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Print the generated random string
console.log(generateRandomString());