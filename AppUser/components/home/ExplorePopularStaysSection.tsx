import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Heart, ChevronRight, Star, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getProperties } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function ExplorePopularStaysSection() {
  const router = useRouter();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularStaysData() {
      try {
        setLoading(true);
        const docs = await getProperties().catch(() => []);

        const activeDocs = (docs || []).filter((d: any) => isActiveProperty(d));
        const allPropsMapped = activeDocs.map((d: any, index: number) => {
          const rawPrice = Number(
            d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || d.amount || 0
          );
          const photos = Array.isArray(d.photos) && d.photos.length > 0
            ? d.photos
            : Array.isArray(d.images) && d.images.length > 0
              ? d.images
              : typeof d.photoUrl === 'string' ? [d.photoUrl] : [];

          const photoUrl = photos[0]
            ? String(photos[0])
            : 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';

          const formattedLocation = String(
            d.location || d.address || [d.city, d.state].filter(Boolean).join(', ') || 'Uttarakhand'
          );

          const hasReviews = Number(d.reviewsCount || 0) > 0 && Number(d.rating || 0) > 0;

          return {
            id: String(d.$id || d.id || `stay-${index}`),
            title: String(d.propertyName || d.title || d.name || 'Luxury Stay'),
            location: formattedLocation,
            city: String(d.city || ''),
            details: String(d.description || 'Premium scenic stay'),
            ratingText: hasReviews ? Number(d.rating).toFixed(1) : 'New',
            reviewsCount: Number(d.reviewsCount || 0),
            price: rawPrice,
            image: photoUrl,
          };
        });

        setStays(allPropsMapped);
      } catch {
        setStays([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPopularStaysData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.brand.coral} />
      </View>
    );
  }

  if (stays.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header matching User Portal */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.title}>Explore popular stays</Text>
          <Text style={styles.subtitle}>Handpicked luxury resorts & gateway stays</Text>
        </View>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/stays' as any)}
        >
          <Text style={styles.viewAllText}>View all</Text>
          <ChevronRight color={Colors.brand.coral} size={16} />
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {stays.map((item) => {
          const isSaved = savedHotelIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => router.push(`/hotel/${item.id}` as any)}
            >
              {/* Image Container with Top-Right Heart Button */}
              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => toggleSavedHotel(item.id)}
                  activeOpacity={0.8}
                >
                  <Heart
                    color={isSaved ? Colors.brand.coral : '#FFFFFF'}
                    fill={isSaved ? Colors.brand.coral : 'transparent'}
                    size={18}
                  />
                </TouchableOpacity>
              </View>

              {/* Title & Location / Rating & Price Row */}
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.locationRatingRow}>
                  <View style={styles.locationWrap}>
                    <MapPin color="#64748B" size={12} style={{ marginRight: 3 }} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>

                  <View style={styles.ratingBadge}>
                    <Star
                      color={item.ratingText === 'New' ? Colors.brand.coral : '#F59E0B'}
                      fill={item.ratingText === 'New' ? Colors.brand.coral : '#F59E0B'}
                      size={12}
                    />
                    <Text style={[styles.ratingText, item.ratingText === 'New' && { color: Colors.brand.coral }]}>
                      {item.ratingText}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>
                    {item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Check Rates'}{' '}
                    <Text style={styles.perNight}>/ night</Text>
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 17,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.coral,
    marginRight: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  locationRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  perNight: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#64748B',
  },
});
