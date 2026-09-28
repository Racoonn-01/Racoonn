export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { BulkAvailabilitySchema } from '@/lib/partner-api/validation/schemas';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'availability:write');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const body = await req.json().catch(() => ({}));
    const parsed = BulkAvailabilitySchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid payload', 422, parsed.error.issues);
    }

    const { propertyId, updates } = parsed.data;

    if (propertyId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);
    }

    const results = [];

    for (const item of updates) {
      try {
        const existing = await appwriteServer.databases.listDocuments(
          DATABASE_ID,
          'room_availability',
          [Query.equal('roomId', item.roomId), Query.equal('date', item.date), Query.limit(1)]
        );

        if (existing.total > 0) {
          await appwriteServer.databases.updateDocument(
            DATABASE_ID,
            'room_availability',
            existing.documents[0].$id,
            {
              availableCount: item.available,
              isBlocked: item.blocked ?? false,
              ...(item.price !== undefined ? { price: item.price } : {}),
            }
          );
        } else {
          await appwriteServer.databases.createDocument(
            DATABASE_ID,
            'room_availability',
            ID.unique(),
            {
              roomId: item.roomId,
              date: item.date,
              availableCount: item.available,
              isBlocked: item.blocked ?? false,
              price: item.price || 0,
            }
          );
        }

        results.push({
          roomId: item.roomId,
          date: item.date,
          status: 'success',
          available: item.available,
        });
      } catch (itemErr) {
        results.push({
          roomId: item.roomId,
          date: item.date,
          status: 'error',
          error: (itemErr as Error).message,
        });
      }
    }

    // Trigger webhook
    dispatchWebhookEvent(
      'availability.updated',
      { propertyId, count: results.length },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'POST',
      path: '/api/v1/availability/bulk',
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data: {
        total: updates.length,
        processed: results.filter((r) => r.status === 'success').length,
        items: results,
      },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
