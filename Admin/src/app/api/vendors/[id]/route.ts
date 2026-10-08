import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Vendor ID is required' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

    const databases = new Databases(client);
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

    // 1. Delete all properties for this vendor
    try {
      const propertyColId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';
      const props = await databases.listDocuments(dbId, propertyColId, [
        Query.equal('vendorId', id)
      ]);
      
      for (const prop of props.documents) {
        await databases.deleteDocument(dbId, propertyColId, prop.$id);
      }
    } catch (err) {
      console.warn("Failed to delete associated properties", err);
    }

    // 2. Delete the vendor document itself
    await databases.deleteDocument(
      dbId,
      process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || '6a3e0fd9da7df0d38588',
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting vendor:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete vendor' },
      { status: 500 }
    );
  }
}
