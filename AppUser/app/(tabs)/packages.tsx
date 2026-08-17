import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  SlidersHorizontal,
  ChevronDown,
  MapPin,
  Clock,
  Utensils,
  Heart,
  ArrowRight,
  PackageSearch,
  Check,
  X,
  Search,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { getCMSPackages } from '../../lib/appwrite/api';
import { useAuthStore } from '../../store/authStore';

const FILTERS = [
  'Price',
  'Duration',
  'Uttarakhand',
  'Himachal',
  'Goa',
  'International',
  'Bestseller',
  'Trending',
  'New',
];

const HISTOGRAM_BARS = [
  6, 8, 12, 16, 24, 38, 48, 56, 52, 44, 32, 22, 16, 28, 40, 36, 24, 14, 10, 6,
  4, 4, 3, 2,
];

interface DraggablePriceHistogramProps {
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  absMin?: number;
  absMax?: number;
}

function DraggablePriceHistogram({
  minPrice,
  maxPrice,
  onPriceChange,
  absMin = 1000,
  absMax = 100000,
}: DraggablePriceHistogramProps) {
  const [trackWidth, setTrackWidth] = useState(300);
  const thumbDiameter = 32;

  const currentMinRef = useRef(minPrice);
  const currentMaxRef = useRef(maxPrice);
  const trackWidthRef = useRef(trackWidth);
  const onPriceChangeRef = useRef(onPriceChange);
  const initialMinRef = useRef(minPrice);
  const initialMaxRef = useRef(maxPrice);

  useEffect(() => {
    currentMinRef.current = minPrice;
    currentMaxRef.current = maxPrice;
    trackWidthRef.current = trackWidth;
    onPriceChangeRef.current = onPriceChange;
  }, [minPrice, maxPrice, trackWidth, onPriceChange]);

  const maxTravel = Math.max(1, trackWidth - thumbDiameter);
  const minRatio = Math.min(1, Math.max(0, (minPrice - absMin) / (absMax - absMin)));
  const maxRatio = Math.min(1, Math.max(0, (maxPrice - absMin) / (absMax - absMin)));

  const leftThumbX = minRatio * maxTravel;
  const rightThumbX = maxRatio * maxTravel;

  const leftPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          initialMinRef.current = currentMinRef.current;
          initialMaxRef.current = currentMaxRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const tw = Math.max(1, trackWidthRef.current - thumbDiameter);
          const startX = ((initialMinRef.current - absMin) / (absMax - absMin)) * tw;
          const currentMaxX = ((currentMaxRef.current - absMin) / (absMax - absMin)) * tw;
          const newX = Math.max(
            0,
            Math.min(currentMaxX - 24, startX + gestureState.dx)
          );
          const rawMin = absMin + (newX / tw) * (absMax - absMin);
          const steppedMin = Math.round(rawMin / 500) * 500;
          onPriceChangeRef.current(steppedMin, currentMaxRef.current);
        },
      }),
    [absMin, absMax]
  );

  const rightPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          initialMinRef.current = currentMinRef.current;
          initialMaxRef.current = currentMaxRef.current;
        },
        onPanResponderMove: (_, gestureState) => {
          const tw = Math.max(1, trackWidthRef.current - thumbDiameter);
          const startX = ((initialMaxRef.current - absMin) / (absMax - absMin)) * tw;
          const currentMinX = ((currentMinRef.current - absMin) / (absMax - absMin)) * tw;
          const newX = Math.max(
            currentMinX + 24,
            Math.min(tw, startX + gestureState.dx)
          );
          const rawMax = absMin + (newX / tw) * (absMax - absMin);
          const steppedMax = Math.round(rawMax / 500) * 500;
          onPriceChangeRef.current(currentMinRef.current, steppedMax);
        },
      }),
    [absMin, absMax]
  );

  return (
    <View
      style={styles.histogramContainer}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setTrackWidth(w);
      }}
    >
      <View style={styles.barsRow}>
        {HISTOGRAM_BARS.map((height, idx) => {
          const barRatio = idx / (HISTOGRAM_BARS.length - 1);
          const barPrice = absMin + barRatio * (absMax - absMin);
          const isActive = barPrice >= minPrice && barPrice <= maxPrice;
          return (
            <View
              key={idx}
              style={[
                styles.histogramBar,
                { height: height * 1.25 },
                isActive ? styles.histogramBarActive : styles.histogramBarInactive,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.sliderTrackLine}>
        <View
          style={[
            styles.activeSliderFill,
            {
              left: leftThumbX + 16,
              width: Math.max(0, rightThumbX - leftThumbX),
            },
          ]}
        />

        {/* Left Thumb Handle (Draggable) */}
        <View
          {...leftPanResponder.panHandlers}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={[
            styles.draggableSliderHandle,
            { left: leftThumbX },
          ]}
        />

        {/* Right Thumb Handle (Draggable) */}
        <View
          {...rightPanResponder.panHandlers}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={[
            styles.draggableSliderHandle,
            { left: rightThumbX },
          ]}
        />
      </View>
    </View>
  );
}

const DURATION_OPTIONS = [
  { id: 'any', label: 'Any' },
  { id: 'short', label: '1 - 4 Days' },
  { id: 'medium', label: '5 - 6 Days' },
  { id: 'long', label: '7+ Days' },
];

const SORT_OPTIONS = [
  { id: 'none', label: 'Default' },
  { id: 'lowToHigh', label: 'Price: Low to High' },
  { id: 'highToLow', label: 'Price: High to Low' },
];

export default function PackagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, toggleSavedPackage } = useAuthStore();
  const savedPackageIds = profile?.savedPackages || [];

  // Page level state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [packageList, setPackageList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Separate Modal States: 'price' | 'filters' | null
  const [activeModalMode, setActiveModalMode] = useState<'price' | 'filters' | null>(null);

  // Search Query State
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState(typeof params.q === 'string' ? params.q : '');

  useEffect(() => {
    if (typeof params.q === 'string') {
      setSearchQuery(params.q);
    }
  }, [params.q]);

  // Price Inputs State
  const [minPriceInput, setMinPriceInput] = useState('1000');
  const [maxPriceInput, setMaxPriceInput] = useState('100000');
  const [appliedMinPrice, setAppliedMinPrice] = useState(1000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(100000);

  // Duration & Sort State
  const [durationOption, setDurationOption] = useState<string>('any');
  const [sortOption, setSortOption] = useState<string>('none');

  useEffect(() => {
    async function loadPackages() {
      setLoading(true);
      try {
        const cmsPkgs = await getCMSPackages();
        if (cmsPkgs && Array.isArray(cmsPkgs) && cmsPkgs.length > 0) {
          const publishedOnly = cmsPkgs.filter((p: any) => p.status === 'published');
          if (publishedOnly.length > 0) {
            const mapped = publishedOnly.map((cmsPkg: any) => {
              const minPrice =
                cmsPkg.pricing && cmsPkg.pricing[0] ? cmsPkg.pricing[0].pricePerPerson : 0;
              return {
                id: cmsPkg.id,
                title: cmsPkg.title,
                location: cmsPkg.metaTitle || 'Uttarakhand',
                duration:
                  cmsPkg.itinerary && cmsPkg.itinerary.length > 0
                    ? `${cmsPkg.itinerary.length + 1} Days / ${cmsPkg.itinerary.length} Nights`
                    : '5 Days / 4 Nights',
                features: 'Meals | Stay | Transfer',
                price: `₹${minPrice.toLocaleString('en-IN')}`,
                badge: 'Featured',
                badgeColor: Colors.brand.coral,
                images:
                  cmsPkg.images && cmsPkg.images.length > 0
                    ? cmsPkg.images
                    : ['https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80'],
              };
            });
            setPackageList(mapped);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading CMS packages in AppUser:', err);
      }

      // No fallback to mock packages - realtime only
      setPackageList([]);
      setLoading(false);
    }

    loadPackages();
  }, []);

  const parsePriceNum = (priceStr: string | number) =>
    Number(String(priceStr).replace(/[^0-9]/g, '')) || 0;

  const parseDaysNum = (durStr: string) => {
    const match = String(durStr).match(/(\d+)\s*Days?/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  const toggleCategoryFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  const filterHelper = (
    minP: number,
    maxP: number,
    dur: string,
    catFilters: string[]
  ) => {
    return packageList.filter((pkg) => {
      const p = parsePriceNum(pkg.price);
      if (p < minP || p > maxP) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (pkg.title || '').toLowerCase().includes(q);
        const locMatch = (pkg.location || '').toLowerCase().includes(q);
        if (!titleMatch && !locMatch) return false;
      }

      if (dur !== 'any') {
        const d = parseDaysNum(pkg.duration);
        if (dur === 'short' && d > 4) return false;
        if (dur === 'medium' && (d < 5 || d > 6)) return false;
        if (dur === 'long' && d < 7) return false;
      }

      if (catFilters.length > 0) {
        const actualCatFilters = catFilters.filter((f) => f !== 'Price' && f !== 'Duration');
        if (actualCatFilters.length > 0) {
          const matchesCat = actualCatFilters.some((filter) => {
            const locationMatch = (pkg.location || '').toLowerCase().includes(filter.toLowerCase());
            const badgeMatch = (pkg.badge || '').toLowerCase().includes(filter.toLowerCase());
            return locationMatch || badgeMatch;
          });
          if (!matchesCat) return false;
        }
      }

      return true;
    });
  };

  // Realtime count for modal action buttons
  const currentModalMinPrice = Number(minPriceInput.replace(/[^0-9]/g, '')) || 0;
  const currentModalMaxPrice = Number(maxPriceInput.replace(/[^0-9]/g, '')) || 1000000;
  const previewMatchingCount = filterHelper(
    currentModalMinPrice,
    currentModalMaxPrice,
    durationOption,
    selectedFilters
  ).length;

  // Screen filtered package list
  const filteredPackages = filterHelper(
    appliedMinPrice,
    appliedMaxPrice,
    durationOption,
    selectedFilters
  ).sort((a, b) => {
    if (sortOption === 'lowToHigh') {
      return parsePriceNum(a.price) - parsePriceNum(b.price);
    }
    if (sortOption === 'highToLow') {
      return parsePriceNum(b.price) - parsePriceNum(a.price);
    }
    return 0;
  });

  const getBadgeColor = (badgeName: string) => {
    const b = (badgeName || '').toLowerCase();
    if (b.includes('bestseller') || b.includes('featured')) return Colors.brand.coral;
    if (b.includes('popular')) return '#3B82F6';
    if (b.includes('new')) return '#10B981';
    if (b.includes('trending')) return '#F97316';
    return Colors.brand.coral;
  };

  const applyModalFilters = () => {
    setAppliedMinPrice(currentModalMinPrice);
    setAppliedMaxPrice(currentModalMaxPrice);
    setActiveModalMode(null);
  };

  const clearPriceOnly = () => {
    setMinPriceInput('1000');
    setMaxPriceInput('100000');
    setAppliedMinPrice(1000);
    setAppliedMaxPrice(100000);
    setSortOption('none');
  };

  const clearAllFilters = () => {
    clearPriceOnly();
    setDurationOption('any');
    setSelectedFilters([]);
    setSearchQuery('');
    setActiveModalMode(null);
  };

  const totalActiveCount =
    selectedFilters.length +
    (appliedMinPrice > 1000 || appliedMaxPrice < 100000 ? 1 : 0) +
    (durationOption !== 'any' ? 1 : 0) +
    (sortOption !== 'none' ? 1 : 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Light Luxury Header with Integrated Search */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <View style={styles.badgePillHeader}>
              <Text style={styles.badgePillHeaderText}>HANDPICKED EXPERIENCES</Text>
            </View>
            <Text style={styles.headerTitle}>Tour Packages</Text>
          </View>
          <View style={styles.countBadgeHeader}>
            <Text style={styles.countBadgeText}>{filteredPackages.length} Active</Text>
          </View>
        </View>

        {/* Integrated Search Bar */}
        <View style={styles.searchBarBox}>
          <Search color="#94A3B8" size={18} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search destination, state or package..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#94A3B8" size={16} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          {/* Main Filters Button */}
          <TouchableOpacity
            style={[styles.filterToggleBtn, totalActiveCount > 0 && styles.filterToggleBtnActive]}
            activeOpacity={0.85}
            onPress={() => setActiveModalMode('filters')}
          >
            <SlidersHorizontal
              color={totalActiveCount > 0 ? '#FFFFFF' : Colors.brand.navy}
              size={15}
            />
            <Text style={[styles.filterToggleText, totalActiveCount > 0 && styles.filterToggleTextActive]}>
              Filters {totalActiveCount > 0 ? `(${totalActiveCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Duration Button */}
          <TouchableOpacity
            style={[styles.filterChip, durationOption !== 'any' && styles.filterChipActive]}
            activeOpacity={0.8}
            onPress={() => setActiveModalMode('filters')}
          >
            <Text style={[styles.filterChipText, durationOption !== 'any' && styles.filterChipTextActive]}>
              Duration
            </Text>
            <ChevronDown
              color={durationOption !== 'any' ? '#FFFFFF' : '#64748B'}
              size={13}
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          {/* Destination & Category Tabs */}
          {FILTERS.filter((f) => f !== 'Price' && f !== 'Duration').map((cat) => {
            const isSelected = selectedFilters.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => toggleCategoryFilter(cat)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Package List Grid */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.coral} />
            <Text style={styles.loadingText}>Loading curated packages...</Text>
          </View>
        ) : filteredPackages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <PackageSearch color="#94A3B8" size={48} />
            <Text style={styles.emptyTitle}>No packages found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your filters to find what you&apos;re looking for.
            </Text>
            <TouchableOpacity
              style={styles.resetFilterBtn}
              onPress={clearAllFilters}
            >
              <Text style={styles.resetFilterText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredPackages.map((pkg: any) => {
            const isSaved = savedPackageIds.includes(String(pkg.id));
            const mainImg =
              Array.isArray(pkg.images) && pkg.images.length > 0
                ? pkg.images[0]
                : 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80';
            const badgeTextColor = getBadgeColor(pkg.badge);

            return (
              <TouchableOpacity
                key={String(pkg.id)}
                style={styles.card}
                activeOpacity={0.92}
                onPress={() => router.push(`/packages/${pkg.id}` as any)}
              >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                  <Image source={{ uri: mainImg }} style={styles.cardImage} />

                  {/* Top Left Badge */}
                  <View style={styles.badgePill}>
                    <Text style={[styles.badgeText, { color: badgeTextColor }]}>
                      {pkg.badge || 'Featured'}
                    </Text>
                  </View>

                  {/* Top Right Heart */}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    activeOpacity={0.8}
                    onPress={(e) => { e.stopPropagation(); toggleSavedPackage(String(pkg.id)); }}
                  >
                    <Heart
                      color={isSaved ? Colors.brand.coral : Colors.brand.coral}
                      fill={isSaved ? Colors.brand.coral : 'transparent'}
                      size={16}
                    />
                  </TouchableOpacity>
                </View>

                {/* Content Section */}
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{pkg.title}</Text>

                  {/* Location & Info Badge Pills Row */}
                  <View style={styles.pillBadgesRow}>
                    <View style={styles.locationBadge}>
                      <MapPin color={Colors.brand.coral} size={13} style={{ marginRight: 4 }} />
                      <Text style={styles.locationBadgeText}>{pkg.location}</Text>
                    </View>

                    <View style={styles.infoBadge}>
                      <Clock color="#64748B" size={13} style={{ marginRight: 4 }} />
                      <Text style={styles.infoBadgeText}>{pkg.duration}</Text>
                    </View>
                  </View>

                  <View style={styles.featuresRow}>
                    <Utensils color="#64748B" size={13} style={{ marginRight: 6 }} />
                    <Text style={styles.featuresText}>{pkg.features}</Text>
                  </View>

                  {/* Divider */}
                  <View style={styles.divider} />

                  {/* Bottom Row */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.startingLabel}>Starting from</Text>
                      <Text style={styles.priceAmount}>{pkg.price}</Text>
                    </View>

                    <View style={styles.detailsBtn}>
                      <Text style={styles.detailsBtnText}>View Details</Text>
                      <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 6 }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 1. SEPARATE PRICE RANGE MODAL (Matches Screenshot 1) */}
      <Modal
        visible={activeModalMode === 'price'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModalMode(null)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalHeaderTitle}>Price Range</Text>
                  <Text style={styles.modalHeaderSub}>Nightly prices before taxes and fees</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setActiveModalMode(null)}
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              {/* Price Range Body */}
              <ScrollView
                style={styles.modalBodyScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalSection}>
                  {/* Draggable Histogram Bar Chart */}
                  <DraggablePriceHistogram
                    minPrice={Number(minPriceInput.replace(/[^0-9]/g, '')) || 1000}
                    maxPrice={Number(maxPriceInput.replace(/[^0-9]/g, '')) || 100000}
                    onPriceChange={(min, max) => {
                      setMinPriceInput(String(min));
                      setMaxPriceInput(String(max));
                    }}
                  />

                  {/* MINIMUM & MAXIMUM Input Boxes */}
                  <View style={styles.minMaxRow}>
                    {/* MINIMUM */}
                    <View style={styles.minMaxBox}>
                      <Text style={styles.minMaxLabel}>MINIMUM</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.priceTextInput}
                          value={minPriceInput}
                          onChangeText={setMinPriceInput}
                          keyboardType="numeric"
                          placeholder="1000"
                        />
                      </View>
                    </View>

                    {/* MAXIMUM */}
                    <View style={styles.minMaxBox}>
                      <Text style={styles.minMaxLabel}>MAXIMUM</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.priceTextInput}
                          value={maxPriceInput}
                          onChangeText={setMaxPriceInput}
                          keyboardType="numeric"
                          placeholder="100000"
                        />
                      </View>
                    </View>
                  </View>

                  {/* Sort Order Selector */}
                  <View style={styles.sortRow}>
                    <Text style={styles.sortLabel}>Sort Order:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {SORT_OPTIONS.map((so) => {
                        const isSelected = sortOption === so.id;
                        return (
                          <TouchableOpacity
                            key={so.id}
                            style={[
                              styles.sortChip,
                              isSelected && styles.sortChipActive,
                            ]}
                            onPress={() => setSortOption(so.id)}
                          >
                            <Text
                              style={[
                                styles.sortChipText,
                                isSelected && styles.sortChipTextActive,
                              ]}
                            >
                              {so.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </ScrollView>

              {/* Price Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={clearPriceOnly}>
                  <Text style={styles.clearAllText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.showResultsBtn}
                  activeOpacity={0.88}
                  onPress={applyModalFilters}
                >
                  <Text style={styles.showResultsText}>
                    Show packages ({previewMatchingCount})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 2. SEPARATE COMPREHENSIVE FILTERS MODAL (Matches Screenshots 2 & 3) */}
      <Modal
        visible={activeModalMode === 'filters'}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveModalMode(null)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Filters</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setActiveModalMode(null)}
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBodyScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Section 1: Price range */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>Price range</Text>
                  <Text style={styles.sectionSubHeading}>Trip price, includes all fees</Text>

                  {/* Draggable Histogram Bar Chart */}
                  <DraggablePriceHistogram
                    minPrice={Number(minPriceInput.replace(/[^0-9]/g, '')) || 1000}
                    maxPrice={Number(maxPriceInput.replace(/[^0-9]/g, '')) || 100000}
                    onPriceChange={(min, max) => {
                      setMinPriceInput(String(min));
                      setMaxPriceInput(String(max));
                    }}
                  />

                  {/* MINIMUM & MAXIMUM Input Boxes */}
                  <View style={styles.minMaxRow}>
                    <View style={styles.minMaxBox}>
                      <Text style={styles.minMaxLabel}>MINIMUM</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.priceTextInput}
                          value={minPriceInput}
                          onChangeText={setMinPriceInput}
                          keyboardType="numeric"
                          placeholder="1000"
                        />
                      </View>
                    </View>

                    <View style={styles.minMaxBox}>
                      <Text style={styles.minMaxLabel}>MAXIMUM</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.priceTextInput}
                          value={maxPriceInput}
                          onChangeText={setMaxPriceInput}
                          keyboardType="numeric"
                          placeholder="100000"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.modalDivider} />

                {/* Section 2: Trip Duration */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>Trip duration</Text>
                  <Text style={styles.sectionSubHeading}>Filter by number of days</Text>

                  <View style={styles.durationChipsRow}>
                    {DURATION_OPTIONS.map((opt) => {
                      const isSelected = durationOption === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          style={[
                            styles.durationChip,
                            isSelected && styles.durationChipActive,
                          ]}
                          onPress={() => setDurationOption(opt.id)}
                        >
                          <Text
                            style={[
                              styles.durationText,
                              isSelected && styles.durationTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalDivider} />

                {/* Section 3: Destinations & Badges */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>Destinations & Categories</Text>
                  <View style={styles.categoriesWrap}>
                    {FILTERS.filter(
                      (f) => f !== 'Price' && f !== 'Duration'
                    ).map((cat) => {
                      const isSelected = selectedFilters.includes(cat);
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.modalCategoryChip,
                            isSelected && styles.modalCategoryChipActive,
                          ]}
                          onPress={() => toggleCategoryFilter(cat)}
                        >
                          {isSelected && (
                            <Check
                              color="#FFFFFF"
                              size={12}
                              style={{ marginRight: 4 }}
                            />
                          )}
                          <Text
                            style={[
                              styles.modalCategoryText,
                              isSelected && styles.modalCategoryTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalDivider} />

                {/* Section 4: Sort options */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>Sort By Price</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                    {SORT_OPTIONS.map((so) => {
                      const isSelected = sortOption === so.id;
                      return (
                        <TouchableOpacity
                          key={so.id}
                          style={[
                            styles.sortChip,
                            isSelected && styles.sortChipActive,
                          ]}
                          onPress={() => setSortOption(so.id)}
                        >
                          <Text
                            style={[
                              styles.sortChipText,
                              isSelected && styles.sortChipTextActive,
                            ]}
                          >
                            {so.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Full Filters Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={clearAllFilters}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.showResultsBtn}
                  activeOpacity={0.88}
                  onPress={applyModalFilters}
                >
                  <Text style={styles.showResultsText}>
                    Show {previewMatchingCount} packages
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  badgePillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  badgePillHeaderText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.brand.coral,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.5,
  },
  countBadgeHeader: {
    backgroundColor: 'rgba(232, 106, 112, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.25)',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.brand.coral,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.brand.navy,
    fontWeight: '500',
  },
  filterBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  filterBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  filterToggleBtnActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  filterToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brand.navy,
    marginLeft: 6,
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 130,
    gap: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  resetFilterBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageContainer: {
    height: 210,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  heartBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    padding: 18,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 10,
  },
  pillBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.2)',
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.coral,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  infoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  featuresText: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  startingLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 21,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  detailsBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },

  /* Airbnb-style Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalHeaderSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBodyScroll: {
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubHeading: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
  },
  histogramContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 65,
    paddingHorizontal: 10,
  },
  histogramBar: {
    width: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  histogramBarActive: {
    backgroundColor: Colors.brand.coral,
  },
  histogramBarInactive: {
    backgroundColor: '#E2E8F0',
  },
  sliderTrackLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'relative',
    marginTop: 4,
    justifyContent: 'center',
  },
  activeSliderFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: Colors.brand.coral,
    borderRadius: 2,
  },
  draggableSliderHandle: {
    position: 'absolute',
    top: -12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: Colors.brand.coral,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 5,
    elevation: 6,
  },
  minMaxRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
    marginBottom: 18,
  },
  minMaxBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  minMaxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 6,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: Colors.brand.navy,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  sortChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  durationChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  durationChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  durationChipActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  durationTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoriesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalCategoryChipActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  modalCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  modalCategoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  showResultsBtn: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  showResultsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
