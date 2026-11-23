export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { generatePartnerApiKey } from '@/lib/partner-api/security/hashing';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

// PATCH: Revoke or activate key
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!['active', 'revoked'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const doc = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      'integration_api_keys',
      id,
      { status }
    );

    return NextResponse.json({
      success: true,
      data: { id: doc.$id, status: doc.status },
      message: `API Key ${doc.status === 'revoked' ? 'revoked' : 'activated'} successfully.`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}

// POST: Regenerate key secret
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const current = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      'integration_api_keys',
      id
    );

    const { rawKey, keyPrefix, keyHash } = generatePartnerApiKey(current.environment || 'production');

    const updated = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      'integration_api_keys',
      id,
      {
        keyPrefix,
        keyHash,
        status: 'active',
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updated.$id,
        rawKey, // Revealed only once upon regeneration
        keyPrefix,
        status: 'active',
      },
      message: 'API Key regenerated successfully. Copy the new key now.',
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}
