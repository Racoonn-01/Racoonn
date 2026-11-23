import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';


export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

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
      to: email,
      subject: 'Account Under Verification',
      text: `Hello ${name || 'Partner'},\n\nThank you for completing your onboarding. Please wait 24 to 48 hours for your account and document verification.\n\nBest,\nRacoonn Team`,
      html: `
         <div style="font-family: Arial, sans-serif; background-color: #F4F0EA; padding: 40px 20px; color: #1F2E4A;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
               <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #e2e8f0;">
                  <img src="${logoUrl}" alt="Racoonn Logo" style="max-width: 200px; height: auto;" />
               </div>
               <div style="padding: 40px 30px;">
                  <h2 style="margin-top: 0; color: #1F2E4A; font-size: 24px; font-weight: 600;">Verification in Progress</h2>
                  <p style="font-size: 16px; line-height: 1.5; color: #64748B; margin-bottom: 30px;">
                     Hello ${name || 'Partner'},<br><br>
                     Thank you for successfully completing your registration and onboarding process with the Racoonn Partner Program.
                  </p>
                  <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #F8D6D8; border-radius: 8px; border-left: 4px solid #E86A70;">
                     <p style="font-size: 18px; font-weight: bold; color: #1F2E4A; margin: 0;">
                        Please wait 24 to 48 hours for your account and document verification.
                     </p>
                  </div>
                  <p style="font-size: 16px; line-height: 1.5; color: #64748B;">
                     Our team is currently reviewing your submitted details. We will notify you once your account has been approved.
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending onboarding complete email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
