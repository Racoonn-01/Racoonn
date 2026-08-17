import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  LayoutGrid,
  Mountain,
  Tent,
  Palmtree,
  Globe,
  MapPin,
  Clock,
  Utensils,
  Heart,
  ArrowRight,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getCMSPackages } from '../../lib/appwrite/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

const filters = [
  { id: 'all', label: 'All Packages', icon: LayoutGrid },
  { id: 'uttarakhand', label: 'Uttarakhand', icon: Mountain },
  { id: 'himachal', label: 'Himachal', icon: Tent },
  { id: 'weekend', label: 'Weekend Getaways', icon: Palmtree },
  { id: 'international', label: 'International', icon: Globe },
];

export default function BestTourPackagesSection() {
  const router = useRouter();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [activeFilter, setActiveFilter] = useState('all');
  const [allPackages, setAllPackages] = useState<any[]>([]);

  useEffect(() => {
    async function loadCMSPackages() {
      try {
        const cmsPkgs = await getCMSPackages();
        if (cmsPkgs && Array.isArray(cmsPkgs) && cmsPkgs.length > 0) {
          const publishedOnly = cmsPkgs.filter((p: any) => 
            p.status === 'published' || p.status === 'active' || p.status === 'approved'
          );
          
          const mapped = publishedOnly.map((cmsPkg: any) => {
            const firstPricing = Array.isArray(cmsPkg.pricing) && cmsPkg.pricing.length > 0 ? cmsPkg.pricing[0] : null;
            const minPrice = firstPricing ? Number(firstPricing.pricePerPerson) : 0;
            const safePrice = isNaN(minPrice) ? 0 : minPrice;

            return {
              id: String(cmsPkg.id || Math.random()),
              title: cmsPkg.title || 'Tour Package',
              location: cmsPkg.metaTitle || 'Uttarakhand',
              duration:
                Array.isArray(cmsPkg.itinerary) && cmsPkg.itinerary.length > 0
                  ? `${cmsPkg.itinerary.length + 1} Days / ${cmsPkg.itinerary.length} Nights`
                  : '5 Days / 4 Nights',
              features: 'Meals | Stay | Transfer',
              price: `₹${safePrice.toLocaleString('en-IN')}`,
              badge: 'Featured',
              images:
                Array.isArray(cmsPkg.images) && cmsPkg.images.length > 0
                  ? cmsPkg.images
                  : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop'],
            };
          });
          setAllPackages(mapped);
        } else {
          setAllPackages([]);
        }
      } catch (err) {
        console.error('Error fetching CMS packages for home section:', err);
        setAllPackages([]);
      }
    }
    loadCMSPackages();
  }, []);

  const filteredPackages = allPackages.filter((pkg) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'uttarakhand') return pkg.location.toLowerCase().includes('uttarakhand');
    if (activeFilter === 'himachal') return pkg.location.toLowerCase().includes('himachal');
    if (activeFilter === 'international') return pkg.location.toLowerCase().includes('international');
    if (activeFilter === 'weekend') return pkg.duration.includes('3 Nights') || pkg.duration.includes('2 Nights');
    return true;
  });

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.curatedText}>CURATED FOR YOU</Text>
        <Text style={styles.title}>
          Best <Text style={styles.titleHighlight}>Tour Packages</Text>
        </Text>
        <Text style={styles.subtitle}>
          Discover handpicked tour packages that promise an unforgettable journey through the mountains.
        </Text>
      </View>

      {/* Filter Chips Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filters.map((filter) => {
          const IconComp = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              onPress={() => setActiveFilter(filter.id)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <IconComp
                color={isActive ? '#FFFFFF' : Colors.brand.navy}
                size={16}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tour Package Cards Horizontal Slider (One Card at a Time) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.cardsSliderContent}
      >
        {filteredPackages.map((pkg) => {
          const isSaved = savedHotelIds.includes(pkg.id);
          return (
            <View key={pkg.id} style={styles.card}>
              {/* Image Carousel */}
              <View style={styles.cardImageContainer}>
                <Image source={{ uri: pkg.images[0] }} style={styles.cardImage} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pkg.badge}</Text>
                </View>

                {/* Heart Saved Button */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => toggleSavedHotel(pkg.id)}
                  activeOpacity={0.8}
                >
                  <Heart
                    color={isSaved ? Colors.brand.coral : '#1F2E4A'}
                    fill={isSaved ? Colors.brand.coral : 'transparent'}
                    size={16}
                  />
                </TouchableOpacity>
              </View>

              {/* Content Section */}
              <View style={styles.cardContent}>
                <Text style={styles.pkgTitle}>{pkg.title}</Text>

                <View style={styles.infoRow}>
                  <MapPin color={Colors.brand.coral} size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>{pkg.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Clock color="#64748B" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>{pkg.duration}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Utensils color="#64748B" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>{pkg.features}</Text>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Bottom Price & Button Row */}
                <View style={styles.footerRow}>
                  <View>
                    <Text style={styles.startingFrom}>Starting from</Text>
                    <Text style={styles.price}>{pkg.price}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.exploreBtn}
                    onPress={() => router.push(`/packages/${pkg.id}` as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.exploreBtnText}>Explore Package</Text>
                    <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* 🌟 View All Packages Button */}
      <TouchableOpacity
        style={styles.viewAllBtn}
        onPress={() => router.push('/(tabs)/packages' as any)}
        activeOpacity={0.85}
      >
        <Text style={styles.viewAllBtnText}>View All Packages</Text>
        <ArrowRight color={Colors.brand.coral} size={16} style={{ marginLeft: 6 }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  curatedText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.brand.coral,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.brand.navy,
    textAlign: 'center',
  },
  titleHighlight: {
    color: Colors.brand.coral,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brand.navy,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cardsSliderContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  cardImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 18,
  },
  pkgTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  startingFrom: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  exploreBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  /* 🌟 View All Packages Button Style */
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: Colors.brand.coral,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  viewAllBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.coral,
    letterSpacing: 0.3,
  },
});
