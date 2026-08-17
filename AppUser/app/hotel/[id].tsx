import React, { useEffect, useState, useRef } from 'react';
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
  ImageBackground,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Star,
  Heart,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BedDouble,
  Coffee,
  Sparkles,
  Info,
  ArrowLeft,
  Share2,
  Grid,
  X,
  MessageCircle,
  Calendar,
  Users,
  Plus,
  Navigation,
  Minus,
  ChevronDown,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import AuthBottomSheet from '../../components/shared/AuthBottomSheet';
import { calculateHotelGST } from '../../utils/gst';
import { getProperty, getRooms, getReviews, createReview, getImageUrl } from '../../lib/appwrite/api';
import { isActiveProperty } from '../../utils/isActiveProperty';

import { WebView } from 'react-native-webview';

const MAPBOX_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

function getCoordinates(locationStr: string): [number, number] {
  const locLower = (locationStr || '').toLowerCase();
  if (locLower.includes('nainital')) return [79.454, 29.3803];
  if (locLower.includes('mussoorie')) return [78.0754, 30.4598];
  if (locLower.includes('rishikesh')) return [78.2676, 30.0869];
  if (locLower.includes('haridwar')) return [78.1642, 29.9457];
  if (locLower.includes('auli')) return [79.5701, 30.5288];
  return [78.0322, 30.3165]; // Dehradun default
}

function getMapboxHtml(title: string, locationStr: string): string {
  const [lng, lat] = getCoordinates(locationStr);
  const cleanTitle = (title || 'Luxury Hotel').replace(/'/g, "\\'");
  const cleanLoc = (locationStr || 'Uttarakhand').replace(/'/g, "\\'");

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
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3.5px solid #FFFFFF;
      box-shadow: 0 4px 14px rgba(0,0,0,0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-marker::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #FFFFFF;
      border-radius: 50%;
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
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [${lng}, ${lat}],
      zoom: 14,
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

    new mapboxgl.Marker(el)
      .setLngLat([${lng}, ${lat}])
      .setPopup(popup)
      .addTo(map);
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

const INITIAL_REVIEWS = [
  {
    id: 'rev-1',
    userName: 'Aarav Sharma',
    date: 'July 2026',
    rating: 5,
    category: 'View & Hospitality',
    text: 'Spectacular stay! The mountain views from the balcony were breathtaking and the staff made us feel like royalty throughout our stay.',
  },
  {
    id: 'rev-2',
    userName: 'Priya Malhotra',
    date: 'June 2026',
    rating: 5,
    category: 'Cleanliness & Food',
    text: 'Super clean rooms, incredible buffet breakfast, and crystal clear swimming pool. 100% recommended for family vacations in Uttarakhand!',
  },
];

const REVIEW_FILTERS = ['All', 'View', 'Hospitality', 'Cleanliness', 'Amenities', 'Food'];

export default function PropertyDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user, profile, isAuthenticated, toggleSavedHotel } = useAuthStore();
  
  const [isAuthSheetVisible, setIsAuthSheetVisible] = useState(false);
  const hotelId = (id as string) || 'stay-1';

  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rooms' | 'amenities' | 'about' | 'location' | 'reviews'>('rooms');
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [, setSelectedPhotoIndex] = useState(0);

  // Booking Dates & Guests Detailed State
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [petsCount, setPetsCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<string>('06 Aug, 2026');
  const [checkOutDate, setCheckOutDate] = useState<string>('07 Aug, 2026');

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

  // Scroll View Ref & Section Positions
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});

  const startBooking = (room?: any) => {
    if (!isAuthenticated) {
      setIsAuthSheetVisible(true);
      return;
    }

    if (!hotel) return;
    const nightlyRate = room?.price || Number(hotel.price) || 3500;
    const checkInDay = Number(checkInDate.split(' ')[0]) || 1;
    const checkOutDay = Number(checkOutDate.split(' ')[0]) || checkInDay + 1;
    const nights = Math.max(1, checkOutDay - checkInDay);

    router.push({
      pathname: `/checkout/${hotel.id}` as any,
      params: {
        id: hotel.id,
        packageTitle: hotel.title,
        guests: adultsCount + childrenCount,
        totalPrice: nightlyRate * nights * roomsCount,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        location: hotel.location,
        image: hotel.images?.[0] || '',
        roomName: room?.name || 'Standard Room',
        bookingType: 'hotel',
        nights: nights,
        rooms: roomsCount,
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

          const propertyPrice = Number(found.price || found.pricePerNight || found.startingPrice || 3500);

          setHotel({
            id: String(found.$id),
            title: String(found.propertyName || found.title || 'Verified Stay'),
            location: String(
              found.location ||
              [found.city, found.state].filter(Boolean).join(', ') ||
              'Uttarakhand'
            ),
            rating: Number(found.rating || 4.8),
            reviewsCount: Number(found.reviewsCount || 0),
            price: propertyPrice,
            images: photos.length > 0 ? photos.map((p: any) => getImageUrl(p) || p) : ['https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80'],
            description: String(found.description || 'Experience luxury like never before with verified stays.'),
            amenities: Array.isArray(found.amenities) && found.amenities.length > 0
              ? found.amenities
              : ['Free High-Speed Wi-Fi', 'Swimming Pool', 'Complimentary Breakfast', 'Free Parking', 'Air Conditioning'],
          });

          // Fetch real rooms from Appwrite rooms collection
          const realRooms = await getRooms(hotelId);
          if (realRooms && realRooms.length > 0) {
            const mappedRooms = realRooms.map((r: any, idx: number) => {
              const roomPhotos = Array.isArray(r.photos) && r.photos.length > 0
                ? r.photos
                : Array.isArray(r.images) && r.images.length > 0
                  ? r.images
                  : [];
              return {
                id: String(r.$id || `rm-${idx}`),
                name: String(r.name || r.roomName || r.roomType || 'Standard Room'),
                price: Number(r.price || r.pricePerNight || propertyPrice),
                capacity: String(r.capacity || r.maxGuests
                  ? `${r.maxGuests || 2} Guests · ${r.bedType || '1 Bed'}`
                  : '2 Adults · 1 Bed'),
                image: getImageUrl(roomPhotos[0] || photos[0]) || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop',
                inclusions: Array.isArray(r.inclusions) && r.inclusions.length > 0
                  ? r.inclusions
                  : Array.isArray(r.amenities) && r.amenities.length > 0
                    ? r.amenities
                    : ['Free Breakfast Included', 'Free High-Speed Wi-Fi', 'Free Cancellation up to 24h'],
              };
            });
            setRoomsList(mappedRooms);
          } else {
            // No rooms in Appwrite — show one card with property price
            setRoomsList([{
              id: 'rm-default',
              name: 'Standard Room',
              price: propertyPrice,
              capacity: '2 Adults · 1 Bed',
              image: getImageUrl(photos[0]) || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop',
              inclusions: ['Free Breakfast Included', 'Free High-Speed Wi-Fi', 'Free Cancellation up to 24h'],
            }]);
          }
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
        } else {
          setReviewsList([]);
        }
      } catch (err) {
        console.error('Error fetching realtime property details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRealPropertyData();
  }, [hotelId]);

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
    setReviewsList([newRev, ...reviewsList]);
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
        contentContainerStyle={styles.scrollContent}
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
            <View style={styles.ratingBox}>
              <Star color="#F59E0B" fill="#F59E0B" size={14} />
              <Text style={styles.ratingScore}>{hotel.rating}</Text>
            </View>
            <Text style={styles.reviewsCount}>· {hotel.reviewsCount} verified guest reviews</Text>
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
              {roomsList.map((room) => (
                <View key={room.id} style={styles.roomCard}>
                  {/* Room Cover Photo */}
                  <View style={styles.roomImageContainer}>
                    <Image
                      source={{ uri: room.image || hotel.images[0] }}
                      style={styles.roomImage}
                      resizeMode="cover"
                    />
                    <View style={styles.roomBadge}>
                      <Text style={styles.roomBadgeText}>Instant Confirmation</Text>
                    </View>
                  </View>

                  <View style={styles.roomCardContent}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomCapacity}>{room.capacity}</Text>

                    <View style={styles.inclusionsList}>
                      {room.inclusions.map((inc, i) => (
                        <View key={i} style={styles.inclusionItem}>
                          <CheckCircle2 color={Colors.brand.coral} size={13} style={{ marginRight: 6 }} />
                          <Text style={styles.inclusionText}>{inc}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.roomFooter}>
                      <View>
                        <Text style={styles.roomPriceLabel}>Price per night</Text>
                        <Text style={styles.roomPrice}>₹{room.price.toLocaleString('en-IN')}</Text>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.brand.coral, marginTop: 2 }}>
                          + GST ({calculateHotelGST(room.price).gstPercentage}%) [{calculateHotelGST(room.price).gstType}]
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.reserveBtn}
                        onPress={() => startBooking(room)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.reserveBtnText}>Reserve Room</Text>
                        <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
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
            <Text style={styles.sectionTitle}>Amenities & Facilities</Text>
            <View style={styles.amenitiesGrid}>
              {(Array.isArray(hotel?.amenities) ? hotel.amenities : DEFAULT_AMENITIES).map((item: string, index: number) => (
                <View key={index} style={styles.amenityChip}>
                  <CheckCircle2 color={Colors.brand.coral} size={14} style={{ marginRight: 8 }} />
                  <Text style={styles.amenityText}>{item}</Text>
                </View>
              ))}
            </View>
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

            <View style={styles.hostCard}>
              <ShieldCheck color={Colors.brand.coral} size={28} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.hostTitle}>100% Verified Racoonn Partner Stay</Text>
                <Text style={styles.hostSub}>Inspected for hygiene, safety, and luxury standards.</Text>
              </View>
            </View>
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
                source={{ html: getMapboxHtml(hotel.title, hotel.location) }}
                style={{ flex: 1, borderRadius: 20 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={true}
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
              {filteredReviews.map((rev) => (
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
              ))}
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      {!isWriteReviewOpen && !isDatePickerOpen && !isGuestPickerOpen && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomPriceLabel}>Starting from</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>₹{Number(hotel.price).toLocaleString('en-IN')}</Text>
              <Text style={styles.bottomPerNight}>/ night</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={() => startBooking()}
            activeOpacity={0.9}
          >
            <Text style={styles.bookNowText}>Book Now</Text>
            <ArrowRight color="#FFFFFF" size={16} style={{ marginLeft: 6 }} />
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

      {/* Date Selection Slide-Up Bottom Sheet Window */}
      <Modal
        visible={isDatePickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDatePickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDatePickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.writeModalCard, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
                {/* Top Drag Handle Bar */}
                <View style={styles.sheetHandleBar} />

                {/* Header Row */}
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>
                      {dateSelectionStep === 'checkin' ? 'Select Check-In Date' : 'Select Check-Out Date'}
                    </Text>
                    <Text style={styles.modalSubTitle}>
                      {dateSelectionStep === 'checkin'
                        ? 'Tap a date to set Check-In'
                        : `Check-in set to ${checkInDate}. Now choose Check-Out date.`}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtnCircle}
                    onPress={() => setIsDatePickerOpen(false)}
                  >
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                {/* Step Switcher Tabs */}
                <View style={styles.dateStepTabRow}>
                  <TouchableOpacity
                    style={[styles.dateStepTab, dateSelectionStep === 'checkin' && styles.dateStepTabActive]}
                    onPress={() => setDateSelectionStep('checkin')}
                  >
                    <Text style={[styles.dateStepTabText, dateSelectionStep === 'checkin' && styles.dateStepTabTextActive]}>
                      1. CHECK-IN ({checkInDate})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.dateStepTab, dateSelectionStep === 'checkout' && styles.dateStepTabActive]}
                    onPress={() => setDateSelectionStep('checkout')}
                  >
                    <Text style={[styles.dateStepTabText, dateSelectionStep === 'checkout' && styles.dateStepTabTextActive]}>
                      2. CHECK-OUT ({checkOutDate})
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Date Grid Selector */}
                <Text style={styles.inputLabel}>August 2026</Text>
                <View style={styles.datePillsGrid}>
                  {['06 Aug, 2026', '07 Aug, 2026', '08 Aug, 2026', '09 Aug, 2026', '10 Aug, 2026', '11 Aug, 2026', '12 Aug, 2026', '13 Aug, 2026', '14 Aug, 2026', '15 Aug, 2026'].map((dt) => {
                    const checkInDayNum = parseInt(checkInDate.split(' ')[0], 10) || 6;
                    const thisDayNum = parseInt(dt.split(' ')[0], 10) || 6;
                    const isDisabled = dateSelectionStep === 'checkout' && thisDayNum <= checkInDayNum;
                    const isSelected = dateSelectionStep === 'checkin' ? checkInDate === dt : checkOutDate === dt;
                    return (
                      <TouchableOpacity
                        key={dt}
                        disabled={isDisabled}
                        style={[
                          styles.datePill,
                          isDisabled && { opacity: 0.35, backgroundColor: '#F1F5F9' },
                          isSelected && styles.datePillActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          if (dateSelectionStep === 'checkin') {
                            setCheckInDate(dt);
                            // Auto open checkout step after checkin selection!
                            setDateSelectionStep('checkout');
                          } else {
                            setCheckOutDate(dt);
                            // Auto close modal on checkout selection!
                            setIsDatePickerOpen(false);
                          }
                        }}
                      >
                        <Text style={[styles.datePillText, isDisabled && { color: '#94A3B8' }, isSelected && styles.datePillTextActive]}>{dt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.submitReviewBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    if (dateSelectionStep === 'checkin') {
                      setDateSelectionStep('checkout');
                    } else {
                      setIsDatePickerOpen(false);
                    }
                  }}
                >
                  <Text style={styles.submitReviewText}>
                    {dateSelectionStep === 'checkin' ? 'Continue to Check-Out Date →' : 'Confirm Dates'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
                  onPress={() => setIsGuestPickerOpen(false)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
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
    gap: 10,
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
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  roomCapacity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  inclusionsList: {
    gap: 4,
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
  roomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  reserveBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  amenitiesGrid: {
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.sand,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  amenityText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.navy,
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
    paddingVertical: 14,
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
});
