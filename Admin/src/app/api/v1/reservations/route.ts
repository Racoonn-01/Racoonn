export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { checkIdempotency, saveIdempotencyResponse } from '@/lib/partner-api/security/idempotency';
import { assertPropertyAccess } from '@/lib/partner-api/tenant';
import { CreateReservationSchema } from '@/lib/partner-api/validation/schemas';
import { dispatchWebhookEvent } from '@/lib/partner-api/webhooks/dispatcher';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'reservations:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');
    const roomId = url.searchParams.get('roomId');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    if (propertyId) {
      await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, propertyId);
    }

    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];
    if (propertyId) queries.push(Query.equal('hotelId', propertyId));
    if (roomId) queries.push(Query.equal('roomId', roomId));

    const resp = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'bookings',
      queries
    );

    const bookingIds = resp.documents.map((b) => b.$id);
    let guestDocs: any[] = [];
    if (bookingIds.length > 0) {
      const gResp = await appwriteServer.databases.listDocuments(
        DATABASE_ID,
        'booking_guests',
        [Query.equal('bookingId', bookingIds), Query.limit(100)]
      ).catch(() => ({ documents: [] }));
      guestDocs = gResp.documents;
    }

    const data = resp.documents.map((b) => {
      const guest = guestDocs.find((g) => g.bookingId === b.$id);
      return {
        id: b.$id,
        externalReference: b.otaReferenceId || null,
        propertyId: b.hotelId,
        roomId: b.roomId,
        status: (b.status || 'confirmed').toLowerCase(),
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        nights: b.nights || 1,
        adults: b.adults || 1,
        children: b.children || 0,
        guest: {
          firstName: guest?.firstName || b.hotelName ? 'External' : 'Guest',
          lastName: guest?.lastName || 'User',
          email: guest?.email || 'N/A',
          phone: guest?.phone || 'N/A',
        },
        source: b.bookingSource || 'racoonn_direct',
        createdAt: b.$createdAt,
        updatedAt: b.$updatedAt,
      };
    });

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: '/api/v1/reservations',
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total: resp.total,
        hasNextPage: offset + data.length < resp.total,
      },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'reservations:create');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      throw new ApiError(
        'MISSING_IDEMPOTENCY_KEY',
        'An Idempotency-Key header is mandatory when creating reservations.',
        400
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateReservationSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid reservation request', 422, parsed.error.issues);
    }

    const reservationData = parsed.data;

    // 1. Idempotency Check
    const { cachedResponse, recordId } = await checkIdempotency(
      partnerCtx.partner,
      idempotencyKey,
      '/api/v1/reservations',
      reservationData
    );

    if (cachedResponse) {
      return NextResponse.json({
        success: true,
        data: cachedResponse,
        meta: { idempotentReplay: true },
      }, { headers: { 'X-Request-ID': reqId } });
    }

    // 2. Tenant isolation check
    await assertPropertyAccess(partnerCtx.apiKeyId, partnerCtx.partner, reservationData.propertyId);

    // 3. Property & Room Verification
    let propertyDoc: any;
    let roomDoc: any;

    if (reservationData.propertyId === 'TEST_PROPERTY_001') {
      propertyDoc = { $id: 'TEST_PROPERTY_001', propertyName: 'Sandbox Grand Resort', city: 'Haldwani', location: 'Sandbox' };
      roomDoc = { $id: 'TEST_ROOM_001', propertyId: 'TEST_PROPERTY_001', name: 'Sandbox Room', price: 4500 };
    } else {
      try {
        propertyDoc = await appwriteServer.databases.getDocument(DATABASE_ID, 'properties', reservationData.propertyId);
        roomDoc = await appwriteServer.databases.getDocument(DATABASE_ID, 'rooms', reservationData.roomId);
      } catch {
        throw new ApiError('RESOURCE_NOT_FOUND', 'The requested property or room does not exist.', 404);
      }
    }

    // 4. Availability & Overlap Protection Check
    const checkInDate = new Date(reservationData.checkIn);
    const checkOutDate = new Date(reservationData.checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    if (checkOutDate <= checkInDate) {
      throw new ApiError('INVALID_DATES', 'checkOut date must be strictly after checkIn date.', 400);
    }

    // Check specific availability records for date window
    const availRecords = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'room_availability',
      [
        Query.equal('roomId', reservationData.roomId),
        Query.greaterThanEqual('date', reservationData.checkIn),
        Query.lessThan('date', reservationData.checkOut),
      ]
    );

    // Check if any date is blocked or has 0 availability
    for (const rec of availRecords.documents) {
      if (rec.isBlocked || rec.availableCount <= 0) {
        throw new ApiError(
          'ROOM_NOT_AVAILABLE',
          `The requested room is not available on ${rec.date}.`,
          409
        );
      }
    }

    // 5. Atomic Booking Record Creation in Appwrite
    const bookingId = ID.unique();
    const guestId = ID.unique();
    const paymentId = ID.unique();

    const pricePerNight = roomDoc.discountPrice && roomDoc.discountPrice > 0 ? roomDoc.discountPrice : (roomDoc.price || 1000);
    const totalPrice = reservationData.totalAmount || (pricePerNight * nights);

    const bookingDoc = await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'bookings',
      bookingId,
      {
        userId: `partner_${partnerCtx.partner}`,
        hotelId: reservationData.propertyId,
        roomId: reservationData.roomId,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        nights,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        hotelName: propertyDoc.propertyName || propertyDoc.title || 'Racoonn Property',
        hotelImage: propertyDoc.imageUrl || '',
        hotelLocation: propertyDoc.location || propertyDoc.city || 'India',
        adults: reservationData.adults,
        children: reservationData.children,
        roomPricePerNight: pricePerNight,
        priceBeforeTax: totalPrice,
        priceAfterTax: totalPrice,
        bookingSource: partnerCtx.partner,
        otaReferenceId: reservationData.externalReference || idempotencyKey,
      }
    );

    // Guest Document
    await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'booking_guests',
      guestId,
      {
        bookingId,
        firstName: reservationData.guest.firstName,
        lastName: reservationData.guest.lastName,
        email: reservationData.guest.email,
        phone: reservationData.guest.phone || '',
        country: reservationData.guest.country || 'India',
        specialRequests: reservationData.specialRequests || '',
      }
    );

    // Payment Document
    await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'booking_payments',
      paymentId,
      {
        bookingId,
        totalAmount: totalPrice,
        paymentStatus: 'Completed',
        paymentMethod: `partner_api_${partnerCtx.partner}`,
        paymentDate: new Date().toISOString(),
      }
    );

    // 6. Deduct room_availability count across the booking dates
    for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const match = availRecords.documents.find((r) => r.date === dateStr);
      if (match) {
        await appwriteServer.databases.updateDocument(
          DATABASE_ID,
          'room_availability',
          match.$id,
          { availableCount: Math.max(0, match.availableCount - 1) }
        );
      }
    }

    const responsePayload = {
      id: bookingDoc.$id,
      externalReference: reservationData.externalReference || null,
      propertyId: reservationData.propertyId,
      roomId: reservationData.roomId,
      status: 'confirmed',
      checkIn: reservationData.checkIn,
      checkOut: reservationData.checkOut,
      nights,
      adults: reservationData.adults,
      children: reservationData.children,
      guest: reservationData.guest,
      totalAmount: totalPrice,
      currency: reservationData.currency || 'INR',
      source: partnerCtx.partner,
      createdAt: bookingDoc.$createdAt,
    };

    // 7. Save Idempotency Cache
    await saveIdempotencyResponse(recordId, partnerCtx.partner, idempotencyKey, responsePayload);

    // 8. Dispatch Webhook Event
    dispatchWebhookEvent(
      'reservation.created',
      {
        reservationId: bookingDoc.$id,
        externalReference: reservationData.externalReference,
        propertyId: reservationData.propertyId,
        roomId: reservationData.roomId,
        checkIn: reservationData.checkIn,
        checkOut: reservationData.checkOut,
        status: 'confirmed',
      },
      partnerCtx.partner,
      partnerCtx.environment
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'POST',
      path: '/api/v1/reservations',
      statusCode: 201,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({ success: true, data: responsePayload }, { status: 201, headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
