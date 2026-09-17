"use server";

import nodemailer from "nodemailer";

export async function sendStatusEmail(
  toEmail: string,
  vendorName: string,
  ticketDetails: {
    id: string;
    displayId: string;
    subject: string;
    category: string;
  },
  status: string
) {
  try {
    console.log(`Mocking status email to ${toEmail} for ticket ${ticketDetails.id} - Status: ${status}`);
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not found. Email logged locally.");
      return { success: true, message: "Email logged" };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    let title = "";
    let message = "";
    const buttonColor = "#d91656";

    if (status === "Open") {
       title = "Ticket Opened";
       message = `We have received your support ticket regarding <strong>${ticketDetails.subject}</strong>. Our team is reviewing it and will get back to you shortly.`;
    } else if (status === "In Progress") {
       title = "Ticket In Progress";
       message = `Your support ticket regarding <strong>${ticketDetails.subject}</strong> is now being actively worked on by our support team.`;
    } else if (status === "Resolved") {
       title = "Ticket Resolved";
       message = `Your support ticket regarding <strong>${ticketDetails.subject}</strong> has been resolved. If you have any further questions, please feel free to reach out.`;
    } else if (status === "Closed") {
       title = "Ticket Closed";
       message = `Your support ticket regarding <strong>${ticketDetails.subject}</strong> has been closed. Thank you for contacting us!`;
    } else {
       title = "Ticket Status Update";
       message = `The status of your support ticket regarding <strong>${ticketDetails.subject}</strong> has been updated to <strong>${status}</strong>.`;
    }

    const vendorAppUrl = process.env.NEXT_PUBLIC_VENDOR_URL || "http://localhost:3002";

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
          .header { background-color: #d91656; padding: 30px 20px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 30px; color: #333333; line-height: 1.6; }
          .ticket-box { background-color: #f5f5f5; border-radius: 6px; padding: 25px; margin: 25px 0; }
          .ticket-box h3 { color: #d91656; margin-top: 0; margin-bottom: 15px; font-size: 18px; }
          .btn { display: inline-block; background-color: ${buttonColor}; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 14px; color: #555555; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>Hi ${vendorName},</p>
            <p>${message}</p>
            
            <div class="ticket-box">
              <h3>Ticket Details</h3>
              <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketDetails.displayId}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${status}</p>
              <p style="margin: 5px 0;"><strong>Category:</strong> ${ticketDetails.category}</p>
              <br/>
              <a href="${vendorAppUrl}/vendor/support" class="btn">View Ticket</a>
            </div>

            <div class="footer">
              <p>If you didn't raise this ticket, you can safely ignore this email.</p>
              <p style="margin-top:20px;">Safe travels!<br/><strong>The Racoonn Team</strong></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Racoonn Support" <${process.env.SMTP_FROM || 'support@racoonn.com'}>`,
      to: toEmail,
      subject: `[Racoonn Support] ${title} - ${ticketDetails.displayId}`,
      html: htmlTemplate
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to send status email:", error);
    return { success: false, error: error.message };
  }
}

export async function sendEmployeeVerificationEmail(
  toEmail: string,
  employeeName: string,
  role: string,
  verificationUrl: string,
  allowedTabs: string[] = []
) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const fullLink = verificationUrl.startsWith("http") ? verificationUrl : `${appUrl}${verificationUrl}`;

    console.log(`[REALTIME EMAIL DISPATCH] To: ${toEmail} | Employee: ${employeeName} | Role: ${role} | Link: ${fullLink}`);

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Racoonn Admin Portal" <${process.env.SMTP_FROM || 'admin@racoonn.com'}>`,
        to: toEmail,
        subject: `Verify Email & Activate Racoonn Admin Access (${role})`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; margin: 0; padding: 30px; color: #ffffff; }
              .card { max-width: 550px; margin: 0 auto; background: #1e293b; border-radius: 20px; padding: 40px; border: 1px solid #334155; text-align: center; }
              .logo { color: #e86a70; font-size: 26px; font-weight: 900; margin-bottom: 24px; letter-spacing: -0.5px; }
              h2 { font-size: 22px; color: #ffffff; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
              .role-badge { display: inline-block; background: rgba(232, 106, 112, 0.15); color: #e86a70; border: 1px solid rgba(232, 106, 112, 0.3); font-weight: bold; padding: 6px 14px; border-radius: 20px; font-size: 13px; margin-bottom: 24px; }
              .btn { display: inline-block; background-color: #e86a70; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-size: 16px; box-shadow: 0 4px 14px rgba(232, 106, 112, 0.4); margin: 24px 0; }
              .footer { border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; font-size: 12px; color: #64748b; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="logo">Racoonn Admin</div>
              <h2>Verify Email Access</h2>
              <p>Hello <b>${employeeName}</b>,</p>
              <p>You have been assigned to the Racoonn Admin Portal under the role:</p>
              <div class="role-badge">${role}</div>
              <p>Please click the button below to open the Admin Login window, verify your email, and sign in to your authorized modules:</p>
              <a href="${fullLink}" class="btn">Open Admin Login Window</a>
              <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:<br/><span style="color: #38bdf8;">${fullLink}</span></p>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Racoonn Technologies. All rights reserved.
              </div>
            </div>
          </body>
          </html>
        `
      });
    }

    return { success: true, fullLink };
  } catch (error: any) {
    console.error("Failed to send employee verification email:", error);
    return { success: false, error: error.message };
  }
}
