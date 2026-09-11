export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';
import { generateWebhookSecret } from '@/lib/partner-api/security/hashing';
import { WebhookEndpointCreateSchema } from '@/lib/partner-api/validation/schemas';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'webhooks:read');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const endpoints = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'webhook_endpoints',
      [Query.equal('partner', partnerCtx.partner), Query.limit(50)]
    );

    const data = endpoints.documents.map((e) => ({
      id: e.$id,
      partner: e.partner,
      url: e.url,
      events: e.events || [],
      status: e.status,
      secretPrefix: `${e.secret.slice(0, 10)}••••••••`,
      createdAt: e.$createdAt,
      lastDeliveryAt: e.lastDeliveryAt || null,
    }));

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'GET',
      path: '/api/v1/webhooks/endpoints',
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

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'webhooks:write');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const body = await req.json().catch(() => ({}));
    const parsed = WebhookEndpointCreateSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError('VALIDATION_ERROR', parsed.error.issues[0]?.message || 'Invalid webhook payload', 422, parsed.error.issues);
    }

    const secret = generateWebhookSecret();

    const doc = await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'webhook_endpoints',
      ID.unique(),
      {
        partner: partnerCtx.partner,
        apiKeyId: partnerCtx.apiKeyId,
        url: parsed.data.url,
        events: parsed.data.events,
        status: 'active',
        secret,
      }
    );

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'POST',
      path: '/api/v1/webhooks/endpoints',
      statusCode: 201,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    // Secret is returned ONLY once during creation
    return NextResponse.json({
      success: true,
      data: {
        id: doc.$id,
        partner: doc.partner,
        url: doc.url,
        events: doc.events,
        status: doc.status,
        secret,
        createdAt: doc.$createdAt,
      },
      meta: {
        note: 'Save this webhook secret now. It is used to verify HMAC SHA-256 signatures and will not be displayed again.',
      },
    }, { status: 201, headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
