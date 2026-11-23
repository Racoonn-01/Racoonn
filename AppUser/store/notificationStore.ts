import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserBookings,
  fetchUserNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  fetchNotificationPreferencesApi,
  updateNotificationPreferencesApi,
  NotificationPreferencesData,
} from '../lib/appwrite/api';

const NOTIFICATIONS_STORAGE_KEY = '@racoonn_realtime_notifications';
const PREFERENCES_STORAGE_KEY = '@racoonn_notification_preferences';

export type NotificationCategory =
  | 'booking'
  | 'payment'
  | 'cancellation'
  | 'reminder'
  | 'vendor'
  | 'promo'
  | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  unread: boolean;
  type?: NotificationCategory;
  category?: NotificationCategory;
  data?: {
    url?: string;
    bookingId?: string;
    hotelId?: string;
    action?: string;
    [key: string]: any;
  };
}

export function formatNotificationTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isLoaded: boolean;
  preferences: NotificationPreferencesData;
  preferencesLoaded: boolean;

  loadNotifications: () => Promise<void>;
  addNotification: (item: {
    title: string;
    message: string;
    type?: NotificationCategory;
    category?: NotificationCategory;
    data?: any;
    timestamp?: number;
    id?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId?: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  syncUserNotifications: (userId: string) => Promise<void>;
  loadPreferences: (userId: string) => Promise<void>;
  updatePreferences: (userId: string, prefs: Partial<NotificationPreferencesData>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isLoaded: false,
  preferences: {
    bookings: true,
    reminders: true,
    promos: true,
    system: true,
  },
  preferencesLoaded: false,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const parsed: AppNotification[] = JSON.parse(raw);
        const updated = parsed.map((n) => ({
          ...n,
          time: formatNotificationTime(n.timestamp || Date.now()),
        }));
        const unreadCount = updated.filter((n) => n.unread).length;
        set({ notifications: updated, unreadCount, isLoaded: true, isLoading: false });
      } else {
        set({ notifications: [], unreadCount: 0, isLoaded: true, isLoading: false });
      }
    } catch (err) {
      console.warn('[NotificationStore] Failed to load stored notifications:', err);
      set({ notifications: [], unreadCount: 0, isLoaded: true, isLoading: false });
    }
  },

  addNotification: async (item) => {
    try {
      const ts = item.timestamp || Date.now();
      const cat = item.category || item.type || 'system';
      const newNotif: AppNotification = {
        id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: item.title,
        message: item.message,
        time: formatNotificationTime(ts),
        timestamp: ts,
        unread: true,
        type: cat,
        category: cat,
        data: item.data || {},
      };

      const current = get().notifications;
      const exists = current.some(
        (n) =>
          n.id === newNotif.id ||
          (newNotif.data?.bookingId &&
            n.data?.bookingId === newNotif.data?.bookingId &&
            n.type === newNotif.type &&
            Math.abs(n.timestamp - ts) < 30000)
      );

      if (exists) return;

      const nextList = [newNotif, ...current].slice(0, 60);
      const unreadCount = nextList.filter((n) => n.unread).length;
      set({ notifications: nextList, unreadCount });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch (err) {
      console.warn('[NotificationStore] Failed to save notification:', err);
    }
  },

  markAsRead: async (id: string) => {
    try {
      const nextList = get().notifications.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      );
      const unreadCount = nextList.filter((n) => n.unread).length;
      set({ notifications: nextList, unreadCount });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));

      // Sync to Appwrite in background
      markNotificationReadApi(id).catch(() => {});
    } catch (err) {
      console.warn('[NotificationStore] Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async (userId?: string) => {
    try {
      const nextList = get().notifications.map((n) => ({ ...n, unread: false }));
      set({ notifications: nextList, unreadCount: 0 });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));

      if (userId) {
        markAllNotificationsReadApi(userId).catch(() => {});
      }
    } catch (err) {
      console.warn('[NotificationStore] Failed to mark all notifications as read:', err);
    }
  },

  removeNotification: async (id: string) => {
    try {
      const nextList = get().notifications.filter((n) => n.id !== id);
      const unreadCount = nextList.filter((n) => n.unread).length;
      set({ notifications: nextList, unreadCount });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));

      // Sync to Appwrite in background
      deleteNotificationApi(id).catch(() => {});
    } catch (err) {
      console.warn('[NotificationStore] Failed to remove notification:', err);
    }
  },

  clearAll: async () => {
    try {
      set({ notifications: [], unreadCount: 0 });
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (err) {
      console.warn('[NotificationStore] Failed to clear notifications:', err);
    }
  },

  syncUserNotifications: async (userId: string) => {
    if (!userId) return;
    try {
      // 1. Fetch remote notifications from Appwrite
      const serverRes = await fetchUserNotificationsApi(userId, { limit: 50 });
      const current = get().notifications;

      const remoteItems: AppNotification[] = serverRes.documents.map((d) => {
        const ts = new Date(d.createdAt).getTime();
        return {
          id: d.id,
          title: d.title,
          message: d.message,
          time: formatNotificationTime(ts),
          timestamp: ts,
          unread: !d.read,
          type: d.category,
          category: d.category,
          data: d.data || {},
        };
      });

      // 2. Also incorporate booking history
      const bookings = await getUserBookings(userId).catch(() => []);
      const bookingItems: AppNotification[] = [];

      for (const b of bookings || []) {
        const bookingId = b.$id || b.bookingId;
        const bookingRef = bookingId ? bookingId.substring(0, 8).toUpperCase() : 'RES';
        const propertyName = b.hotelName || b.propertyName || b.roomName || 'Stay';
        const isCancelled = b.status === 'Cancelled';
        const ts = new Date(b.$updatedAt || b.$createdAt || Date.now()).getTime();
        const cat: NotificationCategory = isCancelled ? 'cancellation' : 'booking';

        const existsInRemote = remoteItems.some(
          (n) => n.data?.bookingId === bookingId && (n.category === cat || n.type === cat)
        );

        if (!existsInRemote) {
          bookingItems.push({
            id: `bk_${bookingId}_${cat}`,
            title: isCancelled ? '❌ Booking Cancelled' : '🎉 Booking Confirmed',
            message: isCancelled
              ? `Your reservation #${bookingRef} for ${propertyName} was cancelled.`
              : `Your reservation #${bookingRef} for ${propertyName} is confirmed! Check-in: ${b.checkIn || 'Upcoming'}.`,
            time: formatNotificationTime(ts),
            timestamp: ts,
            unread: false,
            type: cat,
            category: cat,
            data: {
              bookingId,
              url: '/(tabs)/profile',
            },
          });
        }
      }

      // Merge and deduplicate by ID or bookingId + category
      const map = new Map<string, AppNotification>();
      for (const item of [...remoteItems, ...bookingItems, ...current]) {
        const key = item.id || `${item.data?.bookingId}_${item.category}`;
        if (!map.has(key)) {
          map.set(key, item);
        }
      }

      const merged = Array.from(map.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 60);

      const unreadCount = merged.filter((n) => n.unread).length;
      set({ notifications: merged, unreadCount, isLoaded: true });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(merged));
    } catch (err) {
      console.warn('[NotificationStore] Error syncing user notifications:', err);
    }
  },

  loadPreferences: async (userId: string) => {
    try {
      const cached = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (cached) {
        set({ preferences: JSON.parse(cached), preferencesLoaded: true });
      }

      if (userId) {
        const remote = await fetchNotificationPreferencesApi(userId);
        set({ preferences: remote, preferencesLoaded: true });
        await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(remote));
      }
    } catch (err) {
      console.warn('[NotificationStore] Error loading preferences:', err);
    }
  },

  updatePreferences: async (userId: string, prefs: Partial<NotificationPreferencesData>) => {
    try {
      const updated = { ...get().preferences, ...prefs };
      set({ preferences: updated });
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));

      if (userId) {
        await updateNotificationPreferencesApi(userId, prefs);
      }
    } catch (err) {
      console.warn('[NotificationStore] Error updating preferences:', err);
    }
  },
}));
