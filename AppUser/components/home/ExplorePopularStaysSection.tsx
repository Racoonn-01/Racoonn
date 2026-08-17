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
import { Heart, ChevronRight, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getProperties, getCMSPopularStays } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Full width minus 20px left & right padding

interface SectionData {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  propertyIds?: string[];
  isActive: boolean;
  stays: any[];
}

export default function ExplorePopularStaysSection() {
  const router = useRouter();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [cmsSections, setCmsSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularStaysData() {
      try {
        setLoading(true);
        const [docs, cmsData] = await Promise.all([
          getProperties().catch(() => []),
          getCMSPopularStays().catch(() => []),
        ]);

        const activeDocs = (docs || []).filter((d: any) => isActiveProperty(d));
        const allPropsMapped = activeDocs.map((d: any, index: number) => {
          const rawPrice = Number(
            d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || d.amount || 3500
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

          return {
            id: String(d.$id || d.id || `stay-${index}`),
            title: String(d.propertyName || d.title || d.name || 'Luxury Stay'),
            location: formattedLocation,
            city: String(d.city || ''),
            ratingText: d.rating ? String(d.rating) : '4.8',
            price: rawPrice,
            image: photoUrl,
          };
        });

        // Match CMS sections configured by Admin (identical to User Portal DynamicPopularStays)
        if (Array.isArray(cmsData) && cmsData.length > 0) {
          const activeCMS = cmsData.filter((s: any) => s.isActive !== false);
          const builtSections: SectionData[] = [];

          activeCMS.forEach((sec: any) => {
            let matched: any[] = [];
            if (sec.propertyIds && Array.isArray(sec.propertyIds) && sec.propertyIds.length > 0) {
              matched = allPropsMapped.filter((p) => sec.propertyIds.includes(p.id));
            } else {
              const targetLoc = (sec.location && sec.location.toLowerCase() !== 'all')
                ? sec.location.trim().toLowerCase()
                : sec.title.toLowerCase().includes(' in ')
                ? sec.title.split(/ in /i)[1]?.trim().toLowerCase() || ''
                : '';

              if (targetLoc && targetLoc !== 'all') {
                matched = allPropsMapped.filter(
                  (p) =>
                    p.location.toLowerCase().includes(targetLoc) ||
                    p.city.toLowerCase().includes(targetLoc) ||
                    p.title.toLowerCase().includes(targetLoc)
                );
              } else {
                matched = allPropsMapped;
              }
            }

            if (matched.length > 0) {
              builtSections.push({
                id: String(sec.id || `sec-${Math.random()}`),
                title: String(sec.title || 'Popular Stays'),
                subtitle: String(sec.subtitle || 'Handpicked luxury stays'),
                location: sec.location,
                propertyIds: sec.propertyIds,
                isActive: true,
                stays: matched.slice(0, 4),
              });
            }
          });

          if (builtSections.length > 0) {
            setCmsSections(builtSections);
            setLoading(false);
            return;
          }
        }

        // Fallback single section if no active CMS section matches
        if (allPropsMapped.length > 0) {
          setCmsSections([
            {
              id: 'default-sec',
              title: 'Explore popular stays',
              subtitle: 'Handpicked luxury resorts & gateway stays',
              isActive: true,
              stays: allPropsMapped,
            },
          ]);
        } else {
          setCmsSections([]);
        }
      } catch {
        setCmsSections([]);
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

  if (cmsSections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {cmsSections.map((sec) => (
        <View key={sec.id} style={styles.sectionBlock}>
          {/* Section Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.title}>{sec.title}</Text>
              {sec.subtitle ? <Text style={styles.subtitle}>{sec.subtitle}</Text> : null}
            </View>
            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => router.push('/stays' as any)}
            >
              <Text style={styles.viewAllText}>View all</Text>
              <ChevronRight color={Colors.brand.coral} size={16} />
            </TouchableOpacity>
          </View>

          {/* Horizontal Carousel displaying cards with smooth snapping */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            snapToAlignment="start"
            contentContainerStyle={styles.scrollContent}
          >
            {sec.stays.map((item) => {
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
                        color={isSaved ? Colors.brand.coral : '#1F2E4A'}
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
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>

                      <View style={styles.ratingBadge}>
                        <Star color={Colors.brand.coral} fill={Colors.brand.coral} size={13} />
                        <Text style={styles.ratingText}>{item.ratingText}</Text>
                      </View>
                    </View>


                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.3,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
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
    borderRadius: 24,
    padding: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  imageContainer: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
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
    paddingTop: 12,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  locationRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.coral,
  },
  priceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  perNight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
  },
});
