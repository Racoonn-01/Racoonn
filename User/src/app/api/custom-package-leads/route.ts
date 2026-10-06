import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const IS_VERCEL = process.env.VERCEL === '1';
const SHARED_FILE_PATH = IS_VERCEL 
  ? "/tmp/custom_package_leads.json" 
  : "/Users/haldwani/Documents/Working/Working/Racoonn/custom_package_leads.json";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let leads = [];

    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      if (fileData) leads = JSON.parse(fileData);
    }

    const newLead = {
      id: Date.now().toString(),
      ...body,
      status: 'New Lead',
      createdAt: new Date().toISOString()
    };

    try {
      leads.push(newLead);
      fs.writeFileSync(SHARED_FILE_PATH, JSON.stringify(leads, null, 2), "utf-8");
    } catch (fsErr) {
      console.warn("Could not save lead to filesystem, skipping to email.", fsErr);
    }

    // Send Email to User
    if (newLead.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="background-color: #1F2E4A; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Quote Request Received!</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
              <p>Hi ${newLead.name},</p>
              <p>Thank you for your interest in <strong>${newLead.packageTitle}</strong>. We have successfully received your custom quote request.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1F2E4A;">Your Requirements:</h3>
                <p style="margin: 5px 0;"><strong>Destination:</strong> ${newLead.destination}</p>
                <p style="margin: 5px 0;"><strong>Departure City:</strong> ${newLead.departureCity}</p>
                <p style="margin: 15px 0 5px 0;"><strong>Additional Message:</strong></p>
                <p style="margin: 5px 0;"><em>${newLead.message || 'No additional requirements specified.'}</em></p>
              </div>
              
              <p>Our travel experts are currently reviewing your request and will connect with you shortly to provide a personalized itinerary and quote.</p>
              <p>If you have any urgent questions, feel free to reply directly to this email.</p>
              <br/>
              <p>Best regards,</p>
              <p><strong>The Racoonn Team</strong></p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Racoonn Travel" <${process.env.SMTP_USER}>`,
          to: newLead.email,
          bcc: process.env.SMTP_USER, // Send a copy to the admin!
          subject: `Quote Request Received: ${newLead.packageTitle}`,
          html: htmlContent,
        });
      } catch (emailErr) {
        console.error("Error sending email to lead:", emailErr);
        // We don't fail the request if email fails, just log it.
      }
    }

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: unknown) {
    console.error("Error saving custom package lead:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
