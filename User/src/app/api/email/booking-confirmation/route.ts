import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      hotelName,
      hotelLocation,
      price,
      nights,
      checkIn,
      checkOut,
      adults,
      email,
      firstName,
      lastName,
      bookingId
    } = data;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
        <div style="background-color: #E11D48; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Booking Confirmed!</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${firstName || 'Guest'},</p>
          <p>Thank you for booking with Racoonn. Your reservation at <strong>${hotelName}</strong> is confirmed!</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #E11D48;">Booking Details</h3>
            <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Hotel:</strong> ${hotelName} ${hotelLocation ? `(${hotelLocation})` : ''}</p>
            <p style="margin: 5px 0;"><strong>Check-in:</strong> ${checkIn}</p>
            <p style="margin: 5px 0;"><strong>Check-out:</strong> ${checkOut}</p>
            <p style="margin: 5px 0;"><strong>Guests:</strong> ${adults || 1} Adult(s)</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${nights} Night(s)</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;" />
            <p style="margin: 5px 0; font-size: 1.1em;"><strong>Total Paid:</strong> ₹${price.toLocaleString("en-IN")}</p>
          </div>
          
          <p>If you have any questions or need to make changes to your booking, please don't hesitate to contact us.</p>
          <p>Safe travels!</p>
          <p><strong>The Racoonn Team</strong></p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Racoonn Bookings" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Booking Confirmed: ${hotelName}`,
      html: htmlContent,
    });

    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Error sending confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email', details: error.message },
      { status: 500 }
    );
  }
}
