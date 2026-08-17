import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { getCMSPopularDestinations } from '../../lib/appwrite/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40; // Full screen width minus 20px padding on left & right

export default function PopularDestinationsSection() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        setLoading(true);
        const fetchedDestinations = await getCMSPopularDestinations();
        setDestinations(fetchedDestinations);
      } catch (err) {
        console.error('Error fetching CMS destinations', err);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    }
    fetchDestinations();
  }, []);

  if (loading || destinations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.badgeText}>EXPLORE UTTARAKHAND</Text>
        <Text style={styles.title}>
          Popular Destinations in <Text style={styles.titleHighlight}>Uttarakhand</Text>
        </Text>
        <Text style={styles.subtitle}>
          From serene mountains to spiritual towns, explore the best stays and packages in Devbhoomi.
        </Text>
      </View>

      {/* Horizontal Destinations Carousel - One Card at a Time */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
      >
        {destinations.map((dest) => (
          <TouchableOpacity
            key={dest.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push('/stays' as any)}
          >
            <Image source={{ uri: dest.image }} style={styles.cardImage} />
            <View style={styles.darkGradientOverlay} />

            {/* Top Left City Tag */}
            <View style={styles.cityTag}>
              <MapPin color={Colors.brand.coral} fill={Colors.brand.coral} size={14} />
              <Text style={styles.cityName}>{dest.city}</Text>
            </View>

            {/* Bottom Content */}
            <View style={styles.bottomContent}>
              <Text style={styles.descriptionText} numberOfLines={2}>
                {dest.description}
              </Text>

              <View style={styles.pricePill}>
                <Text style={styles.pricePillText}>Stays from ₹{dest.price}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* View All Button */}
      <View style={styles.viewAllWrapper}>
        <TouchableOpacity
          style={styles.viewAllBtn}
          onPress={() => router.push('/stays' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewAllBtnText}>View all destinations</Text>
          <ArrowRight color={Colors.brand.coral} size={18} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
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
    marginBottom: 20,
  },
  badgeText: {
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
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 380,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.brand.navy,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  darkGradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  cityTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  cityName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    gap: 12,
  },
  descriptionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  pricePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  pricePillText: {
    color: Colors.brand.navy,
    fontSize: 13,
    fontWeight: '800',
  },
  viewAllWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  viewAllBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.brand.coral,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllBtnText: {
    color: Colors.brand.coral,
    fontSize: 14,
    fontWeight: '800',
  },
});
