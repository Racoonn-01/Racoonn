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
  ActivityIndicator,
} from 'react-native';
import {
  Heart,
  MapPin,
  Star,
  Trash2,
  ArrowRight,
  Search,
  Building2,
  Package,
  Calendar,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import Colors from '@/constants/Colors';
import { REAL_STAY_IMAGE, REAL_PACKAGE_IMAGE } from '@/constants/RealImages';
import { getProperties, getCMSPackages } from '../../lib/appwrite/api';
import { packages as ALL_PACKAGES } from '../../data/packages';

// Build a fallback lookup map from local mock packages data
const LOCAL_PACKAGES_MAP: Record<string, any> = {};
ALL_PACKAGES.forEach((p: any) => {
  LOCAL_PACKAGES_MAP[String(p.id)] = p;
});

export default function WishlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, toggleSavedHotel, toggleSavedPackage } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'stays' | 'packages'>('stays');
  const [propertiesMap, setPropertiesMap] = useState<Record<string, any>>({});
  const [packagesMap, setPackagesMap] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [docs, cmsPkgs] = await Promise.all([
          getProperties().catch(() => []),
          getCMSPackages().catch(() => []),
        ]);

        // 1. Process Properties Map
        if (docs && Array.isArray(docs) && docs.length > 0) {
          const pMap: Record<string, any> = {};
          docs.forEach((d: any) => {
            const rawPrice = Number(
              d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 0
            );
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const photoUrl = photos[0] ? String(photos[0]) : REAL_STAY_IMAGE;

            pMap[String(d.$id)] = {
              id: String(d.$id),
              title: String(d.propertyName || d.title || 'Luxury Stay'),
              location: String(
                d.location || `${d.city || ''}, ${d.state || ''}`.trim() || 'Uttarakhand'
              ),
              rating: d.rating ? Number(d.rating) : 4.8,
              reviewsCount: Number(d.reviewsCount || 0),
              price: rawPrice,
              category: d.category || 'Resort',
              image: photoUrl,
            };
          });
          setPropertiesMap(pMap);
        }

        // 2. Process Packages Map
        const pkgMap: Record<string, any> = {};
        if (cmsPkgs && Array.isArray(cmsPkgs) && cmsPkgs.length > 0) {
          cmsPkgs.forEach((pkg: any) => {
            const citiesList: any[] = Array.isArray(pkg.departureCities) ? pkg.departureCities : [];
            const defaultCity = citiesList.find((c: any) => c.isDefault) || citiesList[0] || null;
            const minPrice = defaultCity && Number(defaultCity.pricePerPerson) > 0
              ? Number(defaultCity.pricePerPerson)
              : (Array.isArray(pkg.pricing) && pkg.pricing[0] && Number(pkg.pricing[0].pricePerPerson) > 0
                  ? Number(pkg.pricing[0].pricePerPerson)
                  : Number(pkg.price || 0));
            const safePrice = isNaN(minPrice) || minPrice === 0 ? Number(pkg.price || 0) : minPrice;

            const pkgImg = Array.isArray(pkg.images) && pkg.images[0]
              ? String(pkg.images[0])
              : REAL_PACKAGE_IMAGE;

            const durationStr = pkg.duration ||
              (Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0
                ? `${pkg.itinerary.length + 1}D / ${pkg.itinerary.length}N`
                : '5D / 4N');

            const item = {
              id: String(pkg.id || pkg.$id),
              title: pkg.title || 'Tour Package',
              location: pkg.location || pkg.metaTitle || 'Uttarakhand, India',
              duration: durationStr,
              price: safePrice,
              rating: pkg.rating ? Number(pkg.rating) : 4.9,
              image: pkgImg,
              badge: pkg.badge || 'Featured',
            };

            if (pkg.$id) pkgMap[String(pkg.$id)] = item;
            if (pkg.id) pkgMap[String(pkg.id)] = item;
          });
        }
        setPackagesMap(pkgMap);
      } catch (err) {
        console.error('Error loading wishlist resources:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Collect all saved IDs from profile
  const savedHotelIds: string[] = Array.isArray(profile?.savedHotels) ? profile.savedHotels : [];
  const savedPackageIds: string[] = Array.isArray(profile?.savedPackages) ? profile.savedPackages : [];

  // Union of all saved IDs across both arrays
  const allSavedIds = Array.from(new Set([...savedHotelIds, ...savedPackageIds]));

  // Build Saved Stays list:
  // If an ID is found in propertiesMap, it is definitely a Stay.
  // If an ID was explicitly in savedHotels AND is not a package, treat as Stay.
  const savedHotels = allSavedIds
    .filter((id) => {
      if (propertiesMap[id]) return true;
      if (packagesMap[id] || LOCAL_PACKAGES_MAP[id]) return false;
      return savedHotelIds.includes(id);
    })
    .map((id) =>
      propertiesMap[id] || {
        id: String(id),
        title: 'Saved Luxury Stay',
        location: 'Uttarakhand, India',
        rating: 4.8,
        reviewsCount: 12,
        price: 3500,
        category: 'Resort',
        image: REAL_STAY_IMAGE,
      }
    )
    .filter((item): item is any => Boolean(item && item.id));

  // Build Saved Packages list:
  // If an ID is found in packagesMap or LOCAL_PACKAGES_MAP, it is definitely a Package!
  // If an ID was in savedPackages, treat as Package!
  const savedPackages = allSavedIds
    .filter((id) => {
      if (packagesMap[id] || LOCAL_PACKAGES_MAP[id]) return true;
      if (propertiesMap[id]) return false;
      return savedPackageIds.includes(id);
    })
    .map((id) => {
      if (packagesMap[id]) return packagesMap[id];
      if (LOCAL_PACKAGES_MAP[id]) {
        const local = LOCAL_PACKAGES_MAP[id];
        return {
          id: String(local.id),
          title: local.title,
          location: local.location,
          duration: local.duration,
          price: Number(String(local.price).replace(/[^0-9]/g, '')) || 9999,
          rating: 4.9,
          image: local.images?.[0] || REAL_PACKAGE_IMAGE,
          badge: local.badge || 'Tour',
        };
      }
      return {
        id: String(id),
        title: 'Saved Tour Package',
        location: 'Uttarakhand, India',
        duration: '5 Days / 4 Nights',
        price: 9999,
        rating: 4.9,
        image: REAL_PACKAGE_IMAGE,
        badge: 'Featured',
      };
    })
    .filter((item): item is any => Boolean(item && item.id));

  const totalSaved = savedHotels.length + savedPackages.length;

  const handleRemoveStay = (id: string) => {
    toggleSavedHotel(id);
    if (savedPackageIds.includes(id)) {
      toggleSavedPackage(id);
    }
  };

  const handleRemovePackage = (id: string) => {
    toggleSavedPackage(id);
    if (savedHotelIds.includes(id)) {
      toggleSavedHotel(id);
    }
  };

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

        {/* Tab Toggle: Stays vs Packages */}
        <View style={styles.tabBarContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'stays' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('stays')}
          >
            <Building2
              color={activeTab === 'stays' ? Colors.brand.coral : '#64748B'}
              size={15}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'stays' && styles.tabBtnTextActive,
              ]}
            >
              Stays ({savedHotels.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'packages' && styles.tabBtnActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('packages')}
          >
            <Package
              color={activeTab === 'packages' ? Colors.brand.coral : '#64748B'}
              size={15}
            />
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'packages' && styles.tabBtnTextActive,
              ]}
            >
              Tour Packages ({savedPackages.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Loading Spinner ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.coral} />
          <Text style={styles.loadingText}>Loading your wishlists...</Text>
        </View>
      ) : (
        <>
          {/* ── TAB 1: SAVED STAYS ── */}
          {activeTab === 'stays' && (
            savedHotels.length === 0 ? (
              <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.emptyHeroCard}>
                  <View style={styles.emptyIconRing}>
                    <View style={styles.emptyIconCore}>
                      <Building2 color={Colors.brand.coral} size={30} />
                    </View>
                  </View>
                  <Text style={styles.emptyTitle}>No saved stays yet</Text>
                  <Text style={styles.emptySub}>
                    Tap the ♡ heart on any hotel, resort, or villa to save it here for later.
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
                          onPress={() => handleRemoveStay(item.id)}
                        >
                          <Trash2 color="#EF4444" size={15} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.savedItemTitle} numberOfLines={1}>{item.title}</Text>

                      <View style={styles.locationRow}>
                        <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                        <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
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
          )}

          {/* ── TAB 2: SAVED PACKAGES ── */}
          {activeTab === 'packages' && (
            savedPackages.length === 0 ? (
              <ScrollView contentContainerStyle={styles.emptyScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.emptyHeroCard}>
                  <View style={styles.emptyIconRing}>
                    <View style={styles.emptyIconCore}>
                      <Package color={Colors.brand.coral} size={30} />
                    </View>
                  </View>
                  <Text style={styles.emptyTitle}>No saved packages yet</Text>
                  <Text style={styles.emptySub}>
                    Tap the ♡ heart on any holiday or tour package to bookmark it for future travel.
                  </Text>
                  <TouchableOpacity
                    style={styles.exploreBtn}
                    activeOpacity={0.9}
                    onPress={() => router.push('/packages' as any)}
                  >
                    <Text style={styles.exploreBtnText}>Explore Packages</Text>
                    <ArrowRight color="#FFFFFF" size={16} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={styles.listScrollContent} showsVerticalScrollIndicator={false}>
                {savedPackages.map((pkg) => (
                  <TouchableOpacity
                    key={String(pkg.id)}
                    style={styles.savedItemCard}
                    activeOpacity={0.92}
                    onPress={() => router.push(`/packages/${pkg.id}` as any)}
                  >
                    <Image source={{ uri: pkg.image }} style={styles.savedItemImage} />

                    <View style={styles.savedItemBody}>
                      <View style={styles.savedItemTopRow}>
                        <View style={styles.durationBadge}>
                          <Calendar color={Colors.brand.coral} size={11} style={{ marginRight: 3 }} />
                          <Text style={styles.durationBadgeText}>{pkg.duration}</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.trashCircleBtn}
                          onPress={() => handleRemovePackage(pkg.id)}
                        >
                          <Trash2 color="#EF4444" size={15} />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.savedItemTitle} numberOfLines={1}>{pkg.title}</Text>

                      <View style={styles.locationRow}>
                        <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                        <Text style={styles.locationText} numberOfLines={1}>{pkg.location}</Text>
                      </View>

                      <View style={styles.savedItemFooter}>
                        <Text style={styles.savedItemPrice}>
                          ₹{Number(pkg.price || 0).toLocaleString('en-IN')}
                          <Text style={styles.savedItemPerNight}>/person</Text>
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
          )}
        </>
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 14,
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
    padding: 4,
    marginTop: 14,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
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
    marginTop: 20,
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
    paddingHorizontal: 10,
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
  listScrollContent: {
    padding: 16,
    paddingBottom: 140,
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
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Colors.brand.coral,
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
