import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Heart, ChevronRight, Star, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getProperties, getCMSPopularStays } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

interface CMSSection {
  id: string;
  title: string;
  subtitle: string;
  location?: string;
  isActive: boolean;
  order?: number;
  propertyIds?: string[];
  stays: any[];
}

export default function DynamicPopularStaysSection() {
  const router = useRouter();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCMSPopularStays() {
      try {
        setLoading(true);
        const [docs, cmsData] = await Promise.all([
          getProperties().catch(() => []),
          getCMSPopularStays().catch(() => []),
        ]);

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
            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop';

          const formattedLocation = String(
            d.location || d.address || [d.city, d.state].filter(Boolean).join(', ') || 'Uttarakhand'
          );

          const hasReviews = Number(d.reviewsCount || 0) > 0 && Number(d.rating || 0) > 0;

          return {
            id: String(d.$id || d.id || `stay-${index}`),
            title: String(d.propertyName || d.title || d.name || 'Luxury Stay'),
            location: formattedLocation,
            city: String(d.city || ''),
            details: String(d.description || d.subtitle || 'Handpicked luxury stay'),
            ratingText: hasReviews ? Number(d.rating).toFixed(1) : 'New',
            reviewsCount: Number(d.reviewsCount || 0),
            price: rawPrice,
            image: photoUrl,
          };
        });

        if (Array.isArray(cmsData) && cmsData.length > 0) {
          const activeCMS = cmsData.filter((s: any) => s.isActive !== false);
          const builtSections: CMSSection[] = [];

          activeCMS.forEach((sec: any) => {
            let matched: any[] = [];
            // 1. If Admin selected specific property IDs in CMS
            if (sec.propertyIds && Array.isArray(sec.propertyIds) && sec.propertyIds.length > 0) {
              matched = allPropsMapped.filter((p) => sec.propertyIds.includes(p.id));
            } else {
              // 2. Location based matching (e.g. Haldwani, Nainital, Kainchi dham)
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

            // Only include section if matching properties exist
            if (matched.length > 0) {
              builtSections.push({
                id: String(sec.id || `sec-${Math.random()}`),
                title: String(sec.title || 'Popular Stays'),
                subtitle: String(sec.subtitle || 'Handpicked luxury resorts & gateway stays'),
                location: sec.location,
                propertyIds: sec.propertyIds,
                isActive: true,
                order: sec.order || 0,
                stays: matched.slice(0, 6),
              });
            }
          });

          // Sort by CMS order
          builtSections.sort((a, b) => (a.order || 0) - (b.order || 0));

          if (builtSections.length > 0) {
            setSections(builtSections);
            setLoading(false);
            return;
          }
        }

        setSections([]);
      } catch {
        setSections([]);
      } finally {
        setLoading(false);
      }
    }

    loadCMSPopularStays();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.brand.coral} />
      </View>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {sections.map((sec) => {
        const targetLocation = (sec.location && sec.location.toLowerCase() !== 'all')
          ? sec.location.trim()
          : sec.title.toLowerCase().includes(' in ')
          ? sec.title.split(/ in /i)[1]?.trim() || ''
          : '';

        return (
          <View key={sec.id} style={styles.sectionBlock}>
            {/* Header matching User Portal */}
            <View style={styles.header}>
              <View style={styles.headerTextCol}>
                <Text style={styles.title}>{sec.title}</Text>
                {sec.subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {sec.subtitle}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.viewAllBtn}
                onPress={() => {
                  if (targetLocation) {
                    router.push({
                      pathname: '/stays' as any,
                      params: { location: targetLocation },
                    });
                  } else {
                    router.push('/stays' as any);
                  }
                }}
              >
                <Text style={styles.viewAllText}>View all</Text>
                <ChevronRight color={Colors.brand.coral} size={15} style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>

            {/* Horizontal Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
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
                    <View style={styles.imageBox}>
                      <Image source={{ uri: item.image }} style={styles.image} />
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

                    <View style={styles.cardBody}>
                      <View style={styles.ratingBadge}>
                        <Star color="#F59E0B" fill="#F59E0B" size={11} />
                        <Text style={styles.ratingText}>{item.ratingText}</Text>
                        {item.reviewsCount > 0 && item.ratingText !== 'New' && (
                          <Text style={styles.reviewsText}> ({item.reviewsCount})</Text>
                        )}
                      </View>

                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                      </Text>

                      <View style={styles.locationRow}>
                        <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {item.location}
                        </Text>
                      </View>

                      <Text style={styles.detailsText} numberOfLines={1}>
                        {item.details}
                      </Text>

                      <View style={styles.cardFooter}>
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
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBlock: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
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
    marginTop: 3,
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
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 14,
  },
  card: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  imageBox: {
    height: 140,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 3,
  },
  reviewsText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
    flex: 1,
  },
  detailsText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  perNight: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
});
