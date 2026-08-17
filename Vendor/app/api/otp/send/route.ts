import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { method, identifier } = await req.json();

    if (!method || !identifier) {
      return NextResponse.json(
        { error: 'Method and identifier are required' },
        { status: 400 }
      );
    }

    const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || process.env.CLOUDFLARE_WORKER_URL;
    if (!workerUrl) {
      // Fallback local response if worker URL not configured
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      if (method === 'email') {
         const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
               user: process.env.SMTP_USER,
               pass: process.env.SMTP_PASS,
            }
         });
         
         await transporter.sendMail({
            from: `"Racoonn Partner Program" <${process.env.SMTP_USER}>`,
            to: identifier,
            subject: 'Your Racoonn Verification Code',
            text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
            html: `<div style="font-family: sans-serif; padding: 20px;">
                     <h2>Racoonn Partner Verification</h2>
                     <p>Your verification code is: <strong>${otp}</strong></p>
                     <p>It will expire in 10 minutes.</p>
                   </div>`
         });
      } else {
         console.log(`[FAKE SMS] To: ${identifier}, OTP: ${otp}`);
      }

      const res = NextResponse.json({ success: true, message: `OTP sent successfully to ${identifier}` });
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const payload = Buffer.from(`${identifier}:${otp}`).toString('base64');
      
      res.cookies.set('racoonn_otp', payload, {
         httpOnly: true,
         expires,
         path: '/'
      });

      return res;
    }

    const response = await fetch(`${workerUrl.replace(/\/$/, '')}/api/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, identifier })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true, message: `OTP sent successfully to ${identifier}` });
  } catch (error) {
    console.error('Error proxying OTP send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
