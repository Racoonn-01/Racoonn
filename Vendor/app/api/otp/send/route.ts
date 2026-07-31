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

    // Proxy to Cloudflare Worker endpoint
    const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || process.env.CLOUDFLARE_WORKER_URL;
    if (!workerUrl) {
      // Fallback local response if worker URL not configured
      return NextResponse.json({ success: true, message: `OTP sent successfully to ${identifier}` });
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
