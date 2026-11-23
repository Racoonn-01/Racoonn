import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite/server';

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json(
        { error: 'User ID and Phone are required' },
        { status: 400 }
      );
    }

    const { users } = createAdminClient();

    // Appwrite expects phones to be in E.164 format (e.g. +16175551212)
    // The frontend passes something like "+91 9876543210". We strip out whitespace.
    const cleanPhone = phone.replace(/\s+/g, '');

    // Check if the current user already has this phone number
    const user = await users.get(userId);
    if (user.phone === cleanPhone) {
       // Phone is already set
       return NextResponse.json({ success: true, message: 'Phone already synced' });
    }

    // Try to update phone
    await users.updatePhone(userId, cleanPhone);

    return NextResponse.json({ success: true, message: 'Phone synced successfully' });
  } catch (error: any) {
    console.error('Error syncing phone to Appwrite Auth:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error while syncing phone' },
      { status: error.code || 500 }
    );
  }
}
