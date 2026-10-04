import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'abandoned_checkouts';
const BOOKING_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || 'bookings';

export const maxDuration = 60; // Set max duration for Vercel to allow processing
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Validate Vercel Cron Secret for security
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce')
      .setKey(process.env.APPWRITE_API_KEY!);

    const databases = new Databases(client);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await databases.listDocuments(DB_ID, COLLECTION_ID, [
      Query.equal('status', 'CHECKOUT_STARTED'),
      Query.equal('emailSent', false),
      Query.lessThan('$createdAt', tenMinsAgo),
      Query.greaterThan('$createdAt', oneDayAgo)
    ]);

    let emailsProcessed = 0;

    for (const checkout of response.documents) {
      let bookingCompleted = false;

      // Ensure that there isn't actually a completed booking for this exact session
      if (checkout.bookingId) {
        try {
          const booking = await databases.getDocument(DB_ID, BOOKING_COLLECTION_ID, checkout.bookingId);
          if (booking.status === 'Confirmed' || booking.status === 'Completed' || booking.paymentStatus === 'Completed') {
            bookingCompleted = true;
          }
        } catch (err) {
          // Booking not found or error
        }
      }

      if (bookingCompleted) {
        await databases.updateDocument(DB_ID, COLLECTION_ID, checkout.$id, {
          status: 'BOOKED'
        });
      } else {
        // Build base URL dynamically from the request to allow testing locally
        const host = request.headers.get('host') || 'www.racoonn.com';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const recoveryLink = `${protocol}://${host}/checkout/recover/${checkout.recoveryToken}`;
        
        const mailOptions = {
          from: `"Racoonn" <${process.env.SMTP_USER}>`,
          to: checkout.email,
          subject: `Complete your booking at ${checkout.hotelId || 'Racoonn'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto;">
              <h2>Hi ${checkout.name || 'there'},</h2>
              <p>We noticed you left something behind! Your booking for <strong>${checkout.hotelId || 'your stay'}</strong> is almost complete.</p>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Summary</h3>
                ${checkout.roomName ? `<p><strong>Room:</strong> ${checkout.roomName}</p>` : ''}
                ${checkout.checkIn ? `<p><strong>Dates:</strong> ${checkout.checkIn} to ${checkout.checkOut}</p>` : ''}
                ${checkout.amount ? `<p><strong>Total:</strong> ₹${checkout.amount.toLocaleString()}</p>` : ''}
              </div>

              <p>We've saved your progress. Click the button below to complete your booking securely:</p>
              
              <a href="${recoveryLink}" style="display: inline-block; background-color: #ff5a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Complete Your Booking</a>
              
              <p style="margin-top: 30px; font-size: 12px; color: #666;">If you've already completed this booking or didn't start one, please ignore this email.</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          
          await databases.updateDocument(DB_ID, COLLECTION_ID, checkout.$id, {
            status: 'ABANDONED',
            emailSent: true,
            emailSentAt: new Date().toISOString()
          });
          emailsProcessed++;
        } catch (emailErr) {
          console.error(`Failed to send email to ${checkout.email}:`, emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, processed: emailsProcessed });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
