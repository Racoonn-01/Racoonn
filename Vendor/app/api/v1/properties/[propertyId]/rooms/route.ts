export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'rooms:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { propertyId } = await params;

    // Sandbox mock room support
    if (propertyId === 'TEST_PROPERTY_001') {
      return NextResponse.json({
        success: true,
        data: [
          {
            id: 'TEST_ROOM_001',
            propertyId: 'TEST_PROPERTY_001',
            name: 'Sandbox Deluxe Suite',
            type: 'Deluxe',
            status: 'active',
            totalInventory: 10,
            maxOccupancy: 3,
            size: 350,
            basePrice: 4500,
            currency: 'INR',
            mealPlan: 'Breakfast Included',
          },
        ],
      }, { headers: { 'X-Request-ID': reqId } });
    }

    // Tenant check
    await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);

    const roomsResp = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'rooms',
      [Query.equal('propertyId', propertyId), Query.limit(100)]
    );

    const data = roomsResp.documents.map((r) => ({
      id: r.$id,
      propertyId: r.propertyId,
      name: r.name,
      type: r.type || 'Standard',
      status: 'active',
      totalInventory: r.size ? Math.max(1, Math.floor(r.size / 30)) : 5,
      maxOccupancy: r.occupancy || 2,
      size: r.size || null,
      basePrice: r.discountPrice && r.discountPrice > 0 ? r.discountPrice : r.price,
      currency: 'INR',
      mealPlan: r.mealPlan || null,
      cancellationPolicy: r.cancellation || null,
      description: r.description || null,
      createdAt: r.$createdAt,
    }));

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: `/api/v1/properties/${propertyId}/rooms`,
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({ success: true, data }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    if (partnerCtx) {
      logPartnerApiRequest({
        partner: partnerCtx.partner,
        apiKeyId: partnerCtx.apiKeyId,
        method: 'GET',
        path: `/api/v1/properties/unknown/rooms`,
        statusCode: (err as { statusCode?: number }).statusCode || 500,
        requestId: reqId,
        responseTime: Date.now() - startTime,
        environment: partnerCtx.environment,
      });
    }
    return handleApiError(err, reqId);
  }
}
