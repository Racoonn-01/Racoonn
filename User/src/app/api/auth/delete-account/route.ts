import { NextResponse } from 'next/server';
import { Client, Users, Databases, Query } from 'node-appwrite';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
    const projectId = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';
    const apiKey = process.env.APPWRITE_API_KEY;

    if (!apiKey) {
      console.error('APPWRITE_API_KEY is not defined in environment variables');
      return NextResponse.json({ error: 'Server configuration error: missing API key' }, { status: 500 });
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const users = new Users(client);
    const databases = new Databases(client);

    const databaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
    const profilesCollectionId = process.env.NEXT_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID || 'userprofiles';
    const wishlistsCollectionId = process.env.NEXT_PUBLIC_APPWRITE_WISHLISTS_COLLECTION_ID || '6a4372f4005095bc2d72';

    // 1. Delete profile document from userprofiles collection if exists
    try {
      await databases.deleteDocument(databaseId, profilesCollectionId, userId);
    } catch (profileErr: any) {
      console.warn('Profile document deletion skipped or not found:', profileErr?.message);
    }

    // 2. Delete user's wishlists if any
    try {
      const wishlists = await databases.listDocuments(databaseId, wishlistsCollectionId, [
        Query.equal('userId', userId)
      ]);
      for (const doc of wishlists.documents) {
        await databases.deleteDocument(databaseId, wishlistsCollectionId, doc.$id);
      }
    } catch (wishlistErr: any) {
      console.warn('Wishlists deletion skipped or not found:', wishlistErr?.message);
    }

    // 3. Delete user account from Appwrite Auth
    try {
      await users.delete(userId);
    } catch (userErr: any) {
      console.error('Failed to delete Appwrite user account:', userErr?.message);
      return NextResponse.json(
        { error: userErr?.message || 'Failed to delete user account' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: error?.message || 'An error occurred while deleting the account' },
      { status: 500 }
    );
  }
}
