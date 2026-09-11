export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { authenticatePartnerRequest } from '@/lib/partner-api/middleware';
import { handleApiError, ApiError } from '@/lib/partner-api/errors/api-error';
import { logPartnerApiRequest } from '@/lib/partner-api/security/audit-log';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  let partnerCtx;
  let reqId = 'req_init';

  try {
    const auth = await authenticatePartnerRequest(req, 'webhooks:write');
    partnerCtx = auth.partner;
    reqId = auth.requestId;

    const { id } = await params;

    let doc;
    try {
      doc = await appwriteServer.databases.getDocument(DATABASE_ID, 'webhook_endpoints', id);
    } catch {
      throw new ApiError('RESOURCE_NOT_FOUND', `Webhook endpoint '${id}' was not found.`, 404);
    }

    if (doc.partner !== partnerCtx.partner) {
      throw new ApiError('FORBIDDEN', 'You do not have permission to delete this webhook endpoint.', 403);
    }

    await appwriteServer.databases.deleteDocument(DATABASE_ID, 'webhook_endpoints', id);

    logPartnerApiRequest({
      partner: partnerCtx.partner,
      apiKeyId: partnerCtx.apiKeyId,
      method: 'DELETE',
      path: `/api/v1/webhooks/endpoints/${id}`,
      statusCode: 200,
      requestId: reqId,
      responseTime: Date.now() - startTime,
      environment: partnerCtx.environment,
    });

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
    }, { headers: { 'X-Request-ID': reqId } });
  } catch (err) {
    return handleApiError(err, reqId);
  }
}
