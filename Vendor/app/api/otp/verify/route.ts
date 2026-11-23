import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

    if (!identifier || !code) {
      return NextResponse.json(
        { error: 'Identifier and code are required' },
        { status: 400 }
      );
    }

    // Use native verification logic using Next.js cookies
    const cookieStore = await cookies();
      const otpCookie = cookieStore.get('racoonn_otp');
      
      if (!otpCookie) {
         return NextResponse.json({ error: 'OTP expired or not requested' }, { status: 400 });
      }
      
      const payload = Buffer.from(otpCookie.value, 'base64').toString('ascii');
      const [savedIdentifier, savedOtp, expiresAt] = payload.split(':');
      
      if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
         return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
      }

      if (savedIdentifier !== identifier || savedOtp !== code) {
         return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
      }
      
      const res = NextResponse.json({ success: true, message: 'Verified successfully' });
      // Clear cookie
      res.cookies.set('racoonn_otp', '', { maxAge: 0, path: '/' });
      
    return res;
  } catch (error) {
    console.error('Error proxying OTP verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
