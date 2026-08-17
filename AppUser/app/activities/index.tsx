import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, MapPin, Clock, Users, Navigation } from 'lucide-react-native';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'react-native-appwrite';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface Activity {
  $id: string;
  title: string;
  location: string;
  duration: string;
  groupSize: string;
  price: string;
  image: string;
  images?: string[];
  description?: string;
  category: string;
}

export default function ActivitiesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const searchQuery = typeof params.q === 'string' ? params.q.toLowerCase() : '';

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const queries = [Query.orderDesc('$createdAt')];
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.activitiesCollectionId,
          queries
        );
        let data = res.documents as unknown as Activity[];
        
        // Local filtering
        if (searchQuery) {
          data = data.filter(
            (act) =>
              act.title?.toLowerCase().includes(searchQuery) ||
              act.location?.toLowerCase().includes(searchQuery) ||
              act.category?.toLowerCase().includes(searchQuery)
          );
        }
        
        setActivities(data);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [searchQuery]);

  const renderActivity = ({ item }: { item: Activity }) => {
    const images = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
    const coverImage = images[0] || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';

    return (
      <View style={styles.card}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: coverImage }} style={styles.image} resizeMode="cover" />
          {item.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          
          <View style={styles.locationRow}>
            <MapPin size={14} color={Colors.brand.coral} />
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBadge}>
              <Clock size={14} color="#64748B" />
              <Text style={styles.infoText}>
                {item.duration}
                {!/[a-zA-Z]/.test(item.duration) ? ' Days' : ''}
              </Text>
            </View>
            <View style={styles.infoBadge}>
              <Users size={14} color="#64748B" />
              <Text style={styles.infoText}>
                {item.groupSize}
                {!item.groupSize.toLowerCase().includes('people') && !item.groupSize.toLowerCase().includes('person') ? ' People' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.priceLabel}>STARTING FROM</Text>
              <Text style={styles.priceValue}>
                {item.price.startsWith('₹') || item.price.startsWith('Rs') ? item.price : `₹${item.price}`}
              </Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} activeOpacity={0.8}>
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discover Activities</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.brand.coral} />
        </View>
      ) : activities.length === 0 ? (
        <View style={styles.centerContainer}>
          <Navigation size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No Activities Found</Text>
          <Text style={styles.emptySub}>
            {searchQuery ? `We couldn't find anything for "${searchQuery}".` : "Check back later for curated adventures."}
          </Text>
          {searchQuery ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => router.setParams({ q: '' })}>
              <Text style={styles.clearBtnText}>Clear Search</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.$id}
          renderItem={renderActivity}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Curated Adventures</Text>
              <Text style={styles.listHeaderSub}>Elevate your travel experience with local activities.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    marginBottom: 20,
  },
  listHeaderTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Black',
    color: '#0F172A',
    marginBottom: 4,
  },
  listHeaderSub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    color: Colors.brand.navy,
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#475569',
    marginLeft: 6,
    flex: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontFamily: 'Inter-Black',
    color: Colors.brand.navy,
  },
  bookBtn: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearBtn: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearBtnText: {
    color: Colors.brand.coral,
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
});
