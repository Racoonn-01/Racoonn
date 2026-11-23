require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME, // typically your full gmail address
        pass: process.env.SMTP_PASSWORD, // your app password
      },
    });

    const templatePath = path.join(__dirname, 'templates/emails/verification-code.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    
    console.log("Sending email...");
    const info = await transporter.sendMail({
      from: '"Racoonn" <support@racoonn.com>',
      to: "starkirondigital@gmail.com",
      subject: "Verify Your Email - 731924",
      html: htmlTemplate,
    });

    console.log("Message sent successfully!");
    console.log("Message ID: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.responseCode === 535) {
      console.log("Authentication failed. Make sure SMTP_USERNAME in .env is your full Gmail address (e.g., yourname@gmail.com) and SMTP_PASSWORD is a valid 16-letter App Password.");
    }
  }
}

main();
