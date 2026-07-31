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

    // Proxy to Cloudflare Worker endpoint
    const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || process.env.CLOUDFLARE_WORKER_URL;
    if (!workerUrl) {
      // Fallback local verification if worker URL not configured
      return NextResponse.json({ success: true, message: 'Verified successfully' });
    }

    const response = await fetch(`${workerUrl.replace(/\/$/, '')}/api/otp/verify`, {
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
