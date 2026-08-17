import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  PanResponder,
  Animated,
  Easing,
  Modal,
  Switch,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  Search,
  Star,
  Heart,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Map as MapIcon,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { getProperties } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

const CITY_COORDINATES: Record<string, [number, number]> = {
  dehradun: [78.0322, 30.3165],
  nainital: [79.4540, 29.3803],
  mussoorie: [78.0754, 30.4598],
  rishikesh: [78.2676, 30.0869],
  haridwar: [78.1642, 29.9457],
  haldwani: [79.5130, 29.2183],
  dewalchaurh: [79.5130, 29.2183],
  kathgodam: [79.5434, 29.2713],
  rudrapur: [79.3984, 28.9818],
  bhimtal: [79.5606, 29.3496],
  goa: [73.8567, 15.2993],
};

const FILTER_CHIPS = [
  'Filters',
  'Washing machine',
  'Swimming pool',
  'Free WiFi',
  'Air conditioning',
  'Dehradun',
  'Nainital',
];

const DEST_CATEGORIES = [
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

function getMapboxSearchHtml(
  stays: any[],
  center: [number, number],
  styleMode: 'outdoors-v12' | 'satellite-streets-v12',
  mapboxToken: string
): string {
  const [lng, lat] = center;
  const staysJson = JSON.stringify(
    stays.map((s) => ({
      id: s.id,
      title: s.title,
      location: s.location,
      price: s.price,
      image: s.image,
      coords: s.coords || [79.513, 29.2183],
    }))
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; height: 100%; }
    .price-marker {
      background-color: #FFFFFF;
      color: #0F172A;
      padding: 6px 14px;
      border-radius: 20px;
      font-weight: 800;
      font-size: 13px;
      border: 2px solid #E86A70;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22);
      cursor: pointer;
      white-space: nowrap;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    .price-marker:hover, .price-marker:active {
      transform: scale(1.12);
      background-color: #E86A70;
      color: #FFFFFF;
    }
    .mapboxgl-popup-content {
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .popup-img {
      width: 100%;
      height: 110px;
      object-fit: cover;
    }
    .popup-body {
      padding: 10px 12px;
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
      margin: 0 0 2px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popup-price {
      color: #E86A70;
      font-weight: 900;
      font-size: 14px;
      margin: 4px 0 0 0;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${mapboxToken}';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/${styleMode}',
      center: [${lng}, ${lat}],
      zoom: 12,
      pitch: 0
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    const staysData = ${staysJson};

    staysData.forEach(stay => {
      if (!stay.coords || !Array.isArray(stay.coords)) return;
      const el = document.createElement('div');
      el.className = 'price-marker';
      el.innerText = '₹' + Number(stay.price || 3500).toLocaleString('en-IN');

      const popupHtml = \`
        <div onclick="window.ReactNativeWebView.postMessage('\${stay.id}')">
          <img src="\${stay.image}" class="popup-img" />
          <div class="popup-body">
            <div class="popup-title">\${stay.title}</div>
            <div style="font-size: 11px; color: #64748B;">\${stay.location}</div>
            <div class="popup-price">₹\${Number(stay.price).toLocaleString('en-IN')} /night</div>
          </div>
        </div>
      \`;

      new mapboxgl.Marker(el)
        .setLngLat(stay.coords)
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(popupHtml))
        .addTo(map);
    });
  </script>
</body>
</html>
  `;
}

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
        <View
          {...leftPanResponder.panHandlers}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={[styles.draggableSliderHandle, { left: leftThumbX }]}
        />
        <View
          {...rightPanResponder.panHandlers}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={[styles.draggableSliderHandle, { left: rightThumbX }]}
        />
      </View>
    </View>
  );
}

export default function SearchStaysPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];

  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChip, setSelectedChip] = useState('All');

  // Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [appliedMinPrice, setAppliedMinPrice] = useState(1000);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(100000);
  const [tempMinPrice, setTempMinPrice] = useState('1000');
  const [tempMaxPrice, setTempMaxPrice] = useState('100000');
  const [selectedDuration, setSelectedDuration] = useState('Any');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Mapbox Map API state
  const [isSatelliteMode, setIsSatelliteMode] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([79.5130, 29.2183]);

  // Interactive Bottom Sheet Expand/Collapse/Drag State
  // 0: Full Map (map height = WINDOW_HEIGHT - 240)
  // 1: Half Map (map height = 280)
  // 2: Full List (map height = 0)
  const [sheetState, setSheetState] = useState<0 | 1 | 2>(1);
  const animatedMapHeight = useRef(new Animated.Value(280));

  const toggleExpand = (direction?: 'up' | 'down') => {
    let nextState = sheetState;
    if (direction === 'up') {
      nextState = Math.min(2, sheetState + 1) as 0 | 1 | 2;
    } else if (direction === 'down') {
      nextState = Math.max(0, sheetState - 1) as 0 | 1 | 2;
    } else {
      nextState = sheetState === 2 ? 1 : 2; // Default toggle behavior (chevron click)
    }
    
    setSheetState(nextState);
    
    let targetHeight = 280;
    if (nextState === 0) targetHeight = WINDOW_HEIGHT - 240;
    else if (nextState === 2) targetHeight = 0;

    Animated.timing(animatedMapHeight.current, {
      toValue: targetHeight,
      duration: 380,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -20) {
          toggleExpand('up');
        } else if (gestureState.dy > 20) {
          toggleExpand('down');
        }
      },
    })
  );

  useEffect(() => {
    async function loadRealtimeStays() {
      try {
        setLoading(true);
        const docs = await getProperties();
        if (docs && Array.isArray(docs) && docs.length > 0) {
          const activeDocs = docs.filter((d: any) => isActiveProperty(d));
          const mapped = activeDocs.map((d: any, index: number) => {
            const rawPrice = Number(
              d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 3500
            );
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const photoUrl = photos[0]
              ? String(photos[0])
              : 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';

            const cityKey = (d.city || d.location || 'haldwani').toLowerCase().split(',')[0].trim();
            const coords = CITY_COORDINATES[cityKey] || [79.5130 + (index * 0.02), 29.2183 + (index * 0.02)];

            return {
              id: String(d.$id),
              title: String(d.propertyName || d.title || 'Verified Stay'),
              location: String(
                d.location || `${d.city || ''}, ${d.state || ''}`.trim() || 'Uttarakhand'
              ).replace(/\s*\[GEO:[^\]]*\]/gi, '').trim(),
              city: String(d.city || d.location || 'Uttarakhand'),
              coords,
              ratingText: d.rating ? String(d.rating) : '4.8',
              reviews: Number(d.reviewsCount || 12),
              price: rawPrice,
              image: photoUrl,
              amenities: Array.isArray(d.amenities) ? d.amenities : ['WiFi', 'Parking'],
            };
          });
          setStays(mapped);
          if (mapped.length > 0) {
            setMapCenter(mapped[0].coords);
          }
        } else {
          setStays([]);
        }
      } catch (err) {
        console.error('Error fetching realtime Appwrite stays:', err);
        setStays([]);
      } finally {
        setLoading(false);
      }
    }
    loadRealtimeStays();
  }, []);

  const totalActiveCount =
    (appliedMinPrice > 1000 || appliedMaxPrice < 100000 ? 1 : 0) +
    (selectedDuration !== 'Any' ? 1 : 0) +
    selectedCategories.length;

  const filteredStays = stays.filter((stay) => {
    // Top Chip filter
    if (selectedChip !== 'All' && selectedChip !== 'Filters') {
      const chipLower = selectedChip.toLowerCase();
      const matchesLoc = stay.location.toLowerCase().includes(chipLower);
      const matchesTitle = stay.title.toLowerCase().includes(chipLower);
      const matchesAmenity = Array.isArray(stay.amenities) && stay.amenities.some((a: string) => a.toLowerCase().includes(chipLower));
      if (!matchesLoc && !matchesTitle && !matchesAmenity) return false;
    }

    // Price Filter
    const priceVal = Number(stay.price || 3500);
    if (priceVal < appliedMinPrice || priceVal > appliedMaxPrice) return false;

    // Categories Filter
    if (selectedCategories.length > 0) {
      const stayLoc = stay.location.toLowerCase();
      const stayTitle = stay.title.toLowerCase();
      const matchesCat = selectedCategories.some((cat) => {
        const cLower = cat.toLowerCase();
        return stayLoc.includes(cLower) || stayTitle.includes(cLower);
      });
      if (!matchesCat) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Integrated Back Button + Filter Chips Header */}
      <View style={[styles.integratedHeaderRow, { paddingTop: Math.max(insets.top + 8, Platform.OS === 'ios' ? 48 : 18) }]}>
        <TouchableOpacity
          style={styles.standaloneBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ChevronLeft color={Colors.brand.navy} size={22} />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTER_CHIPS.map((chip) => {
            if (chip === 'Filters') {
              return (
                <TouchableOpacity
                  key={chip}
                  style={[styles.filterOutlineChip, totalActiveCount > 0 && styles.filterChipActive]}
                  activeOpacity={0.8}
                  onPress={() => setIsFilterModalOpen(true)}
                >
                  <SlidersHorizontal color={totalActiveCount > 0 ? '#FFFFFF' : '#0F172A'} size={14} style={{ marginRight: 6 }} />
                  <Text style={[styles.filterOutlineText, totalActiveCount > 0 && styles.filterChipTextActive]}>
                    Filters {totalActiveCount > 0 ? `(${totalActiveCount})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            }

            const isSelected = selectedChip === chip;
            return (
              <TouchableOpacity
                key={chip}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedChip(isSelected ? 'All' : chip);
                  const cityKey = chip.toLowerCase();
                  if (CITY_COORDINATES[cityKey]) {
                    setMapCenter(CITY_COORDINATES[cityKey]);
                  }
                }}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {chip}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Mapbox GL JS Interactive Map Container */}
      <Animated.View style={[styles.mapArea, { height: animatedMapHeight.current }]}>
        <View style={{ flex: 1, width: '100%', position: 'relative' }}>
          <WebView
            originWhitelist={['*']}
            source={{
              html: getMapboxSearchHtml(
                filteredStays,
                mapCenter,
                isSatelliteMode ? 'satellite-streets-v12' : 'outdoors-v12',
                MAPBOX_ACCESS_TOKEN
              ),
            }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={(event) => {
              const stayId = event.nativeEvent.data;
              if (stayId) {
                router.push(`/hotel/${stayId}` as any);
              }
            }}
          />

          {/* Floating Top Map Controls */}
          <View style={styles.mapTopControlsRow}>
            <TouchableOpacity
              style={[styles.streetPillBtn, isSatelliteMode && styles.satellitePillBtn]}
              onPress={() => setIsSatelliteMode(!isSatelliteMode)}
            >
              <MapIcon color="#FFFFFF" size={13} style={{ marginRight: 4 }} />
              <Text style={styles.streetPillText}>
                {isSatelliteMode ? 'Satellite' : 'Street'}
              </Text>
            </TouchableOpacity>

            <View style={styles.toggleSwitchPill}>
              <Switch
                value={!isSatelliteMode}
                onValueChange={(val) => setIsSatelliteMode(!val)}
                trackColor={{ false: '#CBD5E1', true: Colors.brand.coral }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* 4. Bottom Draggable Sheet Container with Realtime Appwrite Data */}
      <View style={styles.bottomSheetCard}>
        <View {...panResponder.current.panHandlers} style={styles.sheetHandleRow}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand()}>
            <View style={styles.sheetHandle} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleExpand()}
          style={styles.sheetHeader}
        >
          <View style={styles.sheetHeaderRow}>
            <View>
              <Text style={styles.homesAvailableTitle}>
                {loading ? 'Fetching live stays...' : `${filteredStays.length} homes available`}
              </Text>
              <Text style={styles.homesAvailableSub}>
                Stays in {selectedChip === 'All' ? 'anywhere' : selectedChip}
              </Text>
            </View>

            <View style={styles.expandTogglePill}>
              {sheetState === 2 ? (
                <ChevronDown color={Colors.brand.navy} size={18} />
              ) : (
                <ChevronUp color={Colors.brand.navy} size={18} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Realtime Stays List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetListContent}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y > 60 && sheetState !== 2) {
              toggleExpand('up');
            }
          }}
          scrollEventThrottle={16}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.brand.coral} />
              <Text style={styles.loadingText}>Loading live properties...</Text>
            </View>
          ) : filteredStays.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No live stays available</Text>
              <Text style={styles.emptySub}>
                Try adjusting your filter selection or search query.
              </Text>
            </View>
          ) : (
            filteredStays.map((item) => {
              const isSaved = savedHotelIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  activeOpacity={0.92}
                  onPress={() => router.push(`/hotel/${item.id}` as any)}
                >
                  {/* Card Image */}
                  <View style={styles.imageBox}>
                    <Image source={{ uri: item.image }} style={styles.cardImage} />

                    <TouchableOpacity
                      style={styles.heartBtn}
                      activeOpacity={0.8}
                      onPress={() => toggleSavedHotel(item.id)}
                    >
                      <Heart
                        color={isSaved ? Colors.brand.coral : '#FFFFFF'}
                        fill={isSaved ? Colors.brand.coral : 'transparent'}
                        size={18}
                      />
                    </TouchableOpacity>

                    <View style={styles.cardPriceTag}>
                      <Text style={styles.cardPriceText}>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.cardPriceSub}> / night</Text>
                    </View>
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.title}</Text>

                    <View style={styles.locRatingRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MapPin color={Colors.brand.coral} size={14} style={{ marginRight: 4 }} />
                        <Text style={styles.locationText}>{item.location}</Text>
                      </View>

                      <View style={styles.ratingBadge}>
                        <Star color="#92400E" size={12} fill="#92400E" />
                        <Text style={styles.ratingText}>{item.ratingText}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.priceAmount}>
                          ₹{Number(item.price).toLocaleString('en-IN')}
                        </Text>
                        <Text style={styles.perNightText}>total per night</Text>
                      </View>

                      <View style={styles.detailsBtn}>
                        <Text style={styles.detailsBtnText}>View Property</Text>
                        <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* 🌟 Interactive Filters Modal (Exact Match to User Screenshot) */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Filters</Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setIsFilterModalOpen(false)}
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
                {/* 1. Price range */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Price range</Text>
                  <Text style={styles.filterSectionSub}>Trip price, includes all fees</Text>

                  <DraggablePriceHistogram
                    minPrice={Number(tempMinPrice.replace(/[^0-9]/g, '')) || 1000}
                    maxPrice={Number(tempMaxPrice.replace(/[^0-9]/g, '')) || 100000}
                    onPriceChange={(min, max) => {
                      setTempMinPrice(String(min));
                      setTempMaxPrice(String(max));
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
                          value={tempMinPrice}
                          onChangeText={setTempMinPrice}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    <View style={styles.minMaxBox}>
                      <Text style={styles.minMaxLabel}>MAXIMUM</Text>
                      <View style={styles.inputWrapper}>
                        <Text style={styles.currencySymbol}>₹</Text>
                        <TextInput
                          style={styles.priceTextInput}
                          value={tempMaxPrice}
                          onChangeText={setTempMaxPrice}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.modalDivider} />

                {/* 2. Trip duration */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Trip duration</Text>
                  <Text style={styles.filterSectionSub}>Filter by number of days</Text>
                  <View style={styles.durationChipsRow}>
                    {['Any', '1 - 4 Days', '5 - 6 Days', '7+ Days'].map((dur) => {
                      const isSelected = selectedDuration === dur;
                      return (
                        <TouchableOpacity
                          key={dur}
                          style={[
                            styles.durationChip,
                            isSelected && styles.durationChipActive,
                          ]}
                          onPress={() => setSelectedDuration(dur)}
                        >
                          <Text
                            style={[
                              styles.durationText,
                              isSelected && styles.durationTextActive,
                            ]}
                          >
                            {dur}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalDivider} />

                {/* 3. Destinations & Categories */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Destinations & Categories</Text>
                  <View style={styles.categoriesWrap}>
                    {DEST_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryChip,
                            isSelected && styles.categoryChipActive,
                          ]}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedCategories((prev) => prev.filter((c) => c !== cat));
                            } else {
                              setSelectedCategories((prev) => [...prev, cat]);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              isSelected && styles.categoryChipTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  onPress={() => {
                    setTempMinPrice('1000');
                    setTempMaxPrice('100000');
                    setAppliedMinPrice(1000);
                    setAppliedMaxPrice(100000);
                    setSelectedDuration('Any');
                    setSelectedCategories([]);
                  }}
                >
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.showResultsBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    setAppliedMinPrice(Number(tempMinPrice) || 1000);
                    setAppliedMaxPrice(Number(tempMaxPrice) || 100000);
                    setIsFilterModalOpen(false);
                  }}
                >
                  <Text style={styles.showResultsText}>
                    Show {filteredStays.length} stays
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
    backgroundColor: '#FFFFFF',
  },
  integratedHeaderRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  standaloneBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  filterScrollContent: {
    paddingRight: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterOutlineChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  filterChip: {
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
  filterOutlineText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
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
  mapArea: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  mapTopControlsRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streetPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  satellitePillBtn: {
    backgroundColor: Colors.brand.coral,
  },
  streetPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  toggleSwitchPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandTogglePill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  homesAvailableTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  homesAvailableSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  sheetListContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  imageBox: {
    height: 190,
    width: '100%',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPriceTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardPriceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  cardPriceSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  locRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  perNightText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  /* Histogram Slider Styles */
  histogramContainer: {
    marginTop: 14,
    marginBottom: 10,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    paddingHorizontal: 16,
  },
  histogramBar: {
    flex: 1,
    marginHorizontal: 1,
    borderRadius: 3,
  },
  histogramBarActive: {
    backgroundColor: Colors.brand.coral,
  },
  histogramBarInactive: {
    backgroundColor: '#CBD5E1',
  },
  sliderTrackLine: {
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
  /* Modal Container Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '84%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalBodyScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  filterSectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  minMaxRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    marginBottom: 6,
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
  durationChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
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
    marginTop: 10,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  categoryChipActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  categoryChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
  },
  showResultsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
