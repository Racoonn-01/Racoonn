import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter } from 'expo-router';

// Safely require expo-notifications to prevent module load crash in Expo Go (SDK 53+)
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.warn('expo-notifications module load warning:', e);
}

// Configure default foreground notification behavior
if (Notifications && typeof Notifications.setNotificationHandler === 'function') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Registers the device for Push Notifications and returns the Expo Push Token.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Notifications) return null;

  // Check if running inside Expo Go
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
  if (isExpoGo && Platform.OS === 'android') {
    console.log('[NotificationService] Android Push notifications are disabled in Expo Go. Use a development build to receive remote push tokens.');
  }

  // Create Notification Channel for Android
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4F46E5',
        sound: 'default',
      });

      await Notifications.setNotificationChannelAsync('bookings', {
        name: 'Booking Updates',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    } catch (channelErr) {
      console.warn('Error setting notification channel:', channelErr);
    }
  }

  // Request Permissions
  try {
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

    // Don't call getExpoPushTokenAsync in Expo Go on Android to prevent SDK 53 crash
    if (isExpoGo && Platform.OS === 'android') {
      return 'expo-go-mock-token';
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || undefined,
    });

    console.log('[NotificationService] Expo Push Token:', tokenData.data);
    return tokenData.data;
  } catch (err) {
    console.warn('[NotificationService] Failed to get push token:', err);
    return null;
  }
}

/**
 * Triggers a local push notification immediately or after a delay.
 */
export async function sendLocalNotification({
  title,
  body,
  data = {},
  seconds = 1,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  seconds?: number;
}): Promise<string | null> {
  if (!Notifications) return null;

  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
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
 * Custom React hook to observe incoming notifications and user tap responses.
 */
export function useNotificationObserver() {
  const router = useRouter();

  useEffect(() => {
    if (!Notifications) return;

    // Listener for notifications received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[NotificationService] Notification Received:', notification.request.content);
    });

    // Listener for when a user clicks/taps on a notification
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[NotificationService] Notification Clicked:', response.notification.request.content);
      const data = response.notification.request.content.data;

      if (data && data.url) {
        try {
          router.push(data.url as any);
        } catch (navErr) {
          console.warn('[NotificationService] Navigation error on notification tap:', navErr);
        }
      }
    });

    return () => {
      if (Notifications) {
        Notifications.removeNotificationSubscription(notificationListener);
        Notifications.removeNotificationSubscription(responseListener);
      }
    };
  }, [router]);
}
