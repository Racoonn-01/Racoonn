import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Client, Databases } from 'node-appwrite';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      hotelName = 'Racoonn Hotel',
      hotelLocation = '',
      price = 0,
      nights = 1,
      checkIn = 'N/A',
      checkOut = 'N/A',
      adults = 1,
      email = '',
      firstName = 'Guest',
      bookingId = 'N/A',
      hotelId = null,
    } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // 2. Prepare Email
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
        <div style="background-color: #E86A6F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Booking Cancelled</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${firstName || 'Guest'},</p>
          <p>Your reservation at <strong>${hotelName}</strong> has been successfully cancelled.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #E86A6F;">Cancelled Booking Details</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotelName} ${hotelLocation ? '(' + hotelLocation + ')' : ''}</p>
            <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
            <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
            <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${nights} Night(s)</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p style="margin: 5px 0; font-size: 1.1em;"><strong>Total Amount:</strong> ₹${(Number(price) || 0).toLocaleString("en-IN")}</p>
          </div>
          
          <p>If you are eligible for a refund according to the cancellation policy, it will be processed and routed back to your original payment method. Please allow 5-7 business days for it to reflect in your statement.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>We hope to host you again in the future!</p>
          <p><strong>The Racoonn Team</strong></p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Racoonn Bookings" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking Cancelled: ${hotelName}`,
      html: htmlContent,
    });

    console.log("Cancellation email sent: %s", info.messageId);

    // 3. Notify Vendor if hotelId is provided
    if (hotelId) {
      try {
        const client = new Client()
          .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
          .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce')
          .setKey(process.env.APPWRITE_API_KEY || '');
          
        const db = new Databases(client);
        const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
        
        const property = await db.getDocument(dbId, 'properties', hotelId);
        if (property && (property.vendorId || property.userId)) {
          const vendor = await db.getDocument(dbId, '6a3e0fd9da7df0d38588', property.vendorId || property.userId);
          
          if (vendor && vendor.email) {
            const vendorHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="background-color: #E86A6F; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">Booking Cancelled Alert!</h1>
                </div>
                <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                  <p>Hi ${vendor.businessName || vendor.firstName || 'Vendor'},</p>
                  <p>A booking at <strong>${hotelName}</strong> has been cancelled.</p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                    <p style="margin: 5px 0;"><strong>Guest Name:</strong> ${firstName}</p>
                    <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
                    <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
                    <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
                    <p style="margin: 5px 0;"><strong>Nights:</strong> ${nights}</p>
                  </div>
                  <p>The dates have been freed up in your inventory. No action is required.</p>
                  <p><strong>The Racoonn Team</strong></p>
                </div>
              </div>
            `;
            
            await transporter.sendMail({
              from: '"Racoonn Bookings" <' + process.env.SMTP_USER + '>',
              to: vendor.email,
              subject: `Booking Cancelled: ${hotelName}`,
              html: vendorHtml
            });
            console.log("Vendor cancellation notification sent to:", vendor.email);
          }
        }
      } catch (vendorErr) {
        console.error("Failed to notify vendor about cancellation:", vendorErr);
      }
    }

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending cancellation email:', error);
    return NextResponse.json(
      { error: 'Failed to send cancellation email', details: error.message },
      { status: 500 }
    );
  }
}
