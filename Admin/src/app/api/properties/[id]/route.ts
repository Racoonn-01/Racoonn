import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Extract editable fields
    const { propertyName, propertyType, city, state, location, status } = body;
    
    // Build update object based on what was provided
    const updateData: Record<string, unknown> = {};
    if (propertyName !== undefined) {
      updateData.propertyName = propertyName;
      updateData.title = propertyName; // Sync title if it exists
    }
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const db = appwriteServer.databases;

    const updatedDoc = await db.updateDocument(
      DATABASE_ID,
      'properties',
      id,
      updateData
    );

    // Send email notification on status change
    if (status) {
      try {
        const vendorId = updatedDoc.vendorId || updatedDoc.userId;
        if (vendorId) {
          const vendor = await db.getDocument(DATABASE_ID, '6a3e0fd9da7df0d38588', vendorId);
          if (vendor && vendor.email) {
            let subject = "";
            let htmlContent = "";
            const propName = updateData.propertyName || updatedDoc.propertyName || "Your Property";

            if (status === "Approved" || status === "Active") {
              subject = `✅ Property Approved: ${propName}`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
                  <h1 style="color: #059669; font-size: 24px; text-align: center;">Property Approved</h1>
                  <p>Dear ${vendor.name || vendor.businessName || 'Partner'},</p>
                  <p>Great news! Your property <strong>"${propName}"</strong> has been approved by the Racoonn team.</p>
                  <p>It is now active and visible to customers on our platform. You can log into your dashboard to manage its pricing and availability.</p>
                  <p><strong>The Racoonn Team</strong></p>
                </div>
              `;
            } else if (status === "Rejected") {
              subject = `❌ Property Rejected: ${propName}`;
              htmlContent = `
                <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
                  <h1 style="color: #dc2626; font-size: 24px; text-align: center;">Property Rejected</h1>
                  <p>Dear ${vendor.name || vendor.businessName || 'Partner'},</p>
                  <p>We reviewed your property <strong>"${propName}"</strong> and unfortunately, it has been rejected at this time as it does not meet our platform requirements.</p>
                  <p>Please log in to your dashboard to review the necessary changes or contact support for more details.</p>
                  <p><strong>The Racoonn Team</strong></p>
                </div>
              `;
            }

            if (htmlContent) {
              const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || "smtp.gmail.com",
                port: Number(process.env.SMTP_PORT || 587),
                secure: false,
                auth: {
                  user: (process.env.SMTP_USER || process.env.SMTP_USERNAME || "work.vivekkumar0666@gmail.com").trim(),
                  pass: (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "rgar quzx szdi fvzo").trim().replace(/\s+/g, '')
                }
              });

              await transporter.sendMail({
                from: '"Racoonn Notification System" <' + (process.env.SMTP_USER || "work.vivekkumar0666@gmail.com") + '>',
                to: vendor.email,
                subject: subject,
                html: htmlContent
              });
              console.log("Property status email sent to", vendor.email);
            }
          }
        }
      } catch (err) {
        console.error("Failed to send property status email:", err);
      }
    }

    return NextResponse.json(updatedDoc);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}
