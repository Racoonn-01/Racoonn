import { NextResponse } from 'next/server';
import { Client, Users, Query } from 'node-appwrite';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const users = new Users(client);

    let targetUser;
    try {
      const userList = await users.list([Query.equal('email', email)]);
      if (userList.total > 0) {
        targetUser = userList.users[0];
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }

    // Don't leak whether user exists or not
    if (!targetUser) {
      return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });
    }

    // Generate secure token
    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins
    const payload = `${targetUser.$id}|${expiry}`;
    const signature = crypto.createHmac('sha256', process.env.APPWRITE_API_KEY || '').update(payload).digest('hex');
    const secret = Buffer.from(`${payload}|${signature}`).toString('base64');

    const appUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?userId=${targetUser.$id}&secret=${encodeURIComponent(secret)}`;

    // Send Email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Racoonn Team" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Racoonn Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden; color: #333;">
          <div style="background-color: #DE1B54; color: white; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px;">Reset Password</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="margin-top: 0;">Hi ${targetUser.name || 'User'},</p>
            <p>We received a request to reset the password for your Racoonn account.</p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <h3 style="color: #DE1B54; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Password Reset Link</h3>
              <p style="margin-bottom: 20px;">Click the button below to securely set a new password for your account. This link will expire in 15 minutes.</p>
              <a href="${resetUrl}" style="background-color: #DE1B54; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Set New Password</a>
            </div>

            <p>If you didn't ask to reset your password, you can safely ignore this email.</p>
            
            <p style="margin-bottom: 5px;">Safe travels!</p>
            <p style="margin-top: 0; font-weight: bold;">The Racoonn Team</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
