import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Search, MapPin, Calendar, Heart, Star, Sparkles, Filter, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

const POPULAR_DESTINATIONS = [
  { id: '1', name: 'Manali', state: 'Himachal Pradesh', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80', properties: 42 },
  { id: '2', name: 'Goa', state: 'West Coast', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', properties: 88 },
  { id: '3', name: 'Udaipur', state: 'Rajasthan', image: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=600&q=80', properties: 35 },
  { id: '4', name: 'Rishikesh', state: 'Uttarakhand', image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80', properties: 29 },
];

const FEATURED_PROPERTIES = [
  {
    id: 'prop-1',
    title: 'The Himalayan Cloud Retreat',
    location: 'Manali, Himachal Pradesh',
    rating: 4.9,
    reviewsCount: 124,
    price: 3499,
    originalPrice: 4999,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    tags: ['Superhost', 'Mountain View', 'Breakfast Included'],
  },
  {
    id: 'prop-2',
    title: 'Azure Bay Luxury Villa',
    location: 'Candolim, Goa',
    rating: 4.85,
    reviewsCount: 89,
    price: 5999,
    originalPrice: 7999,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    tags: ['Private Pool', 'Beachfront'],
  },
  {
    id: 'prop-3',
    title: 'Heritage Palace Suite',
    location: 'Udaipur, Rajasthan',
    rating: 4.95,
    reviewsCount: 210,
    price: 8499,
    originalPrice: 10999,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    tags: ['Lake View', 'Spa & Wellness'],
  },
];

export default function HomeScreen() {
  const { user, profile, checkAuth, toggleSavedHotel } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const savedHotels = profile?.savedHotels || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome to Racoonn</Text>
            <Text style={styles.userNameText}>
              {user ? `Hello, ${profile?.name || user.name || 'Traveler'} 👋` : 'Find your dream stay ✨'}
            </Text>
          </View>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🦝 Racoonn</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchCard}>
          <View style={styles.searchInputContainer}>
            <Search color="#64748b" size={20} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where do you want to go?"
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.searchDivider} />

          <View style={styles.searchRow}>
            <TouchableOpacity style={styles.searchFilterBtn}>
              <Calendar color="#64748b" size={16} />
              <Text style={styles.searchFilterText}>Dates</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchFilterBtn}>
              <MapPin color="#64748b" size={16} />
              <Text style={styles.searchFilterText}>Location</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.searchSubmitBtn}>
              <Search color="#ffffff" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Popular Destinations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight color="#0284c7" size={16} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {POPULAR_DESTINATIONS.map((dest) => (
            <TouchableOpacity key={dest.id} style={styles.destCard} activeOpacity={0.85}>
              <Image source={{ uri: dest.image }} style={styles.destImage} />
              <View style={styles.destOverlay} />
              <View style={styles.destContent}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destSub}>{dest.state} • {dest.properties} Stays</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Properties */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Sparkles color="#0284c7" size={20} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Featured Stays</Text>
          </View>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAllText}>Explore</Text>
            <ChevronRight color="#0284c7" size={16} />
          </TouchableOpacity>
        </View>

        {FEATURED_PROPERTIES.map((item) => {
          const isSaved = savedHotels.includes(item.id);
          return (
            <TouchableOpacity key={item.id} style={styles.propCard} activeOpacity={0.9}>
              <View style={styles.propImageContainer}>
                <Image source={{ uri: item.image }} style={styles.propImage} />
                <TouchableOpacity
                  style={styles.wishlistBtn}
                  onPress={() => toggleSavedHotel(item.id)}
                  activeOpacity={0.7}
                >
                  <Heart
                    color={isSaved ? '#ef4444' : '#ffffff'}
                    fill={isSaved ? '#ef4444' : 'transparent'}
                    size={20}
                  />
                </TouchableOpacity>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>{item.tags[0]}</Text>
                </View>
              </View>

              <View style={styles.propBody}>
                <View style={styles.propTitleRow}>
                  <Text style={styles.propTitle} numberOfLines={1}>{item.title}</Text>
                  <View style={styles.ratingBox}>
                    <Star color="#f59e0b" fill="#f59e0b" size={14} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                </View>

                <View style={styles.locationRow}>
                  <MapPin color="#64748b" size={14} style={{ marginRight: 4 }} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>

                <View style={styles.priceRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
                    <Text style={styles.perNightText}> / night</Text>
                    {item.originalPrice && (
                      <Text style={styles.originalPriceText}>₹{item.originalPrice.toLocaleString('en-IN')}</Text>
                    )}
                  </View>
                  <TouchableOpacity style={styles.bookNowBtn}>
                    <Text style={styles.bookNowText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  logoBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  logoText: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 14,
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchFilterText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 6,
  },
  searchSubmitBtn: {
    backgroundColor: '#0284c7',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#0284c7',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginBottom: 24,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  destCard: {
    width: 140,
    height: 180,
    borderRadius: 14,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  destImage: {
    width: '100%',
    height: '100%',
  },
  destOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  destContent: {
    position: 'absolute',
    bottom: 12,
    left: 10,
    right: 10,
  },
  destName: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  destSub: {
    color: '#e2e8f0',
    fontSize: 11,
    marginTop: 2,
  },
  propCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  propImageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  propImage: {
    width: '100%',
    height: '100%',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  propBody: {
    padding: 14,
  },
  propTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#64748b',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284c7',
  },
  perNightText: {
    fontSize: 12,
    color: '#64748b',
  },
  originalPriceText: {
    fontSize: 12,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  bookNowBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookNowText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
});
