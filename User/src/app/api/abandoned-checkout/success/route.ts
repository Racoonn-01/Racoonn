import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'abandoned_checkouts';

export async function POST(request: Request) {
  try {
    const { sessionId, bookingId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const existingDocs = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('sessionId', sessionId)
    ]);

    if (existingDocs.documents.length > 0) {
      const doc = existingDocs.documents[0];
      await databases.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        status: 'PAYMENT_COMPLETED',
        bookingId: bookingId || '',
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating abandoned checkout success:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
