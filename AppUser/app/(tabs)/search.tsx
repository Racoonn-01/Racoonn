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
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
  PanResponder,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  Star,
  Heart,
  MapPin,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Search,
  Map as MapIcon,
  Layers,
  ArrowRight,
  Wifi,
  Utensils,
  Zap,
  Key,
  PawPrint,
  House,
  Warehouse,
  Building2,
  Building,
  Castle,
  TreePine,
  Tent,
  Trees,
  Tractor,
  Ship,
  Caravan,
  Landmark,
  Mountain,
  Wind,
  Coffee,
  Calendar as CalendarIcon,
  Users,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { usePropertyFilterStore } from '../../store/propertyFilterStore';
import { parseFlexibleDate, formatDisplayDate } from '../../utils/dateUtils';
import { getProperties } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  '';

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

const CITY_CHIPS = [
  'All',
  'Dehradun',
  'Nainital',
  'Mussoorie',
  'Haldwani',
  'Rishikesh',
  'Bhimtal',
  'Haridwar',
  'Goa',
];

const MIN_ALLOWED = 1000;
const MAX_ALLOWED = 100000;

const HISTOGRAM_BARS = [
  2, 4, 8, 14, 25, 40, 65, 80, 95, 100, 85, 70, 55, 45, 30, 20, 15, 25, 35, 50,
  60, 40, 25, 18, 12, 8, 5, 3, 2, 1,
];

const INITIAL_AMENITIES = [
  { id: 'Wifi', label: 'Wifi', type: 'icon' as const },
  { id: 'Kitchen', label: 'Kitchen', type: 'icon' as const },
  { id: 'Washing machine', label: 'Washing machine', emoji: '🧺' },
  { id: 'Tumble dryer', label: 'Tumble dryer', emoji: '🌀' },
  { id: 'Air conditioning', label: 'Air conditioning', emoji: '❄️' },
  { id: 'Heating', label: 'Heating', emoji: '🌡️' },
];

const EXTRA_AMENITIES = [
  { id: 'Pool', label: 'Pool', emoji: '🏊' },
  { id: 'Hot tub', label: 'Hot tub', emoji: '♨️' },
  { id: 'Patio', label: 'Patio', emoji: '🪑' },
  { id: 'BBQ grill', label: 'BBQ grill', emoji: '🥩' },
  { id: 'Fire pit', label: 'Fire pit', emoji: '🔥' },
  { id: 'Pool table', label: 'Pool table', emoji: '🎱' },
  { id: 'Indoor fireplace', label: 'Indoor fireplace', emoji: '🪵' },
  { id: 'Dedicated workspace', label: 'Dedicated workspace', emoji: '💻' },
];

const BOOKING_OPTIONS = [
  { id: 'Instant Book', label: 'Instant Book', icon: 'zap' as const },
  { id: 'Self check-in', label: 'Self check-in', icon: 'key' as const },
  { id: 'Allows pets', label: 'Allows pets', icon: 'paw' as const },
];

const PROPERTY_TYPES = [
  { id: 'House', label: 'House', icon: 'house' as const },
  { id: 'Guest house', label: 'Guest house', icon: 'warehouse' as const },
  { id: 'Hotel', label: 'Hotel', icon: 'hotel' as const },
  { id: 'Apartment', label: 'Apartment', icon: 'apartment' as const },
  { id: 'Villa', label: 'Villa', icon: 'villa' as const },
  { id: 'Resort', label: 'Resort', icon: 'resort' as const },
  { id: 'Tent', label: 'Tent', icon: 'tent' as const },
  { id: 'Cabin', label: 'Cabin', icon: 'cabin' as const },
  { id: 'Farm stay', label: 'Farm stay', icon: 'tractor' as const },
  { id: 'Boat', label: 'Boat', icon: 'boat' as const },
  { id: 'Camper/RV', label: 'Camper/RV', icon: 'caravan' as const },
  { id: 'Tiny home', label: 'Tiny home', icon: 'tinyhome' as const },
  { id: 'Mansion', label: 'Mansion', icon: 'mansion' as const },
  { id: 'Castle', label: 'Castle', icon: 'castle' as const },
  { id: 'Chalet', label: 'Chalet', icon: 'chalet' as const },
  { id: 'Barn', label: 'Barn', icon: 'barn' as const },
  { id: 'Cave', label: 'Cave', icon: 'cave' as const },
  { id: 'Windmill', label: 'Windmill', icon: 'windmill' as const },
  { id: 'Hostel', label: 'Hostel', icon: 'hostel' as const },
  { id: 'Bed & breakfast', label: 'Bed & breakfast', icon: 'coffee' as const },
];

function renderPropertyTypeIcon(typeIcon: string, isSelected: boolean) {
  const color = isSelected ? '#FFFFFF' : '#0F172A';
  const size = 18;
  switch (typeIcon) {
    case 'house':
    case 'tinyhome':
      return <House size={size} color={color} />;
    case 'warehouse':
    case 'barn':
      return <Warehouse size={size} color={color} />;
    case 'hotel':
    case 'hostel':
      return <Building2 size={size} color={color} />;
    case 'apartment':
      return <Building size={size} color={color} />;
    case 'villa':
    case 'castle':
      return <Castle size={size} color={color} />;
    case 'resort':
      return <TreePine size={size} color={color} />;
    case 'tent':
      return <Tent size={size} color={color} />;
    case 'cabin':
    case 'chalet':
      return <Trees size={size} color={color} />;
    case 'tractor':
      return <Tractor size={size} color={color} />;
    case 'boat':
      return <Ship size={size} color={color} />;
    case 'caravan':
      return <Caravan size={size} color={color} />;
    case 'mansion':
      return <Landmark size={size} color={color} />;
    case 'cave':
      return <Mountain size={size} color={color} />;
    case 'windmill':
      return <Wind size={size} color={color} />;
    case 'coffee':
      return <Coffee size={size} color={color} />;
    default:
      return <House size={size} color={color} />;
  }
}

function renderBookingOptionIcon(iconName: string, isSelected: boolean) {
  const color = isSelected ? '#FFFFFF' : '#0F172A';
  const size = 18;
  switch (iconName) {
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'key':
      return <Key size={size} color={color} />;
    case 'paw':
      return <PawPrint size={size} color={color} />;
    default:
      return null;
  }
}

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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    q?: string;
    city?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    infants?: string;
    guests?: string;
    rooms?: string;
  }>();
  const { profile, toggleSavedHotel } = useAuthStore();
  const filterStore = usePropertyFilterStore();

  const [selectedCheckIn, setSelectedCheckIn] = useState<string>(() => {
    if (params.checkIn && params.checkIn !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(params.checkIn));
    }
    return filterStore.checkIn || formatDisplayDate(new Date());
  });

  const [selectedCheckOut, setSelectedCheckOut] = useState<string>(() => {
    if (params.checkOut && params.checkOut !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(params.checkOut));
    }
    return filterStore.checkOut || formatDisplayDate(new Date(Date.now() + 86400000));
  });

  const [searchAdults, setSearchAdults] = useState<number>(() => {
    if (params.adults) return Math.max(1, parseInt(params.adults, 10) || 1);
    if (params.guests) return Math.max(1, parseInt(params.guests, 10) || 1);
    return filterStore.adults || 2;
  });

  const [searchChildren, setSearchChildren] = useState<number>(() => {
    if (params.children !== undefined) return Math.max(0, parseInt(params.children, 10) || 0);
    return filterStore.children || 0;
  });

  const [searchInfants, setSearchInfants] = useState<number>(() => {
    if (params.infants !== undefined) return Math.max(0, parseInt(params.infants, 10) || 0);
    return filterStore.infants || 0;
  });

  const [searchRooms, setSearchRooms] = useState<number>(() => {
    if (params.rooms) return Math.max(1, parseInt(params.rooms, 10) || 1);
    return filterStore.rooms || 1;
  });

  const navigateToStay = (stayId: string) => {
    router.push({
      pathname: `/hotel/${stayId}` as any,
      params: {
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        adults: String(searchAdults),
        children: String(searchChildren),
        infants: String(searchInfants),
        guests: String(searchAdults + searchChildren),
        rooms: String(searchRooms),
      },
    });
  };

  const [stays, setStays] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(params.q || params.city || '');
  const [selectedCity, setSelectedCity] = useState<string>(params.city || 'All');

  // Map state
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([79.5130, 29.2183]);
  const [isSatelliteMode, setIsSatelliteMode] = useState<boolean>(false);

  // Filters Modal State (Committed)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [minPrice, setMinPrice] = useState<number>(1000);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState<string[]>([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);

  // Filters Modal Draft State (In-modal edits)
  const [draftMinPrice, setDraftMinPrice] = useState<number>(1000);
  const [draftMaxPrice, setDraftMaxPrice] = useState<number>(100000);
  const [minInputVal, setMinInputVal] = useState<string>('1000');
  const [maxInputVal, setMaxInputVal] = useState<string>('100000');
  const [draftAmenities, setDraftAmenities] = useState<string[]>([]);
  const [showAllAmenities, setShowAllAmenities] = useState<boolean>(false);
  const [draftBookingOptions, setDraftBookingOptions] = useState<string[]>([]);
  const [showPropertyType, setShowPropertyType] = useState<boolean>(true);
  const [draftPropertyTypes, setDraftPropertyTypes] = useState<string[]>([]);

  // Slider dragging & width measurement
  const [sliderWidth, setSliderWidth] = useState<number>(WINDOW_WIDTH - 64);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const draftMinPriceRef = useRef<number>(draftMinPrice);
  const draftMaxPriceRef = useRef<number>(draftMaxPrice);
  const sliderWidthRef = useRef<number>(sliderWidth);
  const panMinStartVal = useRef<number>(draftMinPrice);
  const panMaxStartVal = useRef<number>(draftMaxPrice);

  useEffect(() => {
    draftMinPriceRef.current = draftMinPrice;
    draftMaxPriceRef.current = draftMaxPrice;
    sliderWidthRef.current = sliderWidth;
  }, [draftMinPrice, draftMaxPrice, sliderWidth]);

  const THUMB_DIAMETER = 28;

  // Min Thumb PanResponder
  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDraggingSlider(true);
        panMinStartVal.current = draftMinPriceRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const trackUsable = Math.max(sliderWidthRef.current - THUMB_DIAMETER, 1);
        const startPos =
          ((panMinStartVal.current - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * trackUsable;
        const currentPos = Math.max(0, Math.min(trackUsable, startPos + gestureState.dx));
        const rawVal =
          MIN_ALLOWED + (currentPos / trackUsable) * (MAX_ALLOWED - MIN_ALLOWED);
        const stepped = Math.round(rawVal / 500) * 500;
        const maxLimit = draftMaxPriceRef.current - 1000;
        const clamped = Math.max(MIN_ALLOWED, Math.min(maxLimit, stepped));
        setDraftMinPrice(clamped);
        setMinInputVal(String(clamped));
      },
      onPanResponderRelease: () => {
        setIsDraggingSlider(false);
      },
      onPanResponderTerminate: () => {
        setIsDraggingSlider(false);
      },
    })
  ).current;

  // Max Thumb PanResponder
  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDraggingSlider(true);
        panMaxStartVal.current = draftMaxPriceRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const trackUsable = Math.max(sliderWidthRef.current - THUMB_DIAMETER, 1);
        const startPos =
          ((panMaxStartVal.current - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * trackUsable;
        const currentPos = Math.max(0, Math.min(trackUsable, startPos + gestureState.dx));
        const rawVal =
          MIN_ALLOWED + (currentPos / trackUsable) * (MAX_ALLOWED - MIN_ALLOWED);
        const stepped = Math.round(rawVal / 500) * 500;
        const minLimit = draftMinPriceRef.current + 1000;
        const clamped = Math.min(MAX_ALLOWED, Math.max(minLimit, stepped));
        setDraftMaxPrice(clamped);
        setMaxInputVal(String(clamped));
      },
      onPanResponderRelease: () => {
        setIsDraggingSlider(false);
      },
      onPanResponderTerminate: () => {
        setIsDraggingSlider(false);
      },
    })
  ).current;

  useEffect(() => {
    if (params.q) {
      setSearchQuery(params.q);
    }
    if (params.city) {
      setSelectedCity(params.city);
      const cKey = params.city.toLowerCase();
      if (CITY_COORDINATES[cKey]) {
        setMapCenter(CITY_COORDINATES[cKey]);
      }
    }
    if (params.checkIn && params.checkIn !== 'Add dates') {
      const formatted = formatDisplayDate(parseFlexibleDate(params.checkIn));
      setSelectedCheckIn(formatted);
      usePropertyFilterStore.getState().setCheckIn(formatted);
    }
    if (params.checkOut && params.checkOut !== 'Add dates') {
      const formatted = formatDisplayDate(parseFlexibleDate(params.checkOut));
      setSelectedCheckOut(formatted);
      usePropertyFilterStore.getState().setCheckOut(formatted);
    }
    if (params.adults) {
      const a = Math.max(1, parseInt(params.adults, 10) || 1);
      setSearchAdults(a);
      usePropertyFilterStore.getState().setAdults(a);
    } else if (params.guests) {
      const g = Math.max(1, parseInt(params.guests, 10) || 1);
      setSearchAdults(g);
      usePropertyFilterStore.getState().setAdults(g);
    }
    if (params.children !== undefined) {
      const c = Math.max(0, parseInt(params.children, 10) || 0);
      setSearchChildren(c);
      usePropertyFilterStore.getState().setChildren(c);
    }
    if (params.infants !== undefined) {
      const inf = Math.max(0, parseInt(params.infants, 10) || 0);
      setSearchInfants(inf);
      usePropertyFilterStore.getState().setInfants(inf);
    }
    if (params.rooms) {
      const r = Math.max(1, parseInt(params.rooms, 10) || 1);
      setSearchRooms(r);
      usePropertyFilterStore.getState().setRooms(r);
    }
  }, [
    params.q,
    params.city,
    params.checkIn,
    params.checkOut,
    params.adults,
    params.children,
    params.infants,
    params.guests,
    params.rooms,
  ]);

  useEffect(() => {
    async function loadRealtimeStays() {
      try {
        setLoading(true);
        const docs = await getProperties();
        if (docs && Array.isArray(docs) && docs.length > 0) {
          const activeDocs = docs.filter((d: any) => isActiveProperty(d));
          const mapped = activeDocs.map((d: any, index: number) => {
            const rawPrice = Number(
              d.price || d.startingPrice || d.minPrice || d.basePrice || d.pricePerNight || 0
            );
            const photos = Array.isArray(d.photos) ? d.photos : [];
            const photoUrl = photos[0]
              ? String(photos[0])
              : 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80';

            const cityKey = (d.city || d.location || 'haldwani').toLowerCase().split(',')[0].trim();
            const coords = CITY_COORDINATES[cityKey] || [79.5130 + index * 0.02, 29.2183 + index * 0.02];
            const hasReviews = Number(d.reviewsCount || 0) > 0 && Number(d.rating || 0) > 0;
            const amList = Array.isArray(d.amenities) ? d.amenities : ['WiFi', 'Parking'];

            return {
              id: String(d.$id),
              title: String(d.propertyName || d.title || 'Verified Resort Stay'),
              location: String(
                d.location || `${d.city || ''}, ${d.state || ''}`.trim() || 'Uttarakhand'
              ).replace(/\s*\[GEO:[^\]]*\]/gi, '').trim(),
              city: String(d.city || d.location || 'Uttarakhand'),
              propertyType: String(d.propertyType || d.type || '').trim(),
              coords,
              ratingText: hasReviews ? Number(d.rating).toFixed(1) : 'New',
              reviews: Number(d.reviewsCount || 0),
              price: rawPrice > 0 ? rawPrice : 3500,
              image: photoUrl,
              amenities: amList,
              isInstantBook: !!(
                d.isInstantBook ||
                d.instantBook ||
                d.instantBooking ||
                amList.some((a: string) => /instant/i.test(a))
              ),
              selfCheckIn: !!(
                d.selfCheckIn ||
                amList.some((a: string) => /self.*check/i.test(a))
              ),
              allowsPets: !!(
                d.allowsPets ||
                d.petFriendly ||
                amList.some((a: string) => /pet/i.test(a))
              ),
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
        console.error('Error fetching stays in search screen:', err);
        setStays([]);
      } finally {
        setLoading(false);
      }
    }
    loadRealtimeStays();
  }, []);

  const savedIds = profile?.savedHotels || [];

  // Open Filter Modal & populate draft values from committed state
  const handleOpenFilterModal = () => {
    setDraftMinPrice(minPrice);
    setDraftMaxPrice(maxPrice);
    setMinInputVal(String(minPrice));
    setMaxInputVal(String(maxPrice));
    setDraftAmenities([...selectedAmenities]);
    setDraftBookingOptions([...selectedBookingOptions]);
    setDraftPropertyTypes([...selectedPropertyTypes]);
    setIsFilterModalOpen(true);
  };

  // Helper matching function
  const checkStayMatches = (
    stay: any,
    minP: number,
    maxP: number,
    amenities: string[],
    bookingOpts: string[],
    propTypes: string[]
  ) => {
    // City chip filter
    if (selectedCity !== 'All') {
      const cLower = selectedCity.toLowerCase();
      const matchesCity = stay.city.toLowerCase().includes(cLower);
      const matchesLoc = stay.location.toLowerCase().includes(cLower);
      if (!matchesCity && !matchesLoc) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      const matchesTitle = stay.title.toLowerCase().includes(qLower);
      const matchesLoc = stay.location.toLowerCase().includes(qLower);
      const matchesCity = stay.city.toLowerCase().includes(qLower);
      if (!matchesTitle && !matchesLoc && !matchesCity) return false;
    }

    // Price filter
    const p = Number(stay.price || 0);
    if (p < minP || p > maxP) return false;

    // Amenities filter
    if (amenities.length > 0) {
      const stayAm = Array.isArray(stay.amenities) ? stay.amenities : [];
      const hasAll = amenities.every((req) =>
        stayAm.some((a: string) => a.toLowerCase().includes(req.toLowerCase()))
      );
      if (!hasAll) return false;
    }

    // Booking Options filter
    if (bookingOpts.length > 0) {
      const matchesAll = bookingOpts.every((opt) => {
        if (opt === 'Instant Book') return stay.isInstantBook;
        if (opt === 'Self check-in') return stay.selfCheckIn;
        if (opt === 'Allows pets') return stay.allowsPets;
        return true;
      });
      if (!matchesAll) return false;
    }

    // Property Type filter
    if (propTypes.length > 0) {
      const pType = (stay.propertyType || '').toLowerCase();
      const pTitle = stay.title.toLowerCase();
      const hasType = propTypes.some((type) => {
        const t = type.toLowerCase();
        return pType.includes(t) || pTitle.includes(t);
      });
      if (!hasType) return false;
    }

    return true;
  };

  // Filtered stays on search screen
  const filteredStays = useMemo(() => {
    return stays.filter((stay) =>
      checkStayMatches(
        stay,
        minPrice,
        maxPrice,
        selectedAmenities,
        selectedBookingOptions,
        selectedPropertyTypes
      )
    );
  }, [
    stays,
    searchQuery,
    selectedCity,
    minPrice,
    maxPrice,
    selectedAmenities,
    selectedBookingOptions,
    selectedPropertyTypes,
  ]);

  // Match count dynamically previewed inside the modal
  const draftMatchCount = useMemo(() => {
    return stays.filter((stay) =>
      checkStayMatches(
        stay,
        draftMinPrice,
        draftMaxPrice,
        draftAmenities,
        draftBookingOptions,
        draftPropertyTypes
      )
    ).length;
  }, [
    stays,
    searchQuery,
    selectedCity,
    draftMinPrice,
    draftMaxPrice,
    draftAmenities,
    draftBookingOptions,
    draftPropertyTypes,
  ]);

  const activeFiltersCount =
    (minPrice > 1000 || maxPrice < 100000 ? 1 : 0) +
    selectedAmenities.length +
    selectedBookingOptions.length +
    selectedPropertyTypes.length +
    (selectedCity !== 'All' ? 1 : 0);

  // Toggle handlers inside Modal
  const toggleDraftAmenity = (id: string) => {
    setDraftAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleDraftBookingOption = (id: string) => {
    setDraftBookingOptions((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  };

  const toggleDraftPropertyType = (id: string) => {
    setDraftPropertyTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Direct numeric input handlers
  const handleMinInputChange = (valStr: string) => {
    setMinInputVal(valStr);
    const num = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num >= MIN_ALLOWED && num <= draftMaxPrice - 500) {
      setDraftMinPrice(num);
    }
  };

  const handleMinInputBlur = () => {
    const num = parseInt(minInputVal.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num < MIN_ALLOWED) {
      setDraftMinPrice(MIN_ALLOWED);
      setMinInputVal(String(MIN_ALLOWED));
    } else if (num > draftMaxPrice - 500) {
      const clamped = Math.max(MIN_ALLOWED, draftMaxPrice - 500);
      setDraftMinPrice(clamped);
      setMinInputVal(String(clamped));
    } else {
      setDraftMinPrice(num);
      setMinInputVal(String(num));
    }
  };

  const handleMaxInputChange = (valStr: string) => {
    setMaxInputVal(valStr);
    const num = parseInt(valStr.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num >= draftMinPrice + 500 && num <= MAX_ALLOWED) {
      setDraftMaxPrice(num);
    }
  };

  const handleMaxInputBlur = () => {
    const num = parseInt(maxInputVal.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num > MAX_ALLOWED) {
      setDraftMaxPrice(MAX_ALLOWED);
      setMaxInputVal(String(MAX_ALLOWED));
    } else if (num < draftMinPrice + 500) {
      const clamped = Math.min(MAX_ALLOWED, draftMinPrice + 500);
      setDraftMaxPrice(clamped);
      setMaxInputVal(String(clamped));
    } else {
      setDraftMaxPrice(num);
      setMaxInputVal(String(num));
    }
  };

  // Clear all in modal
  const handleClearAll = () => {
    setDraftMinPrice(1000);
    setDraftMaxPrice(100000);
    setMinInputVal('1000');
    setMaxInputVal('100000');
    setDraftAmenities([]);
    setDraftBookingOptions([]);
    setDraftPropertyTypes([]);
  };

  // Commit and close
  const handleApplyFilters = () => {
    setMinPrice(draftMinPrice);
    setMaxPrice(draftMaxPrice);
    setSelectedAmenities(draftAmenities);
    setSelectedBookingOptions(draftBookingOptions);
    setSelectedPropertyTypes(draftPropertyTypes);
    setIsFilterModalOpen(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    const cKey = city.toLowerCase();
    if (CITY_COORDINATES[cKey]) {
      setMapCenter(CITY_COORDINATES[cKey]);
    }
  };

  const bottomNavPadding =
    insets.bottom > 0
      ? insets.bottom + 70
      : Platform.OS === 'android'
      ? 84
      : 70;

  // Track positions
  const trackUsable = Math.max(sliderWidth - THUMB_DIAMETER, 1);
  const minPct = (draftMinPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED);
  const maxPct = (draftMaxPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED);
  const leftThumbPos = minPct * trackUsable;
  const rightThumbPos = maxPct * trackUsable;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Container */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        <View style={styles.headerTitleRow}>
          <View>
            <View style={styles.badgePillHeader}>
              <Text style={styles.badgePillHeaderText}>DISCOVER & BOOK</Text>
            </View>
            <Text style={styles.headerTitle}>Find Places to Stay</Text>
          </View>
          <View style={styles.countBadgeHeader}>
            <Text style={styles.countBadgeText}>{filteredStays.length} Stays</Text>
          </View>
        </View>

        {/* Integrated Search Bar */}
        <View style={styles.searchBarBox}>
          <Search color="#94A3B8" size={18} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchBarInput}
            placeholder="Search city, destination, or resort..."
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

        {/* Active Search Summary Pill (Dates & Guests) */}
        {selectedCheckIn ? (
          <View style={styles.searchSummaryPillRow}>
            <View style={styles.searchSummaryPill}>
              <CalendarIcon size={12} color={Colors.brand.coral} style={{ marginRight: 4 }} />
              <Text style={styles.searchSummaryPillText} numberOfLines={1}>
                {selectedCheckIn} - {selectedCheckOut}
              </Text>
            </View>
            <View style={[styles.searchSummaryPill, { marginLeft: 6 }]}>
              <Users size={12} color={Colors.brand.coral} style={{ marginRight: 4 }} />
              <Text style={styles.searchSummaryPillText}>
                {searchAdults + searchChildren} {searchAdults + searchChildren === 1 ? 'Guest' : 'Guests'}
                {searchRooms > 1 ? ` · ${searchRooms} Rooms` : ''}
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Filter and Mode Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          {/* Main Filters Button */}
          <TouchableOpacity
            style={[styles.filterToggleBtn, activeFiltersCount > 0 && styles.filterToggleBtnActive]}
            activeOpacity={0.85}
            onPress={handleOpenFilterModal}
          >
            <SlidersHorizontal
              color={activeFiltersCount > 0 ? '#FFFFFF' : Colors.brand.navy}
              size={15}
            />
            <Text
              style={[
                styles.filterToggleText,
                activeFiltersCount > 0 && styles.filterToggleTextActive,
              ]}
            >
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </Text>
          </TouchableOpacity>

          {/* Map View Toggle Button */}
          <TouchableOpacity
            style={[styles.mapToggleChip, showMap && styles.mapToggleChipActive]}
            activeOpacity={0.85}
            onPress={() => setShowMap(!showMap)}
          >
            <MapIcon
              color={showMap ? '#FFFFFF' : '#475569'}
              size={14}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.mapToggleChipText,
                showMap && styles.mapToggleChipTextActive,
              ]}
            >
              {showMap ? 'Hide Map' : 'Map View'}
            </Text>
          </TouchableOpacity>

          {/* City Selection Chips */}
          {CITY_CHIPS.map((city) => {
            const isSelected = selectedCity === city;
            return (
              <TouchableOpacity
                key={city}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                activeOpacity={0.8}
                onPress={() => handleCitySelect(city)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Optional Interactive Mapbox View */}
      {showMap && (
        <View style={styles.mapContainer}>
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
                navigateToStay(stayId);
              }
            }}
          />
          <TouchableOpacity
            style={styles.satelliteToggleBtn}
            onPress={() => setIsSatelliteMode(!isSatelliteMode)}
          >
            <Layers color="#0F172A" size={16} />
          </TouchableOpacity>
        </View>
      )}

      {/* Stays List ScrollView */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.staysScrollContent, { paddingBottom: bottomNavPadding }]}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.brand.coral} />
            <Text style={styles.loadingText}>Finding verified stays...</Text>
          </View>
        ) : filteredStays.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MapPin size={48} color="#CBD5E1" style={{ marginBottom: 14 }} />
            <Text style={styles.emptyTitle}>No Places Found</Text>
            <Text style={styles.emptySub}>
              Try adjusting your search query, city, or filter criteria to discover stays.
            </Text>
            <TouchableOpacity
              style={styles.resetFiltersBtn}
              onPress={() => {
                setSearchQuery('');
                setSelectedCity('All');
                setMinPrice(1000);
                setMaxPrice(100000);
                setSelectedAmenities([]);
                setSelectedBookingOptions([]);
                setSelectedPropertyTypes([]);
              }}
            >
              <Text style={styles.resetFiltersBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredStays.map((stay) => {
            const isSaved = savedIds.includes(stay.id);
            return (
              <TouchableOpacity
                key={stay.id}
                style={styles.stayCard}
                activeOpacity={0.92}
                onPress={() => navigateToStay(stay.id)}
              >
                {/* Stay Photo Header */}
                <View style={styles.stayImageContainer}>
                  <Image source={{ uri: stay.image }} style={styles.stayImage} resizeMode="cover" />

                  {/* Rating Tag */}
                  <View style={styles.ratingBadge}>
                    <Star color="#F59E0B" fill="#F59E0B" size={13} style={{ marginRight: 4 }} />
                    <Text style={styles.ratingBadgeText}>{stay.ratingText}</Text>
                    {stay.reviews > 0 && (
                      <Text style={styles.reviewsCountText}>({stay.reviews})</Text>
                    )}
                  </View>

                  {/* Favorite Save Button */}
                  <TouchableOpacity
                    style={styles.favBtn}
                    activeOpacity={0.8}
                    onPress={() => toggleSavedHotel(stay.id)}
                  >
                    <Heart
                      color={isSaved ? '#EF4444' : '#FFFFFF'}
                      fill={isSaved ? '#EF4444' : 'rgba(0,0,0,0.3)'}
                      size={20}
                    />
                  </TouchableOpacity>
                </View>

                {/* Stay Details */}
                <View style={styles.stayDetails}>
                  <Text style={styles.stayTitle} numberOfLines={1}>
                    {stay.title}
                  </Text>
                  <View style={styles.locationRow}>
                    <MapPin color="#64748B" size={13} style={{ marginRight: 4 }} />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {stay.location}
                    </Text>
                  </View>

                  {/* Amenities Chips */}
                  {Array.isArray(stay.amenities) && stay.amenities.length > 0 && (
                    <View style={styles.amenitiesRow}>
                      {stay.amenities.slice(0, 3).map((am: string, i: number) => (
                        <View key={i} style={styles.amenityTag}>
                          <Text style={styles.amenityTagText}>{am}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Price & Book Row */}
                  <View style={styles.cardFooter}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={styles.stayPrice}>₹{stay.price.toLocaleString('en-IN')}</Text>
                        <Text style={styles.stayPricePeriod}> / night</Text>
                      </View>
                      <Text style={styles.stayTaxText}>+ taxes & fees included</Text>
                    </View>

                    <View style={styles.viewDealBtn}>
                      <Text style={styles.viewDealBtnText}>View Stay</Text>
                      <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Filter Slideup Modal */}
      <Modal
        visible={isFilterModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdropContainer}
        >
          <TouchableWithoutFeedback onPress={() => setIsFilterModalOpen(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalCard}>
                  {/* Top Drag Handle */}
                  <View style={styles.sheetHandleBar} />

                  {/* Modal Header */}
                  <View style={styles.modalHeaderRow}>
                    <Text style={styles.modalTitle}>Filters</Text>
                    <TouchableOpacity
                      style={styles.closeBtnCircle}
                      onPress={() => setIsFilterModalOpen(false)}
                      activeOpacity={0.7}
                    >
                      <X color="#64748B" size={18} />
                    </TouchableOpacity>
                  </View>

                  {/* Scrollable Content Body */}
                  <ScrollView
                    style={styles.modalScrollBody}
                    contentContainerStyle={styles.modalScrollContent}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={!isDraggingSlider}
                  >
                    {/* 1. Price Range Section */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Price range</Text>
                      <Text style={styles.sectionSubtitle}>Trip price, includes all fees</Text>

                      {/* Histogram Distribution Curve */}
                      <View style={styles.histogramContainer}>
                        {HISTOGRAM_BARS.map((heightPct, idx) => {
                          const barPct = (idx / (HISTOGRAM_BARS.length - 1)) * 100;
                          const minBarLimit =
                            ((draftMinPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100;
                          const maxBarLimit =
                            ((draftMaxPrice - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100;
                          const inRange = barPct >= minBarLimit - 1.5 && barPct <= maxBarLimit + 1.5;

                          return (
                            <View
                              key={idx}
                              style={[
                                styles.histogramBar,
                                {
                                  height: `${Math.max(heightPct, 4)}%`,
                                  backgroundColor: inRange ? '#FF385C' : '#E2E8F0',
                                },
                              ]}
                            />
                          );
                        })}
                      </View>

                      {/* Dual-slider Track & Knobs */}
                      <View
                        style={styles.sliderTrackWrapper}
                        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                      >
                        {/* Inactive Base Track */}
                        <View style={styles.sliderBaseTrack} />

                        {/* Active Colored Track */}
                        <View
                          style={[
                            styles.sliderActiveTrack,
                            {
                              left: leftThumbPos + THUMB_DIAMETER / 2,
                              width: Math.max(0, rightThumbPos - leftThumbPos),
                            },
                          ]}
                        />

                        {/* Minimum Thumb */}
                        <View
                          {...minPanResponder.panHandlers}
                          style={[
                            styles.sliderThumb,
                            { left: leftThumbPos },
                          ]}
                        />

                        {/* Maximum Thumb */}
                        <View
                          {...maxPanResponder.panHandlers}
                          style={[
                            styles.sliderThumb,
                            { left: rightThumbPos },
                          ]}
                        />
                      </View>

                      {/* Minimum & Maximum Input Cards */}
                      <View style={styles.priceBoxesRow}>
                        <View style={styles.priceBox}>
                          <Text style={styles.priceBoxLabel}>MINIMUM</Text>
                          <View style={styles.priceBoxValueRow}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                              style={styles.priceBoxInput}
                              value={minInputVal}
                              keyboardType="numeric"
                              onChangeText={handleMinInputChange}
                              onBlur={handleMinInputBlur}
                            />
                          </View>
                        </View>

                        <View style={styles.priceBox}>
                          <Text style={styles.priceBoxLabel}>MAXIMUM</Text>
                          <View style={styles.priceBoxValueRow}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                              style={styles.priceBoxInput}
                              value={maxInputVal}
                              keyboardType="numeric"
                              onChangeText={handleMaxInputChange}
                              onBlur={handleMaxInputBlur}
                            />
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.sectionDivider} />

                    {/* 2. Amenities Section */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Amenities</Text>
                      <View style={styles.pillsWrap}>
                        {INITIAL_AMENITIES.map((am) => {
                          const isSelected = draftAmenities.includes(am.id);
                          return (
                            <TouchableOpacity
                              key={am.id}
                              style={[styles.filterPill, isSelected && styles.filterPillActive]}
                              activeOpacity={0.8}
                              onPress={() => toggleDraftAmenity(am.id)}
                            >
                              {am.id === 'Wifi' && (
                                <Wifi size={18} color={isSelected ? '#FFFFFF' : '#0F172A'} />
                              )}
                              {am.id === 'Kitchen' && (
                                <Utensils size={18} color={isSelected ? '#FFFFFF' : '#0F172A'} />
                              )}
                              {am.emoji && <Text style={styles.emojiIcon}>{am.emoji}</Text>}
                              <Text
                                style={[
                                  styles.filterPillText,
                                  isSelected && styles.filterPillTextActive,
                                ]}
                              >
                                {am.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}

                        {showAllAmenities &&
                          EXTRA_AMENITIES.map((am) => {
                            const isSelected = draftAmenities.includes(am.id);
                            return (
                              <TouchableOpacity
                                key={am.id}
                                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                                activeOpacity={0.8}
                                onPress={() => toggleDraftAmenity(am.id)}
                              >
                                <Text style={styles.emojiIcon}>{am.emoji}</Text>
                                <Text
                                  style={[
                                    styles.filterPillText,
                                    isSelected && styles.filterPillTextActive,
                                  ]}
                                >
                                  {am.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                      </View>

                      {/* Show more / Show less toggle */}
                      <TouchableOpacity
                        style={styles.showMoreBtn}
                        activeOpacity={0.7}
                        onPress={() => setShowAllAmenities(!showAllAmenities)}
                      >
                        <Text style={styles.showMoreText}>
                          {showAllAmenities ? 'Show less' : 'Show more'}
                        </Text>
                        {showAllAmenities ? (
                          <ChevronUp size={16} color="#0F172A" />
                        ) : (
                          <ChevronDown size={16} color="#0F172A" />
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Divider */}
                    <View style={styles.sectionDivider} />

                    {/* 3. Booking Options Section */}
                    <View style={styles.sectionContainer}>
                      <Text style={styles.sectionTitle}>Booking options</Text>
                      <View style={styles.pillsWrap}>
                        {BOOKING_OPTIONS.map((opt) => {
                          const isSelected = draftBookingOptions.includes(opt.id);
                          return (
                            <TouchableOpacity
                              key={opt.id}
                              style={[styles.filterPill, isSelected && styles.filterPillActive]}
                              activeOpacity={0.8}
                              onPress={() => toggleDraftBookingOption(opt.id)}
                            >
                              {renderBookingOptionIcon(opt.icon, isSelected)}
                              <Text
                                style={[
                                  styles.filterPillText,
                                  isSelected && styles.filterPillTextActive,
                                ]}
                              >
                                {opt.label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {/* 4. Property Type Accordion Box */}
                    <View style={styles.propertyTypeCard}>
                      <TouchableOpacity
                        style={styles.propertyTypeHeader}
                        activeOpacity={0.8}
                        onPress={() => setShowPropertyType(!showPropertyType)}
                      >
                        <Text style={styles.propertyTypeTitle}>Property type</Text>
                        {showPropertyType ? (
                          <ChevronUp size={20} color="#0F172A" />
                        ) : (
                          <ChevronDown size={20} color="#0F172A" />
                        )}
                      </TouchableOpacity>

                      {showPropertyType && (
                        <View style={styles.propertyTypeBody}>
                          {PROPERTY_TYPES.map((pt) => {
                            const isSelected = draftPropertyTypes.includes(pt.id);
                            return (
                              <TouchableOpacity
                                key={pt.id}
                                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                                activeOpacity={0.8}
                                onPress={() => toggleDraftPropertyType(pt.id)}
                              >
                                {renderPropertyTypeIcon(pt.icon, isSelected)}
                                <Text
                                  style={[
                                    styles.filterPillText,
                                    isSelected && styles.filterPillTextActive,
                                  ]}
                                >
                                  {pt.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  {/* Fixed Sticky Footer */}
                  <View
                    style={[
                      styles.modalFooterRow,
                      { paddingBottom: Math.max(insets.bottom + 12, 18) },
                    ]}
                  >
                    <TouchableOpacity activeOpacity={0.7} onPress={handleClearAll}>
                      <Text style={styles.modalClearAllText}>Clear all</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalShowPlacesBtn}
                      activeOpacity={0.85}
                      onPress={handleApplyFilters}
                    >
                      <Text style={styles.modalShowPlacesText}>
                        Show {draftMatchCount} {draftMatchCount === 1 ? 'place' : 'places'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgePillHeader: {
    backgroundColor: 'rgba(232, 106, 112, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgePillHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.brand.coral,
    letterSpacing: 0.6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  countBadgeHeader: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#0F172A',
    fontWeight: '500',
  },
  filterBarContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  filterBarScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
  },
  filterToggleBtnActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  filterToggleText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    marginLeft: 5,
  },
  filterToggleTextActive: {
    color: '#FFFFFF',
  },
  mapToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  mapToggleChipActive: {
    backgroundColor: Colors.brand.coral,
  },
  mapToggleChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  mapToggleChipTextActive: {
    color: '#FFFFFF',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: Colors.brand.navy,
    borderColor: Colors.brand.navy,
  },
  filterChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  mapContainer: {
    height: 220,
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  satelliteToggleBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  staysScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  resetFiltersBtn: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  stayImageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
  },
  stayImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  reviewsCountText: {
    color: '#CBD5E1',
    fontSize: 11,
    marginLeft: 3,
  },
  favBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayDetails: {
    padding: 16,
  },
  stayTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12.5,
    color: '#64748B',
    flex: 1,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  amenityTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  amenityTagText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stayPrice: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  stayPricePeriod: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  stayTaxText: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 2,
  },
  viewDealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDealBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Filter Slideup Modal Styles */
  modalBackdropContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: WINDOW_HEIGHT * 0.9,
    overflow: 'hidden',
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtnCircle: {
    position: 'absolute',
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollBody: {
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
  },
  sectionContainer: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },

  /* Histogram */
  histogramContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 64,
    paddingHorizontal: 6,
    marginBottom: 4,
    gap: 2,
  },
  histogramBar: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 4,
  },

  /* Slider Track */
  sliderTrackWrapper: {
    position: 'relative',
    height: 34,
    justifyContent: 'center',
    marginBottom: 12,
  },
  sliderBaseTrack: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: 3,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  sliderActiveTrack: {
    position: 'absolute',
    height: 3,
    backgroundColor: '#FF385C',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    top: 3,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#FF385C',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },

  /* Minimum & Maximum Cards */
  priceBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  priceBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  priceBoxValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 4,
  },
  priceBoxInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    padding: 0,
  },

  /* Section Divider */
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 24,
  },

  /* Pills Grid & Styling */
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emojiIcon: {
    fontSize: 17,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },

  /* Property Type Accordion Card */
  propertyTypeCard: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    marginTop: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  propertyTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  propertyTypeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  propertyTypeBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 4,
  },

  /* Sticky Modal Footer */
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  modalClearAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    textDecorationLine: 'underline',
  },
  modalShowPlacesBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  modalShowPlacesText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  searchSummaryPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  searchSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchSummaryPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E86A70',
  },
});
