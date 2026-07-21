import { NextResponse } from 'next/server';
import { Client, Databases } from 'node-appwrite';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, updatePayload } = body;

    if (!userId || !updatePayload) {
      return NextResponse.json({ error: 'Missing userId or updatePayload' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);

    const result = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
      process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || '',
      userId,
      updatePayload
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Server Error' },
      { status: error.code || 500 }
    );
  }
}
