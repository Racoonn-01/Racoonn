import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  ArrowRight,
  Sparkles,
  Compass,
  Building2,
  ShieldCheck,
  Search,
  Filter,
  Package,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import Colors from '@/constants/Colors';
import { getProperties } from '../../lib/appwrite/api';
import { packages as ALL_PACKAGES } from '../../data/packages';

// Build a lookup map from packages data (id as string key)
const PACKAGES_MAP: Record<string, any> = {};
ALL_PACKAGES.forEach((p: any) => {
  PACKAGES_MAP[String(p.id)] = p;
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 44) / 2;

const MOCK_PROPERTIES_MAP: Record<string, any> = {
  'd1': {
    id: 'd1',
    title: 'The Solitaire Resort',
    location: 'Dehradun, Uttarakhand',
    rating: 4.85,
    reviewsCount: 128,
    price: 6500,
    category: 'Resort',
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=800&auto=format&fit=crop',
  },
  'n1': {
    id: 'n1',
    title: 'The Naini Retreat',
    location: 'Nainital, Uttarakhand',
    rating: 4.94,
    reviewsCount: 210,
    price: 12500,
    category: 'Villa',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop',
  },
  'prop-1': {
    id: 'prop-1',
    title: 'Himalayan Cloud Retreat',
    location: 'Mussoorie, Uttarakhand',
    rating: 4.96,
    reviewsCount: 184,
    price: 3499,
    category: 'Resort',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
};

const TRENDING_EXPLORE_STAYS = [
  {
    id: 'prop-1',
    title: 'Himalayan Cloud Retreat',
    location: 'Mussoorie',
    rating: 4.96,
    price: 3499,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'd1',
    title: 'The Solitaire Resort',
    location: 'Dehradun',
    rating: 4.85,
    price: 6500,
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'n1',
    title: 'The Naini Retreat',
    location: 'Nainital',
    rating: 4.94,
    price: 12500,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'r1',
    title: 'Rishikesh Ganga Villa',
    location: 'Rishikesh',
    rating: 4.91,
    price: 5200,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
];

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, toggleSavedHotel, toggleSavedPackage } = useAuthStore();
  const [propertiesMap, setPropertiesMap] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadProperties() {
      try {
        const docs = await getProperties();
        if (docs && Array.isArray(docs) && docs.length > 0) {
          const map: Record<string, any> = {};
          docs.forEach((d: any) => {
            const rawPrice = Number(
              d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 3500
            );
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const photoUrl = photos[0]
              ? String(photos[0])
              : 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';

            map[String(d.$id)] = {
              id: String(d.$id),
              title: String(d.propertyName || d.title || 'Luxury Stay'),
              location: String(
                d.location || `${d.city || ''}, ${d.state || ''}`.trim() || 'Uttarakhand'
              ),
              rating: d.rating ? Number(d.rating) : 4.88,
              reviewsCount: d.reviews || 142,
              price: rawPrice,
              category: d.category || 'Resort',
              image: photoUrl,
            };
          });
          setPropertiesMap(map);
        }
      } catch (err) {
        console.error('Error loading properties for wishlist:', err);
      }
    }
    loadProperties();
  }, []);

  // --- Saved Stays ---
  const savedHotelIds = Array.isArray(profile?.savedHotels) ? profile.savedHotels : [];
  const savedHotels = savedHotelIds
    .map((id) =>
      propertiesMap[id] || {
        id: String(id),
        title: 'Saved Luxury Stay',
        location: 'Uttarakhand, India',
        rating: 4.9,
        reviewsCount: 110,
        price: 3500,
        category: 'Resort',
        image:
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
      }
    )
    .filter((item): item is any => Boolean(item && item.id));

  const totalSaved = savedHotels.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Bar */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 20) }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Wishlists</Text>
            <Text style={styles.headerSub}>
              {totalSaved} {totalSaved === 1 ? 'saved item' : 'saved items'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.searchCircleBtn}
            onPress={() => router.push('/(tabs)')}
          >
            <Search color={Colors.brand.navy} size={18} />
          </TouchableOpacity>
        </View>

      </View>

      {/* ── SAVED STAYS ── */}
      {savedHotels.length === 0 ? (
          <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.emptyHeroCard}>
              <View style={styles.emptyIconRing}>
                <View style={styles.emptyIconCore}>
                  <Heart color={Colors.brand.coral} fill={Colors.brand.coral} size={32} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>No saved stays yet</Text>
              <Text style={styles.emptySub}>
                Tap the ♡ heart on any resort or villa to save it here.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                activeOpacity={0.9}
                onPress={() => router.push('/stays' as any)}
              >
                <Text style={styles.exploreBtnText}>Explore Stays</Text>
                <ArrowRight color="#FFFFFF" size={16} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.listScrollContent} showsVerticalScrollIndicator={false}>
            {savedHotels.map((item) => (
              <TouchableOpacity
                key={String(item.id)}
                style={styles.savedItemCard}
                activeOpacity={0.92}
                onPress={() => router.push(`/hotel/${item.id}` as any)}
              >
                <Image source={{ uri: item.image }} style={styles.savedItemImage} />

                <View style={styles.savedItemBody}>
                  <View style={styles.savedItemTopRow}>
                    <View style={styles.ratingBadge}>
                      <Star color="#F59E0B" fill="#F59E0B" size={10} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.trashCircleBtn}
                      onPress={() => toggleSavedHotel(item.id)}
                    >
                      <Trash2 color="#EF4444" size={15} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.savedItemTitle} numberOfLines={1}>{item.title}</Text>

                  <View style={styles.locationRow}>
                    <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>

                  <View style={styles.savedItemFooter}>
                    <Text style={styles.savedItemPrice}>
                      ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      <Text style={styles.savedItemPerNight}>/night</Text>
                    </Text>

                    <View style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>View</Text>
                      <ArrowRight color="#FFFFFF" size={12} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  searchCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginTop: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: Colors.brand.navy,
    fontWeight: '900',
  },
  emptyScrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  emptyHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconCore: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '900',
  },
  trendingSection: {},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  gridCardImageContainer: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  gridCardImage: {
    width: '100%',
    height: '100%',
  },
  heartCircleBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridCardBody: {
    padding: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  gridCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  gridCardLocation: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  gridCardPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.coral,
    marginTop: 6,
  },
  gridCardPerNight: {
    fontSize: 10.5,
    fontWeight: '400',
    color: '#64748B',
  },
  listScrollContent: {
    padding: 16,
    paddingBottom: 90,
    gap: 14,
  },
  savedItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  savedItemImage: {
    width: 110,
    height: 110,
    borderRadius: 14,
  },
  savedItemBody: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  savedItemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trashCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedItemTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
  },
  savedItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  savedItemPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  savedItemPerNight: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '400',
  },
  viewBtn: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
});
