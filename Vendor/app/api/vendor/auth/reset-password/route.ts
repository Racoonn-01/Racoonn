import { NextResponse } from 'next/server';
import { Client, Users } from 'node-appwrite';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { userId, secret, password } = await req.json();

    if (!userId || !secret || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // Decode and verify the secret token
    let payload = '';
    let signature = '';
    try {
      const decoded = Buffer.from(secret, 'base64').toString('utf-8');
      const parts = decoded.split('|');
      if (parts.length !== 3) throw new Error('Invalid token format');
      const [tokenUserId, expiryStr, tokenSignature] = parts;
      
      if (tokenUserId !== userId) {
        throw new Error('Token does not match user');
      }

      if (Date.now() > parseInt(expiryStr)) {
        throw new Error('Token has expired');
      }

      payload = `${tokenUserId}|${expiryStr}`;
      signature = tokenSignature;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    const expectedSignature = crypto.createHmac('sha256', process.env.APPWRITE_API_KEY || '').update(payload).digest('hex');
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid token signature' }, { status: 400 });
    }

    // Token is valid, update the password via Server SDK
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const users = new Users(client);
    
    await users.updatePassword(userId, password);

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating the password' },
      { status: 500 }
    );
  }
}
