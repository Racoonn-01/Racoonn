import { NextRequest } from 'next/server';
import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { hashApiKey } from './security/hashing';
import { checkRateLimit } from './security/rate-limit';
import { ApiError } from './errors/api-error';
import { PartnerContext, PartnerPermission } from './types';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export interface GuardResult {
  partner: PartnerContext;
  requestId: string;
}

export async function authenticatePartnerRequest(
  req: NextRequest,
  requiredPermission?: PartnerPermission
): Promise<GuardResult> {
  const requestId = req.headers.get('x-request-id') || `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    throw new ApiError(
      'MISSING_AUTHORIZATION',
      'Missing Authorization header. Expected Bearer <api_key>.',
      401
    );
  }

  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    throw new ApiError(
      'INVALID_AUTHORIZATION_FORMAT',
      'Invalid Authorization header format. Format: Bearer <api_key>.',
      401
    );
  }

  const rawApiKey = parts[1];
  if (!rawApiKey.startsWith('rac_live_partner_') && !rawApiKey.startsWith('rac_test_partner_')) {
    throw new ApiError(
      'INVALID_API_KEY',
      'The API key is invalid or has been revoked.',
      401
    );
  }

  const keyHash = hashApiKey(rawApiKey);

  // Lookup API key in Appwrite
  let keyDocs;
  try {
    keyDocs = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'integration_api_keys',
      [Query.equal('keyHash', keyHash), Query.limit(1)]
    );
  } catch (err) {
    console.error('[DB Lookup error during partner auth]:', err);
    throw new ApiError('AUTH_SERVICE_UNAVAILABLE', 'Authentication service is temporarily unavailable.', 503);
  }

  if (keyDocs.total === 0) {
    throw new ApiError(
      'INVALID_API_KEY',
      'The API key is invalid or has been revoked.',
      401
    );
  }

  const keyDoc = keyDocs.documents[0];

  if (keyDoc.status !== 'active') {
    throw new ApiError(
      'KEY_REVOKED',
      `The API key has been ${keyDoc.status || 'revoked'}.`,
      401
    );
  }

  if (keyDoc.expiresAt) {
    const expires = new Date(keyDoc.expiresAt).getTime();
    if (Date.now() > expires) {
      throw new ApiError(
        'KEY_EXPIRED',
        'The API key has expired.',
        401
      );
    }
  }

  // Rate Limiting
  const rateLimitResult = checkRateLimit(
    keyDoc.$id,
    keyDoc.environment || 'production',
    keyDoc.rateLimit
  );

  if (!rateLimitResult.allowed) {
    const error = new ApiError(
      'RATE_LIMIT_EXCEEDED',
      'Rate limit exceeded. Please slow down your requests.',
      429
    );
    error.details = { retryAfterSeconds: rateLimitResult.retryAfterSeconds };
    throw error;
  }

  // Permission Check
  const permissions: PartnerPermission[] = Array.isArray(keyDoc.permissions)
    ? keyDoc.permissions
    : [];

  if (requiredPermission && !permissions.includes(requiredPermission)) {
    throw new ApiError(
      'INSUFFICIENT_PERMISSIONS',
      `This API key does not have the required permission: [${requiredPermission}].`,
      403
    );
  }

  // Update lastUsedAt asynchronously
  (async () => {
    try {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        'integration_api_keys',
        keyDoc.$id,
        { lastUsedAt: new Date().toISOString() }
      );
    } catch {
      // Ignore background write failure
    }
  })();

  const partnerContext: PartnerContext = {
    apiKeyId: keyDoc.$id,
    partner: keyDoc.partner,
    name: keyDoc.name,
    environment: keyDoc.environment || 'production',
    permissions,
    rateLimit: keyDoc.rateLimit || (keyDoc.environment === 'sandbox' ? 100 : 1000),
  };

  return { partner: partnerContext, requestId };
}
