import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import Colors from '@/constants/Colors';
import HeroSection from '../../components/home/HeroSection';
import ExplorePopularStaysSection from '../../components/home/ExplorePopularStaysSection';
import PopularDestinationsSection from '../../components/home/PopularDestinationsSection';
import BestTourPackagesSection from '../../components/home/BestTourPackagesSection';

import DynamicPopularStaysSection from '../../components/home/DynamicPopularStaysSection';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Balanced clearance: leaves ~16-20px between bottom cards and the curved top of the navigation bar
  const bottomNavPadding = 96 + Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 10);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomNavPadding }]}
        bounces={true}
      >
        {/* Hero Section — background image + floating search card */}
        <HeroSection />

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
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 115,
  },
});
