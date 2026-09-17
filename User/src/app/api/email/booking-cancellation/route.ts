import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending cancellation email:', error);
    return NextResponse.json(
      { error: 'Failed to send cancellation email', details: error.message },
      { status: 500 }
    );
  }
}
