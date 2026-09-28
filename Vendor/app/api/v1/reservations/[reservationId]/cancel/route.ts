export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { CancelReservationSchema } from '@/lib/partner-api/validation/schemas';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'reservations:cancel');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { reservationId } = await params;
    const body = await req.json().catch(() => ({}));
    const parsed = CancelReservationSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid cancel payload', 422, parsed.error.issues);
    }

    let bookingDoc;
    try {
      bookingDoc = await appwriteServer.databases.getDocument(
        DATABASE_ID,
        'bookings',
        reservationId
      );
    } catch {
      throw new ApiError('RESOURCE_NOT_FOUND', `Reservation '${reservationId}' was not found.`, 404);
    }

    if (bookingDoc.hotelId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, bookingDoc.hotelId);
    }

    if (bookingDoc.status?.toLowerCase() === 'cancelled') {
      return NextResponse.json({
        success: true,
        data: {
          id: bookingDoc.$id,
          status: 'cancelled',
          message: 'Reservation is already cancelled.',
        },
      }, { headers: { 'X-Request-ID': reqId } });
    }

    // 1. Update Booking status to Cancelled
    const updated = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      'bookings',
      reservationId,
      {
        status: 'Cancelled',
      }
    );

    // 2. Restore Availability for the dates of the cancelled reservation
    try {
      const checkInDate = new Date(bookingDoc.checkIn);
      const checkOutDate = new Date(bookingDoc.checkOut);

      const availRecords = await appwriteServer.databases.listDocuments(
        DATABASE_ID,
        'room_availability',
        [
          Query.equal('roomId', bookingDoc.roomId),
          Query.greaterThanEqual('date', bookingDoc.checkIn),
          Query.lessThan('date', bookingDoc.checkOut),
        ]
      );

      for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const match = availRecords.documents.find((r) => r.date === dateStr);
        if (match) {
          await appwriteServer.databases.updateDocument(
            DATABASE_ID,
            'room_availability',
            match.$id,
            { availableCount: match.availableCount + 1 }
          );
        }
      }
    } catch (availErr) {
      console.warn('[Availability Restoration Note]:', (availErr as Error).message);
    }

    // 3. Dispatch Webhook Event
    dispatchWebhookEvent(
      'reservation.cancelled',
      {
        reservationId,
        propertyId: bookingDoc.hotelId,
        roomId: bookingDoc.roomId,
        reason: parsed.data.reason,
        status: 'cancelled',
      },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'POST',
      path: `/api/v1/reservations/${reservationId}/cancel`,
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.$id,
        status: 'cancelled',
        cancelledAt: updated.$updatedAt,
        reason: parsed.data.reason,
      },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
