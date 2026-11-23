export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'reservations:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { reservationId } = await params;

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

    const guests = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'booking_guests',
      [Query.equal('bookingId', reservationId), Query.limit(1)]
    ).catch(() => ({ documents: [] }));

    const guest = guests.documents[0];

    const data = {
      id: bookingDoc.$id,
      externalReference: bookingDoc.otaReferenceId || null,
      propertyId: bookingDoc.hotelId,
      roomId: bookingDoc.roomId,
      status: (bookingDoc.status || 'confirmed').toLowerCase(),
      checkIn: bookingDoc.checkIn,
      checkOut: bookingDoc.checkOut,
      nights: bookingDoc.nights || 1,
      adults: bookingDoc.adults || 1,
      children: bookingDoc.children || 0,
      guest: {
        firstName: guest?.firstName || 'Guest',
        lastName: guest?.lastName || 'User',
        email: guest?.email || 'N/A',
        phone: guest?.phone || 'N/A',
      },
      source: bookingDoc.bookingSource || 'racoonn_direct',
      createdAt: bookingDoc.$createdAt,
      updatedAt: bookingDoc.$updatedAt,
    };

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: `/api/v1/reservations/${reservationId}`,
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ reservationId: string }> }
) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'reservations:update');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { reservationId } = await params;
    const body = await req.json().catch(() => ({}));

    const bookingDoc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      'bookings',
      reservationId
    );

    if (bookingDoc.hotelId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, bookingDoc.hotelId);
    }

    const updates: Record<string, any> = {};
    if (body.adults !== undefined) updates.adults = Number(body.adults);
    if (body.children !== undefined) updates.children = Number(body.children);
    if (body.externalReference) updates.otaReferenceId = body.externalReference;

    const updatedDoc = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      'bookings',
      reservationId,
      updates
    );

    dispatchWebhookEvent(
      'reservation.updated',
      {
        reservationId,
        propertyId: updatedDoc.hotelId,
        roomId: updatedDoc.roomId,
        status: updatedDoc.status,
      },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'PUT',
      path: `/api/v1/reservations/${reservationId}`,
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedDoc.$id,
        propertyId: updatedDoc.hotelId,
        status: updatedDoc.status,
        updatedAt: updatedDoc.$updatedAt,
      },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
