import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import crypto from 'crypto';
import { ApiError } from '../errors/api-error';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function checkIdempotency(
  partner: string,
  idempotencyKey: string,
  endpoint: string,
  requestPayload: unknown
): Promise<{ cachedResponse: unknown | null; recordId?: string }> {
  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(requestPayload || {}))
    .digest('hex');

  try {
    const existing = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'integration_idempotency_keys',
      [
        Query.equal('partner', partner),
        Query.equal('idempotencyKey', idempotencyKey),
        Query.limit(1),
      ]
    );

    if (existing.total > 0) {
      const doc = existing.documents[0];
      if (doc.requestHash !== requestHash) {
        throw new ApiError(
          'IDEMPOTENCY_MISMATCH',
          'Idempotency-Key was previously used with different request parameters.',
          409
        );
      }

      if (doc.status === 'completed' && doc.response) {
        try {
          return { cachedResponse: JSON.parse(doc.response) };
        } catch {
          return { cachedResponse: doc.response };
        }
      }

      if (doc.status === 'in_progress') {
        throw new ApiError(
          'CONCURRENT_REQUEST',
          'A request with this Idempotency-Key is currently being processed.',
          409
        );
      }
    }

    // Reserve idempotency record
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const created = await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'integration_idempotency_keys',
      ID.unique(),
      {
        partner,
        idempotencyKey,
        endpoint,
        requestHash,
        response: '',
        status: 'in_progress',
        expiresAt,
      }
    );

    return { cachedResponse: null, recordId: created.$id };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.warn('[Idempotency Store Error]:', (err as Error).message);
    return { cachedResponse: null };
  }
}

export async function saveIdempotencyResponse(
  recordId: string | undefined,
  partner: string,
  idempotencyKey: string,
  response: unknown
): Promise<void> {
  if (!recordId) return;
  try {
    await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      'integration_idempotency_keys',
      recordId,
      {
        response: JSON.stringify(response).slice(0, 10000),
        status: 'completed',
      }
    );
  } catch (err) {
    console.warn('[Idempotency Complete Error]:', (err as Error).message);
  }
}
