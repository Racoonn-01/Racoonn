import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { method, identifier } = await req.json();

    if (!method || !identifier) {
      return NextResponse.json(
        { error: 'Method and identifier are required' },
        { status: 400 }
      );
    }

    // Use native Nodemailer logic instead of proxying to avoid 429 errors from external workers
    let otp: string;
      if (method === 'email') {
         otp = Math.floor(100000 + Math.random() * 900000).toString();
         const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
               user: process.env.SMTP_USER,
               pass: process.env.SMTP_PASS,
            }
         });
         const protocol = req.headers.get('x-forwarded-proto') || (req.headers.get('host')?.includes('localhost') ? 'http' : 'https');
         const host = req.headers.get('host');
         const logoUrl = `${protocol}://${host}/Racoonn-Logo-02.png`;

         await transporter.sendMail({
            from: `"Racoonn Partner Program" <${process.env.SMTP_USER}>`,
            to: identifier,
            subject: 'Your Racoonn Verification Code',
            text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
            html: `
               <div style="font-family: Arial, sans-serif; background-color: #F4F0EA; padding: 40px 20px; color: #1F2E4A;">
                  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                     <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #e2e8f0;">
                        <img src="${logoUrl}" alt="Racoonn Logo" style="max-width: 200px; height: auto;" />
                     </div>
                     <div style="padding: 40px 30px;">
                        <h2 style="margin-top: 0; color: #1F2E4A; font-size: 24px; font-weight: 600;">Verification Code</h2>
                        <p style="font-size: 16px; line-height: 1.5; color: #64748B; margin-bottom: 30px;">
                           Hello,<br><br>
                           Please use the verification code below to continue your onboarding process with the Racoonn Partner Program.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                           <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #E86A70; background-color: #F8D6D8; padding: 15px 30px; border-radius: 8px;">
                              ${otp}
                           </span>
                        </div>
                        <p style="font-size: 14px; color: #64748B; text-align: center; margin-bottom: 0;">
                           This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
                        </p>
                     </div>
                     <div style="background-color: #1F2E4A; padding: 20px; text-align: center;">
                        <p style="color: #ffffff; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Racoonn. All rights reserved.</p>
                     </div>
                  </div>
                   </div>
                </div>
             `
          });
      } else {
         otp = "123456"; // Fixed OTP for mobile testing to avoid terminal checking
         console.log(`[FAKE SMS] To: ${identifier}, OTP: ${otp}`);
      }

      const res = NextResponse.json({ success: true, message: `OTP sent successfully to ${identifier}` });
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      const expires = new Date(expiresAt); 
      const payload = Buffer.from(`${identifier}:${otp}:${expiresAt}`).toString('base64');
      
      res.cookies.set('racoonn_otp', payload, {
         httpOnly: true,
         expires,
         path: '/'
      });

    return res;
  } catch (error) {
    console.error('Error proxying OTP send:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
