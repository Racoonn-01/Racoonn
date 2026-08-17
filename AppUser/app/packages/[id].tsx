import React, { useState, useRef } from 'react';
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
  ChevronUp,
  X,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Mail,
  Calendar,
  Users,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import AuthBottomSheet from '../../components/shared/AuthBottomSheet';
import { packages as MOCK_PACKAGES } from '../../data/packages';
import { getCMSPackages } from '../../lib/appwrite/api';

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
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    tags: ['4-Star Resort', 'Free Breakfast', 'AC Rooms'],
    pricePerNight: 4500,
    isDefault: true,
    priceLabel: 'Included in Package',
  },
  {
    id: 'h-2',
    title: 'Azure Bay Luxury Heritage Villa',
    description: 'Ultra-luxury 5-Star boutique villa featuring private dip pool and butler service.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?q=80&w=800&auto=format&fit=crop',
    pricePerPerson: 2500,
    priceLabel: '+ ₹2,500 / person',
  },
];

const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    userName: 'Vikram Malhotra',
    date: 'July 2026',
    rating: 5,
    text: 'Flawless tour package! Smooth vehicle transfers, luxurious hotel rooms, and our driver was super helpful throughout the mountain trip.',
  },
  {
    id: 'rev-2',
    userName: 'Neha Kapoor',
    date: 'June 2026',
    rating: 5,
    text: 'Booked this for our family trip to Uttarakhand. The itinerary flow was relaxed and the resort stay in Dhanaulti was unforgettable.',
  },
];

export default function PackageDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated, toggleSavedPackage } = useAuthStore();
  const [isAuthSheetVisible, setIsAuthSheetVisible] = useState(false);
  const pkgId = (id as string) || 'pkg-1';

  // Find package or fallback
  const pkgData: any = (MOCK_PACKAGES as any[]).find((p) => String(p.id) === String(pkgId)) || {
    id: pkgId,
    title: 'Exotic Uttarakhand Mountain Escape',
    location: 'Dehradun · Mussoorie · Dhanaulti',
    duration: '5 Nights / 6 Days',
    rating: 4.92,
    reviews: 142,
    price: 18499,
    originalPrice: 24999,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    category: 'Adventure',
    highlights: ['Private SUV Transfer', '4-Star Resort Stays', 'Sightseeing & Breakfast'],
  };

  const heroImages: string[] = Array.isArray(pkgData.images) && pkgData.images.length > 0
    ? pkgData.images
    : [
        pkgData.image || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop',
      ];

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
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infantsCount, setInfantsCount] = useState<number>(0);
  const [petsCount, setPetsCount] = useState<number>(0);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [checkInDate, setCheckInDate] = useState<string>('07 Aug, 2026');
  const [checkOutDate, setCheckOutDate] = useState<string>('11 Aug, 2026');

  // Date & Guest Modal States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateSelectionStep, setDateSelectionStep] = useState<'checkin' | 'checkout'>('checkin');
  const [isGuestPickerOpen, setIsGuestPickerOpen] = useState(false);

  // Review Modal State
  const [reviewsList, setReviewsList] = useState(MOCK_REVIEWS);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userNameInput, setUserNameInput] = useState(profile?.name || '');
  const [userReviewComment, setUserReviewComment] = useState('');

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

  const handleAddReview = () => {
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
  };

  const scrollToSection = (section: 'plan' | 'stays' | 'activities' | 'reviews' | 'contact') => {
    setActiveTab(section);
    const yPos = sectionPositions.current[section];
    if (yPos !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yPos - 10, animated: true });
    }
  };

  // Pricing calculations
  const basePriceNum = Number(pkgData.price) || 18499;
  const nightsCount = 5;
  const baseHotelPrice = MOCK_HOTEL_OPTIONS[0].pricePerNight;
  const currentHotelPrice = MOCK_HOTEL_OPTIONS[selectedHotelIndex]?.pricePerNight || baseHotelPrice;
  const hotelExtraPerPerson = (currentHotelPrice - baseHotelPrice) * nightsCount;

  const activitiesExtraPerPerson = selectedActivities.reduce((sum, actIdx) => {
    const act = MOCK_ACTIVITY_OPTIONS[actIdx];
    return sum + (act ? act.pricePerPerson : 0);
  }, 0);

  const effectivePricePerPerson = basePriceNum + hotelExtraPerPerson + activitiesExtraPerPerson;
  const grandTotalPrice = effectivePricePerPerson * adultsCount;

  const handleBookNow = () => {
    if (!isAuthenticated) {
      setIsAuthSheetVisible(true);
      return;
    }
    router.push({
      pathname: `/checkout/${pkgId}` as any,
      params: {
        packageTitle: pkgData.title,
        guests: adultsCount,
        totalPrice: grandTotalPrice,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        location: 'Uttarakhand, India',
        bookingType: 'package',
      },
    });
  };

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
            <View style={styles.ratingBox}>
              <Star color="#F59E0B" fill="#F59E0B" size={14} />
              <Text style={styles.ratingScore}>{pkgData.rating}</Text>
            </View>
            <Text style={styles.reviewsCount}>({pkgData.reviews || 142} traveler reviews)</Text>
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

          {/* 🌟 START DATE / END DATE & TRAVELERS GROUPED BAR */}
          <View style={styles.packageBookingGroupedBar}>
            {/* Start Date */}
            <TouchableOpacity
              style={styles.packageGroupedCol}
              activeOpacity={0.8}
              onPress={() => {
                setDateSelectionStep('checkin');
                setIsDatePickerOpen(true);
              }}
            >
              <Text style={styles.packageGroupedLabel}>START DATE</Text>
              <Text style={styles.packageGroupedValue}>{checkInDate || 'Add date'}</Text>
            </TouchableOpacity>

            <View style={styles.packageGroupedDivider} />

            {/* End Date */}
            <TouchableOpacity
              style={styles.packageGroupedCol}
              activeOpacity={0.8}
              onPress={() => {
                setDateSelectionStep('checkout');
                setIsDatePickerOpen(true);
              }}
            >
              <Text style={styles.packageGroupedLabel}>END DATE</Text>
              <Text style={styles.packageGroupedValue}>{checkOutDate || 'Add date'}</Text>
            </TouchableOpacity>

            <View style={styles.packageGroupedDivider} />

            {/* Travelers Stepper */}
            <View style={styles.packageGroupedCol}>
              <Text style={styles.packageGroupedLabel}>TRAVELERS</Text>
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
                  style={styles.stepperCircleBtn}
                  onPress={() => setAdultsCount(adultsCount + 1)}
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
              {MOCK_ITINERARY.map((day) => {
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
                        {day.points.map((pt, pIdx) => (
                          <View key={pIdx} style={styles.stepCard}>
                            <View style={styles.stepIconBadge}>
                              <CheckCircle2 color={Colors.brand.coral} size={15} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.pointTitle}>{pt.title}</Text>
                              <Text style={styles.pointDesc}>{pt.description}</Text>
                            </View>
                          </View>
                        ))}
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
              {MOCK_HOTEL_OPTIONS.map((hotel, idx) => {
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
                      {hotel.tags[0] && (
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
                      <View style={styles.tagRow}>
                        {hotel.tags.slice(1).map((t, ti) => (
                          <View key={ti} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>{t}</Text>
                          </View>
                        ))}
                      </View>

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
              {MOCK_ACTIVITY_OPTIONS.map((act, idx) => {
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
              {reviewsList.map((rev) => (
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
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 5: Contact & Verification */}
          <View
            onLayout={(e: any) => (sectionPositions.current['contact'] = e.nativeEvent.layout.y)}
            style={styles.sectionBox}
          >
            <Text style={styles.sectionTitle}>Need Assistance & Inquiry</Text>
            <Text style={styles.sectionSubtitle}>Get in touch with our 24/7 Racoonn tour experts</Text>

            {/* 100% Guaranteed Badge */}
            <View style={styles.contactCard}>
              <ShieldCheck color={Colors.brand.coral} size={32} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.contactCardTitle}>100% Guaranteed Racoonn Experience</Text>
                <Text style={styles.contactCardSub}>
                  Assigned personal tour manager, 24/7 mountain helpline & instant confirmation.
                </Text>
              </View>
            </View>

            {/* Contact Action Buttons */}
            <View style={styles.contactButtonsGrid}>
              {/* Call Us Now */}
              <TouchableOpacity
                style={styles.contactActionBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL('tel:+9118001234567')}
              >
                <View style={styles.contactActionIconBg}>
                  <PhoneCall color={Colors.brand.coral} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactActionTitle}>Call Us Now</Text>
                  <Text style={styles.contactActionSub}>1800 123 4567 (Toll Free)</Text>
                </View>
                <ArrowRight color="#94A3B8" size={16} />
              </TouchableOpacity>

              {/* Email Support */}
              <TouchableOpacity
                style={styles.contactActionBtn}
                activeOpacity={0.85}
                onPress={() => Linking.openURL('mailto:support@racoonn.com')}
              >
                <View style={styles.contactActionIconBg}>
                  <Mail color={Colors.brand.coral} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactActionTitle}>Email Support</Text>
                  <Text style={styles.contactActionSub}>support@racoonn.com</Text>
                </View>
                <ArrowRight color="#94A3B8" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Bar */}
      {!isWriteReviewOpen && !isDatePickerOpen && !isGuestPickerOpen && (
        <View style={styles.bottomBar}>
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
  contactButtonsGrid: {
    gap: 10,
    marginTop: 12,
  },
  contactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactActionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(232, 106, 112, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactActionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  contactActionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
});
