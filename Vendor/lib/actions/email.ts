"use server";

import nodemailer from "nodemailer";

export async function sendTicketEmail(vendorEmail: string, vendorName: string, ticketData: {
  id: string;
  subject: string;
  category: string;
  description: string;
}) {
  try {
    // These should be set in .env.local
    const host = process.env.SMTP_HOST || "smtp.ethereal.email";
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || "test";
    const pass = process.env.SMTP_PASS || "test";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 40px 20px;
          }
          .main-wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #f1f5f9;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
          }
          .header-bar {
            background-color: #d86866; /* Racoonn Coral Red */
            height: 60px;
            width: 100%;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .icon-circle {
            background-color: #fcebeb;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin: -72px auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            box-shadow: 0 0 0 4px #ffffff;
          }
          .icon-circle svg {
            color: #d86866;
            width: 28px;
            height: 28px;
          }
          h1 {
            color: #111827;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 16px;
            margin-top: 0;
          }
          .subtext {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 32px;
            max-width: 480px;
            margin-left: auto;
            margin-right: auto;
          }
          .ticket-card {
            background-color: #faf6f6;
            border-radius: 12px;
            padding: 30px 20px;
            margin: 0 auto 32px auto;
            text-align: left;
            max-width: 460px;
          }
          .ticket-inner {
            border: 1px dashed #f5c6c5;
            border-radius: 8px;
            padding: 24px;
            background-color: transparent;
          }
          .ticket-header-text {
            text-align: center;
            font-size: 14px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .row {
            display: flex;
            margin-bottom: 12px;
            font-size: 15px;
          }
          .row:last-child {
            margin-bottom: 0;
          }
          .label {
            font-weight: 600;
            color: #374151;
            width: 100px;
            flex-shrink: 0;
          }
          .value {
            color: #d86866;
            font-weight: 500;
          }
          .desc-value {
            color: #6b7280;
            font-weight: 400;
            white-space: pre-wrap;
            margin-top: 4px;
            display: block;
          }
          .action-btn {
            display: inline-block;
            background-color: #d86866;
            color: #ffffff;
            font-weight: 600;
            font-size: 16px;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            margin-bottom: 24px;
          }
          .footer-box {
            background-color: #1e242d;
            border-radius: 12px;
            padding: 40px 30px;
            text-align: center;
          }
          .social-links {
            margin-bottom: 30px;
          }
          .social-circle {
            display: inline-block;
            background-color: #d86866;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin: 0 8px;
            line-height: 36px;
            color: white;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
          }
          .footer-text {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 12px 0;
          }
          .footer-text a {
            color: #d86866;
            text-decoration: none;
          }
          .copyright {
            color: #6b7280;
            font-size: 13px;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="main-wrapper">
          <div class="container">
            <div class="header-bar"></div>
            <div class="content">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22v-5"/>
                  <path d="M9 7V2"/>
                  <path d="M15 7V2"/>
                  <path d="M5 11h14"/>
                  <rect width="18" height="14" x="3" y="7" rx="2"/>
                </svg>
              </div>
              
              <h1>Support Ticket Received</h1>
              <p class="subtext">Thanks for reaching out to Racoonn! We've received your ticket and our team is already reviewing the details.</p>
              
              <div class="ticket-card">
                <div class="ticket-inner">
                  <div class="ticket-header-text">Your Ticket Details</div>
                  
                  <div class="row">
                    <div class="label">Ticket ID:</div>
                    <div class="value">TKT-${ticketData.id.substring(0,6).toUpperCase()}</div>
                  </div>
                  <div class="row">
                    <div class="label">Subject:</div>
                    <div class="value" style="color: #4b5563;">${ticketData.subject}</div>
                  </div>
                  <div class="row">
                    <div class="label">Category:</div>
                    <div class="value" style="color: #4b5563;">${ticketData.category}</div>
                  </div>
                  <div style="margin-top: 16px;">
                    <div class="label" style="width: 100%;">Description:</div>
                    <div class="desc-value">${ticketData.description}</div>
                  </div>
                </div>
              </div>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/vendor/support" class="action-btn">View Ticket</a>
            </div>
          </div>
          
          <div class="footer-box">
            <div class="social-links">
              <a href="#" class="social-circle">f</a>
              <a href="#" class="social-circle">in</a>
              <a href="#" class="social-circle">X</a>
            </div>
            <p class="footer-text">
              Need help? Contact our support team at <a href="mailto:support@racoonn.com">support@racoonn.com</a>
            </p>
            <p class="copyright">
              &copy; ${new Date().getFullYear()} Racoonn. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // We only send if SMTP_HOST is actually configured, else we mock it
    if (process.env.SMTP_HOST) {
      await transporter.sendMail({
        from: '"Racoonn Support" <support@racoonn.com>',
        to: vendorEmail,
        subject: `[Racoonn Support] ${ticketData.subject}`,
        html: htmlTemplate,
      });
      console.log(`Email sent to ${vendorEmail} for ticket ${ticketData.id}`);
    } else {
      console.log("Mocking email send (No SMTP_HOST set):");
      console.log(`To: ${vendorEmail}`);
      console.log(`Subject: [Racoonn Support] ${ticketData.subject}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send ticket email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
