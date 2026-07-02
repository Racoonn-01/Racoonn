import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { identifier, code } = await req.json();

    if (!identifier || !code) {
      return NextResponse.json(
        { error: 'Identifier and code are required' },
        { status: 400 }
      );
    }

    // Proxy to Express Backend server
    const response = await fetch('http://localhost:5005/api/otp/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, code })
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ success: true, message: 'Verified successfully' });
  } catch (error) {
    console.error('Error proxying OTP verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
