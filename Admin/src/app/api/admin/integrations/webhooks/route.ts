export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET() {
  try {
    const [epResp, delResp] = await Promise.all([
      appwriteServer.databases.listDocuments(
        DATABASE_ID,
        'webhook_endpoints',
        [Query.limit(50), Query.orderDesc('$createdAt')]
      ).catch(() => ({ documents: [] })),
      appwriteServer.databases.listDocuments(
        DATABASE_ID,
        'webhook_deliveries',
        [Query.limit(50), Query.orderDesc('$createdAt')]
      ).catch(() => ({ documents: [] })),
    ]);

    return NextResponse.json({
      success: true,
      endpoints: epResp.documents,
      deliveries: delResp.documents,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
