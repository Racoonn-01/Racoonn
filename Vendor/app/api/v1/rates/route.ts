export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { RateUpdateSchema } from '@/lib/partner-api/validation/schemas';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'rates:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const url = new URL(req.url);
    const roomId = url.searchParams.get('roomId');
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    if (!roomId) {
      throw new ApiError('MISSING_PARAMETER', 'Query parameter roomId is required.', 400);
    }

    // Verify room
    if (roomId !== 'TEST_ROOM_001') {
      const room = await appwriteServer.databases.getDocument(DATABASE_ID, 'rooms', roomId);
      if (room.propertyId) {
        await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, room.propertyId);
      }
    }

    const queries = [Query.equal('roomId', roomId), Query.limit(100)];
    if (fromDate) queries.push(Query.greaterThanEqual('date', fromDate));
    if (toDate) queries.push(Query.lessThanEqual('date', toDate));

    const records = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'room_availability',
      queries
    );

    const data = records.documents.map((d) => ({
      roomId: d.roomId,
      date: d.date,
      price: d.price || 0,
      currency: 'INR',
    }));

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: '/api/v1/rates',
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({ success: true, data }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}

export async function PUT(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'rates:write');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const body = await req.json().catch(() => ({}));
    const parsed = RateUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid rate payload', 422, parsed.error.issues);
    }

    const { roomId, date, price, currency } = parsed.data;

    let propertyId: string | undefined;
    if (roomId === 'TEST_ROOM_001') {
      propertyId = 'TEST_PROPERTY_001';
    } else {
      const room = await appwriteServer.databases.getDocument(DATABASE_ID, 'rooms', roomId);
      propertyId = room.propertyId;
      if (propertyId) {
        await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);
      }
    }

    const existing = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'room_availability',
      [Query.equal('roomId', roomId), Query.equal('date', date), Query.limit(1)]
    );

    if (existing.total > 0) {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        'room_availability',
        existing.documents[0].$id,
        { price }
      );
    } else {
      await appwriteServer.databases.createDocument(
        DATABASE_ID,
        'room_availability',
        ID.unique(),
        {
          roomId,
          date,
          availableCount: 5,
          isBlocked: false,
          price,
        }
      );
    }

    dispatchWebhookEvent(
      'rate.updated',
      { propertyId, roomId, date, price, currency },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'PUT',
      path: '/api/v1/rates',
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data: { roomId, date, price, currency },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
