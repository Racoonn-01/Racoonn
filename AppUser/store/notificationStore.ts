import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserBookings } from '../lib/appwrite/api';

const NOTIFICATIONS_STORAGE_KEY = '@racoonn_realtime_notifications';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  unread: boolean;
  type?: 'booking' | 'cancellation' | 'payment' | 'system';
  data?: {
    url?: string;
    bookingId?: string;
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
  isLoading: boolean;
  isLoaded: boolean;
  loadNotifications: () => Promise<void>;
  addNotification: (item: {
    title: string;
    message: string;
    type?: 'booking' | 'cancellation' | 'payment' | 'system';
    data?: any;
    timestamp?: number;
    id?: string;
  }) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  syncUserNotifications: (userId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,
  isLoaded: false,

  loadNotifications: async () => {
    try {
      set({ isLoading: true });
      const raw = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const parsed: AppNotification[] = JSON.parse(raw);
        // Refresh relative display time for each item
        const updated = parsed.map((n) => ({
          ...n,
          time: formatNotificationTime(n.timestamp || Date.now()),
        }));
        set({ notifications: updated, isLoaded: true, isLoading: false });
      } else {
        set({ notifications: [], isLoaded: true, isLoading: false });
      }
    } catch (err) {
      console.warn('[NotificationStore] Failed to load stored notifications:', err);
      set({ notifications: [], isLoaded: true, isLoading: false });
    }
  },

  addNotification: async (item) => {
    try {
      const ts = item.timestamp || Date.now();
      const newNotif: AppNotification = {
        id: item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: item.title,
        message: item.message,
        time: formatNotificationTime(ts),
        timestamp: ts,
        unread: true,
        type: item.type || 'system',
        data: item.data || {},
      };

      const current = get().notifications;
      // Prevent duplicates by ID or identical bookingId + type
      const exists = current.some(
        (n) =>
          n.id === newNotif.id ||
          (newNotif.data?.bookingId &&
            n.data?.bookingId === newNotif.data?.bookingId &&
            n.type === newNotif.type)
      );

      if (exists) return;

      const nextList = [newNotif, ...current].slice(0, 50); // keep up to 50 notifications
      set({ notifications: nextList });
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
      set({ notifications: nextList });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch (err) {
      console.warn('[NotificationStore] Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      const nextList = get().notifications.map((n) => ({ ...n, unread: false }));
      set({ notifications: nextList });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch (err) {
      console.warn('[NotificationStore] Failed to mark all notifications as read:', err);
    }
  },

  removeNotification: async (id: string) => {
    try {
      const nextList = get().notifications.filter((n) => n.id !== id);
      set({ notifications: nextList });
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextList));
    } catch (err) {
      console.warn('[NotificationStore] Failed to remove notification:', err);
    }
  },

  clearAll: async () => {
    try {
      set({ notifications: [] });
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    } catch (err) {
      console.warn('[NotificationStore] Failed to clear notifications:', err);
    }
  },

  syncUserNotifications: async (userId: string) => {
    if (!userId) return;
    try {
      const bookings = await getUserBookings(userId);
      if (!bookings || bookings.length === 0) return;

      const current = get().notifications;
      const newItems: AppNotification[] = [];

      for (const b of bookings) {
        const bookingId = b.$id || b.bookingId;
        const bookingRef = bookingId ? bookingId.substring(0, 8).toUpperCase() : 'RES';
        const propertyName = b.hotelName || b.propertyName || b.roomName || 'Stay';
        const isCancelled = b.status === 'Cancelled';
        const ts = new Date(b.$updatedAt || b.$createdAt || Date.now()).getTime();

        const notifType = isCancelled ? 'cancellation' : 'booking';
        const alreadyExists = current.some(
          (n) => n.data?.bookingId === bookingId && n.type === notifType
        );

        if (!alreadyExists) {
          newItems.push({
            id: `bk_${bookingId}_${notifType}`,
            title: isCancelled ? '❌ Booking Cancelled' : '🎉 Booking Confirmed',
            message: isCancelled
              ? `Your reservation #${bookingRef} for ${propertyName} was cancelled.`
              : `Your reservation #${bookingRef} for ${propertyName} is confirmed! Check-in: ${b.checkIn || 'Upcoming'}.`,
            time: formatNotificationTime(ts),
            timestamp: ts,
            unread: false, // historical synced items start as read
            type: notifType,
            data: {
              bookingId,
              url: '/(tabs)/profile',
            },
          });
        }
      }

      if (newItems.length > 0) {
        const combined = [...newItems, ...current]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 50);
        set({ notifications: combined });
        await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(combined));
      }
    } catch (err) {
      console.warn('[NotificationStore] Error syncing user bookings into notifications:', err);
    }
  },
}));
