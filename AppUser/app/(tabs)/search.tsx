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
  ArrowLeft,
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
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { REAL_STAY_IMAGE } from '@/constants/RealImages';
import { useAuthStore } from '../../store/authStore';
import { usePropertyFilterStore } from '../../store/propertyFilterStore';
import { parseFlexibleDate, formatDisplayDate } from '../../utils/dateUtils';
import { getProperties } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiaGltYW5zaHUwNjY2IiwiYSI6ImNtcnc0ankydzAzb2ozMHNlb29ueWtsbTQifQ.mR3wqM4d-EnIXpp1S-l6pQ';

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
  sattal: [79.5333, 29.3500],
  mukteshwar: [79.6473, 29.4722],
  bhowali: [79.5186, 29.3844],
  ramgarh: [79.5552, 29.4285],
  ranikhet: [79.4284, 29.6434],
  almora: [79.6591, 29.5971],
  corbett: [79.1284, 29.3949],
  ramnagar: [79.1284, 29.3949],
  goa: [73.8567, 15.2993],
  delhi: [77.2090, 28.6139],
  'new delhi': [77.2090, 28.6139],
};

const CITY_CHIPS = [
  'All',
  'Haldwani',
  'Dehradun',
  'Nainital',
  'Mussoorie',
  'Delhi',
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
  styleMode: string = 'outdoors-v12',
  mapboxToken: string,
  selectedId: string | null = null
): string {
  const [lng, lat] = center;
  const staysJson = JSON.stringify(
    stays.map((s) => ({
      id: s.id,
      title: s.title,
      location: s.location,
      price: s.price,
      image: s.image,
      ratingText: s.ratingText || '4.8',
      coords: s.coords || [79.5606, 29.3496],
    }))
  );

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js"></script>
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    html, body { width: 100%; height: 100%; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; height: 100%; }

    /* Custom Floating Price Marker matching image */
    .price-marker {
      background-color: #FFFFFF;
      color: #0F172A;
      padding: 6px 14px;
      border-radius: 22px;
      font-weight: 800;
      font-size: 13.5px;
      letter-spacing: -0.2px;
      border: 2px solid #FF5A5F;
      box-shadow: 0 4px 14px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      -webkit-user-select: none;
    }
    .price-marker.active {
      background-color: #FF5A5F !important;
      color: #FFFFFF !important;
      border-color: #FF5A5F !important;
      transform: scale(1.15);
      box-shadow: 0 6px 20px rgba(255, 90, 95, 0.45);
      z-index: 1000 !important;
    }

    /* Floating Layer Switcher Button matching image */
    .layer-control-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 38px;
      height: 38px;
      background: #FFFFFF;
      border-radius: 10px;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: background 0.15s ease, transform 0.1s ease;
    }
    .layer-control-btn:active {
      background: #F1F5F9;
      transform: scale(0.95);
    }
    .layer-control-btn svg {
      width: 20px;
      height: 20px;
      fill: none;
      stroke: #334155;
      stroke-width: 2;
    }

    /* Mapbox standard controls repositioned under layer button */
    .mapboxgl-ctrl-top-right {
      top: 54px !important;
      right: 10px !important;
    }
    .mapboxgl-ctrl-group {
      border-radius: 10px !important;
      overflow: hidden;
      box-shadow: 0 0 0 2px rgba(0,0,0,0.1) !important;
    }
    .mapboxgl-ctrl-group button {
      width: 36px !important;
      height: 36px !important;
    }

    /* Popup card styling */
    .mapboxgl-popup-content {
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.25);
      max-width: 220px;
    }
    .popup-card {
      cursor: pointer;
    }
    .popup-img {
      width: 100%;
      height: 105px;
      object-fit: cover;
      display: block;
    }
    .popup-body {
      padding: 9px 12px 11px;
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      color: #0F172A;
      margin: 0 0 3px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popup-loc {
      font-size: 11px;
      color: #64748B;
      margin-bottom: 5px;
    }
    .popup-price {
      color: #FF5A5F;
      font-weight: 900;
      font-size: 13.5px;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Layer toggle icon matching screenshot -->
  <div class="layer-control-btn" id="layerToggleBtn" title="Switch Map View">
    <svg viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>

  <script>
    mapboxgl.accessToken = '${mapboxToken}';

    const STYLES = [
      'mapbox://styles/mapbox/outdoors-v12',
      'mapbox://styles/mapbox/streets-v12',
      'mapbox://styles/mapbox/satellite-streets-v12'
    ];
    let currentStyleIdx = 0;

    const map = new mapboxgl.Map({
      container: 'map',
      style: STYLES[0],
      center: [${lng}, ${lat}],
      zoom: 12.2,
      pitch: 0,
      dragRotate: true,
      touchZoomRotate: true,
      touchPitch: true
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    map.addControl(geolocate, 'top-right');

    // Layer toggle click handler
    document.getElementById('layerToggleBtn').addEventListener('click', function() {
      currentStyleIdx = (currentStyleIdx + 1) % STYLES.length;
      map.setStyle(STYLES[currentStyleIdx]);
    });

    const staysData = ${staysJson};
    const markers = {};
    let activeStayId = '${selectedId || ''}';

    function createMarkers() {
      staysData.forEach(stay => {
        if (!stay.coords || !Array.isArray(stay.coords)) return;
        const el = document.createElement('div');
        el.className = 'price-marker' + (stay.id === activeStayId ? ' active' : '');
        el.innerText = '₹' + Number(stay.price || 1500).toLocaleString('en-IN');
        el.id = 'marker-' + stay.id;

        const popupHtml = \`
          <div class="popup-card" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'open_stay', id: '\${stay.id}' }))">
            <img src="\${stay.image}" class="popup-img" />
            <div class="popup-body">
              <div class="popup-title">\${stay.title}</div>
              <div class="popup-loc">\${stay.location}</div>
              <div class="popup-price">₹\${Number(stay.price).toLocaleString('en-IN')} /night</div>
            </div>
          </div>
        \`;

        const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(popupHtml);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setActiveMarker(stay.id);
          map.easeTo({ center: stay.coords, duration: 350 });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'marker_click',
              id: stay.id,
              title: stay.title,
              price: stay.price,
              coords: stay.coords
            }));
          }
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(stay.coords)
          .setPopup(popup)
          .addTo(map);

        markers[stay.id] = { marker, el, data: stay };
      });
    }

    function setActiveMarker(id) {
      activeStayId = id;
      Object.keys(markers).forEach(k => {
        if (k === id) {
          markers[k].el.classList.add('active');
        } else {
          markers[k].el.classList.remove('active');
        }
      });
    }

    map.on('load', () => {
      createMarkers();
      if (staysData.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        staysData.forEach(s => {
          if (s.coords && Array.isArray(s.coords)) bounds.extend(s.coords);
        });
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 45, maxZoom: 14.5 });
        }
      }
    });

    map.on('style.load', () => {
      createMarkers();
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
    ai?: string;
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
  const DEFAULT_MAP_HEIGHT = Math.round(WINDOW_HEIGHT * 0.44);
  const MIN_MAP_HEIGHT = 170;
  const MAX_MAP_HEIGHT = Math.round(WINDOW_HEIGHT * 0.76);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mapHeight, setMapHeight] = useState<number>(DEFAULT_MAP_HEIGHT);
  const [selectedStayId, setSelectedStayId] = useState<string | null>(null);
  const dragStartHeight = useRef<number>(DEFAULT_MAP_HEIGHT);
  const mapHeightRef = useRef<number>(DEFAULT_MAP_HEIGHT);
  mapHeightRef.current = mapHeight;
  const webViewRef = useRef<WebView>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        dragStartHeight.current = mapHeightRef.current;
      },
      onPanResponderMove: (_, gestureState) => {
        const nextH = Math.max(
          MIN_MAP_HEIGHT,
          Math.min(MAX_MAP_HEIGHT, dragStartHeight.current + gestureState.dy)
        );
        setMapHeight(nextH);
      },
      onPanResponderRelease: (_, gestureState) => {
        const current = dragStartHeight.current + gestureState.dy;
        if (Math.abs(current - MIN_MAP_HEIGHT) < 40 || gestureState.vy < -0.6) {
          setMapHeight(MIN_MAP_HEIGHT);
        } else if (Math.abs(current - MAX_MAP_HEIGHT) < 50 || gestureState.vy > 0.6) {
          setMapHeight(MAX_MAP_HEIGHT);
        } else if (Math.abs(current - DEFAULT_MAP_HEIGHT) < 40) {
          setMapHeight(DEFAULT_MAP_HEIGHT);
        }
      },
    })
  ).current;

  const [mapCenter, setMapCenter] = useState<[number, number]>([79.5606, 29.3496]);
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

  // Search Popup Modal State (Image 2)
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState<boolean>(false);
  const [popupDestination, setPopupDestination] = useState<string>('');
  const [popupCheckIn, setPopupCheckIn] = useState<string>(selectedCheckIn);
  const [popupCheckOut, setPopupCheckOut] = useState<string>(selectedCheckOut);
  const [popupAdults, setPopupAdults] = useState<number>(searchAdults);
  const [popupChildren, setPopupChildren] = useState<number>(searchChildren);
  const [popupRooms, setPopupRooms] = useState<number>(searchRooms);
  const [isDatesExpanded, setIsDatesExpanded] = useState<boolean>(false);
  const [isGuestsExpanded, setIsGuestsExpanded] = useState<boolean>(false);

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [popupViewDate, setPopupViewDate] = useState<Date>(() => {
    const inD = parseFlexibleDate(selectedCheckIn);
    const safeIn = inD.getTime() < today.getTime() ? today : inD;
    return new Date(safeIn.getFullYear(), safeIn.getMonth(), 1);
  });

  const [dateSelectionStep, setDateSelectionStep] = useState<'checkin' | 'checkout'>('checkin');

  const viewYear = popupViewDate.getFullYear();
  const viewMonth = popupViewDate.getMonth();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const isCurrentOrPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setPopupViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setPopupViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const parsedIn = useMemo(() => parseFlexibleDate(popupCheckIn), [popupCheckIn]);
  const parsedOut = useMemo(() => parseFlexibleDate(popupCheckOut), [popupCheckOut]);

  const isCheckInDay = (day: number) => {
    const y = popupViewDate.getFullYear();
    const m = popupViewDate.getMonth();
    return (
      parsedIn.getFullYear() === y &&
      parsedIn.getMonth() === m &&
      parsedIn.getDate() === day
    );
  };

  const isCheckOutDay = (day: number) => {
    const y = popupViewDate.getFullYear();
    const m = popupViewDate.getMonth();
    return (
      parsedOut.getFullYear() === y &&
      parsedOut.getMonth() === m &&
      parsedOut.getDate() === day
    );
  };

  const isInRangeDay = (day: number) => {
    const y = popupViewDate.getFullYear();
    const m = popupViewDate.getMonth();
    const d = new Date(y, m, day).getTime();
    return d > parsedIn.getTime() && d < parsedOut.getTime();
  };

  const isPastDay = (day: number) => {
    const y = popupViewDate.getFullYear();
    const m = popupViewDate.getMonth();
    return new Date(y, m, day).getTime() < today.getTime();
  };

  const handleInlineDatePress = (day: number) => {
    const y = popupViewDate.getFullYear();
    const m = popupViewDate.getMonth();
    const tapped = new Date(y, m, day);
    if (tapped.getTime() < today.getTime()) return;

    if (dateSelectionStep === 'checkin') {
      const newInStr = formatDisplayDate(tapped);
      setPopupCheckIn(newInStr);
      if (!popupCheckOut || parsedOut.getTime() <= tapped.getTime()) {
        const nextDay = new Date(tapped.getTime() + 86400000);
        setPopupCheckOut(formatDisplayDate(nextDay));
      }
      setDateSelectionStep('checkout');
    } else {
      if (tapped.getTime() <= parsedIn.getTime()) {
        setPopupCheckIn(formatDisplayDate(tapped));
        const nextDay = new Date(tapped.getTime() + 86400000);
        setPopupCheckOut(formatDisplayDate(nextDay));
        setDateSelectionStep('checkout');
      } else {
        setPopupCheckOut(formatDisplayDate(tapped));
        setDateSelectionStep('checkin');
      }
    }
  };

  const handleSelectDatePreset = (preset: 'today' | 'weekend' | '3days' | '7days') => {
    const d1 = new Date();
    let d2 = new Date();
    if (preset === 'today') {
      d2.setDate(d1.getDate() + 1);
    } else if (preset === '3days') {
      d2.setDate(d1.getDate() + 3);
    } else if (preset === '7days') {
      d2.setDate(d1.getDate() + 7);
    } else if (preset === 'weekend') {
      const day = d1.getDay();
      const daysUntilFri = (5 - day + 7) % 7 || 7;
      d1.setDate(d1.getDate() + daysUntilFri);
      d2 = new Date(d1);
      d2.setDate(d2.getDate() + 2);
    }
    setPopupCheckIn(formatDisplayDate(d1));
    setPopupCheckOut(formatDisplayDate(d2));
    setPopupViewDate(new Date(d1.getFullYear(), d1.getMonth(), 1));
  };

  // Number of nights based on selected check-in and check-out
  const numberOfNights = useMemo(() => {
    try {
      const inD = parseFlexibleDate(selectedCheckIn);
      const outD = parseFlexibleDate(selectedCheckOut);
      const diffTime = outD.getTime() - inD.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(1, diffDays);
    } catch {
      return 1;
    }
  }, [selectedCheckIn, selectedCheckOut]);

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
              : REAL_STAY_IMAGE;

            const cityKey = (d.city || d.location || 'haldwani').toLowerCase().split(',')[0].trim();
            let coords = CITY_COORDINATES[cityKey] || [79.5130 + index * 0.02, 29.2183 + index * 0.02];
            const rawLocStr = String(d.location || '');
            const geoMatch = rawLocStr.match(/\[GEO:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/i);
            if (geoMatch) {
              const geoLat = parseFloat(geoMatch[1]);
              const geoLng = parseFloat(geoMatch[2]);
              if (!isNaN(geoLat) && !isNaN(geoLng)) {
                coords = [geoLng, geoLat];
              }
            }
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
              maxGuests: Number(
                d.maxGuests || d.guestCapacity || d.capacity || d.occupancy || d.guests || 0
              ),
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

  // AI Natural Language Query Parser (Matches User Portal Search Engine)
  const [activeAiQuery, setActiveAiQuery] = useState<string>(params.ai || '');

  useEffect(() => {
    if (params.ai !== undefined) {
      setActiveAiQuery(params.ai);
    }
  }, [params.ai]);

  const parsedAiQuery = useMemo(() => {
    if (!activeAiQuery || activeAiQuery.trim() === '') return null;
    let q = activeAiQuery.toLowerCase();

    // Expand abbreviations & common typos
    q = q
      .replace(/\bac\b/g, 'air conditioning')
      .replace(/\bwi-?fi\b/g, 'internet')
      .replace(/\btv\b/g, 'television')
      .replace(/\bswiming\b/g, 'pool')
      .replace(/\bswimmimg\b/g, 'pool');

    // Hinglish dictionary
    const hinglishMap: Record<string, string> = {
      sasta: 'budget',
      saste: 'budget',
      mahnga: 'luxury',
      mahanga: 'luxury',
      pani: 'pool',
      tarak: 'pool',
      bacche: 'kids',
      bache: 'kids',
      parivar: 'family',
      shadi: 'event',
      shaadi: 'event',
      kutta: 'pet',
      billi: 'pet',
      janwar: 'pet',
      khana: 'restaurant',
      bhojan: 'restaurant',
      badiya: 'best',
      achha: 'good',
      mast: 'awesome',
      jabardast: 'awesome',
      saundarya: 'beautiful',
      kamar: 'room',
      kamra: 'room',
      sardi: 'heater',
      garmi: 'air conditioning',
      thanda: 'air conditioning',
      hawa: 'air conditioning',
    };

    Object.entries(hinglishMap).forEach(([hinglish, english]) => {
      const regex = new RegExp(`\\b${hinglish}\\b`, 'gi');
      q = q.replace(regex, english);
    });

    // Parse Budget (supports numbers, commas, and 'k' notation like 5k, 10k)
    let maxBudget = Infinity;
    const kBudgetMatch = q.match(
      /(?:under|below|less than|max|budget|around|cheaper than|under rs|under inr|under ₹)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*k\b/i
    );
    if (kBudgetMatch) {
      maxBudget = parseFloat(kBudgetMatch[1]) * 1000;
    } else {
      const budgetMatch = q.match(
        /(?:under|below|less than|max|budget|around|cheaper than|under rs|under inr|under ₹)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)?)/i
      );
      if (budgetMatch) {
        maxBudget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      }
    }

    // Parse Guests
    let minGuests = 1;
    const guestMatch = q.match(/(?:for\s+)?(\d+)\s*(?:guests?|people|persons?|adults?)/i);
    if (guestMatch) {
      minGuests = parseInt(guestMatch[1], 10);
    } else if (
      q.includes('couple') ||
      q.includes('2 people') ||
      q.includes('two people') ||
      q.includes('two guests')
    ) {
      minGuests = 2;
    } else if (
      q.includes('family of 4') ||
      q.includes('4 people') ||
      q.includes('four people') ||
      q.includes('kids')
    ) {
      minGuests = 4;
    }

    // Extract property types
    const possibleTypes = [
      'hotel',
      'homestay',
      'villa',
      'resort',
      'apartment',
      'cabin',
      'cottage',
      'guest house',
      'camp',
      'tent',
    ];
    const requiredTypes = possibleTypes.filter((t) => q.includes(t));

    // Extract destination / city from AI query if mentioned
    const knownCities = [
      'haldwani',
      'dehradun',
      'nainital',
      'mussoorie',
      'delhi',
      'rishikesh',
      'bhimtal',
      'haridwar',
      'goa',
      'manali',
      'shimla',
      'jim corbett',
      'corbett',
      'ramnagar',
      'mumbai',
      'jaipur',
      'udaipur',
      'kerala',
    ];
    const matchedCity = knownCities.find((c) => q.includes(c));

    // Extract remaining text keywords
    const stopWords = [
      'best',
      'top',
      'cheap',
      'show',
      'me',
      'find',
      'the',
      'in',
      'at',
      'on',
      'with',
      'for',
      'of',
      'and',
      'good',
      'great',
      'awesome',
      'under',
      'below',
      'less',
      'than',
      'max',
      'budget',
      'around',
      'price',
      'cheaper',
      'rs',
      'inr',
      'guests',
      'people',
      'persons',
      'adults',
      'couple',
      'family',
      'properties',
      'property',
      'stays',
      'stay',
      'rooms',
      'room',
      'places',
      'place',
      'looking',
      'want',
      'need',
      'please',
    ];
    const rawWords = q.split(' ').filter((w) => w.length > 2);
    const keywords = rawWords.filter(
      (w) =>
        !stopWords.includes(w) &&
        !w.match(/^\d+$/) &&
        !w.match(/^\d+k$/) &&
        !requiredTypes.some((t) => t.includes(w)) &&
        (!matchedCity || !matchedCity.includes(w))
    );

    return { maxBudget, minGuests, requiredTypes, matchedCity, keywords, rawWords };
  }, [activeAiQuery]);

  // When AI query specifies a city, auto-set selectedCity and center map
  useEffect(() => {
    if (parsedAiQuery?.matchedCity) {
      const cityCapitalized =
        parsedAiQuery.matchedCity.charAt(0).toUpperCase() + parsedAiQuery.matchedCity.slice(1);
      const matchedChip = CITY_CHIPS.find(
        (c) => c.toLowerCase() === parsedAiQuery.matchedCity?.toLowerCase()
      );
      if (matchedChip) {
        setSelectedCity(matchedChip);
      }
      const cKey = parsedAiQuery.matchedCity.toLowerCase();
      if (CITY_COORDINATES[cKey]) {
        setMapCenter(CITY_COORDINATES[cKey]);
      }
    }
  }, [parsedAiQuery?.matchedCity]);

  // Helper matching function (matches User Portal logic)
  const checkStayMatches = (
    stay: any,
    minP: number,
    maxP: number,
    amenities: string[],
    bookingOpts: string[],
    propTypes: string[]
  ) => {
    // AI Natural Query Filter
    if (parsedAiQuery) {
      const p = Number(stay.price || 0);
      // 1. Budget check
      if (p > parsedAiQuery.maxBudget) return false;

      // 2. Capacity check
      const estimatedCap =
        stay.maxGuests || Math.max((stay.beds || 1) * 2, (stay.bedrooms || 1) * 2);
      if (estimatedCap < parsedAiQuery.minGuests) return false;

      // 3. Property Type check
      if (parsedAiQuery.requiredTypes.length > 0) {
        const typeStr = `${stay.title} ${stay.subtitle || ''} ${stay.propertyType || ''}`.toLowerCase();
        const hasType = parsedAiQuery.requiredTypes.some((t) => typeStr.includes(t));
        if (!hasType) return false;
      }

      // 4. City match from AI query
      if (parsedAiQuery.matchedCity) {
        const locStr = `${stay.title} ${stay.subtitle || ''} ${stay.location || ''} ${stay.city || ''}`.toLowerCase();
        if (!locStr.includes(parsedAiQuery.matchedCity)) {
          return false;
        }
      }

      // 5. Smart Keywords check (Location, title, amenities) - Matches User Portal 60% flexibility rule
      const amenitiesStr = Array.isArray(stay.amenities)
        ? stay.amenities.join(' ')
        : stay.amenities || '';
      const fullSearchStr = `${stay.title} ${stay.subtitle || ''} ${stay.location || ''} ${stay.city || ''} ${amenitiesStr}`.toLowerCase();

      const wordsToMatch =
        parsedAiQuery.keywords.length > 0
          ? parsedAiQuery.keywords
          : parsedAiQuery.maxBudget === Infinity &&
            parsedAiQuery.minGuests === 1 &&
            parsedAiQuery.requiredTypes.length === 0 &&
            !parsedAiQuery.matchedCity
          ? parsedAiQuery.rawWords
          : [];

      if (wordsToMatch.length > 0) {
        const matchCount = wordsToMatch.filter((w) => fullSearchStr.includes(w)).length;
        const requiredMatches =
          wordsToMatch.length <= 2 ? wordsToMatch.length : Math.ceil(wordsToMatch.length * 0.6);
        if (matchCount < requiredMatches) return false;
      }
    }

    // City chip filter (if selected city is not 'All' and not superseded by parsedAiQuery)
    if (selectedCity !== 'All' && !parsedAiQuery?.matchedCity) {
      const cLower = selectedCity.toLowerCase();
      const matchesCity = stay.city?.toLowerCase().includes(cLower);
      const matchesLoc = stay.location?.toLowerCase().includes(cLower);
      if (!matchesCity && !matchesLoc) return false;
    }

    // Search query filter (when manual query is typed)
    if (searchQuery.trim() && !activeAiQuery) {
      const qLower = searchQuery.toLowerCase().trim();
      const matchesTitle = stay.title.toLowerCase().includes(qLower);
      const matchesLoc = stay.location.toLowerCase().includes(qLower);
      const matchesCity = stay.city.toLowerCase().includes(qLower);
      if (!matchesTitle && !matchesLoc && !matchesCity) return false;
    }

    // Price filter
    const p = Number(stay.price || 0);
    if (p < minP || p > maxP) return false;

    // Guest capacity filter (if property specifies maximum guests)
    if (stay.maxGuests && stay.maxGuests > 0) {
      const totalAllowed = stay.maxGuests * Math.max(1, searchRooms);
      if (searchAdults + searchChildren > totalAllowed) return false;
    }

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
    searchAdults,
    searchChildren,
    searchRooms,
    activeAiQuery,
    parsedAiQuery,
  ]);

  const selectedStay = useMemo(() => {
    if (!selectedStayId) return filteredStays[0] || null;
    return filteredStays.find((s) => s.id === selectedStayId) || filteredStays[0] || null;
  }, [selectedStayId, filteredStays]);

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
    activeAiQuery,
    parsedAiQuery,
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

  // Open search details popup modal (Image 2)
  const handleOpenSearchPopup = (focus?: 'destination' | 'dates' | 'guests') => {
    setPopupDestination(searchQuery || (selectedCity !== 'All' ? selectedCity : ''));
    setPopupCheckIn(selectedCheckIn);
    setPopupCheckOut(selectedCheckOut);
    setPopupAdults(searchAdults);
    setPopupChildren(searchChildren);
    setPopupRooms(searchRooms);

    const inD = parseFlexibleDate(selectedCheckIn);
    const safeIn = inD.getTime() < today.getTime() ? today : inD;
    setPopupViewDate(new Date(safeIn.getFullYear(), safeIn.getMonth(), 1));
    setDateSelectionStep('checkin');

    setIsDatesExpanded(focus === 'dates');
    setIsGuestsExpanded(focus === 'guests');
    setIsSearchPopupOpen(true);
  };

  // Commit and apply search parameters from popup modal
  const handleApplySearchPopup = () => {
    setSelectedCheckIn(popupCheckIn);
    setSelectedCheckOut(popupCheckOut);
    setSearchAdults(popupAdults);
    setSearchChildren(popupChildren);
    setSearchRooms(popupRooms);

    const cleanDest = popupDestination.trim();
    setSearchQuery(cleanDest);

    // If destination matches one of the city chips, set that city chip
    const matchedCity = CITY_CHIPS.find(
      (c) => c !== 'All' && c.toLowerCase() === cleanDest.toLowerCase()
    );
    if (matchedCity) {
      setSelectedCity(matchedCity);
      const cKey = matchedCity.toLowerCase();
      if (CITY_COORDINATES[cKey]) {
        setMapCenter(CITY_COORDINATES[cKey]);
      }
    } else if (cleanDest === '') {
      setSelectedCity('All');
    }

    usePropertyFilterStore.getState().setFilters({
      checkIn: popupCheckIn,
      checkOut: popupCheckOut,
      adults: popupAdults,
      children: popupChildren,
      rooms: popupRooms,
      destination: cleanDest,
    });

    setIsDatesExpanded(false);
    setIsGuestsExpanded(false);
    setIsSearchPopupOpen(false);
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

  // Dynamic search location title (Defaults to Haldwani if none selected, or shows searched location/city)
  const currentSearchLocation = useMemo(() => {
    if (activeAiQuery && activeAiQuery.trim() !== '') {
      if (parsedAiQuery?.matchedCity) {
        return parsedAiQuery.matchedCity.charAt(0).toUpperCase() + parsedAiQuery.matchedCity.slice(1);
      }
      return 'AI Recommendations';
    }
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.trim();
      // Capitalize first letter of words
      return q.charAt(0).toUpperCase() + q.slice(1);
    }
    if (selectedCity && selectedCity !== 'All') {
      return selectedCity;
    }
    if (params.city && params.city !== 'All') {
      return params.city;
    }
    if (params.q && params.q.trim() !== '') {
      const q = params.q.trim();
      return q.charAt(0).toUpperCase() + q.slice(1);
    }
    return 'Haldwani';
  }, [activeAiQuery, parsedAiQuery?.matchedCity, searchQuery, selectedCity, params.city, params.q]);

  // Concise dates and guests subtitle formatted like Image 2: "23–24 Oct · 2 guests"
  const searchSummarySubtext = useMemo(() => {
    if (activeAiQuery && activeAiQuery.trim() !== '') {
      return `Prompt: "${activeAiQuery.length > 28 ? activeAiQuery.substring(0, 28) + '...' : activeAiQuery}"`;
    }
    let dateStr = 'Anytime';
    try {
      if (selectedCheckIn && selectedCheckOut) {
        const inD = parseFlexibleDate(selectedCheckIn);
        const outD = parseFlexibleDate(selectedCheckOut);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        if (inD.getMonth() === outD.getMonth()) {
          dateStr = `${inD.getDate()}–${outD.getDate()} ${months[inD.getMonth()]}`;
        } else {
          dateStr = `${inD.getDate()} ${months[inD.getMonth()]} – ${outD.getDate()} ${months[outD.getMonth()]}`;
        }
      }
    } catch {
      dateStr = 'Anytime';
    }

    const totalGuests = (searchAdults || 2) + (searchChildren || 0);
    const guestStr = `${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'}`;
    return `${dateStr} · ${guestStr}`;
  }, [activeAiQuery, selectedCheckIn, selectedCheckOut, searchAdults, searchChildren]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header Container */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top + 8, 16) }]}>
        {/* Search Bar Capsule with Back Arrow (Matches Image 2) */}
        <View style={styles.searchCapsuleHeaderRow}>
          <TouchableOpacity
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#0F172A" size={22} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchCapsuleBar}
            activeOpacity={0.88}
            onPress={() => handleOpenSearchPopup()}
          >
            <Text style={styles.searchCapsuleTitle} numberOfLines={1}>
              {currentSearchLocation ? `Homes in ${currentSearchLocation}` : 'Homes nearby'}
            </Text>
            <Text style={styles.searchCapsuleSub} numberOfLines={1}>
              {searchSummarySubtext}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter and Mode Bar */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBarScroll}
        >
          {/* Active AI Query Badge */}
          {activeAiQuery ? (
            <TouchableOpacity
              style={styles.aiActiveBadgeChip}
              activeOpacity={0.8}
              onPress={() => setActiveAiQuery('')}
            >
              <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.aiActiveBadgeText} numberOfLines={1}>
                AI: {activeAiQuery.length > 20 ? activeAiQuery.slice(0, 20) + '...' : activeAiQuery}
              </Text>
              <View style={styles.aiActiveBadgeClose}>
                <X size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : null}

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

      {/* Draggable & Adjustable Map View */}
      {showMap && (
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{
              html: getMapboxSearchHtml(
                filteredStays,
                mapCenter,
                isSatelliteMode ? 'satellite-streets-v12' : 'outdoors-v12',
                MAPBOX_ACCESS_TOKEN,
                selectedStayId
              ),
              baseUrl: 'https://api.mapbox.com',
            }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mixedContentMode="always"
            allowsInlineMediaPlayback={true}
            androidHardwareAccelerationDisabled={false}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === 'marker_click' && data.id) {
                  setSelectedStayId(data.id);
                } else if (data.type === 'open_stay' && data.id) {
                  navigateToStay(data.id);
                }
              } catch (e) {
                const stayId = event.nativeEvent.data;
                if (stayId) {
                  setSelectedStayId(stayId);
                }
              }
            }}
          />

          {/* Floating Peeking Card when Map is in Full Mode (matching user image) */}
          {mapHeight >= WINDOW_HEIGHT * 0.58 && selectedStay && (
            <View style={styles.floatingStayCard}>
              <TouchableOpacity
                style={styles.floatingCardInner}
                activeOpacity={0.92}
                onPress={() => navigateToStay(selectedStay.id)}
              >
                <Image
                  source={{ uri: selectedStay.image }}
                  style={styles.floatingCardImage}
                  resizeMode="cover"
                />
                <View style={styles.floatingCardInfo}>
                  <View style={styles.floatingCardRatingRow}>
                    <Star color="#F59E0B" fill="#F59E0B" size={12} style={{ marginRight: 3 }} />
                    <Text style={styles.floatingCardRatingText}>{selectedStay.ratingText}</Text>
                    <Text style={styles.floatingCardCityText}>• {selectedStay.city}</Text>
                  </View>
                  <Text style={styles.floatingCardTitle} numberOfLines={1}>
                    {selectedStay.title}
                  </Text>
                  <Text style={styles.floatingCardPrice}>
                    ₹{Number(selectedStay.price).toLocaleString('en-IN')}{' '}
                    <Text style={styles.floatingCardNight}>/ night</Text>
                  </Text>
                </View>
                <View style={styles.floatingCardAction}>
                  <ArrowRight color="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Draggable Divider Handle */}
      {showMap && (
        <View {...panResponder.panHandlers} style={styles.dragHandleBar}>
          <View style={styles.dragPill} />
          <View style={styles.dragControlsRow}>
            <Text style={styles.dragHintText}>
              {mapHeight >= WINDOW_HEIGHT * 0.65
                ? 'Full Map View'
                : mapHeight >= WINDOW_HEIGHT * 0.38
                ? 'Split View'
                : 'Compact Map'}
            </Text>
            <View style={styles.dragSnapButtons}>
              <TouchableOpacity
                style={[styles.snapBtn, mapHeight <= 220 && styles.snapBtnActive]}
                onPress={() => setMapHeight(MIN_MAP_HEIGHT)}
              >
                <Text style={[styles.snapBtnText, mapHeight <= 220 && styles.snapBtnTextActive]}>
                  Small
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.snapBtn,
                  mapHeight > 220 && mapHeight < WINDOW_HEIGHT * 0.6 && styles.snapBtnActive,
                ]}
                onPress={() => setMapHeight(DEFAULT_MAP_HEIGHT)}
              >
                <Text
                  style={[
                    styles.snapBtnText,
                    mapHeight > 220 && mapHeight < WINDOW_HEIGHT * 0.6 && styles.snapBtnTextActive,
                  ]}
                >
                  Half
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.snapBtn, mapHeight >= WINDOW_HEIGHT * 0.6 && styles.snapBtnActive]}
                onPress={() => setMapHeight(MAX_MAP_HEIGHT)}
              >
                <Text
                  style={[
                    styles.snapBtnText,
                    mapHeight >= WINDOW_HEIGHT * 0.6 && styles.snapBtnTextActive,
                  ]}
                >
                  Full
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
                      {numberOfNights > 1 ? (
                        <Text style={styles.stayTaxText}>
                          ₹{(stay.price * numberOfNights).toLocaleString('en-IN')} total for {numberOfNights} nights
                        </Text>
                      ) : (
                        <Text style={styles.stayTaxText}>+ taxes & fees included</Text>
                      )}
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

      {/* Search Details Popup Modal (Image 2 - The Only Popup) */}
      <Modal
        visible={isSearchPopupOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSearchPopupOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.popupModalOverlay}
        >
          <TouchableOpacity
            style={styles.popupBackdropTouchable}
            activeOpacity={1}
            onPress={() => setIsSearchPopupOpen(false)}
          >
            <View style={styles.popupCardWrapper}>
              {/* Floating Top-Right Close Button as in Image 2 */}
              <TouchableOpacity
                style={styles.popupFloatingCloseBtn}
                activeOpacity={0.85}
                onPress={() => setIsSearchPopupOpen(false)}
              >
                <X color="#0F172A" size={20} strokeWidth={2.2} />
              </TouchableOpacity>

              {/* White Card */}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.popupCard}
                onPress={(e) => e.stopPropagation()}
              >
                <ScrollView
                  style={{ maxHeight: WINDOW_HEIGHT * 0.76 }}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {/* 3-Section Grouped Box (Matches Image 2) */}
                  <View style={styles.popupGroupedBox}>
                    {/* Row 1: Where to? */}
                    <View style={styles.popupBoxRow}>
                      <MapPin color={Colors.brand.coral} size={24} strokeWidth={2} style={styles.popupBoxIcon} />
                      <View style={styles.popupBoxContent}>
                        <Text style={styles.popupBoxTitle}>Where to?</Text>
                        <TextInput
                          style={styles.popupBoxInput}
                          placeholder="Search destination"
                          placeholderTextColor="#94A3B8"
                          value={popupDestination}
                          onChangeText={setPopupDestination}
                          returnKeyType="done"
                        />
                      </View>
                      {popupDestination.length > 0 && (
                        <TouchableOpacity onPress={() => setPopupDestination('')} style={styles.popupClearInputBtn}>
                          <X color="#94A3B8" size={16} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={styles.popupBoxDivider} />

                    {/* Row 2: Check in - Check out */}
                    <TouchableOpacity
                      style={styles.popupBoxRow}
                      activeOpacity={0.7}
                      onPress={() => setIsDatesExpanded(!isDatesExpanded)}
                    >
                      <CalendarIcon color={Colors.brand.coral} size={24} strokeWidth={2} style={styles.popupBoxIcon} />
                      <View style={styles.popupBoxContent}>
                        <Text style={styles.popupBoxTitle}>Check in - Check out</Text>
                        <Text
                          style={[
                            styles.popupBoxSubtitle,
                            popupCheckIn && popupCheckOut && styles.popupBoxSubtitleActive,
                          ]}
                        >
                          {popupCheckIn && popupCheckOut
                            ? `${popupCheckIn} - ${popupCheckOut}`
                            : 'Add dates'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Expandable Clean Compact Inline Calendar */}
                    {isDatesExpanded && (
                      <View style={styles.inlineCalendarContainer}>
                        {/* Month Switcher Header */}
                        <View style={styles.calMonthNavRow}>
                          <TouchableOpacity
                            style={[styles.calNavBtn, isCurrentOrPastMonth && styles.calNavBtnDisabled]}
                            disabled={isCurrentOrPastMonth}
                            onPress={handlePrevMonth}
                          >
                            <ChevronLeft size={18} color={isCurrentOrPastMonth ? '#CBD5E1' : '#0F172A'} />
                          </TouchableOpacity>

                          <Text style={styles.calMonthNavTitle}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                          </Text>

                          <TouchableOpacity style={styles.calNavBtn} onPress={handleNextMonth}>
                            <ChevronRight size={18} color="#0F172A" />
                          </TouchableOpacity>
                        </View>

                        {/* Weekday Labels */}
                        <View style={styles.calWeekDaysRow}>
                          {WEEK_DAYS.map((w, idx) => (
                            <Text key={idx} style={styles.calWeekDayLabel}>
                              {w}
                            </Text>
                          ))}
                        </View>

                        {/* Day Grid */}
                        <View style={styles.calDaysGrid}>
                          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <View key={`empty-${i}`} style={styles.calDayCell} />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const isSelected = isCheckInDay(day) || isCheckOutDay(day);
                            const inRange = isInRangeDay(day);
                            const past = isPastDay(day);

                            return (
                              <TouchableOpacity
                                key={day}
                                style={[
                                  styles.calDayCell,
                                  inRange && styles.calDayCellInRange,
                                  isSelected && styles.calDayCellSelected,
                                ]}
                                disabled={past}
                                onPress={() => handleInlineDatePress(day)}
                                activeOpacity={0.7}
                              >
                                <Text
                                  style={[
                                    styles.calDayText,
                                    past && styles.calDayTextPast,
                                    inRange && styles.calDayTextInRange,
                                    isSelected && styles.calDayTextSelected,
                                  ]}
                                >
                                  {day}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    <View style={styles.popupBoxDivider} />

                    {/* Row 3: Guests */}
                    <TouchableOpacity
                      style={styles.popupBoxRow}
                      activeOpacity={0.7}
                      onPress={() => setIsGuestsExpanded(!isGuestsExpanded)}
                    >
                      <Users color={Colors.brand.coral} size={24} strokeWidth={2} style={styles.popupBoxIcon} />
                      <View style={styles.popupBoxContent}>
                        <Text style={styles.popupBoxTitle}>Guests</Text>
                        <Text
                          style={[
                            styles.popupBoxSubtitle,
                            popupAdults + popupChildren > 0 && styles.popupBoxSubtitleActive,
                          ]}
                        >
                          {popupAdults + popupChildren > 0
                            ? `${popupAdults + popupChildren} ${popupAdults + popupChildren === 1 ? 'Guest' : 'Guests'}${popupRooms > 1 ? ` · ${popupRooms} Rooms` : ''}`
                            : 'Add guests'}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Expandable Guest & Room Steppers */}
                    {isGuestsExpanded && (
                      <View style={styles.popupStepperContainer}>
                        {/* Adults */}
                        <View style={styles.popupStepperRow}>
                          <View>
                            <Text style={styles.popupStepperTitle}>Adults</Text>
                            <Text style={styles.popupStepperSub}>Ages 13 or above</Text>
                          </View>
                          <View style={styles.popupStepperControls}>
                            <TouchableOpacity
                              style={[styles.popupStepperBtn, popupAdults <= 1 && styles.popupStepperBtnDisabled]}
                              disabled={popupAdults <= 1}
                              onPress={() => setPopupAdults((prev) => Math.max(1, prev - 1))}
                            >
                              <Minus size={16} color={popupAdults <= 1 ? '#CBD5E1' : '#0F172A'} />
                            </TouchableOpacity>
                            <Text style={styles.popupStepperValue}>{popupAdults}</Text>
                            <TouchableOpacity
                              style={styles.popupStepperBtn}
                              onPress={() => setPopupAdults((prev) => prev + 1)}
                            >
                              <Plus size={16} color="#0F172A" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Children */}
                        <View style={styles.popupStepperRow}>
                          <View>
                            <Text style={styles.popupStepperTitle}>Children</Text>
                            <Text style={styles.popupStepperSub}>Ages 2 – 12</Text>
                          </View>
                          <View style={styles.popupStepperControls}>
                            <TouchableOpacity
                              style={[styles.popupStepperBtn, popupChildren <= 0 && styles.popupStepperBtnDisabled]}
                              disabled={popupChildren <= 0}
                              onPress={() => setPopupChildren((prev) => Math.max(0, prev - 1))}
                            >
                              <Minus size={16} color={popupChildren <= 0 ? '#CBD5E1' : '#0F172A'} />
                            </TouchableOpacity>
                            <Text style={styles.popupStepperValue}>{popupChildren}</Text>
                            <TouchableOpacity
                              style={styles.popupStepperBtn}
                              onPress={() => setPopupChildren((prev) => prev + 1)}
                            >
                              <Plus size={16} color="#0F172A" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Rooms */}
                        <View style={[styles.popupStepperRow, { borderBottomWidth: 0 }]}>
                          <View>
                            <Text style={styles.popupStepperTitle}>Rooms</Text>
                            <Text style={styles.popupStepperSub}>Number of rooms</Text>
                          </View>
                          <View style={styles.popupStepperControls}>
                            <TouchableOpacity
                              style={[styles.popupStepperBtn, popupRooms <= 1 && styles.popupStepperBtnDisabled]}
                              disabled={popupRooms <= 1}
                              onPress={() => setPopupRooms((prev) => Math.max(1, prev - 1))}
                            >
                              <Minus size={16} color={popupRooms <= 1 ? '#CBD5E1' : '#0F172A'} />
                            </TouchableOpacity>
                            <Text style={styles.popupStepperValue}>{popupRooms}</Text>
                            <TouchableOpacity
                              style={styles.popupStepperBtn}
                              onPress={() => setPopupRooms((prev) => prev + 1)}
                            >
                              <Plus size={16} color="#0F172A" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Big Coral Search Button - ALWAYS PINNED AT CARD BOTTOM */}
                <TouchableOpacity
                  style={styles.popupSearchBtn}
                  activeOpacity={0.88}
                  onPress={handleApplySearchPopup}
                >
                  <Text style={styles.popupSearchBtnText}>Search</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  searchCapsuleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  headerBackBtn: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  searchCapsuleBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchCapsuleTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  searchCapsuleSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 6,
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 22,
    paddingHorizontal: 16,
    height: 50,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 15,
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
  aiActiveBadgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  aiActiveBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    maxWidth: 160,
  },
  aiActiveBadgeClose: {
    marginLeft: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
    overflow: 'hidden',
  },
  dragHandleBar: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  dragPill: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginBottom: 6,
  },
  dragControlsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dragHintText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dragSnapButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snapBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  snapBtnActive: {
    backgroundColor: Colors.brand.coral,
  },
  snapBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  snapBtnTextActive: {
    color: '#FFFFFF',
  },
  floatingStayCard: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    zIndex: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  floatingCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  floatingCardImage: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  floatingCardInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  floatingCardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  floatingCardRatingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  floatingCardCityText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  floatingCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  floatingCardPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  floatingCardNight: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  floatingCardAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginTop: 4,
    paddingBottom: 2,
  },
  searchSummaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8.5,
  },
  searchSummaryPillText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#E86A70',
  },
  searchCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },

  /* Search Details Popup Modal (Image 2) Styles */
  popupModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  popupBackdropTouchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCardWrapper: {
    width: '100%',
    maxWidth: 420,
  },
  popupFloatingCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  popupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  popupGroupedBox: {
    backgroundColor: '#FFFFFF',
  },
  popupBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  popupBoxIcon: {
    marginRight: 16,
  },
  popupBoxContent: {
    flex: 1,
    justifyContent: 'center',
  },
  popupBoxTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 3,
  },
  popupBoxSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  popupBoxSubtitleActive: {
    color: '#334155',
    fontWeight: '600',
  },
  popupBoxInput: {
    fontSize: 14.5,
    color: '#1E293B',
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  popupClearInputBtn: {
    padding: 4,
  },
  popupBoxDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  popupStepperContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  popupStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  popupStepperTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  popupStepperSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  popupStepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  popupStepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupStepperBtnDisabled: {
    borderColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  popupStepperValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  popupSearchBtn: {
    backgroundColor: Colors.brand.coral,
    borderRadius: 24,
    height: 52,
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  popupSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  /* Inline Calendar Styles in Popup */
  inlineCalendarContainer: {
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  calMonthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  calMonthNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  calNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNavBtnDisabled: {
    opacity: 0.35,
  },
  calWeekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 4,
  },
  calWeekDayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calDayCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 18,
  },
  calDayCellInRange: {
    backgroundColor: '#FFF1F2',
    borderRadius: 0,
  },
  calDayCellSelected: {
    backgroundColor: Colors.brand.coral,
    borderRadius: 18,
  },
  calDayText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0F172A',
  },
  calDayTextPast: {
    color: '#CBD5E1',
    fontWeight: '400',
  },
  calDayTextInRange: {
    color: Colors.brand.coral,
    fontWeight: '700',
  },
  calDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
