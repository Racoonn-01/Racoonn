import crypto from 'crypto';
import { PartnerEnvironment } from '../types';

/**
 * Generates a cryptographically secure random Partner API Key.
 * Format:
 * Production: rac_live_partner_<48 hex chars>
 * Sandbox:    rac_test_partner_<48 hex chars>
 */
export function generatePartnerApiKey(environment: PartnerEnvironment = 'production'): {
  rawKey: string;
  keyPrefix: string;
  keyHash: string;
} {
  const envPrefix = environment === 'production' ? 'rac_live_partner_' : 'rac_test_partner_';
  const randomSecret = crypto.randomBytes(24).toString('hex'); // 48 chars
  const rawKey = `${envPrefix}${randomSecret}`;
  const keyPrefix = rawKey.substring(0, envPrefix.length + 8); // e.g. rac_live_partner_7f82c1a4
  const keyHash = hashApiKey(rawKey);

  return { rawKey, keyPrefix, keyHash };
}

/**
 * Hashes an API key using SHA-256 for secure DB lookup and storage.
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey.trim()).digest('hex');
}

/**
 * Computes an HMAC SHA-256 hex signature for outbound webhook payloads.
 */
export function signWebhookPayload(secret: string, rawBody: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

/**
 * Constant-time signature verification to prevent timing attacks.
 */
export function verifyWebhookSignature(secret: string, rawBody: string, signature: string): boolean {
  const expected = signWebhookPayload(secret, rawBody);
  const bufExpected = Buffer.from(expected, 'utf8');
  const bufReceived = Buffer.from(signature, 'utf8');

  if (bufExpected.length !== bufReceived.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufExpected, bufReceived);
}

/**
 * Generates a random secret for webhook endpoints.
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`;
}
