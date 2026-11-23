import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

let firebaseInitialized = false;

/**
 * Initializes the Firebase Admin SDK if credentials exist
 */
export function initFirebaseAdmin(): boolean {
  if (firebaseInitialized) return true;
  if (getApps().length > 0) {
    firebaseInitialized = true;
    return true;
  }

  try {
    const serviceAccountPath =
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      path.join(__dirname, '../config/firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized with service account.');
      return true;
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized from env.');
      return true;
    }
  } catch (err: any) {
    console.warn('⚠️ Firebase Admin SDK initialization skipped:', err.message);
  }
  return false;
}

/**
 * Sends push notification directly through Firebase Cloud Messaging (HTTP v1)
 */
export async function sendFcmDirectMessage(options: {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string;
}) {
  if (!initFirebaseAdmin()) {
    return { success: false, reason: 'Firebase Admin credentials not configured' };
  }

  const { tokens, title, body, data = {}, channelId = 'default' } = options;

  if (!tokens || tokens.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const message = {
      tokens,
      notification: {
        title,
        body,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId,
          icon: 'ic_launcher',
          color: '#FF5A5F',
          sound: 'default',
        },
      },
      data,
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(
      `🔥 Direct FCM sent: ${response.successCount} success, ${response.failureCount} failed`
    );
    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (err: any) {
    console.error('🔥 Direct FCM send error:', err.message);
    return { success: false, error: err.message };
  }
}
