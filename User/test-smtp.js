const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // upgrades to TLS
  auth: {
    user: 'info@racoonn.com',
    pass: process.env.SMTP_PASS
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
