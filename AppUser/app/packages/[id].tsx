import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Dimensions,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Linking,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Clock,
  Star,
  Share2,
  Heart,
  ArrowLeft,
  CalendarDays,
  Hotel,
  Compass,
  CheckCircle2,
  PhoneCall,
  ChevronDown,
  X,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Mail,
  Check,
  Sparkles,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { REAL_PACKAGE_IMAGE, REAL_PACKAGE_IMAGES, REAL_STAY_IMAGE, REAL_STAY_IMAGES, REAL_ACTIVITY_IMAGE } from '@/constants/RealImages';
import { useAuthStore } from '../../store/authStore';
import AuthBottomSheet from '../../components/shared/AuthBottomSheet';
import CustomCalendarModal from '../../components/shared/CustomCalendarModal';
import { packages as MOCK_PACKAGES } from '../../data/packages';
import { getCMSPackages, getReviews, createReview, createPackageLead } from '../../lib/appwrite/api';

const { width } = Dimensions.get('window');

const MOCK_ITINERARY = [
  {
    dayNumber: 1,
    title: 'Arrival in Dehradun & Transfer to Mussoorie',
    activities: 'Pick up from Dehradun Airport/Railway Station, drive to Mussoorie. Check-in to resort and evening walk at Mall Road.',
    points: [
      { title: 'Airport / Station Pickup', description: 'Chauffeur driven private vehicle waiting at arrival.' },
      { title: 'Scenic Drive to Mussoorie', description: 'Stop at Bhatta Falls for quick photo opportunity.' },
      { title: 'Resort Check-In', description: 'Welcome drink & room orientation.' },
    ]
  },
  {
    dayNumber: 2,
    title: 'Mussoorie Sightseeing & Kempty Falls',
    activities: 'Full day sightseeing covering Kempty Falls, Gun Hill cable car ride, Company Garden, and Lal Tibba view point.',
    points: [
      { title: 'Kempty Falls Visit', description: 'Enjoy refreshing cascade falls and cable car views.' },
      { title: 'Lal Tibba View Point', description: 'Panoramiic telescope view of snow-capped Himalayan peaks.' },
    ]
  },
  {
    dayNumber: 3,
    title: 'Dhanaulti Day Excursion & Eco Park Walk',
    activities: 'Day trip to peaceful Dhanaulti. Explore Eco Park, Surkanda Devi Temple trek or ropeway, and apple orchards.',
    points: [
      { title: 'Eco Park Walk', description: 'Pine & Deodar trees misty nature walk.' },
      { title: 'Surkanda Devi Temple', description: 'Highest peak view point in Dhanaulti range.' },
    ]
  },
  {
    dayNumber: 4,
    title: 'Leisure & Departure Transfer',
    activities: 'Breakfast at hotel, shopping at local craft markets, transfer back to Dehradun for return journey.',
    points: [
      { title: 'Souvenir Shopping', description: 'Local wooden handicraft & organic tea shops.' },
      { title: 'Return Drop-Off', description: 'Drop at Dehradun Airport or Railway Station.' },
    ]
  }
];

const MOCK_HOTEL_OPTIONS = [
  {
    id: 'h-1',
    title: 'The Himalayan Cloud Retreat & Spa',
    description: '4-Star luxury resort with mountain view balcony, infinity pool, and buffet breakfast.',
    image: REAL_STAY_IMAGE,
    tags: ['4-Star Resort', 'Free Breakfast', 'AC Rooms'],
    pricePerNight: 4500,
    isDefault: true,
    priceLabel: 'Included in Package',
  },
  {
    id: 'h-2',
    title: 'Azure Bay Luxury Heritage Villa',
    description: 'Ultra-luxury 5-Star boutique villa featuring private dip pool and butler service.',
    image: REAL_STAY_IMAGES[1],
    tags: ['5-Star Luxury', 'Private Pool', 'Butler Service'],
    pricePerNight: 7500,
    isDefault: false,
    priceLabel: '+ ₹3,000 / night',
  },
];

const MOCK_ACTIVITY_OPTIONS = [
  {
    id: 1,
    title: 'Adventure Sports & Zipline Pass',
    description: 'Get an adrenaline rush with mountain zip-lining, valley crossing, rope climbing, and rappelling.',
    image: REAL_ACTIVITY_IMAGE,
    pricePerPerson: 2500,
    priceLabel: '+ ₹2,500 / person',
  },
];

export default function PackageDetailScreen() {
  const insets = useSafeAreaInsets();
  const bottomNavPadding = insets.bottom > 0
    ? (insets.bottom + 10)
    : (Platform.OS === 'android' ? 44 : 16);
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated, toggleSavedPackage } = useAuthStore();
  const [isAuthSheetVisible, setIsAuthSheetVisible] = useState(false);
  const pkgId = (id as string) || 'pkg-1';
  const [realPackage, setRealPackage] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRealPkgAndReviews() {
      setIsLoading(true);
      try {
        const pkgs = await getCMSPackages();
        if (pkgs && pkgs.length > 0) {
          const match = pkgs.find((p: any) => String(p.id) === String(pkgId));
          if (match) {
            setRealPackage(match);
          }
        }
      } catch (e) {
        console.warn('Error loading real package in detail:', e);
      } finally {
        setIsLoading(false);
      }

      try {
        const rawReviews = await getReviews(pkgId);
        if (rawReviews && rawReviews.length > 0) {
          const mapped = rawReviews.map((r: any) => ({
            id: r.$id || r.id,
            userName: r.userName || 'Verified Traveler',
            date: r.$createdAt ? new Date(r.$createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent',
            rating: Number(r.rating) || 5,
            text: r.text || '',
          }));
          setReviewsList(mapped);
        } else {
          setReviewsList([]);
        }
      } catch (err) {
        console.warn('Error loading reviews for package:', err);
      }
    }
    fetchRealPkgAndReviews();
  }, [pkgId]);

  // Find package or fallback
  const pkgData: any = realPackage || (MOCK_PACKAGES as any[]).find((p) => String(p.id) === String(pkgId)) || {
    id: pkgId,
    title: 'Tour Package',
    location: 'Uttarakhand',
    duration: '3 Days / 2 Nights',
    price: 0,
    originalPrice: 0,
    image: REAL_PACKAGE_IMAGE,
    category: 'Featured',
    highlights: ['Private SUV Transfer', '4-Star Resort Stays', 'Sightseeing & Breakfast'],
  };

  const heroImages: string[] = Array.isArray(pkgData.images) && pkgData.images.length > 0
    ? pkgData.images
    : (pkgData.image ? [pkgData.image, ...REAL_PACKAGE_IMAGES.slice(1, 4)] : REAL_PACKAGE_IMAGES);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const handleSliderScroll = (event: any) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeImageIndex && slide >= 0 && slide < heroImages.length) {
      setActiveImageIndex(slide);
    }
  };

  const [activeTab, setActiveTab] = useState<'plan' | 'stays' | 'activities' | 'reviews' | 'contact'>('plan');
  const [openDay, setOpenDay] = useState<number>(1);

  const toggleDayAccordion = (dayNum: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenDay((prev) => (prev === dayNum ? 0 : dayNum));
  };
  const [selectedHotelIndex, setSelectedHotelIndex] = useState<number>(0);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  // Booking Dates & Guests Detailed State
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [petsCount, setPetsCount] = useState<number>(0);
  const [checkInDate, setCheckInDate] = useState<string>(() => {
    const d = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  });
  const [checkOutDate, setCheckOutDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]}, ${d.getFullYear()}`;
  });

  // Date, Departure City & Guest Modal States
  const [isDeparturePickerOpen, setIsDeparturePickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateSelectionStep, setDateSelectionStep] = useState<'checkin' | 'checkout'>('checkin');
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  // Realtime departure cities loaded directly from CMS
  const availableDepartureCityObjects = useMemo<{
    id: string;
    cityName: string;
    pricePerPerson: number;
    isDefault: boolean;
    pricing: any[];
  }[]>(() => {
    const raw = pkgData?.departureCities;
    if (!Array.isArray(raw) || raw.length === 0) {
      return [];
    }
    const result: {
      id: string;
      cityName: string;
      pricePerPerson: number;
      isDefault: boolean;
      pricing: any[];
    }[] = [];
    raw.forEach((item: any, idx: number) => {
      if (typeof item === 'string' && item.trim()) {
        result.push({
          id: `city-${idx}`,
          cityName: item.trim(),
          pricePerPerson: 0,
          isDefault: idx === 0,
          pricing: [],
        });
      } else if (item && typeof item === 'object') {
        const name = (item.cityName || item.name || item.city || item.title || '').trim();
        if (name) {
          result.push({
            id: String(item.id || item.$id || `city-${idx}`),
            cityName: name,
            pricePerPerson: Number(item.pricePerPerson) || 0,
            isDefault: Boolean(item.isDefault),
            pricing: Array.isArray(item.pricing) ? item.pricing : [],
          });
        }
      }
    });
    return result;
  }, [pkgData?.departureCities]);

  const defaultDepartureCity = useMemo(() => {
    return (
      availableDepartureCityObjects.find((c) => c.isDefault) ||
      availableDepartureCityObjects[0] ||
      null
    );
  }, [availableDepartureCityObjects]);

  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [departureCity, setDepartureCity] = useState<string>('');

  useEffect(() => {
    if (defaultDepartureCity && !selectedCityId) {
      setSelectedCityId(defaultDepartureCity.id);
      setDepartureCity(defaultDepartureCity.cityName);
    } else if (availableDepartureCityObjects.length === 0) {
      const fallback = (pkgData?.location?.split('·')[0] || pkgData?.city || 'Haldwani').trim();
      setDepartureCity(fallback);
    }
  }, [defaultDepartureCity, selectedCityId, availableDepartureCityObjects.length, pkgData?.location, pkgData?.city]);

  const selectedCityObj = useMemo(() => {
    if (selectedCityId) {
      const found = availableDepartureCityObjects.find((c) => c.id === selectedCityId);
      if (found) return found;
    }
    return defaultDepartureCity;
  }, [availableDepartureCityObjects, selectedCityId, defaultDepartureCity]);

  // Review Modal State
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userNameInput, setUserNameInput] = useState(profile?.name || '');
  const [userReviewComment, setUserReviewComment] = useState('');

  const effectiveReviewsCount = reviewsList.length;
  const effectiveRating = effectiveReviewsCount > 0
    ? (reviewsList.reduce((sum, r) => sum + Number(r.rating || 5), 0) / effectiveReviewsCount).toFixed(1)
    : (realPackage?.rating ? Number(realPackage.rating).toFixed(1) : null);

  // Scroll View Ref & Section Positions
  const scrollRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<Record<string, number>>({});

  const savedPackageIds = profile?.savedPackages || [];
  const isSaved = savedPackageIds.includes(pkgId);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${pkgData.title} on Racoonn Packages! ${pkgData.location} - ${pkgData.duration}`,
      });
    } catch {}
  };

  const toggleActivity = (index: number) => {
    setSelectedActivities((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleAddReview = async () => {
    if (!userReviewComment.trim()) return;
    const newRev = {
      id: `rev-${Date.now()}`,
      userName: userNameInput.trim() || 'Racoonn Traveler',
      date: 'Just now',
      rating: userRating,
      text: userReviewComment,
    };
    setReviewsList([newRev, ...reviewsList]);
    setUserReviewComment('');
    setIsWriteReviewOpen(false);

    try {
      await createReview({
        propertyId: String(pkgId),
        vendorId: realPackage?.vendorId || 'package-vendor',
        userName: newRev.userName,
        rating: userRating,
        text: newRev.text,
        category: 'Package Tour',
      });
    } catch (err) {
      console.warn('Error saving package review:', err);
    }
  };

  const scrollToSection = (section: 'plan' | 'stays' | 'activities' | 'reviews' | 'contact') => {
    setActiveTab(section);
    const yPos = sectionPositions.current[section];
    if (yPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yPos - 10, animated: true });
    }
  };

  // Dynamic duration nights count (e.g. "5 Nights / 6 Days" -> 5)
  const nightsMatch = String(pkgData?.duration || '').match(/(\d+)\s*Nights?/i);
  const nightsCount = nightsMatch ? parseInt(nightsMatch[1], 10) : 1;

  // Effective itinerary, hotel options, and activity options from live CMS pkgData
  const effectiveItinerary = useMemo(() => {
    if (Array.isArray(pkgData?.itinerary) && pkgData.itinerary.length > 0) {
      return pkgData.itinerary.map((day: any, idx: number) => ({
        dayNumber: day.dayNumber || idx + 1,
        title: day.title || `Day ${idx + 1} Overview`,
        activities: day.activities || day.title || '',
        points: Array.isArray(day.points) ? day.points : [],
      }));
    }
    return MOCK_ITINERARY;
  }, [pkgData?.itinerary]);

  const effectiveHotels = useMemo(() => {
    if (Array.isArray(pkgData?.hotelOptions) && pkgData.hotelOptions.length > 0) {
      const basePrice = Number(pkgData.hotelOptions[0]?.pricePerNight || pkgData.hotelOptions[0]?.price || 4500);
      return pkgData.hotelOptions.map((h: any, idx: number) => {
        const hPrice = Number(h.pricePerNight || h.price || 4500);
        return {
          id: String(h.id || h.$id || `h-${idx}`),
          title: h.title || h.name || 'Resort Stay',
          description: h.description || 'Comfortable stay with modern amenities',
          image: h.image || REAL_STAY_IMAGE,
          tags: Array.isArray(h.tags) && h.tags.length > 0 ? h.tags : ['Resort', 'Free Breakfast'],
          pricePerNight: hPrice,
          isDefault: idx === 0,
          priceLabel: idx === 0 ? 'Included in Package' : `+ ₹${Math.abs(hPrice - basePrice).toLocaleString('en-IN')} / night`,
        };
      });
    }
    return MOCK_HOTEL_OPTIONS;
  }, [pkgData?.hotelOptions]);

  const effectiveActivities = useMemo(() => {
    if (Array.isArray(pkgData?.activityOptions) && pkgData.activityOptions.length > 0) {
      return pkgData.activityOptions.map((act: any, idx: number) => ({
        id: act.id || idx,
        title: act.title || act.name || 'Outdoor Experience',
        description: act.description || 'Exciting adventure activity',
        image: act.image || REAL_ACTIVITY_IMAGE,
        pricePerPerson: Number(act.pricePerPerson || act.price || 0),
        priceLabel: idx === 0 ? 'Included in Package' : `+ ₹${Number(act.pricePerPerson || 0).toLocaleString('en-IN')} / person`,
      }));
    }
    return MOCK_ACTIVITY_OPTIONS;
  }, [pkgData?.activityOptions]);

  // Find the absolute maximum allowed travelers across slabs (matching User portal)
  const activeSlabsForLimit = (selectedCityObj && Array.isArray(selectedCityObj.pricing) && selectedCityObj.pricing.length > 0)
    ? selectedCityObj.pricing
    : (pkgData?.pricing && Array.isArray(pkgData.pricing) ? pkgData.pricing : []);

  const maxTravelersLimit = activeSlabsForLimit.length > 0
    ? Math.max(...activeSlabsForLimit.map((slab: any) => Math.max(slab.maxPersons || 1, slab.minPersons || 1)))
    : 999;

  // Group base price with tiered pricing slabs based on adults count (matching User portal)
  const citySlabs: any[] = (selectedCityObj && Array.isArray(selectedCityObj.pricing) && selectedCityObj.pricing.length > 0)
    ? selectedCityObj.pricing
    : [];

  let groupBasePrice = 0;

  // 1. If city has its own custom slabs, use them directly (User portal logic)
  if (citySlabs.length > 0) {
    const sortedCitySlabs = [...citySlabs].sort((a: any, b: any) => {
      const aMin = Math.min(a.minPersons || 1, a.maxPersons || 999);
      const bMin = Math.min(b.minPersons || 1, b.maxPersons || 999);
      return aMin - bMin;
    });

    let applicableSlab = sortedCitySlabs.find((slab: any) => {
      const min = Math.min(slab.minPersons || 1, slab.maxPersons || 999);
      const max = Math.max(slab.minPersons || 1, slab.maxPersons || 999);
      return adultsCount >= min && adultsCount <= max;
    });

    if (!applicableSlab) {
      const lowerSlabs = sortedCitySlabs.filter(
        (slab: any) => Math.min(slab.minPersons || 1, slab.maxPersons || 999) <= adultsCount
      );
      applicableSlab = lowerSlabs.length > 0 ? lowerSlabs[lowerSlabs.length - 1] : sortedCitySlabs[0];
    }

    if (applicableSlab) {
      groupBasePrice = (Number(applicableSlab.pricePerPerson) || 0) * adultsCount;
    } else {
      groupBasePrice = (Number(selectedCityObj?.pricePerPerson) || 0) * adultsCount;
    }
  } else {
    // 2. Fallback to package base slabs with city delta or flat price (User portal logic)
    let cityRateDelta = 0;
    if (selectedCityObj && defaultDepartureCity && availableDepartureCityObjects.length > 0) {
      cityRateDelta = (Number(selectedCityObj.pricePerPerson) || 0) - (Number(defaultDepartureCity.pricePerPerson) || 0);
    }

    const defaultBasePriceNum = selectedCityObj 
      ? (Number(selectedCityObj.pricePerPerson) || 0) 
      : (Number(String(pkgData?.price || 0).replace(/[^\d]/g, '')) || 0);
    groupBasePrice = defaultBasePriceNum * adultsCount;

    if (pkgData?.pricing && Array.isArray(pkgData.pricing) && pkgData.pricing.length > 0) {
      const sortedSlabs = [...pkgData.pricing].sort((a: any, b: any) => {
        const aMin = Math.min(a.minPersons || 1, a.maxPersons || 999);
        const bMin = Math.min(b.minPersons || 1, b.maxPersons || 999);
        return aMin - bMin;
      });

      let applicableSlab = sortedSlabs.find((slab: any) => {
        const min = Math.min(slab.minPersons || 1, slab.maxPersons || 999);
        const max = Math.max(slab.minPersons || 1, slab.maxPersons || 999);
        return adultsCount >= min && adultsCount <= max;
      });

      if (!applicableSlab) {
        const lowerSlabs = sortedSlabs.filter(
          (slab: any) => Math.min(slab.minPersons || 1, slab.maxPersons || 999) <= adultsCount
        );
        applicableSlab = lowerSlabs.length > 0 ? lowerSlabs[lowerSlabs.length - 1] : sortedSlabs[0];
      }

      if (applicableSlab) {
        const slabBase = (Number(applicableSlab.pricePerPerson) || 0) + cityRateDelta;
        groupBasePrice = Math.max(0, slabBase) * adultsCount;
      }
    }
  }

  // Accommodation extra cost per person relative to default base option (Hotel 0)
  const baseHotelPrice = effectiveHotels[0]?.pricePerNight || 0;
  const currentHotelPrice = effectiveHotels[selectedHotelIndex]?.pricePerNight || baseHotelPrice;
  const hotelExtraPerPerson = (currentHotelPrice - baseHotelPrice) * nightsCount;

  // Activities extra cost per person (Index 0 is included in base package)
  const activitiesExtraPerPerson = selectedActivities.reduce((sum, actIdx) => {
    const act = effectiveActivities[actIdx];
    return sum + (act && actIdx !== 0 ? act.pricePerPerson : 0);
  }, 0);

  const groupHotelExtra = hotelExtraPerPerson * adultsCount;
  const groupActivitiesExtra = activitiesExtraPerPerson * adultsCount;

  // Total price calculations (matching User portal: groupBasePrice + groupHotelExtra + groupActivitiesExtra)
  const grandTotalPrice = groupBasePrice + groupHotelExtra + groupActivitiesExtra;
  const effectivePricePerPerson = Math.round(grandTotalPrice / adultsCount);

  // Request Custom Quote State (Need Assistance & Inquiry)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    email: profile?.email || '',
    destination: '',
    departureCity: '',
    message: '',
  });

  const handleQuoteSubmit = async () => {
    if (!quoteForm.name.trim() || !quoteForm.phone.trim() || !quoteForm.email.trim()) {
      Alert.alert('Incomplete Details', 'Please provide your full name, phone number, and email.');
      return;
    }
    setIsQuoteSubmitting(true);
    try {
      await createPackageLead({
        packageId: String(pkgId),
        packageTitle: pkgData?.title || 'Tour Package',
        name: quoteForm.name.trim(),
        phone: quoteForm.phone.trim(),
        email: quoteForm.email.trim(),
        destination: quoteForm.destination || pkgData?.location || 'Uttarakhand',
        departureCity: quoteForm.departureCity || departureCity || 'Haldwani',
        message: quoteForm.message.trim(),
      });
      setIsQuoteModalOpen(false);
      setQuoteForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        destination: '',
        departureCity: '',
        message: '',
      });
      Alert.alert(
        'Request Sent!',
        'Your custom quote request has been sent successfully. Our travel experts will contact you shortly.'
      );
    } catch (err) {
      console.warn('Failed to submit quote request:', err);
      Alert.alert('Error', 'Could not send request. Please try again.');
    } finally {
      setIsQuoteSubmitting(false);
    }
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setIsAuthSheetVisible(true);
      return;
    }
    const selectedCoverImage =
      (Array.isArray(pkgData?.images) && pkgData.images.length > 0 && pkgData.images[0]) ||
      pkgData?.image ||
      (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]) ||
      '';

    router.push({
      pathname: `/checkout/${pkgId}` as any,
      params: {
        packageTitle: pkgData.title,
        guests: adultsCount,
        totalPrice: grandTotalPrice,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        location: pkgData.location || 'Uttarakhand, India',
        bookingType: 'package',
        departureCity: departureCity,
        image: selectedCoverImage,
      },
    });
  };

  if (isLoading && !realPackage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.topNavContainer, { position: 'relative', width: '100%', paddingHorizontal: 20, paddingTop: 10 }]}>
          <TouchableOpacity style={styles.navCircleBtn} onPress={() => router.back()}>
            <ArrowLeft color={Colors.brand.navy} size={20} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.brand.coral} />
          <Text style={{ marginTop: 14, fontSize: 14, fontWeight: '600', color: '#64748B' }}>
            Loading package details...
          </Text>
        </View>
      </SafeAreaView>
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

            <TouchableOpacity style={styles.navCircleBtn} onPress={() => toggleSavedPackage(pkgId)}>
              <Heart
                color={isSaved ? Colors.brand.coral : Colors.brand.navy}
                fill={isSaved ? Colors.brand.coral : 'transparent'}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Image Slider Header */}
        <View style={styles.heroContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleSliderScroll}
            scrollEventThrottle={16}
            style={{ width: '100%', height: '100%' }}
          >
            {heroImages.map((imgUri: string, idx: number) => (
              <View key={idx} style={{ width, height: 260 }}>
                <Image source={{ uri: imgUri }} style={styles.heroImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>

          <View style={styles.heroOverlay} pointerEvents="none" />

          {/* Slider Dots Indicator */}
          {heroImages.length > 1 && (
            <View style={styles.sliderDotsContainer} pointerEvents="none">
              {heroImages.map((_: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.sliderDot,
                    activeImageIndex === idx && styles.sliderDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          <View style={styles.heroCategoryBadge}>
            <Text style={styles.heroCategoryText}>{pkgData.category || pkgData.badge || 'Curated Tour'}</Text>
          </View>
        </View>

        {/* Main Content Body */}
        <View style={styles.contentBody}>
          {/* Badge & Title */}
          <View style={styles.durationBadge}>
            <Clock color={Colors.brand.coral} size={14} />
            <Text style={styles.durationBadgeText}>{pkgData.duration}</Text>
          </View>

          <Text style={styles.title}>{pkgData.title}</Text>

          <View style={styles.locationRow}>
            <MapPin color={Colors.brand.coral} size={16} style={{ marginRight: 6 }} />
            <Text style={styles.locationText}>{pkgData.location}</Text>
          </View>

          {/* Rating Summary */}
          <View style={styles.ratingRow}>
            {effectiveRating ? (
              <>
                <View style={styles.ratingBox}>
                  <Star color="#F59E0B" fill="#F59E0B" size={14} />
                  <Text style={styles.ratingScore}>{effectiveRating}</Text>
                </View>
                <Text style={styles.reviewsCount}>
                  ({effectiveReviewsCount} {effectiveReviewsCount === 1 ? 'traveler review' : 'traveler reviews'})
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

          {/* Highlights */}
          <View style={styles.highlightsRow}>
            {(pkgData.highlights || []).map((hl: string, idx: number) => (
              <View key={idx} style={styles.highlightChip}>
                <CheckCircle2 color={Colors.brand.coral} size={12} style={{ marginRight: 4 }} />
                <Text style={styles.highlightText}>{hl}</Text>
              </View>
            ))}
          </View>

          {/* 🌟 3-COLUMN BOOKING BAR: DEPARTURE CITY | START DATE | TRAVELERS (Matches Design) */}
          <View style={styles.packageBookingGroupedBar}>
            {/* Departure City */}
            <TouchableOpacity
              style={styles.packageGroupedCol}
              activeOpacity={0.7}
              onPress={() => setIsDeparturePickerOpen(true)}
            >
              <Text style={styles.packageGroupedCoralLabel}>DEPARTURE CITY</Text>
              <View style={styles.departureValueRow}>
                <Text style={styles.packageGroupedValue} numberOfLines={1}>
                  {typeof departureCity === 'string' ? departureCity : ((departureCity as any)?.cityName || 'Haldwani')}
                </Text>
                <ChevronDown color="#475569" size={14} style={{ marginLeft: 3 }} />
              </View>
            </TouchableOpacity>

            <View style={styles.packageGroupedDivider} />

            {/* Start Date Only */}
            <TouchableOpacity
              style={styles.packageGroupedCol}
              activeOpacity={0.8}
              onPress={() => {
                setDateSelectionStep('checkin');
                setIsDatePickerOpen(true);
              }}
            >
              <Text style={styles.packageGroupedDarkLabel}>START DATE</Text>
              <Text style={styles.packageGroupedValue} numberOfLines={1}>{checkInDate || 'Add date'}</Text>
            </TouchableOpacity>

            <View style={styles.packageGroupedDivider} />

            {/* Travelers Stepper */}
            <View style={styles.packageGroupedCol}>
              <Text style={styles.packageGroupedDarkLabel}>TRAVELERS</Text>
              <View style={styles.travelerStepperRow}>
                <TouchableOpacity
                  style={styles.stepperCircleBtn}
                  onPress={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.travelersCountText}>
                  {adultsCount} {adultsCount === 1 ? 'adult' : 'adults'}
                </Text>

                <TouchableOpacity
                  style={[styles.stepperCircleBtn, adultsCount >= maxTravelersLimit && { opacity: 0.4 }]}
                  onPress={() => setAdultsCount(Math.min(maxTravelersLimit, adultsCount + 1))}
                  disabled={adultsCount >= maxTravelersLimit}
                  activeOpacity={0.7}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Horizontal Section Navigation Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stickyTabsRow}>
            <TouchableOpacity
              onPress={() => scrollToSection('plan')}
              style={[styles.tabChip, activeTab === 'plan' && styles.tabChipActive]}
            >
              <CalendarDays color={activeTab === 'plan' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'plan' && styles.tabChipTextActive]}>
                Tour Plan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('stays')}
              style={[styles.tabChip, activeTab === 'stays' && styles.tabChipActive]}
            >
              <Hotel color={activeTab === 'stays' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'stays' && styles.tabChipTextActive]}>
                Stays
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => scrollToSection('activities')}
              style={[styles.tabChip, activeTab === 'activities' && styles.tabChipActive]}
            >
              <Compass color={activeTab === 'activities' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'activities' && styles.tabChipTextActive]}>
                Activities
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

            <TouchableOpacity
              onPress={() => scrollToSection('contact')}
              style={[styles.tabChip, activeTab === 'contact' && styles.tabChipActive]}
            >
              <PhoneCall color={activeTab === 'contact' ? Colors.brand.coral : '#64748B'} size={16} />
              <Text style={[styles.tabChipText, activeTab === 'contact' && styles.tabChipTextActive]}>
                Inquire
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.divider} />

          {/* Section 1: Tour Plan / Itinerary */}
          <View
            onLayout={(e: any) => (sectionPositions.current['plan'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Tour Flow & Daily Itinerary</Text>
            <Text style={styles.sectionSubtitle}>Detailed day-by-day plan organized by Racoonn</Text>

            <View style={styles.itineraryList}>
              {effectiveItinerary.map((day: any) => {
                const isOpen = openDay === day.dayNumber;
                return (
                  <View
                    key={day.dayNumber}
                    style={[styles.itineraryCard, isOpen && styles.itineraryCardOpen]}
                  >
                    <TouchableOpacity
                      style={styles.itineraryHeader}
                      activeOpacity={0.85}
                      onPress={() => toggleDayAccordion(day.dayNumber)}
                    >
                      <View style={[styles.dayBadge, isOpen && styles.dayBadgeActive]}>
                        <Text style={[styles.dayBadgeText, isOpen && styles.dayBadgeTextActive]}>
                          Day {day.dayNumber}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.itineraryDayTitle}>{day.title}</Text>
                        <Text style={styles.itineraryDaySub} numberOfLines={1}>
                          {day.activities}
                        </Text>
                      </View>
                      <ChevronDown
                        color={isOpen ? Colors.brand.coral : '#94A3B8'}
                        size={20}
                        style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                      />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={styles.itineraryBody}>
                        {Array.isArray(day.points) && day.points.length > 0 ? (
                          day.points.map((pt: any, pIdx: number) => (
                            <View key={pIdx} style={styles.stepCard}>
                              <View style={styles.stepIconBadge}>
                                <CheckCircle2 color={Colors.brand.coral} size={15} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.pointTitle}>{pt.title}</Text>
                                <Text style={styles.pointDesc}>{pt.description}</Text>
                              </View>
                            </View>
                          ))
                        ) : (
                          <View style={styles.stepCard}>
                            <View style={styles.stepIconBadge}>
                              <CheckCircle2 color={Colors.brand.coral} size={15} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.pointTitle}>{day.activities || day.title || `Day ${day.dayNumber} Overview`}</Text>
                              <Text style={styles.pointDesc}>Enjoy scheduled activities and sightseeings for Day {day.dayNumber}.</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 2: Stays / Accommodations */}
          <View
            onLayout={(e: any) => (sectionPositions.current['stays'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Available Accommodations</Text>
            <Text style={styles.sectionSubtitle}>Select resort option to customize your tour package</Text>

            <View style={styles.optionsList}>
              {effectiveHotels.map((hotel: any, idx: number) => {
                const isSelected = selectedHotelIndex === idx;
                return (
                  <TouchableOpacity
                    key={hotel.id}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    activeOpacity={0.9}
                    onPress={() => setSelectedHotelIndex(idx)}
                  >
                    {/* Hotel Image & Overlay Badges */}
                    <View style={styles.optionImageContainer}>
                      <Image source={{ uri: hotel.image }} style={styles.optionImage} resizeMode="cover" />

                      {/* Top Selection Status Badge */}
                      <View style={[styles.selectBadge, isSelected ? styles.selectBadgeActive : styles.selectBadgeInactive]}>
                        <CheckCircle2 color={isSelected ? '#FFFFFF' : '#94A3B8'} size={18} />
                      </View>

                      {/* Star Rating Overlay */}
                      {hotel.tags && hotel.tags[0] && (
                        <View style={styles.hotelTagOverlay}>
                          <Star color="#F59E0B" fill="#F59E0B" size={11} />
                          <Text style={styles.hotelTagOverlayText}>{hotel.tags[0]}</Text>
                        </View>
                      )}
                    </View>

                    {/* Content Section */}
                    <View style={styles.optionContent}>
                      <Text style={styles.optionTitle}>{hotel.title}</Text>
                      <Text style={styles.optionDesc}>{hotel.description}</Text>

                      {/* Feature Tags */}
                      {Array.isArray(hotel.tags) && hotel.tags.length > 1 && (
                        <View style={styles.tagRow}>
                          {hotel.tags.slice(1).map((t: string, ti: number) => (
                            <View key={ti} style={styles.tagChip}>
                              <Text style={styles.tagChipText}>{t}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Divider */}
                      <View style={styles.optionDivider} />

                      {/* Pricing & Selection Footer */}
                      <View style={styles.optionFooterRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceSubLabel}>PACKAGE RATE</Text>
                          <Text style={[styles.optionPriceLabel, isSelected && styles.optionPriceLabelActive]}>
                            {hotel.priceLabel}
                          </Text>
                        </View>

                        <View style={[styles.selectActionBtn, isSelected && styles.selectActionBtnActive]}>
                          <Text style={[styles.selectActionText, isSelected && styles.selectActionTextActive]}>
                            {isSelected ? 'Selected' : 'Select'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 3: Activities */}
          <View
            onLayout={(e: any) => (sectionPositions.current['activities'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Included & Optional Activities</Text>
            <Text style={styles.sectionSubtitle}>Tap to add optional adventure activities</Text>

            <View style={styles.optionsList}>
              {effectiveActivities.map((act: any, idx: number) => {
                const isSelected = selectedActivities.includes(idx);
                return (
                  <TouchableOpacity
                    key={act.id}
                    style={[styles.activityCard, isSelected && styles.activityCardSelected]}
                    activeOpacity={0.9}
                    onPress={() => toggleActivity(idx)}
                  >
                    {/* Activity Image Header */}
                    <View style={styles.activityImageContainer}>
                      <Image source={{ uri: act.image }} style={styles.activityImage} resizeMode="cover" />

                      {/* Top Selection Status Badge */}
                      <View style={[styles.selectBadge, isSelected ? styles.selectBadgeActive : styles.selectBadgeInactive]}>
                        <CheckCircle2 color={isSelected ? '#FFFFFF' : '#94A3B8'} size={18} />
                      </View>
                    </View>

                    {/* Content Section */}
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{act.title}</Text>
                      <Text style={styles.activityDesc}>{act.description}</Text>

                      {/* Divider */}
                      <View style={styles.optionDivider} />

                      {/* Pricing & Selection Footer */}
                      <View style={styles.optionFooterRow}>
                        <View style={styles.priceContainer}>
                          <Text style={styles.priceSubLabel}>ACTIVITY COST</Text>
                          <Text style={[styles.activityPriceLabel, isSelected && styles.activityPriceLabelActive]}>
                            {act.priceLabel}
                          </Text>
                        </View>

                        <View style={[styles.selectActionBtn, isSelected && styles.selectActionBtnActive]}>
                          <Text style={[styles.selectActionText, isSelected && styles.selectActionTextActive]}>
                            {isSelected ? 'Added' : 'Add Activity'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 4: Reviews */}
          <View
            onLayout={(e: any) => (sectionPositions.current['reviews'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <View style={styles.reviewsHeaderRow}>
              <Text style={styles.sectionTitle}>Traveler Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setIsWriteReviewOpen(true)}
              >
                <MessageCircle color="#FFFFFF" size={14} style={{ marginRight: 4 }} />
                <Text style={styles.writeReviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reviewsList}>
              {reviewsList.length === 0 ? (
                <View style={styles.noReviewsBox}>
                  <MessageCircle size={32} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Text style={styles.noReviewsTitle}>No reviews yet</Text>
                  <Text style={styles.noReviewsSub}>Be the first to share your experience on this package!</Text>
                </View>
              ) : (
                reviewsList.map((rev) => (
                  <View key={rev.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{rev.userName.slice(0, 1)}</Text>
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
          </View>

          <View style={styles.divider} />

          {/* Section 5: Get in Touch (Need Assistance & Inquiry) */}
          <View
            onLayout={(e: any) => (sectionPositions.current['contact'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Get in Touch</Text>

            <View style={styles.getInTouchCard}>
              <Text style={styles.getInTouchDescription}>
                Have a special request or need more details about this package? Our travel experts are here to help!
              </Text>

              {/* Request Custom Quote */}
              <TouchableOpacity
                style={styles.customQuoteBtn}
                activeOpacity={0.88}
                onPress={() => {
                  setQuoteForm((prev) => ({
                    ...prev,
                    destination: pkgData?.location || 'Uttarakhand',
                    departureCity: departureCity || 'Haldwani',
                  }));
                  setIsQuoteModalOpen(true);
                }}
              >
                <Sparkles color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.customQuoteBtnText}>Request a Custom Quote</Text>
              </TouchableOpacity>

              {/* Call Us Now */}
              <TouchableOpacity
                style={styles.callNowBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL('tel:+9118001234567')}
              >
                <PhoneCall color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.callNowBtnText}>Call Us Now</Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                style={styles.whatsAppBtn}
                activeOpacity={0.85}
                onPress={() =>
                  Linking.openURL(
                    'https://wa.me/919876543210?text=' +
                      encodeURIComponent(`Hi Racoonn Team, I would like to inquire about the package "${pkgData.title}".`)
                  )
                }
              >
                <MessageCircle color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.whatsAppBtnText}>WhatsApp</Text>
              </TouchableOpacity>

              {/* Email Support */}
              <TouchableOpacity
                style={styles.emailSupportBtn}
                activeOpacity={0.85}
                onPress={() =>
                  Linking.openURL(
                    'mailto:support@racoonn.com?subject=' +
                      encodeURIComponent(`Inquiry for Package: ${pkgData.title}`)
                  )
                }
              >
                <Text style={styles.emailSupportBtnText}>Email Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      {!isWriteReviewOpen && !isDatePickerOpen && !isGuestPickerOpen && (
        <View style={[styles.bottomBar, { paddingBottom: bottomNavPadding }]}>
          <View>
            <Text style={styles.bottomPriceLabel}>Total for {adultsCount} {adultsCount === 1 ? 'Guest' : 'Guests'}</Text>
            <View style={styles.bottomPriceRow}>
              <Text style={styles.bottomPrice}>₹{grandTotalPrice.toLocaleString('en-IN')}</Text>
              <Text style={styles.bottomPerPerson}> (₹{effectivePricePerPerson.toLocaleString('en-IN')}/person)</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bookNowBtn} onPress={handleBookNow} activeOpacity={0.9}>
            <Text style={styles.bookNowText}>Book Package</Text>
            <ArrowRight color="#FFFFFF" size={16} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      )}

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
                    <Text style={styles.modalTitle}>Write Package Review</Text>
                    <Text style={styles.modalSubTitle}>Share your experience with future travelers</Text>
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
                  placeholder="Describe your tour experience, accommodation, driver, and itinerary..."
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
                  <Text style={styles.submitReviewText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Departure City Slide-Up Selection Modal */}
      <Modal
        visible={isDeparturePickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDeparturePickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsDeparturePickerOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.writeModalCard, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
                {/* Top Drag Handle Bar */}
                <View style={styles.sheetHandleBar} />

                {/* Header */}
                <View style={styles.modalHeaderRow}>
                  <View>
                    <Text style={styles.modalTitle}>Departure City</Text>
                    <Text style={styles.modalSubTitle}>Select where your package trip begins</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtnCircle}
                    onPress={() => setIsDeparturePickerOpen(false)}
                  >
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                {/* City Options List - Realtime from CMS */}
                <View style={{ marginTop: 14, gap: 10 }}>
                  {availableDepartureCityObjects.length === 0 ? (
                    <View style={styles.noCitiesBox}>
                      <MapPin color="#94A3B8" size={24} style={{ marginBottom: 6 }} />
                      <Text style={styles.noCitiesTitle}>No Departure Cities Available</Text>
                      <Text style={styles.noCitiesSub}>
                        This package does not have custom departure cities configured in the CMS.
                      </Text>
                    </View>
                  ) : (
                    availableDepartureCityObjects.map((cityObj) => {
                      const isSelected = selectedCityId
                        ? cityObj.id === selectedCityId
                        : (departureCity || '').trim().toLowerCase() === cityObj.cityName.trim().toLowerCase();
                      return (
                        <TouchableOpacity
                          key={cityObj.id || cityObj.cityName}
                          style={[
                            styles.cityPickerOption,
                            isSelected && styles.cityPickerOptionActive,
                          ]}
                          activeOpacity={0.75}
                          onPress={() => {
                            setSelectedCityId(cityObj.id);
                            setDepartureCity(cityObj.cityName);
                            setIsDeparturePickerOpen(false);
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <View
                              style={[
                                styles.cityIconCircle,
                                isSelected && styles.cityIconCircleActive,
                              ]}
                            >
                              <MapPin
                                color={isSelected ? Colors.brand.coral : '#64748B'}
                                size={16}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.cityNameText,
                                  isSelected && styles.cityNameTextActive,
                                ]}
                                numberOfLines={1}
                              >
                                {cityObj.cityName}
                              </Text>
                              {cityObj.isDefault && (
                                <Text style={styles.cityDefaultBadge}>
                                  Default Departure
                                </Text>
                              )}
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {cityObj.pricePerPerson > 0 && (
                              <Text
                                style={[
                                  styles.cityPriceBadge,
                                  isSelected && styles.cityPriceBadgeActive,
                                ]}
                              >
                                ₹{cityObj.pricePerPerson.toLocaleString('en-IN')}
                              </Text>
                            )}

                            {isSelected ? (
                              <View style={styles.cityCheckBadge}>
                                <Check color="#FFFFFF" size={13} />
                              </View>
                            ) : (
                              <View style={styles.cityRadioUnchecked} />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom Calendar Bottom Sheet Modal (Single Start Date Mode) */}
      <CustomCalendarModal
        key={`pkg_cal_${checkInDate}_${isDatePickerOpen}`}
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        checkInDate={checkInDate}
        mode="single"
        onSelectDates={(newIn) => {
          setCheckInDate(newIn);
          setCheckOutDate(newIn);
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
                  onPress={() => setIsGuestPickerOpen(false)}
                >
                  <Text style={styles.submitReviewText}>Apply Guests & Rooms</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Request Custom Quote Modal */}
      <Modal
        visible={isQuoteModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsQuoteModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsQuoteModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.writeModalCard, { paddingBottom: Math.max(insets.bottom + 24, 32) }]}>
                {/* Drag Handle Bar */}
                <View style={styles.sheetHandleBar} />

                {/* Header Row */}
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.modalTitle}>Request a Custom Quote</Text>
                    <Text style={styles.modalSubTitle}>
                      Interested in this package? Our travel experts will get back with a personalized quote.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtnCircle}
                    onPress={() => setIsQuoteModalOpen(false)}
                  >
                    <X color="#64748B" size={18} />
                  </TouchableOpacity>
                </View>

                {/* Full Name */}
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. John Doe"
                  placeholderTextColor="#94A3B8"
                  value={quoteForm.name}
                  onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, name: text }))}
                />

                {/* Phone & Email Row */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="+91 9876543210"
                      placeholderTextColor="#94A3B8"
                      keyboardType="phone-pad"
                      value={quoteForm.phone}
                      onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, phone: text }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="john@example.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={quoteForm.email}
                      onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, email: text }))}
                    />
                  </View>
                </View>

                {/* Destination & Departure City Row */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Destination</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Mussoorie"
                      placeholderTextColor="#94A3B8"
                      value={quoteForm.destination}
                      onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, destination: text }))}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Departure City</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Haldwani"
                      placeholderTextColor="#94A3B8"
                      value={quoteForm.departureCity}
                      onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, departureCity: text }))}
                    />
                  </View>
                </View>

                {/* Additional Requirements */}
                <Text style={styles.inputLabel}>Additional Requirements (Optional)</Text>
                <TextInput
                  style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                  multiline
                  placeholder="Tell us about specific customization, travelers count, or special requests..."
                  placeholderTextColor="#94A3B8"
                  value={quoteForm.message}
                  onChangeText={(text) => setQuoteForm((prev) => ({ ...prev, message: text }))}
                />

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.customQuoteSubmitBtn, isQuoteSubmitting && { opacity: 0.7 }]}
                  activeOpacity={0.88}
                  disabled={isQuoteSubmitting}
                  onPress={handleQuoteSubmit}
                >
                  <Text style={styles.submitReviewText}>
                    {isQuoteSubmitting ? 'Sending Request...' : 'Send Request'}
                  </Text>
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
  heroContainer: {
    height: 260,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  heroCategoryBadge: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  heroCategoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sliderDotsContainer: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sliderDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  sliderDotActive: {
    width: 20,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FFFFFF',
  },
  contentBody: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -16,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.sand,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.25)',
  },
  durationBadgeText: {
    color: Colors.brand.navy,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
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
    marginBottom: 14,
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
  highlightsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  highlightChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  highlightText: {
    fontSize: 11,
    color: Colors.brand.navy,
    fontWeight: '600',
  },
  /* 🌟 Screenshot-Matching Package 3-Column Grouped Bar */
  packageBookingGroupedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  packageGroupedCol: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  packageGroupedDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  packageGroupedCoralLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E86A70', // Coral color matching user screenshot
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  packageGroupedDarkLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  packageGroupedLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  packageGroupedValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  departureValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityPickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cityPickerOptionActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.08)',
    borderColor: Colors.brand.coral,
  },
  cityIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityIconCircleActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.15)',
  },
  cityNameText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  cityNameTextActive: {
    color: Colors.brand.coral,
    fontWeight: '900',
  },
  cityCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityRadioUnchecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  cityDefaultBadge: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 1,
  },
  cityPriceBadge: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  cityPriceBadgeActive: {
    color: Colors.brand.coral,
  },
  noCitiesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  noCitiesTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginBottom: 4,
  },
  noCitiesSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  travelerStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stepperCircleBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginTop: -1,
  },
  travelersCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
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
  guestSelectorTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  guestSelectorSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  stickyTabsRow: {
    gap: 8,
    marginVertical: 8,
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
    marginBottom: 6,
  },
  itineraryList: {
    gap: 12,
  },
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itineraryCardOpen: {
    borderColor: 'rgba(232, 106, 112, 0.4)',
    shadowOpacity: 0.08,
  },
  itineraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dayBadge: {
    backgroundColor: 'rgba(232, 106, 112, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dayBadgeActive: {
    backgroundColor: Colors.brand.coral,
  },
  dayBadgeText: {
    color: Colors.brand.coral,
    fontSize: 12.5,
    fontWeight: '800',
  },
  dayBadgeTextActive: {
    color: '#FFFFFF',
  },
  itineraryDayTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  itineraryDaySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itineraryBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  stepIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(232, 106, 112, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  pointTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  pointDesc: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 18,
  },
  optionsList: {
    gap: 16,
  },
  optionCard: {
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
  optionCardSelected: {
    borderColor: Colors.brand.coral,
    borderWidth: 2,
    shadowColor: Colors.brand.coral,
    shadowOpacity: 0.15,
  },
  optionImageContainer: {
    width: '100%',
    height: 165,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  selectBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectBadgeActive: {
    backgroundColor: Colors.brand.coral,
  },
  selectBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  hotelTagOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  hotelTagOverlayText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  optionContent: {
    padding: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  optionDesc: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  tagChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  optionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  optionFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceSubLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  optionPriceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  optionPriceLabelActive: {
    color: Colors.brand.coral,
  },
  selectActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  selectActionBtnActive: {
    backgroundColor: Colors.brand.coral,
  },
  selectActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
  },
  selectActionTextActive: {
    color: '#FFFFFF',
  },
  activityCard: {
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
  activityCardSelected: {
    borderColor: Colors.brand.coral,
    borderWidth: 2,
    shadowColor: Colors.brand.coral,
    shadowOpacity: 0.15,
  },
  activityImageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  activityContent: {
    padding: 16,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  activityDesc: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  activityPriceLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  activityPriceLabelActive: {
    color: Colors.brand.coral,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  reviewsList: {
    gap: 12,
    marginTop: 10,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.sand,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.25)',
  },
  contactCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  contactCardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  getInTouchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 4,
  },
  getInTouchDescription: {
    fontSize: 15.5,
    color: '#334155',
    lineHeight: 23,
    marginBottom: 22,
    fontWeight: '400',
  },
  customQuoteBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    marginBottom: 12,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  customQuoteBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  customQuoteSubmitBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  callNowBtn: {
    backgroundColor: '#121826',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    marginBottom: 12,
  },
  callNowBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  whatsAppBtn: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    marginBottom: 12,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emailSupportBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  emailSupportBtnText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
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
    fontSize: 19,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  bottomPerPerson: {
    fontSize: 11,
    color: '#64748B',
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
});
