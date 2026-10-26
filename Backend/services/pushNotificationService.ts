import { Client, Databases, Query, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { sendFcmDirectMessage } from './firebaseDirectService';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

const TOKENS_COLLECTION = 'user_device_tokens';
const NOTIFICATIONS_COLLECTION = 'user_notifications';
const PROFILES_COLLECTION = 'userprofiles';

export interface ExpoPushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
  badge?: number;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded';
    [key: string]: any;
  };
}

export interface NotificationPayload {
  title: string;
  body: string;
  category?: 'booking' | 'payment' | 'cancellation' | 'reminder' | 'vendor' | 'promo' | 'system';
  data?: Record<string, any>;
  sound?: 'default' | null;
  channelId?: string;
}

export interface NotificationPreferences {
  bookings: boolean;
  reminders: boolean;
  promos: boolean;
  system: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  bookings: true,
  reminders: true,
  promos: true,
  system: true,
};

/**
 * Validates if a token is a valid Expo push token format
 */
export function isExpoPushToken(token: string): boolean {
  if (typeof token !== 'string') return false;
  return /^(ExponentPushToken|ExpoPushToken)\[.*\]$/.test(token);
}

/**
 * Registers or updates a device push token for a user
 */
export async function registerDeviceToken(input: {
  userId: string;
  pushToken: string;
  platform: 'android' | 'ios' | 'web';
  deviceIdentifier: string;
  deviceName?: string;
}) {
  const { userId, pushToken, platform, deviceIdentifier, deviceName = 'Mobile Device' } = input;

  if (!userId || !pushToken) {
    throw new Error('userId and pushToken are required to register device token.');
  }

  const now = new Date().toISOString();

  try {
    // Check if token already exists for this user and device
    const existing = await databases.listDocuments(dbId, TOKENS_COLLECTION, [
      Query.equal('userId', userId),
      Query.equal('pushToken', pushToken),
      Query.limit(1),
    ]);

    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      await databases.updateDocument(dbId, TOKENS_COLLECTION, doc.$id, {
        isActive: true,
        lastActiveAt: now,
        deviceIdentifier,
        deviceName,
        platform,
      });
      return { success: true, updated: true, id: doc.$id };
    }

    // Create new device registration
    const created = await databases.createDocument(dbId, TOKENS_COLLECTION, ID.unique(), {
      userId,
      pushToken,
      platform,
      deviceIdentifier,
      deviceName,
      isActive: true,
      lastActiveAt: now,
      createdAt: now,
    });

    return { success: true, created: true, id: created.$id };
  } catch (err: any) {
    console.error('[PushNotificationService] Failed to register device token:', err.message);
    throw err;
  }
}

/**
 * Deactivates device token on logout
 */
export async function unregisterDeviceToken(userId: string, pushToken?: string) {
  try {
    const queries = [Query.equal('userId', userId)];
    if (pushToken) {
      queries.push(Query.equal('pushToken', pushToken));
    }

    const docs = await databases.listDocuments(dbId, TOKENS_COLLECTION, queries);
    for (const doc of docs.documents) {
      await databases.updateDocument(dbId, TOKENS_COLLECTION, doc.$id, {
        isActive: false,
        lastActiveAt: new Date().toISOString(),
      });
    }
    return { success: true, deactivatedCount: docs.documents.length };
  } catch (err: any) {
    console.error('[PushNotificationService] Failed to unregister device token:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Reads user's notification preferences from userprofiles collection
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    let profile = await databases.getDocument(dbId, PROFILES_COLLECTION, userId).catch(() => null);
    if (!profile) {
      const list = await databases.listDocuments(dbId, PROFILES_COLLECTION, [
        Query.equal('userId', userId),
        Query.limit(1),
      ]).catch(() => ({ documents: [] }));
      if (list.documents.length > 0) profile = list.documents[0];
    }
    if (!profile || !profile.notificationPreferences) {
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(profile.notificationPreferences);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Updates user's notification preferences
 */
export async function updateUserPreferences(userId: string, prefs: Partial<NotificationPreferences>) {
  try {
    const current = await getUserPreferences(userId);
    const updated = { ...current, ...prefs };

    let profile = await databases.getDocument(dbId, PROFILES_COLLECTION, userId).catch(() => null);
    if (!profile) {
      const list = await databases.listDocuments(dbId, PROFILES_COLLECTION, [
        Query.equal('userId', userId),
        Query.limit(1),
      ]).catch(() => ({ documents: [] }));
      if (list.documents.length > 0) profile = list.documents[0];
    }

    if (profile) {
      await databases.updateDocument(dbId, PROFILES_COLLECTION, profile.$id, {
        notificationPreferences: JSON.stringify(updated),
      });
    } else {
      await databases.createDocument(dbId, PROFILES_COLLECTION, userId, {
        userId,
        email: `${userId}@placeholder.local`,
        name: 'Racoonn Traveler',
        role: 'Customer',
        notificationPreferences: JSON.stringify(updated),
      }).catch(() => null);
    }

    return { success: true, preferences: updated };
  } catch (err: any) {
    console.error('[PushNotificationService] Failed to update user preferences:', err.message);
    return { success: true, preferences: { ...DEFAULT_PREFERENCES, ...prefs } };
  }
}

/**
 * Persists a notification entry to user_notifications in Appwrite
 */
export async function saveInAppNotification(userId: string, payload: NotificationPayload) {
  try {
    const now = new Date().toISOString();
    const doc = await databases.createDocument(dbId, NOTIFICATIONS_COLLECTION, ID.unique(), {
      userId,
      title: payload.title,
      message: payload.body,
      category: payload.category || 'system',
      read: false,
      data: payload.data ? JSON.stringify(payload.data) : '',
      createdAt: now,
    });
    return doc;
  } catch (err: any) {
    console.error('[PushNotificationService] Failed to save in-app notification:', err.message);
    return null;
  }
}

/**
 * Sends a batch of push messages using the official Expo Push Notification API.
 * Free delivery cost (₹0) using FCM/APNs relay.
 */
export async function sendExpoPushBatches(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (!messages || messages.length === 0) return [];

  // Filter only valid Expo tokens
  const validMessages = messages.filter(m => {
    const tokens = Array.isArray(m.to) ? m.to : [m.to];
    return tokens.some(t => isExpoPushToken(t));
  });

  if (validMessages.length === 0) {
    return [];
  }

  // Expo limits to 100 messages per chunk
  const CHUNK_SIZE = 100;
  const tickets: ExpoPushTicket[] = [];

  for (let i = 0; i < validMessages.length; i += CHUNK_SIZE) {
    const chunk = validMessages.slice(i, i + CHUNK_SIZE);
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.error(`[PushNotificationService] Expo Push API responded with HTTP ${response.status}`);
        continue;
      }

      const json: any = await response.json();
      if (Array.isArray(json?.data)) {
        tickets.push(...json.data);

        // Check for invalid device tokens and mark them inactive
        for (let j = 0; j < json.data.length; j++) {
          const ticket: ExpoPushTicket = json.data[j];
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            const failedToken = chunk[j]?.to;
            if (typeof failedToken === 'string') {
              deactivateInvalidToken(failedToken);
            }
          }
        }
      }
    } catch (networkErr: any) {
      console.error('[PushNotificationService] Network error sending Expo push chunk:', networkErr.message);
    }
  }

  return tickets;
}

/**
 * Marks a dead/unregistered token as inactive
 */
async function deactivateInvalidToken(token: string) {
  try {
    const docs = await databases.listDocuments(dbId, TOKENS_COLLECTION, [
      Query.equal('pushToken', token),
      Query.limit(5),
    ]);
    for (const doc of docs.documents) {
      await databases.updateDocument(dbId, TOKENS_COLLECTION, doc.$id, {
        isActive: false,
        lastActiveAt: new Date().toISOString(),
      });
      console.log(`[PushNotificationService] Inactive token disabled: ${token.substring(0, 15)}...`);
    }
  } catch (err: any) {
    console.warn('[PushNotificationService] Could not deactivate invalid token:', err.message);
  }
}

/**
 * Sends a push notification to all active devices belonging to a user,
 * respecting user preferences and saving notification history.
 */
export async function sendPushToUser(userId: string, payload: NotificationPayload) {
  if (!userId) return { success: false, reason: 'missing_user_id' };

  // 1. Check user preferences
  const prefs = await getUserPreferences(userId);
  const cat = payload.category || 'system';
  if (cat === 'booking' && !prefs.bookings) return { skipped: true, reason: 'pref_disabled' };
  if (cat === 'cancellation' && !prefs.bookings) return { skipped: true, reason: 'pref_disabled' };
  if (cat === 'payment' && !prefs.bookings) return { skipped: true, reason: 'pref_disabled' };
  if (cat === 'reminder' && !prefs.reminders) return { skipped: true, reason: 'pref_disabled' };
  if (cat === 'promo' && !prefs.promos) return { skipped: true, reason: 'pref_disabled' };

  // 2. Save in-app notification history in Appwrite
  const savedDoc = await saveInAppNotification(userId, payload);

  // 3. Find active device push tokens
  let expoTokens: string[] = [];
  let fcmTokens: string[] = [];

  try {
    const tokensRes = await databases.listDocuments(dbId, TOKENS_COLLECTION, [
      Query.equal('userId', userId),
      Query.equal('isActive', true),
      Query.limit(20),
    ]);
    const allTokens = tokensRes.documents.map(d => d.pushToken);
    expoTokens = allTokens.filter(isExpoPushToken);
    fcmTokens = allTokens.filter(
      t => !isExpoPushToken(t) && typeof t === 'string' && t.length > 20 && !t.includes('mock')
    );
  } catch (err: any) {
    console.warn('[PushNotificationService] Could not retrieve tokens for user:', err.message);
  }

  if (expoTokens.length === 0 && fcmTokens.length === 0) {
    return { success: true, inAppOnly: true, notificationId: savedDoc?.$id };
  }

  const tickets: ExpoPushTicket[] = [];

  // 4a. Dispatch Expo push messages (relayed via FCM/APNs)
  if (expoTokens.length > 0) {
    const messages: ExpoPushMessage[] = expoTokens.map(token => ({
      to: token,
      title: payload.title,
      body: payload.body,
      sound: payload.sound !== null ? 'default' : null,
      channelId: payload.channelId || (cat === 'booking' ? 'bookings' : 'default'),
      priority: 'high',
      data: {
        ...payload.data,
        category: cat,
        notificationId: savedDoc?.$id || '',
      },
    }));

    const expoTickets = await sendExpoPushBatches(messages);
    tickets.push(...expoTickets);
  }

  // 4b. Dispatch Direct FCM messages if raw FCM tokens exist
  let fcmResult: any = null;
  if (fcmTokens.length > 0) {
    const stringifiedData: Record<string, string> = {
      category: cat,
      notificationId: savedDoc?.$id || '',
    };
    if (payload.data) {
      for (const [k, v] of Object.entries(payload.data)) {
        stringifiedData[k] = typeof v === 'string' ? v : JSON.stringify(v);
      }
    }

    fcmResult = await sendFcmDirectMessage({
      tokens: fcmTokens,
      title: payload.title,
      body: payload.body,
      channelId: payload.channelId || (cat === 'booking' ? 'bookings' : 'default'),
      data: stringifiedData,
    });
  }

  return {
    success: true,
    sentCount: expoTokens.length + fcmTokens.length,
    expoSentCount: expoTokens.length,
    fcmSentCount: fcmTokens.length,
    tickets,
    fcmResult,
    notificationId: savedDoc?.$id,
  };
}

/**
 * Event: Booking Confirmation Notification
 */
export async function sendBookingConfirmationPush(data: {
  userId: string;
  hotelName: string;
  bookingId: string;
  displayBookingId?: string;
  checkIn: string;
  checkOut: string;
  price: number;
}) {
  const displayId = data.displayBookingId || (data.bookingId ? data.bookingId.substring(0, 8).toUpperCase() : 'RES');
  return await sendPushToUser(data.userId, {
    title: '🎉 Booking Confirmed!',
    body: `Your stay at ${data.hotelName} (#${displayId}) is confirmed for ${data.checkIn}. Safe travels!`,
    category: 'booking',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId,
      url: '/(tabs)/profile',
      action: 'view_booking',
    },
  });
}

/**
 * Event: Booking Cancellation Notification
 */
export async function sendBookingCancellationPush(data: {
  userId: string;
  hotelName: string;
  bookingId: string;
  displayBookingId?: string;
  refundAmount?: number;
}) {
  const displayId = data.displayBookingId || (data.bookingId ? data.bookingId.substring(0, 8).toUpperCase() : 'RES');
  const refundText = data.refundAmount && data.refundAmount > 0
    ? ` Refund of ₹${data.refundAmount.toLocaleString('en-IN')} has been initiated.`
    : '';

  return await sendPushToUser(data.userId, {
    title: 'Booking Cancelled',
    body: `Your reservation #${displayId} for ${data.hotelName} was cancelled.${refundText}`,
    category: 'cancellation',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId,
      url: '/(tabs)/profile',
      action: 'view_cancellation',
    },
  });
}

/**
 * Event: Payment Success / Failed Notification
 */
export async function sendPaymentPush(data: {
  userId: string;
  status: 'success' | 'failed';
  amount: number;
  bookingId?: string;
  hotelName?: string;
}) {
  const isSuccess = data.status === 'success';
  return await sendPushToUser(data.userId, {
    title: isSuccess ? 'Payment Successful ✅' : 'Payment Failed ⚠️',
    body: isSuccess
      ? `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} for ${data.hotelName || 'your booking'} was received.`
      : `Payment of ₹${Number(data.amount).toLocaleString('en-IN')} could not be processed. Please check and retry.`,
    category: 'payment',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId || '',
      url: isSuccess ? '/(tabs)/profile' : '/checkout/' + (data.bookingId || ''),
    },
  });
}

/**
 * Event: Check-in / Check-out Reminder
 */
export async function sendCheckInReminderPush(data: {
  userId: string;
  hotelName: string;
  bookingId: string;
  checkInDate: string;
  hotelLocation?: string;
}) {
  return await sendPushToUser(data.userId, {
    title: 'Ready for Your Stay? 🧳',
    body: `Reminder: Check-in at ${data.hotelName} is tomorrow (${data.checkInDate}). Have a wonderful trip!`,
    category: 'reminder',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId,
      url: '/(tabs)/profile',
    },
  });
}

export async function sendCheckOutReminderPush(data: {
  userId: string;
  hotelName: string;
  bookingId: string;
  checkOutDate: string;
}) {
  return await sendPushToUser(data.userId, {
    title: 'Check-out Reminder 🏨',
    body: `We hope you enjoyed your stay at ${data.hotelName}. Check-out is scheduled for today (${data.checkOutDate}).`,
    category: 'reminder',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId,
      url: '/(tabs)/profile',
    },
  });
}

/**
 * Event: Vendor New Booking Alert
 */
export async function sendVendorNewBookingAlert(data: {
  vendorId: string;
  propertyName: string;
  bookingId: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
}) {
  return await sendPushToUser(data.vendorId, {
    title: '🛎️ New Booking Received!',
    body: `New reservation for ${data.propertyName} by ${data.guestName}. Check-in: ${data.checkIn}.`,
    category: 'vendor',
    channelId: 'bookings',
    data: {
      bookingId: data.bookingId,
      url: '/vendor/bookings',
    },
  });
}

/**
 * Event: Property Approval / Rejection Update
 */
export async function sendPropertyStatusPush(data: {
  vendorId: string;
  propertyName: string;
  status: 'approved' | 'rejected';
  reason?: string;
}) {
  const isApproved = data.status === 'approved';
  return await sendPushToUser(data.vendorId, {
    title: isApproved ? '🎉 Property Approved!' : 'Property Review Update',
    body: isApproved
      ? `Congratulations! ${data.propertyName} is approved and is now live on Racoonn.`
      : `Your listing for ${data.propertyName} requires modifications: ${data.reason || 'Please check your dashboard.'}`,
    category: 'vendor',
    data: {
      url: '/vendor/properties',
    },
  });
}

/**
 * Event: Promotions & Offers
 */
export async function sendPromotionPush(data: {
  userIds?: string[];
  title: string;
  message: string;
  discountCode?: string;
  deepLink?: string;
}) {
  const targetUserIds = data.userIds || [];
  const results = [];

  for (const uid of targetUserIds) {
    const res = await sendPushToUser(uid, {
      title: data.title,
      body: data.message,
      category: 'promo',
      data: {
        discountCode: data.discountCode || '',
        url: data.deepLink || '/(tabs)/packages',
      },
    });
    results.push(res);
  }

  return { total: targetUserIds.length, results };
}

/**
 * Paginated query for in-app notification center
 */
export async function getUserNotifications(input: {
  userId: string;
  limit?: number;
  offset?: number;
  category?: string;
  unreadOnly?: boolean;
}) {
  const { userId, limit = 30, offset = 0, category, unreadOnly = false } = input;

  const queries = [
    Query.equal('userId', userId),
    Query.orderDesc('createdAt'),
    Query.limit(limit),
    Query.offset(offset),
  ];

  if (unreadOnly) {
    queries.push(Query.equal('read', false));
  }

  if (category && category !== 'all') {
    queries.push(Query.equal('category', category));
  }

  const result = await databases.listDocuments(dbId, NOTIFICATIONS_COLLECTION, queries);

  // Also calculate total unread count for badge
  const unreadCountRes = await databases.listDocuments(dbId, NOTIFICATIONS_COLLECTION, [
    Query.equal('userId', userId),
    Query.equal('read', false),
    Query.limit(1),
  ]);

  return {
    total: result.total,
    unreadCount: unreadCountRes.total,
    documents: result.documents.map(d => ({
      id: d.$id,
      userId: d.userId,
      title: d.title,
      message: d.message,
      category: d.category,
      read: d.read,
      createdAt: d.createdAt,
      data: d.data ? (() => { try { return JSON.parse(d.data); } catch { return {}; } })() : {},
    })),
  };
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await databases.updateDocument(dbId, NOTIFICATIONS_COLLECTION, notificationId, {
      read: true,
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const unread = await databases.listDocuments(dbId, NOTIFICATIONS_COLLECTION, [
      Query.equal('userId', userId),
      Query.equal('read', false),
      Query.limit(100),
    ]);

    for (const doc of unread.documents) {
      await databases.updateDocument(dbId, NOTIFICATIONS_COLLECTION, doc.$id, {
        read: true,
      });
    }

    return { success: true, count: unread.documents.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Delete a notification
 */
export async function deleteNotificationDocument(notificationId: string) {
  try {
    await databases.deleteDocument(dbId, NOTIFICATIONS_COLLECTION, notificationId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
