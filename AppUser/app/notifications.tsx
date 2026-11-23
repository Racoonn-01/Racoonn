import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  CheckCheck,
  Trash2,
  Bell,
  BellOff,
  SlidersHorizontal,
  Calendar,
  Clock,
  Tag,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore, AppNotification, NotificationCategory } from '../store/notificationStore';

type FilterTab = 'all' | 'booking' | 'reminder' | 'promo' | 'system';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const userId = user?.$id;

  const {
    notifications,
    unreadCount,
    isLoading,
    preferences,
    loadNotifications,
    syncUserNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    loadPreferences,
    updatePreferences,
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  useEffect(() => {
    loadNotifications();
    if (userId) {
      syncUserNotifications(userId);
      loadPreferences(userId);
    }
  }, [userId, loadNotifications, syncUserNotifications, loadPreferences]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userId) {
      await syncUserNotifications(userId);
    } else {
      await loadNotifications();
    }
    setRefreshing(false);
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (item.unread) {
      await markAsRead(item.id);
    }

    const data = item.data || {};
    try {
      if (data.url) {
        router.push(data.url as any);
      } else if (data.bookingId || item.category === 'booking' || item.category === 'cancellation' || item.category === 'reminder') {
        router.push('/(tabs)/profile' as any);
      } else if (data.hotelId) {
        router.push(`/hotel/${data.hotelId}` as any);
      }
    } catch (err) {
      console.warn('Navigation error on notification item click:', err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'booking') {
      return notifications.filter(
        (n) => n.category === 'booking' || n.type === 'booking' || n.category === 'cancellation'
      );
    }
    if (activeTab === 'reminder') {
      return notifications.filter((n) => n.category === 'reminder' || n.type === 'reminder');
    }
    if (activeTab === 'promo') {
      return notifications.filter((n) => n.category === 'promo' || n.type === 'promo');
    }
    return notifications.filter(
      (n) => n.category === 'system' || n.category === 'payment' || n.type === 'system'
    );
  }, [notifications, activeTab]);

  const renderCategoryIcon = (category?: NotificationCategory) => {
    switch (category) {
      case 'booking':
        return (
          <View style={[styles.iconCircle, { backgroundColor: 'rgba(232, 106, 112, 0.12)' }]}>
            <Calendar color={Colors.brand.coral} size={20} />
          </View>
        );
      case 'cancellation':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <AlertTriangle color="#EF4444" size={20} />
          </View>
        );
      case 'payment':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 color="#16A34A" size={20} />
          </View>
        );
      case 'reminder':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Clock color="#D97706" size={20} />
          </View>
        );
      case 'promo':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Sparkles color="#9333EA" size={20} />
          </View>
        );
      case 'vendor':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
            <Tag color="#4F46E5" size={20} />
          </View>
        );
      case 'system':
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E2E8F0' }]}>
            <Info color="#475569" size={20} />
          </View>
        );
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isUnread = item.unread;

    return (
      <TouchableOpacity
        style={[styles.notificationCard, isUnread && styles.unreadCard]}
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
      >
        {/* Category Icon */}
        {renderCategoryIcon(item.category || item.type)}

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, isUnread && styles.unreadTitle]} numberOfLines={1}>
              {item.title}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.cardMessage} numberOfLines={3}>
            {item.message}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.cardTime}>{item.time}</Text>

            <TouchableOpacity
              onPress={() => removeNotification(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.deleteBtn}
            >
              <Trash2 color="#94A3B8" size={15} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <BellOff color="#94A3B8" size={40} />
      </View>
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'all'
          ? "You're all caught up! Updates regarding your stays, reminders, and exclusive offers will appear here."
          : `No ${activeTab} notifications right now.`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)' as any);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft color="#0F172A" size={26} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRightActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => markAllAsRead(userId)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CheckCheck color={Colors.brand.coral} size={20} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setPreferencesModalVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SlidersHorizontal color="#475569" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterBar}>
        {(['all', 'booking', 'reminder', 'promo', 'system'] as FilterTab[]).map((tab) => {
          const isActive = activeTab === tab;
          const labels: Record<FilterTab, string> = {
            all: 'All',
            booking: 'Bookings',
            reminder: 'Reminders',
            promo: 'Offers',
            system: 'Updates',
          };
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                {labels[tab]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={Colors.brand.coral} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.brand.coral]}
              tintColor={Colors.brand.coral}
            />
          }
        />
      )}

      {/* Notification Preferences Modal */}
      <Modal
        visible={preferencesModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPreferencesModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <TouchableOpacity
                onPress={() => setPreferencesModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#475569" size={22} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Customize the types of alerts and push notifications you receive from Racoonn.
            </Text>

            <View style={styles.prefRow}>
              <View style={styles.prefTextGroup}>
                <Text style={styles.prefLabel}>Booking Updates</Text>
                <Text style={styles.prefDesc}>Confirmations, check-in details, and cancellations.</Text>
              </View>
              <Switch
                value={preferences.bookings}
                onValueChange={(val) => {
                  if (userId) updatePreferences(userId, { bookings: val });
                }}
                trackColor={{ false: '#CBD5E1', true: Colors.brand.coral }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefTextGroup}>
                <Text style={styles.prefLabel}>Travel Reminders</Text>
                <Text style={styles.prefDesc}>Upcoming check-in and check-out reminders.</Text>
              </View>
              <Switch
                value={preferences.reminders}
                onValueChange={(val) => {
                  if (userId) updatePreferences(userId, { reminders: val });
                }}
                trackColor={{ false: '#CBD5E1', true: Colors.brand.coral }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefTextGroup}>
                <Text style={styles.prefLabel}>Exclusive Offers & Promos</Text>
                <Text style={styles.prefDesc}>Special holiday discounts and featured package deals.</Text>
              </View>
              <Switch
                value={preferences.promos}
                onValueChange={(val) => {
                  if (userId) updatePreferences(userId, { promos: val });
                }}
                trackColor={{ false: '#CBD5E1', true: Colors.brand.coral }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.prefRow}>
              <View style={styles.prefTextGroup}>
                <Text style={styles.prefLabel}>System & Account</Text>
                <Text style={styles.prefDesc}>Security updates, profile changes, and support replies.</Text>
              </View>
              <Switch
                value={preferences.system}
                onValueChange={(val) => {
                  if (userId) updatePreferences(userId, { system: val });
                }}
                trackColor={{ false: '#CBD5E1', true: Colors.brand.coral }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setPreferencesModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Save & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badge: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(232, 106, 112, 0.35)',
    borderLeftWidth: 4,
    borderLeftColor: Colors.brand.coral,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  cardContent: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginRight: 6,
  },
  unreadTitle: {
    color: '#0F172A',
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.coral,
  },
  cardMessage: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTime: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  deleteBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 20,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  prefTextGroup: {
    flex: 1,
    paddingRight: 16,
  },
  prefLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  prefDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 17,
  },
  doneBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
