import { appwriteServer } from '@/lib/appwrite/server';
import { Query, ID } from 'node-appwrite';
import { signWebhookPayload } from '../security/hashing';
import { WebhookEventName, WebhookPayload, PartnerEnvironment } from '../types';

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export async function dispatchWebhookEvent<T = unknown>(
  event: WebhookEventName,
  data: T,
  partner?: string,
  environment: PartnerEnvironment = 'production'
): Promise<void> {
  // Fire and forget delivery dispatch asynchronously
  (async () => {
    try {
      const queries = [Query.equal('status', 'active'), Query.limit(100)];
      if (partner) {
        queries.push(Query.equal('partner', partner));
      }

      const endpoints = await appwriteServer.databases.listDocuments(
        DATABASE_ID,
        'webhook_endpoints',
        queries
      );

      for (const ep of endpoints.documents) {
        const subscribedEvents = Array.isArray(ep.events) ? ep.events : [];
        if (!subscribedEvents.includes(event)) {
          continue;
        }

        const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const payload: WebhookPayload<T> = {
          id: eventId,
          event,
          createdAt: new Date().toISOString(),
          environment,
          partner: ep.partner,
          data,
        };

        const rawBody = JSON.stringify(payload);
        const signature = signWebhookPayload(ep.secret, rawBody);

        deliverWithRetry(ep.$id, ep.url, payload, signature, 1);
      }
    } catch (err) {
      console.warn('[Webhook Dispatch Error]:', (err as Error).message);
    }
  })();
}

async function deliverWithRetry(
  endpointId: string,
  url: string,
  payload: WebhookPayload,
  signature: string,
  attempt: number
): Promise<void> {
  const maxAttempts = 5;
  const backoffDelaysMs = [0, 30_000, 120_000, 600_000, 1_800_000]; // 0s, 30s, 2m, 10m, 30m
  const delay = backoffDelaysMs[attempt - 1] || 30_000;

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const startTime = Date.now();
  let status: 'success' | 'failed' | 'retrying' = 'failed';
  let httpStatus: number | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Racoonn-Signature': signature,
        'X-Racoonn-Event': payload.event,
        'X-Racoonn-Delivery': payload.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    httpStatus = res.status;
    const isSuccess = res.status >= 200 && res.status < 300;
    if (isSuccess) {
      status = 'success';
    } else {
      errorMessage = `HTTP error ${res.status}: ${res.statusText}`;
      if (attempt < maxAttempts && (res.status >= 500 || res.status === 429)) {
        status = 'retrying';
      }
    }
  } catch (err) {
    errorMessage = (err as Error).message;
    if (attempt < maxAttempts) {
      status = 'retrying';
    }
  }

  const responseTime = Date.now() - startTime;

  // Record delivery log
  try {
    await appwriteServer.databases.createDocument(
      DATABASE_ID,
      'webhook_deliveries',
      ID.unique(),
      {
        webhookEndpointId: endpointId,
        eventId: payload.id,
        eventType: payload.event,
        attempt,
        status,
        httpStatus: httpStatus || 0,
        responseTime,
        error: errorMessage ? errorMessage.slice(0, 1000) : '',
        deliveredAt: new Date().toISOString(),
        payload: JSON.stringify(payload).slice(0, 10000),
      }
    );

    if (status === 'success') {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        'webhook_endpoints',
        endpointId,
        { lastDeliveryAt: new Date().toISOString() }
      );
    }
  } catch (logErr) {
    console.warn('[Webhook Delivery Log Failed]:', (logErr as Error).message);
  }

  if (status === 'retrying' && attempt < maxAttempts) {
    deliverWithRetry(endpointId, url, payload, signature, attempt + 1);
  }
}
