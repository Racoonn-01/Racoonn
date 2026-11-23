import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import Colors from '@/constants/Colors';
import HeroSection from '../../components/home/HeroSection';
import ExplorePopularStaysSection from '../../components/home/ExplorePopularStaysSection';
import PopularDestinationsSection from '../../components/home/PopularDestinationsSection';
import BestTourPackagesSection from '../../components/home/BestTourPackagesSection';
import DynamicPopularStaysSection from '../../components/home/DynamicPopularStaysSection';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { checkAuth, user, profile } = useAuthStore();
  const { notifications, syncUserNotifications } = useNotificationStore();
  const [openNotifTrigger, setOpenNotifTrigger] = useState(0);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    useNotificationStore.getState().loadNotifications();
    const currentUserId = user?.$id || profile?.userId;
    if (currentUserId) {
      syncUserNotifications(currentUserId);
    }
  }, [user?.$id, profile?.userId, syncUserNotifications]);

  // Balanced clearance: leaves ~16-20px between bottom cards and the curved top of the navigation bar
  const bottomNavPadding = 96 + Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10);
  const headerTopPadding = Math.max(insets.top + 6, Platform.OS === 'ios' ? 44 : 28);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      {/* Fixed Static Header with Logo & Notifications (No Fade, Fixed at Top) */}
      <View style={[styles.fixedHeaderWrapper, { paddingTop: headerTopPadding }]}>
        <View style={styles.headerCapsule}>
          <Image
            source={require('@/assets/images/Racoonn-Logo-02.png')}
            style={styles.logoImage}
            resizeMode="contain"
            fadeDuration={0}
          />

          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setOpenNotifTrigger((prev) => prev + 1)}
            activeOpacity={0.8}
          >
            <Bell color={Colors.brand.navy} size={20} />
            {unreadCount > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavPadding }]}
        bounces={true}
      >
        {/* Hero Section — background image + floating search card */}
        <HeroSection openNotifCounter={openNotifTrigger} />

        {/* Explore Popular Stays */}
        <ExplorePopularStaysSection />

        {/* Popular Destinations */}
        <PopularDestinationsSection />

        {/* Best Tour Packages */}
        <BestTourPackagesSection />

        {/* Dynamic Popular Stays from CMS (matching User Portal DynamicPopularStays) */}
        <DynamicPopularStaysSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fixedHeaderWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 100,
  },
  headerCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  logoImage: {
    height: 36,
    width: 130,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.brand.coral,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 115,
  },
});
