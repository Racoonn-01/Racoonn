import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/config';
import { ID, Query } from 'appwrite';
import crypto from 'crypto';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'abandoned_checkouts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      sessionId, email, name, phone, hotelId, roomId, 
      roomName, checkIn, checkOut, guests, amount, 
      checkoutUrl, userId 
    } = body;

    if (!email || !sessionId) {
      return NextResponse.json({ error: 'Email and sessionId are required' }, { status: 400 });
    }

    // Check if an abandoned checkout record already exists for this session
    const existingDocs = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('sessionId', sessionId)
    ]);

    const docData = {
      sessionId,
      email,
      name: name || '',
      phone: phone || '',
      hotelId: hotelId || '',
      roomId: roomId || '',
      roomName: roomName || '',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      guests: guests || '',
      amount: amount ? parseFloat(amount) : 0,
      checkoutUrl: checkoutUrl || '',
      userId: userId || '',
      status: 'CHECKOUT_STARTED',
      emailSent: false,
    };

    if (existingDocs.documents.length > 0) {
      // Update existing record
      const doc = existingDocs.documents[0];
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, docData);
      return NextResponse.json({ success: true, id: doc.$id });
    } else {
      // Create new record
      const recoveryToken = crypto.randomBytes(32).toString('hex');
      const newDoc = await databases.createDocument(
        DATABASE_ID, 
        COLLECTION_ID, 
        ID.unique(), 
        {
          ...docData,
          recoveryToken,
        }
      );
      return NextResponse.json({ success: true, id: newDoc.$id });
    }
  } catch (error) {
    console.error('Error tracking abandoned checkout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
