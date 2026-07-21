"use server";

import nodemailer from "nodemailer";

export async function sendResolvedEmail(
  toEmail: string,
  vendorName: string,
  ticketDetails: {
    id: string;
    displayId: string;
    subject: string;
    category: string;
  }
) {
  try {
    console.log(`Mocking resolved email to ${toEmail} for ticket ${ticketDetails.id}`);
    
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not found. Email not actually sent.");
      return { success: true, message: "Mocked email sent" };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Racoonn Support" <${process.env.SMTP_FROM || 'support@racoonn.com'}>`,
      to: toEmail,
      subject: `[Racoonn Support] Your Ticket ${ticketDetails.displayId} is Resolved`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .header-bar { height: 16px; background-color: #f87171; width: 100%; }
            .content { padding: 40px 48px; text-align: center; }
            .icon-wrapper { width: 64px; height: 64px; background-color: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px auto; color: #ef4444; }
            .icon-wrapper svg { width: 32px; height: 32px; }
            h1 { color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; }
            p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }
            .ticket-card { background-color: #fffaf5; border: 2px dashed #fcd34d; border-radius: 12px; padding: 24px; text-align: left; margin-bottom: 32px; }
            .ticket-row { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #fde68a; padding-bottom: 12px; }
            .ticket-row:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }
            .ticket-label { color: #92400e; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
            .ticket-value { color: #78350f; font-size: 15px; font-weight: 500; }
            .action-btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; text-decoration: none; font-weight: 600; padding: 14px 32px; border-radius: 8px; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3); transition: all 0.2s; }
            .footer { background-color: #1e242d; color: #9ca3af; padding: 32px 48px; text-align: center; font-size: 14px; }
            .footer a { color: #f87171; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header-bar"></div>
            <div class="content">
              <div class="icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1>Ticket Resolved</h1>
              <p>Hi ${vendorName},<br/><br/>Your support ticket (<strong>${ticketDetails.displayId}</strong>) has been marked as resolved by our team. We'd love to hear your feedback on how we did.</p>
              
              <div class="ticket-card">
                <div class="ticket-row">
                  <span class="ticket-label">Ticket ID</span>
                  <span class="ticket-value">${ticketDetails.displayId}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-label">Category</span>
                  <span class="ticket-value">${ticketDetails.category}</span>
                </div>
                <div class="ticket-row">
                  <span class="ticket-label">Subject</span>
                  <span class="ticket-value">${ticketDetails.subject}</span>
                </div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/vendor/support?reviewTicket=${ticketDetails.id}" class="action-btn">Write a Review</a>
            </div>
            
            <div class="footer">
              <p>Need more help? Contact <a href="mailto:support@racoonn.com">support@racoonn.com</a></p>
              <p>&copy; ${new Date().getFullYear()} Racoonn. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, message: "Email sent" };

  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
