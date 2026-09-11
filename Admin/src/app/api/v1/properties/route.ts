export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { getAuthorizedPropertyIds } from '@/lib/partner-api/tenant';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'properties:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const offset = (page - 1) * limit;

    // Tenant isolation check
    const allowedPropertyIds = await getAuthorizedPropertyIds(partnerCtx.apiKeyId, partnerCtx.partner);

    const queries = [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')];

    // If sandbox environment, prioritize sandbox mock properties if present
    if (partnerCtx.environment === 'sandbox') {
      // Sandbox mode: allowed to retrieve properties
    }

    if (allowedPropertyIds !== null) {
      if (allowedPropertyIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
          meta: { page, limit, total: 0, hasNextPage: false },
        }, { headers: { 'X-Request-ID': reqId } });
      }
      queries.push(Query.equal('$id', allowedPropertyIds));
    }

    const resp = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'properties',
      queries
    );

    const data = resp.documents.map((p) => ({
      id: p.$id,
      name: p.propertyName || p.title || 'Racoonn Property',
      type: p.propertyType || 'Hotel',
      status: (p.status || 'active').toLowerCase(),
      address: {
        city: p.city || '',
        state: p.state || '',
        country: 'IN',
        location: p.location || '',
      },
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      rating: p.rating || null,
      reviewsCount: p.reviewsCount || 0,
      createdAt: p.$createdAt,
      updatedAt: p.$updatedAt,
    }));

    const total = resp.total;
    const hasNextPage = offset + data.length < total;

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: '/api/v1/properties',
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
        total,
        hasNextPage,
      },
    }, {
      headers: { 'X-Request-ID': reqId },
    });
  } catch (err) {
    if (partnerCtx) {
      logPartnerApiRequest({
        partner: partnerCtx.partner,
        apiKeyId: partnerCtx.apiKeyId,
        method: 'GET',
        path: '/api/v1/properties',
        statusCode: (err as { statusCode?: number }).statusCode || 500,
        requestId: reqId,
        responseTime: Date.now() - startTime,
        environment: partnerCtx.environment,
      });
    }
    return handleApiError(err, reqId);
  }
}
