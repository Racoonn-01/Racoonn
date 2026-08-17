import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import Colors from '@/constants/Colors';
import HeroSection from '../../components/home/HeroSection';
import ExplorePopularStaysSection from '../../components/home/ExplorePopularStaysSection';
import PopularDestinationsSection from '../../components/home/PopularDestinationsSection';
import BestTourPackagesSection from '../../components/home/BestTourPackagesSection';

import PopularStaysHaldwani from '../../components/home/PopularStaysHaldwani';
import PopularStaysDehradun from '../../components/home/PopularStaysDehradun';
import PopularStaysNainital from '../../components/home/PopularStaysNainital';

export default function HomeScreen() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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

        {/* Popular Stays by City */}
        <PopularStaysHaldwani />
        <PopularStaysDehradun />
        <PopularStaysNainital />

        {/* Special Offers */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 110,
  },
});
