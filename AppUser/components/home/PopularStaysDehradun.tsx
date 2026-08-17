import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Star, Heart, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getProperties } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

export default function PopularStaysDehradun() {
  const router = useRouter();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [stays, setStays] = useState<any[]>([]);

  useEffect(() => {
    async function loadDehradunStays() {
      try {
        const docs = await getProperties();
        if (docs && docs.length > 0) {
          const dehradunDocs = docs.filter((d: any) => {
            if (!isActiveProperty(d)) return false;
            const loc = String(d.location || `${d.city || ''} ${d.state || ''}`).toLowerCase();
            return loc.includes('dehradun');
          });

          const mapped = dehradunDocs.map((d: any) => {
            const rawPrice = Number(d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 3500);
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const photoUrl = photos[0] ? String(photos[0]) : 'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=800&auto=format&fit=crop';

            return {
              id: String(d.$id),
              title: String(d.propertyName || d.title || 'Dehradun Stay'),
              location: String(d.location || d.city || 'Dehradun'),
              details: String(d.description || 'Premium stay with mountain view'),
              price: `₹${rawPrice.toLocaleString('en-IN')}`,
              rating: d.rating ? String(d.rating) : 'New',
              reviews: Number(d.reviewsCount || 0),
              image: photoUrl,
            };
          });

          setStays(mapped);
        } else {
          setStays([]);
        }
      } catch {
        setStays([]);
      }
    }
    loadDehradunStays();
  }, []);

  if (stays.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Popular Stays in Dehradun</Text>
          <Text style={styles.subtitle}>Handpicked luxury resorts & valley retreats</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {stays.map((item) => {
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
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>

                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                
                <View style={styles.locationRow}>
                  <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                  <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                </View>

                <Text style={styles.detailsText} numberOfLines={1}>{item.details}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.priceText}>{item.price} <Text style={styles.perNight}>/ night</Text></Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 3,
  },
  reviewsText: {
    fontSize: 10,
    color: '#B45309',
    marginLeft: 3,
  },
  cardTitle: {
    fontSize: 15,
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
    fontSize: 11,
    color: '#64748B',
  },
  detailsText: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 10,
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  perNight: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});
