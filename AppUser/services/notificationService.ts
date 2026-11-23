import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerDeviceTokenApi, unregisterDeviceTokenApi } from '../lib/appwrite/api';
import { useNotificationStore, NotificationCategory } from '../store/notificationStore';
import { useAuthStore } from '../store/authStore';

const SAVED_PUSH_TOKEN_KEY = '@racoonn_device_push_token';

// Safely require expo-notifications to prevent module load crash in Expo Go (SDK 53+)
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('[NotificationService] expo-notifications module load warning:', e);
}

// Configure default foreground notification behavior
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Configure Android notification channels with appropriate sound and importance
 */
export async function setupAndroidNotificationChannels() {
  if (Platform.OS !== 'android' || !Notifications) return;

  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Updates',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF5A5F',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('bookings', {
      name: 'Bookings & Trips',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 300, 200, 300],
      lightColor: '#FF5A5F',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Travel Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D97706',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('promotions', {
      name: 'Offers & Discounts',
      importance: Notifications.AndroidImportance.LOW,
      sound: 'default',
    });
  } catch (channelErr) {
    console.warn('[NotificationService] Error creating notification channels:', channelErr);
  }
}

/**
 * Registers the device for Push Notifications, returns the Expo Push Token,
 * and saves it in Appwrite for the authenticated user.
 */
export async function registerForPushNotificationsAsync(userId?: string): Promise<string | null> {
  if (!Notifications) return null;

  // Initialize Android Channels
  await setupAndroidNotificationChannels();

  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (isExpoGo && Platform.OS === 'android') {
    console.log('[NotificationService] Android Push tokens are disabled in Expo Go. Use a development build.');
  }

  try {
    // 1. Check existing permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[NotificationService] Push notification permission not granted.');
      return null;
    }

    if (isExpoGo && Platform.OS === 'android') {
      return 'expo-go-mock-token';
    }

    // 2. Fetch native FCM token and Expo Push Token
    let nativeFcmToken: string | null = null;
    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      if (deviceToken?.data) {
        nativeFcmToken = typeof deviceToken.data === 'string' ? deviceToken.data : JSON.stringify(deviceToken.data);
        console.log('[NotificationService] Native FCM Device Token:', nativeFcmToken);
      }
    } catch (fcmErr) {
      // Normal in Expo Go or simulators without Play Services
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      '9d6632e1-19ba-48eb-8130-067d57299abd';

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const pushToken = tokenData.data;
    console.log('[NotificationService] Expo Push Token obtained:', pushToken);

    // Save token to local cache
    await AsyncStorage.setItem(SAVED_PUSH_TOKEN_KEY, pushToken);
    if (nativeFcmToken) {
      await AsyncStorage.setItem('@racoonn_native_fcm_token', nativeFcmToken);
    }

    // 3. Register to Appwrite database if user is authenticated
    const targetUserId = userId || useAuthStore.getState().user?.$id;
    if (targetUserId) {
      await registerDeviceTokenApi(
        targetUserId,
        pushToken,
        Platform.OS as any,
        `${Platform.OS === 'ios' ? 'Apple Device' : 'Android Device'} (${Platform.Version})`
      );
    }

    return pushToken;
  } catch (err) {
    console.warn('[NotificationService] Failed to register push token:', err);
    return null;
  }
}

/**
 * Deactivates device token on user logout
 */
export async function unregisterPushNotificationsAsync(userId: string) {
  try {
    const pushToken = (await AsyncStorage.getItem(SAVED_PUSH_TOKEN_KEY)) || undefined;
    await unregisterDeviceTokenApi(userId, pushToken);
    await AsyncStorage.removeItem(SAVED_PUSH_TOKEN_KEY);
    console.log('[NotificationService] Push token unregistered successfully for user:', userId);
  } catch (err) {
    console.warn('[NotificationService] Error unregistering push token:', err);
  }
}

/**
 * Triggers a local push notification and registers it in the notification store.
 */
export async function sendLocalNotification({
  title,
  body,
  category = 'system',
  data = {},
  seconds = 1,
}: {
  title: string;
  body: string;
  category?: NotificationCategory;
  data?: Record<string, any>;
  seconds?: number;
}): Promise<string | null> {
  // Always register in local reactive store
  try {
    await useNotificationStore.getState().addNotification({
      title,
      message: body,
      category,
      type: category,
      data,
      timestamp: Date.now(),
    });
  } catch (storeErr) {
    console.warn('[NotificationService] Failed to record notification in store:', storeErr);
  }

  if (!Notifications) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { ...data, category, channelId: category === 'booking' ? 'bookings' : 'default' },
        sound: 'default',
      },
      trigger: seconds > 0 ? { seconds, type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL } : null,
    });
    return identifier;
  } catch (err) {
    console.warn('[NotificationService] Error scheduling local notification:', err);
    return null;
  }
}

/**
 * Custom React hook to observe incoming push notifications, tap events, and cold starts.
 */
export function useNotificationObserver() {
  const router = useRouter();
  const hasHandledInitial = useRef(false);

  useEffect(() => {
    // 1. Load initial stored notifications
    useNotificationStore.getState().loadNotifications();

    if (!Notifications) return;

    // 2. Setup channels
    setupAndroidNotificationChannels();

    // 3. Handle cold-start tap response (when app is launched by tapping notification)
    if (!hasHandledInitial.current) {
      hasHandledInitial.current = true;
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (response) {
            handleNotificationTap(response);
          }
        })
        .catch((err) => {
          console.warn('[NotificationService] Error checking initial notification response:', err);
        });
    }

    // 4. Foreground notification listener
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[NotificationService] Foreground notification received:', notification.request.content);
      const content = notification.request.content;
      const data = content.data || {};
      const cat = (data.category as NotificationCategory) || 'system';

      useNotificationStore.getState().addNotification({
        id: (data.notificationId as string) || undefined,
        title: content.title || 'New Notification',
        message: content.body || '',
        category: cat,
        type: cat,
        data,
        timestamp: Date.now(),
      });
    });

    // 5. Notification tap listener (background & active app)
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[NotificationService] Notification tapped:', response.notification.request.content);
      handleNotificationTap(response);
    });

    function handleNotificationTap(response: any) {
      const data = response?.notification?.request?.content?.data || {};

      if (data.notificationId) {
        useNotificationStore.getState().markAsRead(String(data.notificationId));
      }

      // Safe navigation based on structured data payload
      try {
        if (data.url) {
          router.push(data.url as any);
        } else if (data.bookingId || data.category === 'booking' || data.category === 'cancellation' || data.category === 'reminder') {
          router.push('/(tabs)/profile' as any);
        } else if (data.hotelId) {
          router.push(`/hotel/${data.hotelId}` as any);
        } else {
          router.push('/notifications' as any);
        }
      } catch (navErr) {
        console.warn('[NotificationService] Navigation error on notification tap:', navErr);
      }
    }

    return () => {
      if (notificationListener && typeof notificationListener.remove === 'function') {
        notificationListener.remove();
      } else if (Notifications && typeof (Notifications as any).removeNotificationSubscription === 'function') {
        (Notifications as any).removeNotificationSubscription(notificationListener);
      }

      if (responseListener && typeof responseListener.remove === 'function') {
        responseListener.remove();
      } else if (Notifications && typeof (Notifications as any).removeNotificationSubscription === 'function') {
        (Notifications as any).removeNotificationSubscription(responseListener);
      }
    };
  }, [router]);
}
