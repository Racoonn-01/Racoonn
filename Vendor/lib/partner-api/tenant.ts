import { appwriteServer } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';
import { ApiError } from './errors/api-error';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

/**
 * Returns list of property IDs this API key or partner is allowed to access.
 * If no specific mappings exist in integration_property_access, defaults to all active properties.
 * If specific mappings exist, only allows explicitly mapped property IDs.
 */
export async function getAuthorizedPropertyIds(apiKeyId: string, partner: string): Promise<string[] | null> {
  try {
    const mappings = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      'integration_property_access',
      [
        Query.equal('partner', partner),
        Query.equal('status', 'active'),
        Query.limit(500),
      ]
    );

    if (mappings.total === 0) {
      // No restricted tenant mappings configured: partner has access to all assigned inventory
      return null;
    }

    // Return restricted list
    return mappings.documents.map((m) => m.propertyId);
  } catch (err) {
    console.warn('[Tenant Access Check Error]:', (err as Error).message);
    return null;
  }
}

/**
 * Validates that a requested property is accessible by this partner.
 */
export async function assertPropertyAccess(apiKeyId: string, partner: string, propertyId: string): Promise<void> {
  const allowed = await getAuthorizedPropertyIds(apiKeyId, partner);
  if (allowed !== null && !allowed.includes(propertyId)) {
    throw new ApiError(
      'FORBIDDEN_PROPERTY',
      'The authenticated partner is not authorized to access this property.',
      403
    );
  }
}
