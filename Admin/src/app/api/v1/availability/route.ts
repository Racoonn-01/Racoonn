export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { AvailabilityUpdateSchema } from '@/lib/partner-api/validation/schemas';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'availability:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const url = new URL(req.url);
    const roomId = url.searchParams.get('roomId');
    const propertyId = url.searchParams.get('propertyId');
    const fromDate = url.searchParams.get('from');
    const toDate = url.searchParams.get('to');

    if (propertyId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);
    }

    const queries = [Query.limit(100)];
    if (roomId) queries.push(Query.equal('roomId', roomId));
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
      available: d.availableCount,
      blocked: Boolean(d.isBlocked),
      price: d.price || null,
    }));

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: '/api/v1/availability',
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
    const auth = await authenticatePartnerRequest(req, 'availability:write');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const body = await req.json().catch(() => ({}));
    const parsed = AvailabilityUpdateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid payload', 422, parsed.error.issues);
    }

    const { roomId, date, available, blocked, price, propertyId } = parsed.data;

    // Room validation
    let roomDoc;
    if (roomId === 'TEST_ROOM_001') {
      roomDoc = { $id: 'TEST_ROOM_001', propertyId: 'TEST_PROPERTY_001', name: 'Sandbox Room' };
    } else {
      try {
        roomDoc = await appwriteServer.databases.getDocument(DATABASE_ID, 'rooms', roomId);
      } catch {
        throw new ApiError('RESOURCE_NOT_FOUND', `Room '${roomId}' not found.`, 404);
      }
    }

    const actualPropId = propertyId || roomDoc.propertyId;
    if (actualPropId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, actualPropId);
    }

    // Upsert room_availability record
    const existing = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'room_availability',
      [Query.equal('roomId', roomId), Query.equal('date', date), Query.limit(1)]
    );

    let resultDoc;
    const isBlocked = blocked ?? false;

    if (existing.total > 0) {
      resultDoc = await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        'room_availability',
        existing.documents[0].$id,
        {
          availableCount: available,
          isBlocked,
          ...(price !== undefined ? { price } : {}),
        }
      );
    } else {
      resultDoc = await appwriteServer.databases.createDocument(
        DATABASE_ID,
        'room_availability',
        ID.unique(),
        {
          roomId,
          date,
          availableCount: available,
          isBlocked,
          price: price || 0,
        }
      );
    }

    const resData = {
      roomId: resultDoc.roomId,
      date: resultDoc.date,
      available: resultDoc.availableCount,
      blocked: Boolean(resultDoc.isBlocked),
    };

    // Dispatch Webhook Event
    dispatchWebhookEvent(
      'availability.updated',
      {
        propertyId: actualPropId,
        roomId,
        date,
        available,
        blocked: isBlocked,
      },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'PUT',
      path: '/api/v1/availability',
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({ success: true, data: resData }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
