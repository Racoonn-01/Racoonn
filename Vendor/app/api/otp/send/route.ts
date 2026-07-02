import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { method, identifier } = await req.json();

    if (!method || !identifier) {
      return NextResponse.json(
        { error: 'Method and identifier are required' },
        { status: 400 }
      );
    }

    // Proxy to Express Backend server
    const response = await fetch('http://localhost:5005/api/otp/send', {
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
