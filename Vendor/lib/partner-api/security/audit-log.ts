import { appwriteServer } from '@/lib/appwrite/server';
import { ID } from 'node-appwrite';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

interface AuditLogEntry {
  partner: string;
  apiKeyId?: string;
  method: string;
  path: string;
  statusCode: number;
  requestId: string;
  responseTime: number;
  ip?: string;
  environment?: string;
}

/**
 * Asynchronously logs sanitized request metadata to Appwrite integration_api_logs.
 * Never blocks client execution or logs sensitive fields (auth tokens, passwords, card data).
 */
export function logPartnerApiRequest(entry: AuditLogEntry): void {
  // Fire and forget to not delay request latency
  (async () => {
    try {
      await appwriteServer.databases.createDocument(
        DATABASE_ID,
        'integration_api_logs',
        ID.unique(),
        {
          partner: entry.partner,
          apiKeyId: entry.apiKeyId || '',
          method: entry.method,
          path: entry.path.slice(0, 500),
          statusCode: entry.statusCode,
          requestId: entry.requestId,
          responseTime: entry.responseTime,
          ip: entry.ip ? entry.ip.slice(0, 128) : '',
          environment: entry.environment || 'production',
        }
      );
    } catch (e) {
      console.warn('[Partner API Audit Log Error]:', (e as Error).message);
    }
  })();
}
