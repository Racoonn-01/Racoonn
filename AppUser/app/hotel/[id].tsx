import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Share,
  TouchableWithoutFeedback,
  Platform,
  Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Star,
  Heart,
  ArrowRight,
  CheckCircle2,
  BedDouble,
  Coffee,
  Info,
  ArrowLeft,
  Share2,
  Grid,
  X,
  MessageCircle,
  Calendar,
  Users,
  Plus,
  Minus,
  ChevronDown,
  Maximize2,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Tv,
  PawPrint,
  ConciergeBell,
  Flower2,
  Snowflake,
  Wine,
  Bus,
  Bath,
  Zap,
  Shirt,
  Accessibility,
  Sun,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { REAL_STAY_IMAGE, REAL_ROOM_IMAGE } from '@/constants/RealImages';
import { useAuthStore } from '../../store/authStore';
import AuthBottomSheet from '../../components/shared/AuthBottomSheet';
import { calculateRoomPricing } from '../../utils/pricing';
import RoomImageSlider from '../../components/rooms/RoomImageSlider';
import RoomDetailsModal from '../../components/rooms/RoomDetailsModal';
import RoomSelectionModal from '../../components/rooms/RoomSelectionModal';
import CustomCalendarModal from '../../components/shared/CustomCalendarModal';
import { usePropertyFilterStore } from '../../store/propertyFilterStore';
import { parseFlexibleDate, formatDisplayDate } from '../../utils/dateUtils';
import { getProperty, getRooms, getOccupiedRooms, getReviews, createReview, getImageUrl } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN =
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

function parseLocationGeo(rawLocation?: string): { cleanLocation: string; lat?: number; lng?: number } {
  if (!rawLocation) return { cleanLocation: '' };
  const geoMatch = rawLocation.match(/\[GEO:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\]/i);
  if (geoMatch) {
    const lat = parseFloat(geoMatch[1]);
    const lng = parseFloat(geoMatch[2]);
    const cleanLocation = rawLocation.replace(/\[GEO:\s*-?\d+(?:\.\d+)?,\\s*-?\d+(?:\.\d+)?\]/gi, '').replace(/\s+,/g, ',').trim();
    return {
      cleanLocation: cleanLocation || rawLocation.trim(),
      lat: isNaN(lat) ? undefined : lat,
      lng: isNaN(lng) ? undefined : lng,
    };
  }
  return { cleanLocation: rawLocation.replace(/\s*\[GEO:[^\]]*\]/gi, '').trim() };
}

function getCoordinates(locationStr: string): [number, number] {
  const parsed = parseLocationGeo(locationStr);
  if (parsed.lat !== undefined && parsed.lng !== undefined) {
    return [parsed.lng, parsed.lat];
  }

  const locLower = (locationStr || '').toLowerCase();
  for (const [cityKey, coords] of Object.entries(CITY_COORDINATES)) {
    if (locLower.includes(cityKey)) {
      return coords;
    }
  }

  return [79.5130, 29.2183]; // Default to Haldwani
}

function getMapboxHtml(title: string, locationStr: string): string {
  const [lng, lat] = getCoordinates(locationStr);
  const parsed = parseLocationGeo(locationStr);
  const displayLocation = parsed.cleanLocation || locationStr || 'Uttarakhand';
  const cleanTitle = (title || 'Luxury Hotel').replace(/'/g, "\\'");
  const cleanLoc = displayLocation.replace(/'/g, "\\'");
  const hasExactGeo = parsed.lat !== undefined && parsed.lng !== undefined;

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
    .custom-marker {
      background-color: #E86A70;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 3.5px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
    }
    .custom-marker::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #FFFFFF;
      border-radius: 50%;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(232, 106, 112, 0.6); }
      70% { box-shadow: 0 0 0 12px rgba(232, 106, 112, 0); }
      100% { box-shadow: 0 0 0 0 rgba(232, 106, 112, 0); }
    }
    .mapboxgl-popup-content {
      border-radius: 14px;
      padding: 10px 14px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-size: 13px;
    }
    .mapboxgl-popup-content h4 {
      margin: 0 0 2px 0;
      color: #0F172A;
      font-size: 14px;
      font-weight: 800;
    }
    .mapboxgl-popup-content p {
      margin: 0;
      color: #64748B;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_TOKEN}';
    let currentLng = ${lng};
    let currentLat = ${lat};
    const hasExact = ${hasExactGeo};

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [currentLng, currentLat],
      zoom: 15,
      pitch: 20
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true
    }), 'top-right');

    const el = document.createElement('div');
    el.className = 'custom-marker';

    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h4>${cleanTitle}</h4><p>${cleanLoc}</p>');

    const marker = new mapboxgl.Marker(el)
      .setLngLat([currentLng, currentLat])
      .setPopup(popup)
      .addTo(map);

    // If exact coordinates were not in GEO tag, geocode address via Mapbox API dynamically
    if (!hasExact && '${cleanLoc}') {
      fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent('${cleanLoc}') + '.json?access_token=' + mapboxgl.accessToken + '&country=in&limit=1')
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.features && data.features.length > 0) {
            const coords = data.features[0].center;
            marker.setLngLat(coords);
            map.flyTo({ center: coords, zoom: 15 });
          }
        })
        .catch(function(err) {
          console.warn('Geocoding fetch failed:', err);
        });
    }
  </script>
</body>
</html>
  `;
}

const DEFAULT_AMENITIES = [
  'Free High-Speed Wi-Fi',
  'Swimming Pool',
  'Complimentary Breakfast',
  'Free Parking',
  'Air Conditioning',
  '24/7 Room Service',
  'Mountain View Balcony',
];



const formatAmenityName = (raw: string): string => {
  if (!raw) return '';
  const map: Record<string, string> = {
    wifi: 'Free High-Speed Wi-Fi',
    parking: 'Free On-Site Parking',
    restaurant: 'Multi-Cuisine Restaurant',
    pool: 'Swimming Pool',
    gym: 'Fitness Centre / Gym',
    tv: 'Flat-Screen TV',
    pets: 'Pet Friendly',
    room_service: '24/7 Room Service',
    front_desk: '24-Hour Front Desk',
    spa: 'Wellness Spa & Steam',
    ac: 'Air Conditioning',
    coffee: 'Tea & Coffee Maker',
    bar: 'Lounge & Bar',
    shuttle: 'Airport / City Shuttle',
    ev: 'EV Charging Station',
    balcony: 'Private Balcony / Terrace',
    accessible: 'Wheelchair Accessible',
    laundry: 'Laundry Service',
  };
  const key = raw.toLowerCase().trim();
  if (map[key]) return map[key];
  return raw
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const getAmenityIcon = (name: string, size = 18, color = Colors.brand.coral) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi size={size} color={color} />;
  if (lower.includes('park') || lower.includes('car')) return <Car size={size} color={color} />;
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('dine') || lower.includes('meal')) return <Utensils size={size} color={color} />;
  if (lower.includes('pool') || lower.includes('swim')) return <Waves size={size} color={color} />;
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) return <Dumbbell size={size} color={color} />;
  if (lower.includes('tv') || lower.includes('screen') || lower.includes('entertainment')) return <Tv size={size} color={color} />;
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('cat')) return <PawPrint size={size} color={color} />;
  if (lower.includes('room_service') || lower.includes('desk') || lower.includes('reception') || lower.includes('front')) return <ConciergeBell size={size} color={color} />;
  if (lower.includes('spa') || lower.includes('wellness') || lower.includes('massage')) return <Flower2 size={size} color={color} />;
  if (lower.includes('steam') || lower.includes('sauna')) return <Bath size={size} color={color} />;
  if (lower.includes('ac') || lower.includes('air cond') || lower.includes('cool')) return <Snowflake size={size} color={color} />;
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('cafe')) return <Coffee size={size} color={color} />;
  if (lower.includes('bar') || lower.includes('drink') || lower.includes('wine')) return <Wine size={size} color={color} />;
  if (lower.includes('shuttle') || lower.includes('transfer') || lower.includes('bus')) return <Bus size={size} color={color} />;
  if (lower.includes('bath') || lower.includes('shower') || lower.includes('tub')) return <Bath size={size} color={color} />;
  if (lower.includes('laundry') || lower.includes('dry clean')) return <Shirt size={size} color={color} />;
  if (lower.includes('ev') || lower.includes('charge') || lower.includes('electric')) return <Zap size={size} color={color} />;
  if (lower.includes('access') || lower.includes('wheelchair') || lower.includes('disab')) return <Accessibility size={size} color={color} />;
  if (lower.includes('balcony') || lower.includes('terrace') || lower.includes('patio')) return <Sun size={size} color={color} />;
  return <CheckCircle2 size={size} color={color} />;
};

const REVIEW_FILTERS = ['All', 'View', 'Hospitality', 'Cleanliness', 'Amenities', 'Food'];

export default function PropertyDetailScreen() {
  const insets = useSafeAreaInsets();
  const bottomNavPadding = insets.bottom > 0
    ? (insets.bottom + 10)
    : (Platform.OS === 'android' ? 44 : 16);
  const params = useLocalSearchParams<{
    id?: string;
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
    infants?: string;
    guests?: string;
    rooms?: string;
  }>();
  const router = useRouter();
  const { user, profile, isAuthenticated, toggleSavedHotel } = useAuthStore();
  const filterStore = usePropertyFilterStore();
  
  const [isAuthSheetVisible, setIsAuthSheetVisible] = useState(false);
  const [isAllAmenitiesModalOpen, setIsAllAmenitiesModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const hotelId = (params.id as string) || 'stay-1';

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [occupiedRooms, setOccupiedRooms] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'rooms' | 'amenities' | 'about' | 'location' | 'reviews'>('rooms');
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [, setSelectedPhotoIndex] = useState(0);

  // Booking Dates & Guests Detailed State (Auto-selected from search / global filterStore)
  const [adultsCount, setAdultsCount] = useState<number>(() => {
    if (params.adults) return Math.max(1, parseInt(params.adults, 10) || 1);
    if (params.guests) return Math.max(1, parseInt(params.guests, 10) || 1);
    return filterStore.adults || 2;
  });
  const [childrenCount, setChildrenCount] = useState<number>(() => {
    if (params.children !== undefined) return Math.max(0, parseInt(params.children, 10) || 0);
    return filterStore.children || 0;
  });
  const [infantsCount, setInfantsCount] = useState<number>(() => {
    if (params.infants !== undefined) return Math.max(0, parseInt(params.infants, 10) || 0);
    return filterStore.infants || 0;
  });
  const [petsCount, setPetsCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(() => {
    if (params.rooms) return Math.max(1, parseInt(params.rooms, 10) || 1);
    return filterStore.rooms || 1;
  });

  const [checkInDate, setCheckInDate] = useState<string>(() => {
    if (params.checkIn && params.checkIn !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(params.checkIn));
    }
    if (filterStore.checkIn && filterStore.checkIn !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(filterStore.checkIn));
    }
    const d = new Date();
    return formatDisplayDate(d);
  });
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    if (params.checkOut && params.checkOut !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(params.checkOut));
    }
    if (filterStore.checkOut && filterStore.checkOut !== 'Add dates') {
      return formatDisplayDate(parseFlexibleDate(filterStore.checkOut));
    }
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDisplayDate(d);
  });

  // Synchronize automatically when search params update
  useEffect(() => {
    if (params.checkIn && params.checkIn !== 'Add dates') {
      const inD = parseFlexibleDate(params.checkIn);
      setCheckInDate(formatDisplayDate(inD));
    }
    if (params.checkOut && params.checkOut !== 'Add dates') {
      const outD = parseFlexibleDate(params.checkOut);
      setCheckOutDate(formatDisplayDate(outD));
    }
    if (params.adults) {
      setAdultsCount(Math.max(1, parseInt(params.adults, 10) || 1));
    } else if (params.guests) {
      setAdultsCount(Math.max(1, parseInt(params.guests, 10) || 1));
    }
    if (params.children !== undefined) {
      setChildrenCount(Math.max(0, parseInt(params.children, 10) || 0));
    }
    if (params.infants !== undefined) {
      setInfantsCount(Math.max(0, parseInt(params.infants, 10) || 0));
    }
    if (params.rooms) {
      setRoomsCount(Math.max(1, parseInt(params.rooms, 10) || 1));
    }
  }, [
    params.checkIn,
    params.checkOut,
    params.adults,
    params.children,
    params.infants,
    params.guests,
    params.rooms,
  ]);

  // Date & Guest Modal States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateSelectionStep, setDateSelectionStep] = useState<'checkin' | 'checkout'>('checkin');
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  // Review System State
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewFilter, setReviewFilter] = useState('All');
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userReviewComment, setUserReviewComment] = useState('');
  const [userNameInput, setUserNameInput] = useState(profile?.name || user?.name || '');

  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<any | null>(null);
  const [isRoomSelectionModalOpen, setIsRoomSelectionModalOpen] = useState<boolean>(false);

  // Scroll View Ref & Section Positions
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});

  // Check if hotel room inventory is empty or unavailable
  const isHotelUnavailable = useMemo(() => {
    if (!roomsList || roomsList.length === 0) return true;

    // Check if total remaining inventory across all rooms is 0
    const totalInventoryAvailable = roomsList.reduce((sum, room) => {
      const roomNameKey = room.name ? room.name.trim() : '';
      const roomOccupiedCount = occupiedRooms[roomNameKey] || occupiedRooms[room.id] || 0;
      const roomTotalRooms = (room.totalRooms !== undefined && room.totalRooms !== null) ? Number(room.totalRooms) : 0;
      const avail = Math.max(0, roomTotalRooms - roomOccupiedCount);
      return sum + avail;
    }, 0);

    if (totalInventoryAvailable <= 0) return true;

    // Check if any room can accommodate the selected guests and rooms count
    const totalGuests = adultsCount + childrenCount;
    const hasAnyBookableRoom = roomsList.some((room) => {
      const maxCap = room.maximumCapacity || 4;
      const roomNameKey = room.name ? room.name.trim() : '';
      const roomOccupiedCount = occupiedRooms[roomNameKey] || occupiedRooms[room.id] || 0;
      const roomTotalRooms = (room.totalRooms !== undefined && room.totalRooms !== null) ? Number(room.totalRooms) : 0;
      const availableRooms = Math.max(0, roomTotalRooms - roomOccupiedCount);

      const autoRooms = Math.ceil(totalGuests / maxCap);
      const requiredRooms = Math.max(roomsCount, autoRooms);
      const guestsPerRoom = Math.ceil(totalGuests / requiredRooms);

      const isCapacityExceeded = guestsPerRoom > maxCap;
      const isNotEnoughRooms = requiredRooms > availableRooms;

      return !isCapacityExceeded && !isNotEnoughRooms && availableRooms > 0;
    });

    return !hasAnyBookableRoom;
  }, [roomsList, occupiedRooms, adultsCount, childrenCount, roomsCount]);

  const enrichedRooms = useMemo(() => {
    return roomsList.map((room) => {
      const roomNameKey = room.name ? room.name.trim() : '';
      const roomOccupiedCount = occupiedRooms[roomNameKey] || occupiedRooms[room.id] || 0;
      const roomTotalRooms = (room.totalRooms !== undefined && room.totalRooms !== null) ? Number(room.totalRooms) : 0;
      const availableRooms = Math.max(0, roomTotalRooms - roomOccupiedCount);
      return {
        ...room,
        availableRooms,
      };
    });
  }, [roomsList, occupiedRooms]);

  const startBooking = (room?: any, pricing?: any, requiredRoomsCount?: number) => {
    if (!isAuthenticated) {
      setIsAuthSheetVisible(true);
      return;
    }

    if (!hotel || isHotelUnavailable) return;
    const targetRoom = room || (roomsList.length > 0 ? roomsList[0] : null);
    if (!targetRoom) return;
    const finalRoomsCount = requiredRoomsCount || roomsCount;
    const finalNightlyRate = pricing?.roomSubtotal
      ? pricing.roomSubtotal
      : Number(targetRoom?.price || hotel.price || 0);

    const dIn = parseFlexibleDate(checkInDate);
    const dOut = parseFlexibleDate(checkOutDate);
    const diffMs = dOut.getTime() - dIn.getTime();
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));

    const targetImage =
      targetRoom?.photos?.[0] ||
      targetRoom?.images?.[0] ||
      targetRoom?.image ||
      hotel.images?.[0] ||
      '';

    router.push({
      pathname: `/checkout/${hotel.id}` as any,
      params: {
        packageTitle: hotel.title,
        guests: adultsCount + childrenCount,
        adults: adultsCount,
        children: childrenCount,
        infants: infantsCount,
        totalPrice: finalNightlyRate * nights * finalRoomsCount,
        price: finalNightlyRate,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        location: hotel.location,
        image: targetImage,
        roomName: targetRoom?.name || 'Standard Room',
        bookingType: 'hotel',
        nights: nights,
        rooms: finalRoomsCount,
      },
    });
  };

  useEffect(() => {
    async function loadRealPropertyData() {
      try {
        setLoading(true);
        // Fetch property directly by ID
        const found = await getProperty(hotelId);
        if (found && isActiveProperty(found)) {
          const photos = Array.isArray(found.photos) && found.photos.length > 0
            ? found.photos
            : Array.isArray(found.images) && found.images.length > 0
              ? found.images
              : [];

          // Fetch real rooms from Appwrite rooms collection
          const realRooms = await getRooms(hotelId);
          let minRoomPrice = Infinity;
          let mappedRooms: any[] = [];

          if (realRooms && realRooms.length > 0) {
            mappedRooms = realRooms.map((r: any, idx: number) => {
              const rawPrice = Number(r.price || r.roomPrice || r.basePrice || r.pricePerNight || 0);
              const discPrice = Number(r.discountPrice || 0);
              const effectivePrice = (discPrice > 0 && discPrice < rawPrice)
                ? discPrice
                : (rawPrice > 0 ? rawPrice : discPrice);

              if (effectivePrice > 0 && effectivePrice < minRoomPrice) {
                minRoomPrice = effectivePrice;
              }

              const roomPhotos = Array.isArray(r.photos) && r.photos.length > 0
                ? r.photos
                : Array.isArray(r.images) && r.images.length > 0
                  ? r.images
                  : [];

              const resolvedPhotos: string[] = roomPhotos
                .map((p: any) => getImageUrl(p) || (typeof p === 'string' ? p : ''))
                .filter((p: string) => typeof p === 'string' && p.length > 0);

              const fallbackImg = getImageUrl(photos[0]) || REAL_ROOM_IMAGE;
              const finalPhotos = resolvedPhotos.length > 0 ? resolvedPhotos : [fallbackImg];

              const amenitiesList = Array.isArray(r.amenities) && r.amenities.length > 0
                ? r.amenities
                : Array.isArray(r.inclusions) && r.inclusions.length > 0
                  ? r.inclusions
                  : [];

              return {
                id: String(r.$id || `rm-${idx}`),
                name: String(r.name || r.roomName || r.roomType || 'Standard Room'),
                price: effectivePrice > 0 ? effectivePrice : Number(found.price || 0),
                rawPrice: rawPrice > 0 ? rawPrice : undefined,
                originalPrice: (rawPrice > effectivePrice && effectivePrice > 0) ? rawPrice : undefined,
                discountPrice: discPrice > 0 ? discPrice : undefined,
                standardCapacity: Number(r.standardCapacity || r.occupancy || 2),
                maximumCapacity: Number(r.maximumCapacity || 4),
                extraPersonCharge: Number(r.extraPersonCharge || 0),
                extraBedAvailable: Boolean(r.extraBedAvailable),
                totalRooms: (r.totalRooms !== undefined && r.totalRooms !== null) ? Number(r.totalRooms) : 0,
                size: Number(r.size) || 350,
                beds: typeof r.beds === 'string' ? r.beds.trim() : (typeof r.bedType === 'string' ? r.bedType.trim() : ''),
                description: typeof r.description === 'string' ? r.description.trim() : '',
                amenities: amenitiesList,
                inclusions: amenitiesList,
                photos: finalPhotos,
                images: finalPhotos,
                image: finalPhotos[0],
                capacity: String(r.capacity || r.maxGuests
                  ? `${r.maxGuests || r.occupancy || 2} Guests`
                  : `${r.occupancy || 2} Guests`),
              };
            });
            setRoomsList(mappedRooms);
          } else {
            setRoomsList([]);
          }

          const propertyPrice = (minRoomPrice !== Infinity && minRoomPrice > 0)
            ? minRoomPrice
            : Number(found.price || found.startingPrice || found.minPrice || found.pricePerNight || 0);

          const rawLoc = String(
            found.location ||
            [found.city, found.state].filter(Boolean).join(', ') ||
            'Uttarakhand'
          );
          const parsedLoc = parseLocationGeo(rawLoc);

          setHotel({
            id: String(found.$id),
            title: String(found.propertyName || found.title || 'Verified Stay'),
            location: parsedLoc.cleanLocation || rawLoc,
            rawLocation: rawLoc,
            rating: Number(found.rating || 0),
            reviewsCount: Number(found.reviewsCount || 0),
            price: propertyPrice,
            images: photos.length > 0 ? photos.map((p: any) => getImageUrl(p) || p) : [REAL_STAY_IMAGE],
            description: String(found.description || ''),
            amenities: Array.isArray(found.amenities) && found.amenities.length > 0
              ? found.amenities
              : [],
          });
        }

        const realReviews = await getReviews(hotelId);
        if (realReviews && realReviews.length > 0) {
          const mappedReviews = realReviews.map((r: any, idx: number) => ({
            id: String(r.$id || `rev-${idx}`),
            userName: String(r.userName || 'Guest'),
            date: 'Recent',
            rating: Number(r.rating || 5),
            category: String(r.category || 'Hospitality'),
            text: String(r.text || ''),
          }));
          setReviewsList(mappedReviews);

          const totalRating = mappedReviews.reduce((sum, r) => sum + r.rating, 0);
          const computedAvg = Number((totalRating / mappedReviews.length).toFixed(1));
          setHotel((prev: any) => prev ? {
            ...prev,
            rating: computedAvg,
            reviewsCount: mappedReviews.length,
          } : null);
        } else {
          setReviewsList([]);
          setHotel((prev: any) => prev ? {
            ...prev,
            rating: prev.rating > 0 ? prev.rating : 0,
            reviewsCount: 0,
          } : null);
        }
      } catch (err) {
        console.error('Error fetching realtime property details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRealPropertyData();
  }, [hotelId]);

  useEffect(() => {
    async function loadOccupancy() {
      if (!hotelId) return;
      try {
        const occupied = await getOccupiedRooms(hotelId, checkInDate, checkOutDate);
        setOccupiedRooms(occupied);
      } catch (e) {
        console.warn('Failed to load real-time occupancy:', e);
      }
    }
    loadOccupancy();
  }, [hotelId, checkInDate, checkOutDate]);

  const savedHotelIds = profile?.savedHotels || [];
  const isSaved = hotel ? savedHotelIds.includes(hotel.id) : false;

  const handleShare = async () => {
    if (!hotel) return;
    try {
      await Share.share({
        message: `Check out ${hotel.title} on Racoonn Stays! ${hotel.location}`,
      });
    } catch {
      // Ignore share cancellation
    }
  };

  const handleAddReview = async () => {
    if (!userReviewComment.trim() || !hotel) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: userNameInput.trim() || 'Racoonn Traveler',
      date: 'Just now',
      rating: userRating,
      category: 'Hospitality',
      text: userReviewComment,
    };
    const updatedReviews = [newRev, ...reviewsList];
    setReviewsList(updatedReviews);
    const sumRatings = updatedReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
    const newAvg = Number((sumRatings / updatedReviews.length).toFixed(1));
    setHotel((prev: any) => prev ? { ...prev, rating: newAvg, reviewsCount: updatedReviews.length } : null);
    setUserReviewComment('');
    setIsWriteReviewOpen(false);

    try {
      await createReview({
        propertyId: String(hotel.id),
        vendorId: hotel.vendorId || 'vendor-1',
        userName: newRev.userName,
        rating: userRating,
        text: newRev.text,
        category: 'Hospitality',
      });
    } catch {
      // Offline fallback
    }
  };

  const scrollToSection = (section: 'rooms' | 'amenities' | 'about' | 'location' | 'reviews') => {
    setActiveTab(section);
    const yPos = sectionPositions.current[section];
    if (yPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yPos - 10, animated: true });
    }
  };

  const filteredReviews = reviewFilter === 'All'
    ? reviewsList
    : reviewsList.filter((r) => r.category.toLowerCase().includes(reviewFilter.toLowerCase()));
  const displayedReviews = filteredReviews.slice(0, 3);

  const allAmenities: string[] = Array.isArray(hotel?.amenities) && hotel.amenities.length > 0
    ? hotel.amenities
    : DEFAULT_AMENITIES;
  const visibleAmenities = allAmenities.slice(0, 6);

  if (loading || !hotel) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomNavPadding }]}
      >
        
        {/* Top Header Navigation Overlay */}
        <View style={styles.topNavContainer}>
          <TouchableOpacity style={styles.navCircleBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.brand.navy} size={20} />
          </TouchableOpacity>

          <View style={styles.topRightBtns}>
            <TouchableOpacity style={styles.navCircleBtn} onPress={handleShare}>
              <Share2 color={Colors.brand.navy} size={18} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCircleBtn} onPress={() => toggleSavedHotel(hotel.id)}>
              <Heart
                color={isSaved ? Colors.brand.coral : Colors.brand.navy}
                fill={isSaved ? Colors.brand.coral : 'transparent'}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5-Image Bento Grid / Hero Header */}
        <View style={styles.bentoContainer}>
          <TouchableOpacity
            style={styles.mainBentoImageWrapper}
            activeOpacity={0.9}
            onPress={() => {
              setSelectedPhotoIndex(0);
              setIsPhotoGalleryOpen(true);
            }}
          >
            <Image source={{ uri: hotel.images[0] }} style={styles.bentoImage} />
          </TouchableOpacity>

          <View style={styles.sideBentoGrid}>
            {(hotel.images.slice(1, 3) || []).map((imgUrl: string, idx: number) => (
              <TouchableOpacity
                key={idx}
                style={styles.sideBentoImageWrapper}
                activeOpacity={0.9}
                onPress={() => {
                  setSelectedPhotoIndex(idx + 1);
                  setIsPhotoGalleryOpen(true);
                }}
              >
                <Image source={{ uri: imgUrl }} style={styles.bentoImage} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Show All Photos Grid Button */}
          <TouchableOpacity
            style={styles.showAllPhotosBtn}
            onPress={() => setIsPhotoGalleryOpen(true)}
            activeOpacity={0.85}
          >
            <Grid color={Colors.brand.navy} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.showAllPhotosText}>Show all photos ({hotel.images.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Body */}
        <View style={styles.contentBody}>
          
          {/* Title & Location */}
          <Text style={styles.title}>{hotel.title}</Text>

          <View style={styles.locationRow}>
            <MapPin color={Colors.brand.coral} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>

          {/* Rating Summary */}
          <View style={styles.ratingRow}>
            {hotel.reviewsCount > 0 ? (
              <>
                <View style={styles.ratingBox}>
                  <Star color="#F59E0B" fill="#F59E0B" size={14} />
                  <Text style={styles.ratingScore}>{Number(hotel.rating).toFixed(1)}</Text>
                </View>
                <Text style={styles.reviewsCount}>
                  · {hotel.reviewsCount} {hotel.reviewsCount === 1 ? 'verified review' : 'verified reviews'}
                </Text>
              </>
            ) : (
              <View style={styles.ratingBox}>
                <Star color="#F59E0B" fill="#F59E0B" size={14} />
                <Text style={styles.ratingScore}>New</Text>
                <Text style={styles.reviewsCount}>· No reviews yet</Text>
              </View>
            )}
          </View>

          {/* Check-In / Check-Out & Guests Selection Card */}
          <View style={styles.bookingDatesWidget}>
            <View style={styles.dateSelectorRow}>
              {/* Check-In Date */}
              <TouchableOpacity
                style={styles.dateBox}
                activeOpacity={0.8}
                onPress={() => {
                  setDateSelectionStep('checkin');
                  setIsDatePickerOpen(true);
                }}
              >
                <Calendar color={Colors.brand.coral} size={18} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.dateLabel}>CHECK-IN</Text>
                  <Text style={styles.dateValue}>{checkInDate}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.dateDivider} />

              {/* Check-Out Date */}
              <TouchableOpacity
                style={styles.dateBox}
                activeOpacity={0.8}
                onPress={() => {
                  setDateSelectionStep('checkout');
                  setIsDatePickerOpen(true);
                }}
              >
                <Calendar color={Colors.brand.coral} size={18} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.dateLabel}>CHECK-OUT</Text>
                  <Text style={styles.dateValue}>{checkOutDate}</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Guests & Rooms Dropdown Trigger Row */}
            <TouchableOpacity
              style={styles.guestsWidgetRow}
              activeOpacity={0.85}
              onPress={() => setIsGuestPickerOpen(true)}
            >
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                <Users color={Colors.brand.coral} size={20} style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.guestsWidgetTitle}>Guests & Rooms</Text>
                  <Text style={styles.guestsWidgetSub}>
                    {adultsCount + childrenCount} {adultsCount + childrenCount === 1 ? 'Guest' : 'Guests'} · {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
                  </Text>
                </View>
              </View>

              <View style={styles.guestsDropdownBadge}>
                <Text style={styles.guestsDropdownBadgeText}>
                  {adultsCount + childrenCount} Guests
                </Text>
                <ChevronDown color={Colors.brand.navy} size={16} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sticky Section Nav Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickyTabsRow}>
            <TouchableOpacity
              onPress={() => scrollToSection('rooms')}
              style={[styles.tabChip, activeTab === 'rooms' && styles.tabChipActive]}
            >
              <BedDouble color={activeTab === 'rooms' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'rooms' && styles.tabChipTextActive]}>
                Rooms & Prices
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('amenities')}
              style={[styles.tabChip, activeTab === 'amenities' && styles.tabChipActive]}
            >
              <Coffee color={activeTab === 'amenities' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'amenities' && styles.tabChipTextActive]}>
                Amenities
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('about')}
              style={[styles.tabChip, activeTab === 'about' && styles.tabChipActive]}
            >
              <Info color={activeTab === 'about' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'about' && styles.tabChipTextActive]}>
                About Hotel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('location')}
              style={[styles.tabChip, activeTab === 'location' && styles.tabChipActive]}
            >
              <MapPin color={activeTab === 'location' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'location' && styles.tabChipTextActive]}>
                Location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('reviews')}
              style={[styles.tabChip, activeTab === 'reviews' && styles.tabChipActive]}
            >
              <Star color={activeTab === 'reviews' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'reviews' && styles.tabChipTextActive]}>
                Reviews ({reviewsList.length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.divider} />

          {/* Section 1: Rooms & Prices */}
          <View
            onLayout={(event: any) => {
              sectionPositions.current['rooms'] = event.nativeEvent.layout.y;
            }}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Rooms available</Text>
            <Text style={styles.sectionSubtitle}>Select room suite for instant online confirmation</Text>

            <View style={styles.roomsList}>
              {roomsList.length === 0 ? (
                <View style={styles.noRoomsContainer}>
                  <BedDouble size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Text style={styles.noRoomsTitle}>No rooms currently available</Text>
                  <Text style={styles.noRoomsSubtitle}>
                    All rooms are currently booked or inventory is unavailable.
                  </Text>
                </View>
              ) : (
                roomsList.map((room, index) => {
                  const totalGuests = adultsCount + childrenCount;
                  const stdCap = room.standardCapacity || 2;
                  const maxCap = room.maximumCapacity || 4;
                  const epc = room.extraPersonCharge || 0;
                  const roomNameKey = room.name ? room.name.trim() : '';
                  const roomOccupiedCount = occupiedRooms[roomNameKey] || occupiedRooms[room.id] || 0;
                  const roomTotalRooms = (room.totalRooms !== undefined && room.totalRooms !== null) ? Number(room.totalRooms) : 0;
                  const availableRooms = Math.max(0, roomTotalRooms - roomOccupiedCount);

                  const autoRooms = Math.ceil(totalGuests / maxCap);
                  const requiredRooms = Math.max(roomsCount, autoRooms);
                  const guestsPerRoom = Math.ceil(totalGuests / requiredRooms);

                  const isCapacityExceeded = guestsPerRoom > maxCap;
                  const isNotEnoughRooms = requiredRooms > availableRooms;
                  const isUnavailable = isCapacityExceeded || isNotEnoughRooms;

                  let unavailableReason = '';
                  if (isNotEnoughRooms) {
                    unavailableReason = `Only ${availableRooms} room(s) available`;
                  } else if (isCapacityExceeded) {
                    unavailableReason = 'Exceeds max room capacity';
                  }

                  const safeGuestsPerRoom = isCapacityExceeded ? maxCap : guestsPerRoom;

                  const pricing = calculateRoomPricing({
                    basePrice: room.price,
                    standardCapacity: stdCap,
                    maximumCapacity: maxCap,
                    extraPersonCharge: epc,
                    totalGuests: safeGuestsPerRoom,
                    numberOfNights: 1,
                  });

                  const displayPrice = pricing.roomSubtotal * requiredRooms;

                  return (
                    <View key={room.id} style={styles.roomCard}>
                      {/* Room Image Slider with Lightbox */}
                      <RoomImageSlider
                        images={room.photos}
                        sliderHeight={195}
                      />

                      <View style={styles.roomCardContent}>
                        {/* Room Title */}
                        <Text style={styles.roomName}>{room.name}</Text>

                        {/* Clickable "View room details" button */}
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedRoomForDetails({
                              room,
                              pricing,
                              requiredRooms,
                              availableRooms,
                              isUnavailable,
                              unavailableReason,
                            })
                          }
                          activeOpacity={0.7}
                          style={styles.viewDetailsBtn}
                        >
                          <Text style={styles.viewDetailsBtnText}>View room details</Text>
                        </TouchableOpacity>

                        {/* Quick Stat Inline Row matching web portal (Image 2) */}
                        <View style={styles.roomStatsInlineRow}>
                          <View style={styles.roomStatInlineItem}>
                            <Users size={14} color="#64748B" style={{ marginRight: 5 }} />
                            <Text style={styles.roomStatInlineText}>Up to {maxCap} guests</Text>
                          </View>
                          <Text style={styles.roomStatDivider}>|</Text>
                          <View style={styles.roomStatInlineItem}>
                            <Maximize2 size={14} color="#64748B" style={{ marginRight: 5 }} />
                            <Text style={styles.roomStatInlineText}>Size: {room.size} sq ft</Text>
                          </View>
                        </View>

                        {/* Room Inventory indicator matching web portal (Image 2) */}
                        <View style={styles.roomInventoryRow}>
                          <BedDouble
                            size={16}
                            color={availableRooms > 0 ? '#10B981' : '#EF4444'}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.roomInventoryText,
                              { color: availableRooms > 0 ? '#10B981' : '#EF4444' },
                            ]}
                          >
                            {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} left
                          </Text>
                        </View>

                        {/* Room Pricing Breakdown & Reservation */}
                        <View style={styles.roomFooter}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.roomPriceLabel}>Price per night</Text>
                            {room.originalPrice && room.originalPrice > room.price ? (
                              <Text style={styles.roomOriginalPrice}>
                                ₹{(room.originalPrice * requiredRooms).toLocaleString('en-IN')}
                              </Text>
                            ) : null}
                            <Text style={styles.roomPrice}>₹{displayPrice.toLocaleString('en-IN')}</Text>

                            {requiredRooms > 1 && (
                              <Text style={styles.breakdownSub}>For {requiredRooms} rooms</Text>
                            )}
                            {pricing.extraGuests > 0 && (
                              <Text style={styles.breakdownExtra}>
                                Includes ₹{(pricing.extraGuestAmount * requiredRooms).toLocaleString('en-IN')} extra bed charge
                              </Text>
                            )}
                          </View>

                          <View style={{ alignItems: 'flex-end' }}>
                            <TouchableOpacity
                              style={[
                                styles.reserveBtn,
                                isUnavailable && styles.reserveBtnDisabled,
                              ]}
                              disabled={isUnavailable}
                              onPress={() => startBooking(room, pricing, requiredRooms)}
                              activeOpacity={0.85}
                            >
                              <Text style={styles.reserveBtnText}>
                                {isUnavailable ? 'Unavailable' : 'Reserve Room'}
                              </Text>
                              {!isUnavailable && (
                                <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 4 }} />
                              )}
                            </TouchableOpacity>

                            {isUnavailable && Boolean(unavailableReason) && (
                              <Text style={styles.soldOutReason}>{unavailableReason}</Text>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 2: Amenities */}
          <View
            onLayout={(event: any) => {
              sectionPositions.current['amenities'] = event.nativeEvent.layout.y;
            }}
            style={styles.sectionBox}
          >
            <View style={styles.amenitiesHeaderRow}>
              <Text style={styles.sectionTitle}>Amenities & Facilities</Text>
              {allAmenities.length > 6 && (
                <View style={styles.amenitiesCountBadge}>
                  <Text style={styles.amenitiesCountBadgeText}>{allAmenities.length} total</Text>
                </View>
              )}
            </View>

            <View style={styles.amenitiesGrid}>
              {visibleAmenities.map((item: string, index: number) => (
                <View key={index} style={styles.amenityCard}>
                  <View style={styles.amenityIconContainer}>
                    {getAmenityIcon(item, 18, Colors.brand.coral)}
                  </View>
                  <Text style={styles.amenityText} numberOfLines={2}>
                    {formatAmenityName(item)}
                  </Text>
                </View>
              ))}
            </View>

            {allAmenities.length > 6 && (
              <TouchableOpacity
                style={styles.viewAllAmenitiesBtn}
                onPress={() => setIsAllAmenitiesModalOpen(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.viewAllAmenitiesBtnText}>
                  View all {allAmenities.length} amenities
                </Text>
                <ChevronRight color={Colors.brand.navy} size={16} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divider} />

          {/* Section 3: About Hotel */}
          <View
            onLayout={(event: any) => {
              sectionPositions.current['about'] = event.nativeEvent.layout.y;
            }}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>About {hotel.title}</Text>
            <Text style={styles.descriptionText}>{hotel.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Section 4: Location */}
          <View
            onLayout={(event: any) => {
              sectionPositions.current['location'] = event.nativeEvent.layout.y;
            }}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.descriptionText}>{hotel.location}</Text>
            
            {/* Interactive Draggable & Zoomable Mapbox GL Map */}
            <View style={styles.mapCard}>
              <WebView
                originWhitelist={['*']}
                source={{
                  html: getMapboxHtml(hotel.title, hotel.rawLocation || hotel.location),
                  baseUrl: 'https://api.mapbox.com',
                }}
                style={{ flex: 1, borderRadius: 20 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={true}
                mixedContentMode="always"
                allowsInlineMediaPlayback={true}
                androidHardwareAccelerationDisabled={false}
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 5: Reviews */}
          <View
            onLayout={(event: any) => {
              sectionPositions.current['reviews'] = event.nativeEvent.layout.y;
            }}
            style={styles.sectionBox}
          >
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>Guest Ratings & Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setIsWriteReviewOpen(true)}
                activeOpacity={0.85}
              >
                <MessageCircle color="#FFFFFF" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewFilterScroll}>
              {REVIEW_FILTERS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setReviewFilter(cat)}
                  style={[styles.revChip, reviewFilter === cat && styles.revChipActive]}
                >
                  <Text style={[styles.revChipText, reviewFilter === cat && styles.revChipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.reviewsListContainer}>
              {filteredReviews.length === 0 ? (
                <View style={styles.noReviewsBox}>
                  <MessageCircle size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Text style={styles.noReviewsTitle}>No reviews yet</Text>
                  <Text style={styles.noReviewsSub}>Be the first to share your experience with other guests!</Text>
                </View>
              ) : (
                displayedReviews.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{rev.userName.slice(0, 1).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.reviewUserName}>{rev.userName}</Text>
                        <Text style={styles.reviewDate}>{rev.date}</Text>
                      </View>
                      <View style={styles.reviewStarBadge}>
                        <Star color="#F59E0B" fill="#F59E0B" size={12} />
                        <Text style={styles.reviewStarText}>{rev.rating}.0</Text>
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{rev.text}</Text>
                  </View>
                ))
              )}

              {/* View All Reviews Button */}
              {filteredReviews.length > 3 && (
                <TouchableOpacity
                  style={styles.viewAllReviewsBtn}
                  onPress={() => setIsAllReviewsModalOpen(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewAllReviewsBtnText}>
                    View all {filteredReviews.length} Reviews
                  </Text>
                  <ChevronRight color={Colors.brand.navy} size={16} />
                </TouchableOpacity>
              )}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      {!isWriteReviewOpen && !isDatePickerOpen && !isGuestPickerOpen && !selectedRoomForDetails && !isRoomSelectionModalOpen && (
        <View style={[styles.bottomBar, { paddingBottom: bottomNavPadding }]}>
          <View>
            <Text style={styles.bottomPriceLabel}>Starting from</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>₹{Number(hotel.price).toLocaleString('en-IN')}</Text>
              <Text style={styles.bottomPerNight}>/ night</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.bookNowBtn,
              isHotelUnavailable && styles.bookNowBtnDisabled,
            ]}
            disabled={isHotelUnavailable}
            onPress={() => {
              if (isHotelUnavailable) return;
              setIsRoomSelectionModalOpen(true);
            }}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.bookNowText,
                isHotelUnavailable && styles.bookNowTextDisabled,
              ]}
            >
              {isHotelUnavailable ? 'Unavailable' : 'Book Now'}
            </Text>
            {!isHotelUnavailable && (
              <ArrowRight color="#FFFFFF" size={16} style={{ marginLeft: 6 }} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Full Screen Photo Gallery Modal */}
      <Modal
        visible={isPhotoGalleryOpen}
        animationType="slide"
        onRequestClose={() => setIsPhotoGalleryOpen(false)}
      >
        <SafeAreaView style={styles.galleryModalContainer}>
          <View style={styles.galleryModalHeader}>
            <Text style={styles.galleryModalTitle}>Property Photos ({hotel.images.length})</Text>
            <TouchableOpacity onPress={() => setIsPhotoGalleryOpen(false)} style={styles.closeBtn}>
              <X color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.galleryScroll}>
            {hotel.images.map((imgUrl: string, index: number) => (
              <View key={index} style={styles.fullPhotoWrapper}>
                <Image source={{ uri: imgUrl }} style={styles.fullPhoto} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Write Review Slide-Up Bottom Sheet Window */}
      <Modal
        visible={isWriteReviewOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWriteReviewOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsWriteReviewOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.writeModalCard, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
                {/* Top Drag/Sheet Handle Bar */}
                <View style={styles.sheetHandleBar} />

                {/* Header Row */}
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>Write Guest Review</Text>
                    <Text style={styles.modalSubTitle}>Share your experience with future guests</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtnCircle}
                    onPress={() => setIsWriteReviewOpen(false)}
                  >
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                {/* Star Rating Selector */}
                <Text style={styles.ratingLabel}>Your Overall Rating</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      activeOpacity={0.8}
                      onPress={() => setUserRating(star)}
                    >
                      <Star
                        color="#F59E0B"
                        fill={star <= userRating ? '#F59E0B' : 'transparent'}
                        size={32}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Your Name */}
                <Text style={styles.inputLabel}>Your Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                  value={userNameInput}
                  onChangeText={setUserNameInput}
                />

                {/* Review Feedback */}
                <Text style={styles.inputLabel}>Review Feedback</Text>
                <TextInput
                  style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Describe your experience with the room, view, and hospitality..."
                  placeholderTextColor="#94A3B8"
                  value={userReviewComment}
                  onChangeText={setUserReviewComment}
                />

                {/* Submit Action Button */}
                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  activeOpacity={0.88}
                  onPress={handleAddReview}
                >
                  <Text style={styles.submitReviewText}>Submit Verified Review</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom Calendar Bottom Sheet Modal */}
      <CustomCalendarModal
        key={`cal_${checkInDate}_${checkOutDate}_${dateSelectionStep}_${isDatePickerOpen}`}
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        initialStep={dateSelectionStep}
        onSelectDates={(newIn, newOut) => {
          setCheckInDate(newIn);
          setCheckOutDate(newOut);
          usePropertyFilterStore.getState().setFilters({
            checkIn: newIn,
            checkOut: newOut,
          });
        }}
      />

      {/* Guests & Rooms Slide-Up Dropdown Sheet Window */}
      <Modal
        visible={isGuestPickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsGuestPickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsGuestPickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.writeModalCard, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
                {/* Top Drag Handle Bar */}
                <View style={styles.sheetHandleBar} />

                {/* Header Row */}
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>Guests & Rooms</Text>
                    <Text style={styles.modalSubTitle}>Select total guests and room count</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtnCircle}
                    onPress={() => setIsGuestPickerOpen(false)}
                  >
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                {/* Detailed Guest Rows matching Image 2 */}
                <View style={styles.guestRowsContainer}>
                  {/* Adults */}
                  <View style={styles.guestPickerRow}>
                    <View>
                      <Text style={styles.guestPickerTitle}>Adults</Text>
                      <Text style={styles.guestPickerSub}>Ages 13 or above</Text>
                    </View>
                    <View style={styles.pickerCounterGroup}>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                      >
                        <Minus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.pickerCounterValue}>{adultsCount}</Text>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setAdultsCount(adultsCount + 1)}
                      >
                        <Plus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Children */}
                  <View style={styles.guestPickerRow}>
                    <View>
                      <Text style={styles.guestPickerTitle}>Children</Text>
                      <Text style={styles.guestPickerSub}>Ages 2–12</Text>
                    </View>
                    <View style={styles.pickerCounterGroup}>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                      >
                        <Minus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.pickerCounterValue}>{childrenCount}</Text>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setChildrenCount(childrenCount + 1)}
                      >
                        <Plus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Infants */}
                  <View style={styles.guestPickerRow}>
                    <View>
                      <Text style={styles.guestPickerTitle}>Infants</Text>
                      <Text style={styles.guestPickerSub}>Under 2</Text>
                    </View>
                    <View style={styles.pickerCounterGroup}>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setInfantsCount(Math.max(0, infantsCount - 1))}
                      >
                        <Minus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.pickerCounterValue}>{infantsCount}</Text>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setInfantsCount(infantsCount + 1)}
                      >
                        <Plus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Pets */}
                  <View style={styles.guestPickerRow}>
                    <View>
                      <Text style={styles.guestPickerTitle}>Pets</Text>
                      <Text style={styles.guestPickerSubLink}>Bringing a service animal?</Text>
                    </View>
                    <View style={styles.pickerCounterGroup}>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setPetsCount(Math.max(0, petsCount - 1))}
                      >
                        <Minus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.pickerCounterValue}>{petsCount}</Text>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setPetsCount(petsCount + 1)}
                      >
                        <Plus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.sheetDivider} />

                  {/* Rooms */}
                  <View style={styles.guestPickerRow}>
                    <View>
                      <Text style={styles.guestPickerTitle}>Rooms</Text>
                      <Text style={styles.guestPickerSub}>Max 4 guests per room</Text>
                    </View>
                    <View style={styles.pickerCounterGroup}>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                      >
                        <Minus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                      <Text style={styles.pickerCounterValue}>{roomsCount}</Text>
                      <TouchableOpacity
                        style={styles.pickerCounterBtn}
                        onPress={() => setRoomsCount(roomsCount + 1)}
                      >
                        <Plus color={Colors.brand.navy} size={14} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    usePropertyFilterStore.getState().setFilters({
                      adults: adultsCount,
                      children: childrenCount,
                      infants: infantsCount,
                      pets: petsCount,
                      rooms: roomsCount,
                    });
                    setIsGuestPickerOpen(false);
                  }}
                >
                  <Text style={styles.submitReviewText}>Apply Guests & Rooms</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <AuthBottomSheet
        visible={isAuthSheetVisible}
        onClose={() => setIsAuthSheetVisible(false)}
      />

      {/* Room Details Bottom Sheet Modal */}
      <RoomDetailsModal
        visible={!!selectedRoomForDetails}
        onClose={() => setSelectedRoomForDetails(null)}
        room={selectedRoomForDetails?.room}
        pricing={selectedRoomForDetails?.pricing}
        requiredRooms={selectedRoomForDetails?.requiredRooms}
        availableRooms={selectedRoomForDetails?.availableRooms}
        propertyAmenities={hotel?.amenities}
        isUnavailable={selectedRoomForDetails?.isUnavailable}
        unavailableReason={selectedRoomForDetails?.unavailableReason}
        onReserve={(rm) => {
          setSelectedRoomForDetails(null);
          startBooking(rm, selectedRoomForDetails?.pricing, selectedRoomForDetails?.requiredRooms);
        }}
      />

      {/* Quick Room Selection Modal ("Book Now") */}
      <RoomSelectionModal
        visible={isRoomSelectionModalOpen}
        onClose={() => setIsRoomSelectionModalOpen(false)}
        rooms={enrichedRooms}
        hotelTitle={hotel?.title || 'Hotel Stay'}
        totalGuests={adultsCount + childrenCount}
        selectedRoomsCount={roomsCount}
        onSelectRoom={(rm) => {
          setIsRoomSelectionModalOpen(false);
          startBooking(rm);
        }}
      />

      {/* Full Modal Window for All Amenities */}
      <Modal
        visible={isAllAmenitiesModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAllAmenitiesModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop to close modal when tapping outside */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsAllAmenitiesModalOpen(false)}
          />

          <View
            style={[
              styles.allAmenitiesModalCard,
              {
                height: SCREEN_HEIGHT * 0.78,
                maxHeight: SCREEN_HEIGHT * 0.88,
              },
            ]}
          >
            {/* Top Drag Indicator */}
            <View style={styles.sheetHandleBar} />

            {/* Modal Header */}
            <View style={styles.allAmenitiesModalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.allAmenitiesModalTitle}>All Amenities & Facilities</Text>
                <Text style={styles.allAmenitiesModalSub}>
                  {allAmenities.length} features available at {hotel?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtnCircle}
                onPress={() => setIsAllAmenitiesModalOpen(false)}
                activeOpacity={0.8}
              >
                <X color={Colors.brand.navy} size={18} />
              </TouchableOpacity>
            </View>

            {/* All Amenities Scrollable List */}
            <ScrollView
              style={{ flex: 1 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={[styles.allAmenitiesListContent, { paddingBottom: 28 }]}
            >
              <View style={styles.allAmenitiesGrid}>
                {allAmenities.map((item: string, index: number) => (
                  <View key={index} style={styles.allAmenitiesRowCard}>
                    <View style={styles.amenityIconContainer}>
                      {getAmenityIcon(item, 20, Colors.brand.coral)}
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.allAmenityName}>{formatAmenityName(item)}</Text>
                      <Text style={styles.allAmenityStatus}>Included with your stay</Text>
                    </View>
                    <CheckCircle2 color="#10B981" size={18} />
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Bottom Close Button */}
            <View style={[styles.allAmenitiesModalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.allAmenitiesCloseBtn}
                onPress={() => setIsAllAmenitiesModalOpen(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.allAmenitiesCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full Modal Window for All Reviews */}
      <Modal
        visible={isAllReviewsModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsAllReviewsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop to close modal when tapping outside */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setIsAllReviewsModalOpen(false)}
          />

          <View
            style={[
              styles.allAmenitiesModalCard,
              {
                height: SCREEN_HEIGHT * 0.78,
                maxHeight: SCREEN_HEIGHT * 0.88,
              },
            ]}
          >
            {/* Top Drag Indicator */}
            <View style={styles.sheetHandleBar} />

            {/* Modal Header */}
            <View style={styles.allAmenitiesModalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.allAmenitiesModalTitle}>All Guest Reviews</Text>
                <Text style={styles.allAmenitiesModalSub}>
                  {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'} for {hotel?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtnCircle}
                onPress={() => setIsAllReviewsModalOpen(false)}
                activeOpacity={0.8}
              >
                <X color={Colors.brand.navy} size={18} />
              </TouchableOpacity>
            </View>

            {/* In-Modal Filter Pills */}
            <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {REVIEW_FILTERS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setReviewFilter(cat)}
                    style={[styles.revChip, reviewFilter === cat && styles.revChipActive]}
                  >
                    <Text style={[styles.revChipText, reviewFilter === cat && styles.revChipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* All Reviews Scrollable List */}
            <ScrollView
              style={{ flex: 1 }}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              bounces={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingVertical: 14, paddingBottom: 28 }}
            >
              <View style={{ gap: 12 }}>
                {filteredReviews.length === 0 ? (
                  <View style={styles.noReviewsBox}>
                    <MessageCircle size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <Text style={styles.noReviewsTitle}>No reviews in this category</Text>
                    <Text style={styles.noReviewsSub}>Try selecting a different filter above.</Text>
                  </View>
                ) : (
                  filteredReviews.map((rev) => (
                    <View key={rev.id} style={styles.reviewCard}>
                      <View style={styles.reviewCardHeader}>
                        <View style={styles.reviewAvatar}>
                          <Text style={styles.reviewAvatarText}>{rev.userName.slice(0, 1).toUpperCase()}</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.reviewUserName}>{rev.userName}</Text>
                          <Text style={styles.reviewDate}>{rev.date}</Text>
                        </View>
                        <View style={styles.reviewStarBadge}>
                          <Star color="#F59E0B" fill="#F59E0B" size={12} />
                          <Text style={styles.reviewStarText}>{rev.rating}.0</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewText}>{rev.text}</Text>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>

            {/* Bottom Close Button */}
            <View style={[styles.allAmenitiesModalFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                style={styles.allAmenitiesCloseBtn}
                onPress={() => setIsAllReviewsModalOpen(false)}
                activeOpacity={0.88}
              >
                <Text style={styles.allAmenitiesCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  topNavContainer: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topRightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBookNowBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  headerBookNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerBookNowBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerBookNowTextDisabled: {
    color: '#FFFFFF',
  },
  navCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
  },
  bentoContainer: {
    flexDirection: 'row',
    height: 280,
    gap: 4,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  mainBentoImageWrapper: {
    flex: 1,
    height: '100%',
  },
  sideBentoGrid: {
    width: 120,
    gap: 4,
  },
  sideBentoImageWrapper: {
    flex: 1,
  },
  bentoImage: {
    width: '100%',
    height: '100%',
  },
  showAllPhotosBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  showAllPhotosText: {
    color: Colors.brand.navy,
    fontSize: 12,
    fontWeight: '800',
  },
  contentBody: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    gap: 4,
  },
  ratingScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewsCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  bookingDatesWidget: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 10,
  },
  dateLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginTop: 1,
  },
  guestsWidgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  guestsWidgetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  guestsWidgetSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  guestsDropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  guestsDropdownBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  dateStepTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 14,
  },
  dateStepTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateStepTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dateStepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dateStepTabTextActive: {
    color: Colors.brand.coral,
    fontWeight: '900',
  },
  datePillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  datePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  datePillActive: {
    backgroundColor: Colors.brand.sand,
    borderColor: Colors.brand.coral,
  },
  datePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  datePillTextActive: {
    color: Colors.brand.coral,
    fontWeight: '900',
  },
  guestRowsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  guestPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestPickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  guestPickerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  guestPickerSubLink: {
    fontSize: 12,
    color: Colors.brand.coral,
    fontWeight: '600',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  pickerCounterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pickerCounterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  pickerCounterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
    minWidth: 20,
    textAlign: 'center',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  widgetCounterBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 10,
  },
  widgetCounterBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  widgetCounterText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  stickyTabsRow: {
    gap: 8,
    marginVertical: 12,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  tabChipActive: {
    backgroundColor: Colors.brand.sand,
    borderWidth: 1,
    borderColor: Colors.brand.coral,
  },
  tabChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabChipTextActive: {
    color: Colors.brand.coral,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  sectionBox: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  roomsList: {
    gap: 14,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  roomImageContainer: {
    height: 150,
    width: '100%',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  roomBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  roomCardContent: {
    padding: 14,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.3,
  },
  viewDetailsBtn: {
    marginTop: 4,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  viewDetailsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.navy,
    textDecorationLine: 'underline',
  },
  roomStatsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  roomStatInlineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomStatInlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  roomStatDivider: {
    fontSize: 13,
    fontWeight: '400',
    color: '#CBD5E1',
    marginHorizontal: 2,
  },
  roomStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  roomStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomStatChipLow: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  roomStatText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  roomInventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 10,
  },
  roomInventoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  roomCapacity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  inclusionsList: {
    gap: 5,
    marginBottom: 12,
  },
  inclusionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inclusionText: {
    fontSize: 12,
    color: Colors.brand.navy,
    fontWeight: '600',
    flex: 1,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  roomPriceLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  roomOriginalPrice: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  breakdownSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginTop: 1,
  },
  breakdownExtra: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.brand.coral,
    marginTop: 1,
  },
  gstBreakdownText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  reserveBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reserveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  soldOutReason: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 4,
    textAlign: 'right',
    maxWidth: 130,
  },
  amenitiesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  amenitiesCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  amenitiesCountBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 10,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  amenityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  amenityText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginLeft: 10,
    flex: 1,
  },
  viewAllAmenitiesBtn: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllAmenitiesBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginRight: 6,
  },
  viewAllReviewsBtn: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllReviewsBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginRight: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hostTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  hostSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  mapCard: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  mapBgImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlayDark: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.40)',
    padding: 12,
    justifyContent: 'space-between',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapInteractivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  mapInteractiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  openInMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  openInMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '900',
  },
  mapCenterPinWrapper: {
    alignItems: 'center',
    alignSelf: 'center',
  },
  mapPinPulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(232, 106, 112, 0.3)',
    top: -8,
  },
  mapPinContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  hotelPinTooltip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelPinTooltipTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.brand.navy,
    maxWidth: 160,
  },
  hotelPinTooltipSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
  },
  nearbyRowBar: {
    flexDirection: 'row',
    gap: 8,
  },
  landmarkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  landmarkChipText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  writeReviewBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  writeReviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  reviewFilterScroll: {
    gap: 8,
    marginBottom: 14,
  },
  revChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  revChipActive: {
    backgroundColor: Colors.brand.navy,
  },
  revChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  revChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reviewsListContainer: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  reviewDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reviewStarBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  reviewStarText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  reviewText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  bottomPriceLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  bottomPerNight: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 2,
  },
  bookNowBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
  },
  bookNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  bookNowBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  bookNowTextDisabled: {
    color: '#FFFFFF',
  },
  noRoomsContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  noRoomsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
  },
  noRoomsSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  galleryModalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  galleryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  galleryModalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  galleryScroll: {
    padding: 20,
    gap: 16,
  },
  fullPhotoWrapper: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullPhoto: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  writeModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandleBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  modalSubTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtnCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginBottom: 8,
  },
  starRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.brand.navy,
    marginBottom: 16,
  },
  submitReviewBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitReviewText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  noReviewsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  noReviewsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginBottom: 4,
  },
  noReviewsSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  allAmenitiesModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
    display: 'flex',
  },
  allAmenitiesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  allAmenitiesModalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  allAmenitiesModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  allAmenitiesListContent: {
    paddingVertical: 16,
  },
  allAmenitiesGrid: {
    gap: 10,
  },
  allAmenitiesRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  allAmenityName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  allAmenityStatus: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  allAmenitiesModalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  allAmenitiesCloseBtn: {
    backgroundColor: Colors.brand.navy,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allAmenitiesCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
