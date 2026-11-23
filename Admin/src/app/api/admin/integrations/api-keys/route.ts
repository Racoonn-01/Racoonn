export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { generatePartnerApiKey, hashApiKey } from '@/lib/partner-api/security/hashing';
import { ALL_PARTNER_PERMISSIONS } from '@/lib/partner-api/types';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

// GET /api/admin/integrations/api-keys
export async function GET() {
  try {
    const keysResp = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'integration_api_keys',
      [Query.limit(100), Query.orderDesc('$createdAt')]
    );

    // Fetch stats for each partner from integration_api_logs
    const logsResp = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'integration_api_logs',
      [Query.limit(500), Query.orderDesc('$createdAt')]
    ).catch(() => ({ documents: [] }));

    const partners = keysResp.documents.map((k) => {
      const partnerLogs = logsResp.documents.filter((l) => l.partner === k.partner);
      const totalReqs = partnerLogs.length;
      const successReqs = partnerLogs.filter((l) => l.statusCode >= 200 && l.statusCode < 400).length;
      const avgResponse = totalReqs > 0
        ? Math.round(partnerLogs.reduce((acc, curr) => acc + (curr.responseTime || 0), 0) / totalReqs)
        : 0;

      return {
        id: k.$id,
        name: k.name,
        partner: k.partner,
        keyPrefix: k.keyPrefix,
        environment: k.environment,
        status: k.status,
        permissions: k.permissions || [],
        createdBy: k.createdBy || 'Admin',
        createdAt: k.$createdAt,
        expiresAt: k.expiresAt || null,
        lastUsedAt: k.lastUsedAt || null,
        rateLimit: k.rateLimit || (k.environment === 'sandbox' ? 100 : 1000),
        stats: {
          totalRequests: totalReqs,
          successfulRequests: successReqs,
          failedRequests: totalReqs - successReqs,
          avgResponseTimeMs: avgResponse,
        },
      };
    });

    return NextResponse.json({ success: true, data: partners });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

// POST /api/admin/integrations/api-keys (Create new key)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, partner, environment = 'production', permissions, expiresAt, propertyIds = [] } = body;

    if (!name || !partner) {
      return NextResponse.json(
        { success: false, error: 'Name and partner identifier are required.' },
        { status: 400 }
      );
    }

    const assignedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ALL_PARTNER_PERMISSIONS;

    const { rawKey, keyPrefix, keyHash } = generatePartnerApiKey(environment);

    const keyDoc = await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'integration_api_keys',
      ID.unique(),
      {
        name,
        partner: partner.toLowerCase().trim(),
        keyPrefix,
        keyHash,
        environment,
        status: 'active',
        permissions: assignedPermissions,
        createdBy: 'Admin',
        expiresAt: expiresAt || '',
        lastUsedAt: '',
        rateLimit: environment === 'sandbox' ? 100 : 1000,
      }
    );

    // If specific property assignments given, register in integration_property_access
    if (Array.isArray(propertyIds) && propertyIds.length > 0) {
      for (const propId of propertyIds) {
        await appwriteServer.databases.createDocument(
          DATABASE_ID,
          'integration_property_access',
          ID.unique(),
          {
            apiKeyId: keyDoc.$id,
            partner: partner.toLowerCase().trim(),
            propertyId: propId,
            status: 'active',
          }
        );
      }
    }

    // Return the raw key ONCE
    return NextResponse.json({
      success: true,
      data: {
        id: keyDoc.$id,
        name: keyDoc.name,
        partner: keyDoc.partner,
        keyPrefix: keyDoc.keyPrefix,
        rawKey, // Revealed only once
        environment: keyDoc.environment,
        permissions: keyDoc.permissions,
        createdAt: keyDoc.$createdAt,
      },
      message: 'API Key generated successfully. Copy this key now as it will not be shown again.',
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
