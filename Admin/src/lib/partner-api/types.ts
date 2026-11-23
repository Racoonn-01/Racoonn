export type PartnerEnvironment = 'production' | 'sandbox';
export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export type PartnerPermission =
  | 'properties:read'
  | 'properties:write'
  | 'rooms:read'
  | 'rooms:write'
  | 'availability:read'
  | 'availability:write'
  | 'rates:read'
  | 'rates:write'
  | 'reservations:read'
  | 'reservations:write'
  | 'reservations:create'
  | 'reservations:update'
  | 'reservations:cancel'
  | 'webhooks:read'
  | 'webhooks:write';

export const ALL_PARTNER_PERMISSIONS: PartnerPermission[] = [
  'properties:read',
  'properties:write',
  'rooms:read',
  'rooms:write',
  'availability:read',
  'availability:write',
  'rates:read',
  'rates:write',
  'reservations:read',
  'reservations:write',
  'reservations:create',
  'reservations:update',
  'reservations:cancel',
  'webhooks:read',
  'webhooks:write',
];

export interface StoredApiKey {
  $id: string;
  name: string;
  partner: string;
  keyPrefix: string;
  keyHash: string;
  environment: PartnerEnvironment;
  status: ApiKeyStatus;
  permissions: PartnerPermission[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string | null;
  lastUsedAt?: string | null;
  rateLimit?: number;
}

export interface PartnerContext {
  apiKeyId: string;
  partner: string;
  name: string;
  environment: PartnerEnvironment;
  permissions: PartnerPermission[];
  rateLimit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasNextPage?: boolean;
    [key: string]: unknown;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type WebhookEventName =
  | 'reservation.created'
  | 'reservation.updated'
  | 'reservation.cancelled'
  | 'availability.updated'
  | 'rate.updated'
  | 'property.updated'
  | 'room.updated';

export interface WebhookPayload<T = unknown> {
  id: string;
  event: WebhookEventName;
  createdAt: string;
  environment: PartnerEnvironment;
  partner: string;
  data: T;
}
