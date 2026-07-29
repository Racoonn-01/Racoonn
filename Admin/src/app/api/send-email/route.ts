import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text, status, reason, vendorName, ownerName } = body;

    if (!to) {
      return NextResponse.json({ success: false, error: "Recipient email is required" }, { status: 400 });
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = (process.env.SMTP_USER || process.env.SMTP_USERNAME || "work.vivekkumar0666@gmail.com").trim();
    const rawPass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "rgar quzx szdi fvzo").trim();
    const pass = rawPass.replace(/\s+/g, '');

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass
      }
    });

    const recipientEmail = to.trim();
    let emailSubject = subject;
    let htmlContent = "";

    const name = ownerName || "Partner";
    const business = vendorName || "Your Property";
    const normStatus = (status || "").toString().toLowerCase().trim();

    if (normStatus.includes("approved")) {
      emailSubject = emailSubject || `🎉 Congratulations! Your Racoonn Vendor Account is Fully Verified`;
      htmlContent = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">🎉 Account Verification Approved</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Welcome to Racoonn Partner Network</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Dear ${name},</p>
        <p style="font-size: 15px; line-height: 1.6;">We are delighted to inform you that your business verification for <strong>"${business}"</strong> has been <strong>APPROVED</strong> by the Racoonn Compliance Team!</p>

        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #065f46;">Full Platform Features Unlocked:</p>
          <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
            <li>Property & Room listings are live for customer bookings</li>
            <li>Promotional Special Offers & Coupon discounts enabled</li>
            <li>Direct bank settlement & instant payouts active</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.6;">You can log in to your Racoonn Vendor Dashboard anytime to manage reservations, availability, and pricing.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Racoonn Audit & Compliance Team • Automated Notification</p>
      </div>`;
    } else if (normStatus.includes("reject")) {
      emailSubject = emailSubject || `⚠️ Action Required: Racoonn Vendor Account Verification Unsuccessful`;
      htmlContent = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #dc2626; font-size: 24px; margin: 0;">⚠️ Verification Unsuccessful</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Racoonn Compliance Audit Notice</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Dear ${name},</p>
        <p style="font-size: 15px; line-height: 1.6;">We reviewed your submitted verification documents for <strong>"${business}"</strong>. Unfortunately, we were unable to approve your account at this time.</p>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #991b1b;">Audit Remarks / Reason for Rejection:</p>
          <p style="margin: 0; color: #b91c1c; font-size: 14px; font-style: italic;">"${reason || "Document details require clarification or re-upload."}"</p>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #334155;">Required Next Steps:</p>
          <ol style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.8;">
            <li>Log in to your <strong>Racoonn Vendor Dashboard</strong>.</li>
            <li>Navigate to <strong>Documents & Compliance</strong>.</li>
            <li>Re-upload the updated document(s) matching compliance criteria.</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 20px;">Our compliance team will re-audit your submission immediately upon re-upload.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Racoonn Audit & Compliance Team • Automated Notification</p>
      </div>`;
    } else {
      emailSubject = emailSubject || `⏳ Status Update: Your Verification Documents are Under Review`;
      htmlContent = `<div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2563eb; font-size: 24px; margin: 0;">⏳ Verification Under Audit</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Racoonn Compliance Audit Notice</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Dear ${name},</p>
        <p style="font-size: 15px; line-height: 1.6;">Your submitted compliance documents for <strong>"${business}"</strong> are currently being audited by our verification specialists.</p>

        <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 8px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">No further action is required from your side at this time. You will receive an automated notification as soon as the review is complete.</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Racoonn Audit & Compliance Team • Automated Notification</p>
      </div>`;
    }

    const mailOptions = {
      from: `"Racoonn Compliance Team" <${user}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: text || emailSubject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n✅ [REAL GMAIL SMTP DISPATCH SUCCESS] Status: ${status} (${normStatus}) | Message ID: ${info.messageId} -> Sent to ${recipientEmail}\n`);

    return NextResponse.json({
      success: true,
      recipient: recipientEmail,
      status: status || "Under Review",
      messageId: info.messageId,
      message: `Verification notification email (${status}) delivered successfully to ${recipientEmail}`
    });
  } catch (err: any) {
    console.error("❌ Nodemailer Gmail SMTP dispatch error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
