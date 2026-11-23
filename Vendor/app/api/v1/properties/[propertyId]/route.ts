export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
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
    const auth = await authenticatePartnerRequest(req, 'properties:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { propertyId } = await params;

    // Sandbox mock property support
    if (propertyId === 'TEST_PROPERTY_001') {
      return NextResponse.json({
        success: true,
        data: {
          id: 'TEST_PROPERTY_001',
          name: 'Racoonn Grand Sandbox Resort',
          type: 'Resort',
          status: 'active',
          address: {
            city: 'Haldwani',
            state: 'Uttarakhand',
            country: 'IN',
            location: 'Nainital Road, Haldwani',
          },
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          rating: 4.8,
          reviewsCount: 42,
          createdAt: new Date().toISOString(),
        },
      }, { headers: { 'X-Request-ID': reqId } });
    }

    // Verify tenant authorization for this specific property
    await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);

    let doc;
    try {
      doc = await appwriteServer.databases.getDocument(
        DATABASE_ID,
        'properties',
        propertyId
      );
    } catch {
      throw new ApiError('RESOURCE_NOT_FOUND', `Property '${propertyId}' was not found.`, 404);
    }

    const data = {
      id: doc.$id,
      name: doc.propertyName || doc.title || 'Racoonn Property',
      type: doc.propertyType || 'Hotel',
      status: (doc.status || 'active').toLowerCase(),
      address: {
        city: doc.city || '',
        state: doc.state || '',
        country: 'IN',
        location: doc.location || '',
      },
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      rating: doc.rating || null,
      reviewsCount: doc.reviewsCount || 0,
      description: doc.description || doc.details || null,
      checkInTime: doc.checkInTime || '14:00',
      checkOutTime: doc.checkOutTime || '11:00',
      cancellationPolicy: doc.cancellationPolicy || null,
      createdAt: doc.$createdAt,
      updatedAt: doc.$updatedAt,
    };

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: `/api/v1/properties/${propertyId}`,
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
        path: `/api/v1/properties/unknown`,
        statusCode: (err as { statusCode?: number }).statusCode || 500,
        requestId: reqId,
        responseTime: Date.now() - startTime,
        environment: partnerCtx.environment,
      });
    }
    return handleApiError(err, reqId);
  }
}
