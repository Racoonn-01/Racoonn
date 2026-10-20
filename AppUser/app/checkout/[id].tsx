import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendLocalNotification } from '@/services/notificationService';
import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Tag,
  Zap,
  Calendar,
  Users,
  BedDouble,
  Plus,
  CheckCircle2,
  ArrowRight,
  Check,
  Star,
  Lock,
  Gift,
  X,
  QrCode,
  Wallet,
  Building2,
  FileText,
  AlertCircle,
  ChevronDown,
  Search,
  MessageSquare,
  Car,
  Plane,
  Coffee,
  Sparkles,
  Wine,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { REAL_STAY_IMAGE, REAL_PACKAGE_IMAGE } from '@/constants/RealImages';
import { COUNTRIES, CountryItem, formatPhoneNumber } from '@/constants/countries';
import { useAuthStore } from '../../store/authStore';
import { createBooking, getProperties, getCMSPackages, checkRoomAvailability } from '../../lib/appwrite/api';
import { calculateHotelGST } from '../../utils/gst';
import { RazorpayCheckoutModal, RazorpaySuccessData } from '../../components/booking/RazorpayCheckoutModal';

export interface AddonType {
  id?: string;
  $id?: string;
  title?: string;
  name?: string;
  price?: number;
  description?: string;
  subtitle?: string;
  tag?: string;
}



function getIconForTitle(title: string) {
  const t = (title || '').toLowerCase();
  if (t.includes('cab') || t.includes('car') || t.includes('taxi') || t.includes('ride') || t.includes('transport')) return Car;
  if (t.includes('airport') || t.includes('flight') || t.includes('plane') || t.includes('transfer')) return Plane;
  if (t.includes('food') || t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('meal')) return Coffee;
  if (t.includes('spa') || t.includes('massage') || t.includes('wellness') || t.includes('relax')) return Sparkles;
  if (t.includes('insur') || t.includes('protect') || t.includes('shield')) return ShieldCheck;
  if (t.includes('early') || t.includes('late') || t.includes('time') || t.includes('check') || t.includes('hour')) return Clock;
  if (t.includes('wine') || t.includes('drink') || t.includes('champagne') || t.includes('bottle')) return Wine;
  return Zap;
}

const ARRIVAL_TIME_OPTIONS = [
  "I don't know yet",
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  'After 06:00 PM',
];

const QUICK_REQUEST_CHIPS = ['High Floor', 'Quiet Room', 'Early Check-in', 'Honeymoon Decor'];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const bottomBarPadding = insets.bottom > 0
    ? insets.bottom + 14
    : (Platform.OS === 'android' ? 48 : 20);
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const [realProperty, setRealProperty] = useState<any>(null);
  const [realPackage, setRealPackage] = useState<any>(null);

  // Fetch real property or package from Appwrite database if available
  useEffect(() => {
    async function fetchRealItem() {
      if (!params.id) return;
      const idStr = String(params.id);
      const isPkg = params.bookingType === 'package';

      try {
        if (isPkg) {
          const pkgs = await getCMSPackages();
          if (pkgs && pkgs.length > 0) {
            const foundPkg = pkgs.find((p: any) => String(p.id || p.$id) === idStr);
            if (foundPkg) {
              setRealPackage(foundPkg);
              return;
            }
          }
        }

        const docs = await getProperties();
        if (docs && docs.length > 0) {
          const found = docs.find((d: any) => String(d.$id || d.id) === idStr);
          if (found) {
            setRealProperty(found);
            return;
          }
        }

        // If not found in properties, check packages as well
        const pkgs = await getCMSPackages();
        if (pkgs && pkgs.length > 0) {
          const foundPkg = pkgs.find((p: any) => String(p.id || p.$id) === idStr);
          if (foundPkg) {
            setRealPackage(foundPkg);
          }
        }
      } catch (e) {
        console.log('Error fetching item document in checkout:', e);
      }
    }
    fetchRealItem();
  }, [params.id, params.bookingType]);

  const bookingType = (params.bookingType as string) || 'hotel';
  const isPackageCheckout = bookingType === 'package';
  const pkgId = (params.id as string) || realPackage?.id || realProperty?.$id || 'pkg-1';
  const itemTitle =
    (params.packageTitle as string) ||
    realPackage?.title ||
    realProperty?.propertyName ||
    realProperty?.title ||
    (isPackageCheckout ? 'Selected Tour Package' : 'Selected Hotel Stay');
  const location =
    (params.location as string) ||
    realPackage?.location ||
    realProperty?.location ||
    (realProperty?.city ? `${realProperty.city}, ${realProperty.state || ''}` : '') ||
    'Uttarakhand, India';
  const departureCity = (params.departureCity as string) || 'Haldwani';

  const selectedPackagePhoto =
    (Array.isArray(realPackage?.images) && realPackage.images.length > 0 && realPackage.images[0]) ||
    realPackage?.image ||
    null;

  const selectedHotelPhoto =
    (Array.isArray(realProperty?.photos) && realProperty.photos.length > 0 && realProperty.photos[0]) ||
    (Array.isArray(realProperty?.images) && realProperty.images.length > 0 && realProperty.images[0]) ||
    realProperty?.image ||
    null;

  // Selected package's exact image: priority given to params.image, then fetched package image, then fallback
  const image =
    (params.image as string) ||
    (isPackageCheckout ? selectedPackagePhoto : selectedHotelPhoto) ||
    selectedPackagePhoto ||
    selectedHotelPhoto ||
    (isPackageCheckout ? REAL_PACKAGE_IMAGE : REAL_STAY_IMAGE);
  const roomName = (params.roomName as string) || 'Standard Room';

  const initialGuests = Number(params.guests || 2);
  const nightsCount = Math.max(1, Number(params.nights || 1));
  const roomsCount = Math.max(1, Number(params.rooms || 1));

  const [defaultDates] = useState(() => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 86400000);
    return {
      in: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      out: tomorrow.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
  });

  const checkIn = (params.checkIn as string) || defaultDates.in;
  const checkOut = (params.checkOut as string) || defaultDates.out;

  const baseRate = Number(params.totalPrice) > 0
    ? Number(params.totalPrice)
    : Number(realProperty?.price || realProperty?.startingPrice || 0) * nightsCount * roomsCount;

  // Active Checkout Step & Scroll References
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const scrollRef = useRef<ScrollView>(null);
  const guestSectionY = useRef<number>(0);
  const addonsSectionY = useRef<number>(0);
  const paymentSectionY = useRef<number>(0);

  const scrollToStep = (step: 1 | 2 | 3) => {
    setActiveStep(step);
    if (step === 1) {
      scrollRef.current?.scrollTo({ y: Math.max(0, guestSectionY.current - 20), animated: true });
    } else if (step === 2) {
      scrollRef.current?.scrollTo({ y: Math.max(0, addonsSectionY.current - 20), animated: true });
    } else if (step === 3) {
      scrollRef.current?.scrollTo({ y: Math.max(0, paymentSectionY.current - 20), animated: true });
    }
  };

  // Real Guest Details State (Default to logged-in user, no dummy names)
  const initialFullName = (profile?.name || user?.name || '').trim();
  const initialParts = initialFullName ? initialFullName.split(' ') : [];
  const [firstName, setFirstName] = useState(initialParts[0] || '');
  const [lastName, setLastName] = useState(initialParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || user?.phone || '');

  // Country, State and Phone Dial Code
  const defaultCountry = COUNTRIES.find((c) => c.name === 'India') || COUNTRIES[0];
  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(defaultCountry);
  const [phoneCountry, setPhoneCountry] = useState<CountryItem>(defaultCountry);
  const [stateProvince, setStateProvince] = useState('');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isPhoneCountryModalOpen, setIsPhoneCountryModalOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [phoneCountrySearchQuery, setPhoneCountrySearchQuery] = useState('');

  // Additional Requests
  const [isAdditionalRequestsExpanded, setIsAdditionalRequestsExpanded] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('02:00 PM - 04:00 PM');
  const [isArrivalTimePickerOpen, setIsArrivalTimePickerOpen] = useState(false);
  const [smokingPreference, setSmokingPreference] = useState<'Non-smoking' | 'Smoking'>('Non-smoking');
  const [airportPickupRequired, setAirportPickupRequired] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  // Additional Travelers (for multiple guests)
  interface TravelerData {
    fullName: string;
    gender: string;
    dateOfBirth: string;
  }
  const extraGuestsCount = Math.max(0, initialGuests - 1);
  const [isTravelersExpanded, setIsTravelersExpanded] = useState(false);
  const [travelersData, setTravelersData] = useState<TravelerData[]>([]);

  const additionalTravelers: TravelerData[] = Array.from(
    { length: extraGuestsCount },
    (_, i) => travelersData[i] || { fullName: '', gender: '', dateOfBirth: '' }
  );

  const updateTraveler = (index: number, field: 'fullName' | 'gender' | 'dateOfBirth', value: string) => {
    setTravelersData((prev) => {
      const updated = Array.from(
        { length: extraGuestsCount },
        (_, i) => prev[i] || { fullName: '', gender: '', dateOfBirth: '' }
      );
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const userIdentifier = user?.$id || profile?.$id || '';
  const [syncedUserId, setSyncedUserId] = useState(userIdentifier);

  if (userIdentifier && userIdentifier !== syncedUserId) {
    setSyncedUserId(userIdentifier);
    const fullName = (profile?.name || user?.name || '').trim();
    const parts = fullName ? fullName.split(' ') : [];
    setFirstName(parts[0] || '');
    setLastName(parts.slice(1).join(' ') || '');
    setEmail(profile?.email || user?.email || '');
    setPhone(profile?.phone || user?.phone || '');
  }

  // Selected Add-ons (Clean start)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Resolve dynamic property addons (only visible if venue owner added them in dashboard)
  const propertyAddons: AddonType[] = realProperty?.addons
    ? (Array.isArray(realProperty.addons)
        ? realProperty.addons.map((a: any) => {
            if (typeof a === 'string') {
              try {
                return JSON.parse(a);
              } catch {
                return null;
              }
            }
            return a;
          }).filter(Boolean)
        : [])
    : [];

  const activeAddonsList: AddonType[] = propertyAddons;

  // Promo Code State (Clean start)
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Razorpay Gateway Sheet State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [selectedRazorpayOption, setSelectedRazorpayOption] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [isRazorpayProcessing, setIsRazorpayProcessing] = useState(false);
  const [isRazorpayWebViewVisible, setIsRazorpayWebViewVisible] = useState(false);

  // Custom Validation & Feedback Modal State
  const [validationModal, setValidationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    missingFields?: string[];
    actionText?: string;
    onAction?: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // Calculations: Addons Total using User Portal per-person logic (Packages don't have add-ons)
  const addonsTotal = isPackageCheckout
    ? 0
    : selectedAddons.reduce((sum, id) => {
        const item = activeAddonsList.find((a) => (a.id || a.$id) === id);
        if (!item) return sum;
        const isPerPerson = typeof item.description === 'string' && item.description.toLowerCase().includes('per person');
        const price = (Number(item.price) || 0) * (isPerPerson ? initialGuests : 1);
        return sum + price;
      }, 0);

  const perNightTariff = isPackageCheckout
    ? (baseRate > 0 ? baseRate : 3500)
    : (baseRate > 0 ? Math.round(baseRate / (roomsCount * nightsCount)) : 3500);
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const gstCalc = calculateHotelGST(
    perNightTariff,
    isPackageCheckout ? 1 : nightsCount,
    isPackageCheckout ? 1 : roomsCount,
    addonsTotal,
    discountAmount,
    isPackageCheckout
  );

  const roomChargesSubtotal = gstCalc.roomAmount;
  const gstTax = gstCalc.gstAmount;
  const grandTotal = gstCalc.totalAmount;

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    if (code === 'RACOONN1000') {
      setAppliedCoupon({ code: 'RACOONN1000', discount: 1000 });
      setCouponError('');
      setCouponInput('');
    } else if (code === 'WELCOME500') {
      setAppliedCoupon({ code: 'WELCOME500', discount: 500 });
      setCouponError('');
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try RACOONN1000 or WELCOME500');
    }
  };



  const addQuickRequest = (chipText: string) => {
    if (specialRequests.includes(chipText)) return;
    setSpecialRequests((prev) => (prev ? `${prev}, ${chipText}` : chipText));
  };

  const handleOpenRazorpay = async () => {
    if (!user?.$id) {
      setValidationModal({
        visible: true,
        title: 'Sign In Required',
        message: 'Please sign in to your account before confirming your reservation.',
        actionText: 'Sign In Now',
        onAction: () => {
          setValidationModal((prev) => ({ ...prev, visible: false }));
          router.push('/auth/login' as any);
        },
      });
      return;
    }

    const missing: string[] = [];
    if (!firstName.trim()) missing.push('Primary First Name');
    if (!lastName.trim()) missing.push('Primary Last Name');
    if (!email.trim()) missing.push('Primary Email Address');
    if (!phone.trim()) missing.push('Primary Mobile Phone Number');

    // For tour packages, validate all additional travelers have name, gender & DOB (matching User portal)
    if (isPackageCheckout && additionalTravelers.length > 0) {
      additionalTravelers.forEach((t, idx) => {
        if (!t.fullName.trim()) missing.push(`Traveler ${idx + 2} Full Name`);
        if (!t.gender.trim()) missing.push(`Traveler ${idx + 2} Gender`);
        if (!t.dateOfBirth.trim()) missing.push(`Traveler ${idx + 2} Date of Birth`);
      });
    }

    if (missing.length > 0) {
      setValidationModal({
        visible: true,
        title: 'Incomplete Details',
        message: 'Please complete all required guest and traveler details.',
        missingFields: missing,
        actionText: 'Complete Details',
        onAction: () => {
          setValidationModal((prev) => ({ ...prev, visible: false }));
          scrollToStep(1);
        },
      });
      return;
    }

    // Pre-checkout room availability verification for hotel bookings
    if (!isPackageCheckout) {
      try {
        const avail = await checkRoomAvailability(pkgId, checkIn, checkOut, roomsCount, roomName);
        if (!avail.isAvailable) {
          Alert.alert(
            'Room Unavailable',
            avail.message || `Sorry, the selected room is no longer available for these dates (${checkIn} - ${checkOut}). Please modify dates or room count.`
          );
          return;
        }
      } catch (err) {
        console.warn('Room availability check warning:', err);
      }
    }

    setIsRazorpayModalOpen(true);
  };

  const handleExecuteRazorpayPayment = () => {
    setIsRazorpayModalOpen(false);
    setIsRazorpayWebViewVisible(true);
  };

  const handleRazorpaySuccess = async (data: RazorpaySuccessData) => {
    setIsRazorpayWebViewVisible(false);
    setIsRazorpayProcessing(true);
    try {
      const selectedAddonsList = selectedAddons.map((id) => {
        const item = activeAddonsList.find((a) => (a.id || a.$id) === id);
        const isPerPerson = typeof item?.description === 'string' && item.description.toLowerCase().includes('per person');
        const itemPrice = (Number(item?.price) || 0) * (isPerPerson ? initialGuests : 1);
        return {
          title: item?.title || item?.name || 'Add-on',
          price: itemPrice,
        };
      });

      let finalSpecialRequests = specialRequests.trim();
      if (isPackageCheckout && departureCity) {
        finalSpecialRequests = `Departure City: ${departureCity}${finalSpecialRequests ? `\n${finalSpecialRequests}` : ''}`;
      }
      if (arrivalTime) finalSpecialRequests += `\nArrival Time: ${arrivalTime}`;
      if (smokingPreference) finalSpecialRequests += `\nSmoking Preference: ${smokingPreference}`;
      if (airportPickupRequired) finalSpecialRequests += `\nAirport Pickup: Requested (+ Additional charges apply)`;
      if (selectedAddonsList.length > 0) {
        finalSpecialRequests += `\nAdd-ons: ${selectedAddonsList.map((a) => `${a.title} (₹${a.price})`).join(', ')}`;
      }
      if (additionalTravelers.some((t) => t.fullName.trim())) {
        finalSpecialRequests +=
          `\n\n--- Additional Travelers ---` +
          additionalTravelers
            .filter((t) => t.fullName.trim())
            .map((t, idx) => `\nGuest ${idx + 1}: ${t.fullName} (${t.gender || 'Not specified'}, DOB: ${t.dateOfBirth || 'N/A'})`)
            .join('');
      }

      const bookingId = await createBooking({
        userId: user!.$id,
        hotelId: pkgId,
        roomId: (params.roomId as string) || (params.roomName as string) || roomName,
        roomName: roomName,
        hotelName: itemTitle,
        hotelLocation: location,
        hotelImage: image,
        checkIn,
        checkOut,
        nights: nightsCount,
        rooms: roomsCount,
        adults: initialGuests,
        guest: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: `${phoneCountry.dialCode} ${phone.trim()}`,
          country: selectedCountry.name,
          state: stateProvince.trim(),
          specialRequests: finalSpecialRequests.trim(),
        },
        payment: {
          roomPrice: baseRate,
          taxes: gstTax,
          serviceFees: addonsTotal,
          discount: discountAmount,
          totalAmount: grandTotal,
        },
      });

      setIsRazorpayProcessing(false);

      // Trigger local push notification for booking confirmation
      sendLocalNotification({
        title: '🎉 Booking Confirmed!',
        body: `Your reservation for ${itemTitle} is confirmed! Ref: #${bookingId.substring(0, 8).toUpperCase()}`,
        data: { url: '/(tabs)/profile' },
      });

      router.replace({
        pathname: '/booking-success' as any,
        params: {
          bookingId: bookingId.substring(0, 8).toUpperCase(),
          itemTitle,
          amount: grandTotal,
          guestName: `${firstName} ${lastName}`,
          email,
        },
      });
    } catch (error) {
      console.error('Failed to create booking after payment:', error);
      setIsRazorpayProcessing(false);
      Alert.alert(
        'Booking Confirmation Alert',
        `Payment was successful (Payment ID: ${data.razorpay_payment_id}), but saving your booking encountered an issue. Please contact support with this reference.`
      );
    }
  };

  const handleRazorpayFailure = (error?: { description?: string }) => {
    setIsRazorpayWebViewVisible(false);
    setIsRazorpayProcessing(false);
  };

  const handleRazorpayClose = () => {
    setIsRazorpayWebViewVisible(false);
    setIsRazorpayProcessing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.brand.navy} />

      {/* Top Professional Header */}
      <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 14) }]}>
        <TouchableOpacity style={styles.backCircleBtn} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={20} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Review & Confirm</Text>
          <View style={styles.sslBadgeRow}>
            <Lock color={Colors.brand.coral} size={11} />
            <Text style={styles.sslBadgeText}>256-BIT ENCRYPTED CHECKOUT</Text>
          </View>
        </View>

        <View style={styles.trustShieldCircle}>
          <ShieldCheck color={Colors.brand.coral} size={20} />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Step Indicator Tabs */}
        {isPackageCheckout ? (
          <View style={styles.roomStepperCard}>
            <View style={styles.roomStepperWrapper}>
              <View style={styles.roomStepperLinesLayer}>
                <View style={[styles.roomConnectorSegment, { left: '16.6%', width: '33.3%', backgroundColor: Colors.brand.coral }]} />
                <View style={[styles.roomConnectorSegment, { left: '50%', width: '33.3%', backgroundColor: '#E2E8F0' }]} />
              </View>

              <View style={styles.roomStepsRow}>
                {/* Step 1: Package Selected */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleCompleted}>
                    <Check color="#FFFFFF" size={13} strokeWidth={2.8} />
                  </View>
                  <Text style={styles.roomStepLabelActive} numberOfLines={1}>Package Selected</Text>
                </View>

                {/* Step 2: Guest Details (Active) */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleActive}>
                    <View style={styles.roomStepInnerDot} />
                  </View>
                  <Text style={styles.roomStepLabelActive} numberOfLines={1}>Guest Details</Text>
                </View>

                {/* Step 3: Confirmation (Upcoming) */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleInactive}>
                    <Text style={styles.roomStepNumberText}>3</Text>
                  </View>
                  <Text style={styles.roomStepLabelInactive} numberOfLines={1}>Confirmation</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.roomStepperCard}>
            <View style={styles.roomStepperWrapper}>
              {/* Connecting Lines Layer behind circles */}
              <View style={styles.roomStepperLinesLayer}>
                <View style={[styles.roomConnectorSegment, { left: '12.5%', width: '25%', backgroundColor: Colors.brand.coral }]} />
                <View style={[styles.roomConnectorSegment, { left: '37.5%', width: '25%', backgroundColor: Colors.brand.coral }]} />
                <View style={[styles.roomConnectorSegment, { left: '62.5%', width: '25%', backgroundColor: '#E2E8F0' }]} />
              </View>

              {/* 4 Step Items */}
              <View style={styles.roomStepsRow}>
                {/* Step 1: Hotel Selected */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleCompleted}>
                    <Check color="#FFFFFF" size={13} strokeWidth={2.8} />
                  </View>
                  <Text style={styles.roomStepLabelActive} numberOfLines={1}>Hotel Selected</Text>
                </View>

                {/* Step 2: Room Selected */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleCompleted}>
                    <Check color="#FFFFFF" size={13} strokeWidth={2.8} />
                  </View>
                  <Text style={styles.roomStepLabelActive} numberOfLines={1}>Room Selected</Text>
                </View>

                {/* Step 3: Guest Details (Active) */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleActive}>
                    <View style={styles.roomStepInnerDot} />
                  </View>
                  <Text style={styles.roomStepLabelActive} numberOfLines={1}>Guest Details</Text>
                </View>

                {/* Step 4: Confirmation (Upcoming) */}
                <View style={styles.roomStepItem}>
                  <View style={styles.roomStepCircleInactive}>
                    <Text style={styles.roomStepNumberText}>4</Text>
                  </View>
                  <Text style={styles.roomStepLabelInactive} numberOfLines={1}>Confirmation</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Reservation Hero Card */}
        <View style={styles.reservationCard}>
          <View style={styles.reservationTopRow}>
            <Image
              source={{ uri: image }}
              style={styles.propertyThumb}
            />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.tagPillRow}>
                <View style={styles.verifiedTagPill}>
                  <Zap color="#047857" size={10} />
                  <Text style={styles.verifiedTagText}>INSTANT CONFIRMATION</Text>
                </View>
                <View style={styles.starRatingPill}>
                  <Star color="#F59E0B" fill="#F59E0B" size={10} />
                  <Text style={styles.starRatingText}>
                    {Number(params.rating || realProperty?.rating || 0) > 0
                      ? Number(params.rating || realProperty?.rating).toFixed(1)
                      : 'New'}
                  </Text>
                </View>
              </View>

              <Text style={styles.reservationTitle} numberOfLines={2}>{itemTitle}</Text>
              <View style={styles.locationMeta}>
                <MapPin color="#64748B" size={12} style={{ marginRight: 4 }} />
                <Text style={styles.locationText}>{location}</Text>
              </View>
            </View>
          </View>

          <View style={styles.reservationDivider} />

          {/* Date & Traveler Info */}
          {isPackageCheckout ? (
            <View style={styles.reservationGrid}>
              <View style={styles.gridBox}>
                <MapPin color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={styles.gridLabel}>DEPARTURE CITY</Text>
                  <Text style={styles.gridVal} numberOfLines={1}>
                    {typeof departureCity === 'string' ? departureCity : ((departureCity as any)?.cityName || 'Haldwani')}
                  </Text>
                </View>
              </View>

              <View style={styles.gridBox}>
                <Calendar color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>START DATE</Text>
                  <Text style={styles.gridVal}>{checkIn}</Text>
                </View>
              </View>

              <View style={styles.gridBox}>
                <Users color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>TRAVELERS</Text>
                  <Text style={styles.gridVal}>{initialGuests} {initialGuests === 1 ? 'Guest' : 'Guests'}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.reservationGrid}>
              <View style={styles.gridBox}>
                <Calendar color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>CHECK-IN</Text>
                  <Text style={styles.gridVal}>{checkIn}</Text>
                </View>
              </View>

              <View style={styles.gridBox}>
                <Calendar color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>CHECK-OUT</Text>
                  <Text style={styles.gridVal}>{checkOut}</Text>
                </View>
              </View>

              <View style={styles.gridBox}>
                <Users color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>TRAVELERS</Text>
                  <Text style={styles.gridVal}>{initialGuests} Adult Guests</Text>
                </View>
              </View>

              <View style={styles.gridBox}>
                <BedDouble color={Colors.brand.coral} size={16} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.gridLabel}>ROOM TYPE</Text>
                  <Text style={styles.gridVal}>{roomName}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Section 1: Guest Information (Matching User Portal GuestDetailsForm) */}
        <View style={styles.sectionCard} onLayout={(e) => { guestSectionY.current = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <User color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Guest Details</Text>
              <Text style={styles.sectionSubTitle}>Used for instant confirmation voucher & check-in</Text>
            </View>
          </View>

          <View style={styles.inputTwoColumn}>
            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="John"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
            </View>

            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Last Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Doe"
                  placeholderTextColor="#94A3B8"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email Address * (For Confirmation PDF)</Text>
            <View style={styles.inputWrapper}>
              <Mail color="#64748B" size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="john.doe@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Phone Number with Country Flag & Dial Code Dropdown */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.phoneDialCodeBtn}
                onPress={() => setIsPhoneCountryModalOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.phoneFlagText}>{phoneCountry.flag}</Text>
                <Text style={styles.phoneDialCodeText}>{phoneCountry.dialCode}</Text>
                <ChevronDown color="#64748B" size={14} />
              </TouchableOpacity>

              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.textInput}
                  placeholder={phoneCountry.dialCode === '+1' ? '(555) 000-0000' : phoneCountry.dialCode === '+91' ? '98765 43210' : '555 000 0000'}
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(val) => setPhone(formatPhoneNumber(val, phoneCountry.dialCode))}
                />
              </View>
            </View>
          </View>

          {/* State / Province */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>State / Province</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Maharashtra"
                placeholderTextColor="#94A3B8"
                value={stateProvince}
                onChangeText={setStateProvince}
              />
            </View>
          </View>

          {/* Country / Region Picker Button */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Country / Region</Text>
            <TouchableOpacity
              style={styles.countryPickerBtn}
              onPress={() => setIsCountryModalOpen(true)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MapPin color="#64748B" size={16} />
                <Text style={styles.countryPickerFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryPickerName}>{selectedCountry.name}</Text>
              </View>
              <ChevronDown color="#64748B" size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Additional Requests (Only for Hotel Stays, NOT for packages) */}
        {!isPackageCheckout && (
          <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.accordionHeaderBtn}
            activeOpacity={0.8}
            onPress={() => setIsAdditionalRequestsExpanded((prev) => !prev)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={styles.sectionIconBg}>
                <MessageSquare color={Colors.brand.coral} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Additional Requests</Text>
                <Text style={styles.sectionSubTitle}>Arrival time, smoking preference, and special requests</Text>
              </View>
            </View>
            <ChevronDown
              color="#64748B"
              size={18}
              style={{ transform: [{ rotate: isAdditionalRequestsExpanded ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {isAdditionalRequestsExpanded && (
            <View style={styles.accordionContentContainer}>
              {/* Estimated Arrival Time Picker */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Arrival Time</Text>
                <TouchableOpacity
                  style={styles.arrivalTimeBtn}
                  onPress={() => setIsArrivalTimePickerOpen(true)}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Clock color="#64748B" size={16} />
                    <Text style={styles.arrivalSelectedText}>{arrivalTime || 'Select Arrival Time'}</Text>
                  </View>
                  <ChevronDown color="#64748B" size={16} />
                </TouchableOpacity>
              </View>

              {/* Smoking Preference */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Smoking Preference</Text>
                <View style={styles.smokingRadioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.smokingRadioOption,
                      smokingPreference === 'Non-smoking' && styles.smokingRadioOptionActive,
                    ]}
                    onPress={() => setSmokingPreference('Non-smoking')}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        smokingPreference === 'Non-smoking' && styles.radioCircleActive,
                      ]}
                    >
                      {smokingPreference === 'Non-smoking' && <View style={styles.radioInnerDot} />}
                    </View>
                    <Text
                      style={[
                        styles.smokingOptionText,
                        smokingPreference === 'Non-smoking' && styles.smokingOptionTextActive,
                      ]}
                    >
                      Non-smoking
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.smokingRadioOption,
                      smokingPreference === 'Smoking' && styles.smokingRadioOptionActive,
                    ]}
                    onPress={() => setSmokingPreference('Smoking')}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        smokingPreference === 'Smoking' && styles.radioCircleActive,
                      ]}
                    >
                      {smokingPreference === 'Smoking' && <View style={styles.radioInnerDot} />}
                    </View>
                    <Text
                      style={[
                        styles.smokingOptionText,
                        smokingPreference === 'Smoking' && styles.smokingOptionTextActive,
                      ]}
                    >
                      Smoking
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Special Requests textarea */}
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Special Requests (Optional)</Text>
                <TextInput
                  style={[styles.inputWrapper, { height: 85, textAlignVertical: 'top', paddingTop: 10 }]}
                  multiline
                  placeholder="e.g. Quiet room, high floor, anniversary celebration..."
                  placeholderTextColor="#94A3B8"
                  value={specialRequests}
                  onChangeText={setSpecialRequests}
                />

                {/* Quick Request Chips */}
                <View style={styles.quickChipsRow}>
                  {QUICK_REQUEST_CHIPS.map((chip, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.quickChipBtn}
                      onPress={() => addQuickRequest(chip)}
                    >
                      <Plus color={Colors.brand.navy} size={11} style={{ marginRight: 3 }} />
                      <Text style={styles.quickChipText}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Airport Pickup Required Card */}
              <TouchableOpacity
                style={[
                  styles.airportPickupCard,
                  airportPickupRequired && styles.airportPickupCardActive,
                ]}
                activeOpacity={0.85}
                onPress={() => setAirportPickupRequired((prev) => !prev)}
              >
                <View
                  style={[
                    styles.airportCheckbox,
                    airportPickupRequired && styles.airportCheckboxActive,
                  ]}
                >
                  {airportPickupRequired && <Check color="#FFFFFF" size={13} strokeWidth={3} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.airportPickupTitle}>Airport Pickup Required</Text>
                  <Text style={styles.airportPickupSubtitle}>
                    We will contact you to arrange the details. Additional charges may apply.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

        {/* Section: Traveler Information (Matching User Portal TravelersForm for extra guests) */}
        {extraGuestsCount > 0 && (
          <View style={styles.sectionCard}>
            <TouchableOpacity
              style={styles.accordionHeaderBtn}
              activeOpacity={0.8}
              onPress={() => setIsTravelersExpanded((prev) => !prev)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={styles.sectionIconBg}>
                  <Users color={Colors.brand.coral} size={18} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>Traveler Information</Text>
                  <Text style={styles.sectionSubTitle}>
                    Details for {extraGuestsCount} additional guest{extraGuestsCount > 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <ChevronDown
                color="#64748B"
                size={18}
                style={{ transform: [{ rotate: isTravelersExpanded ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>

            {isTravelersExpanded && (
              <View style={styles.accordionContentContainer}>
                {additionalTravelers.map((traveler, index) => (
                  <View key={index} style={styles.travelerCard}>
                    <View style={styles.travelerHeaderRow}>
                      <View style={styles.travelerNumberBadge}>
                        <Text style={styles.travelerNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.travelerHeaderTitle}>Guest {index + 1}</Text>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Full Name</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="Full Name"
                          placeholderTextColor="#94A3B8"
                          value={traveler.fullName}
                          onChangeText={(val) => updateTraveler(index, 'fullName', val)}
                        />
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Gender</Text>
                      <View style={styles.genderButtonGroup}>
                        {['Male', 'Female', 'Other'].map((g) => {
                          const isSelected = traveler.gender === g;
                          return (
                            <TouchableOpacity
                              key={g}
                              style={[styles.genderBtn, isSelected && styles.genderBtnActive]}
                              onPress={() => updateTraveler(index, 'gender', g)}
                              activeOpacity={0.8}
                            >
                              <Text style={[styles.genderBtnText, isSelected && styles.genderBtnTextActive]}>
                                {g}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Date of Birth</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="DD/MM/YYYY"
                          placeholderTextColor="#94A3B8"
                          value={traveler.dateOfBirth}
                          onChangeText={(val) => updateTraveler(index, 'dateOfBirth', val)}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Section 3: Curated Add-ons & Experiences (Only for Hotel Stays when added by owner, NOT for packages) */}
        {!isPackageCheckout && activeAddonsList.length > 0 && (
          <View style={styles.sectionCard} onLayout={(e) => { addonsSectionY.current = e.nativeEvent.layout.y; }}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionIconBg}>
                <Zap color={Colors.brand.coral} size={18} />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Enhance Your Stay</Text>
                <Text style={styles.sectionSubTitle}>Select premium add-ons for a better experience</Text>
              </View>
            </View>

            <View style={styles.addonsGridContainer}>
              {activeAddonsList.map((addon, index) => {
                const addonId = addon.id || addon.$id || `addon-${index}`;
                const addonTitle = addon.title || addon.name || 'Add-on Service';
                const isSelected = selectedAddons.includes(addonId);
                const Icon = getIconForTitle(addonTitle);
                const isPerPerson = typeof addon.description === 'string' && addon.description.toLowerCase().includes('per person');
                const displayBasePrice = Number(addon.price) || 0;
                const totalAddonPrice = isPerPerson ? displayBasePrice * initialGuests : displayBasePrice;

                return (
                  <TouchableOpacity
                    key={addonId}
                    style={[styles.portalAddonCard, isSelected && styles.portalAddonCardActive]}
                    activeOpacity={0.88}
                    onPress={() => toggleAddon(addonId)}
                  >
                    <View style={[styles.portalAddonIconBox, isSelected && styles.portalAddonIconBoxActive]}>
                      <Icon color={isSelected ? '#FFFFFF' : Colors.brand.navy} size={20} />
                    </View>

                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.portalAddonTitle}>{addonTitle}</Text>
                      {addon.description ? (
                        <Text style={styles.portalAddonDesc} numberOfLines={2}>{addon.description}</Text>
                      ) : addon.subtitle ? (
                        <Text style={styles.portalAddonDesc} numberOfLines={2}>{addon.subtitle}</Text>
                      ) : null}
                    </View>

                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', gap: 6 }}>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.portalAddonPriceText}>
                          ₹{totalAddonPrice.toLocaleString('en-IN')}
                        </Text>
                        {isPerPerson && initialGuests > 1 && (
                          <Text style={styles.portalAddonPerPersonLabel}>
                            (₹{displayBasePrice} × {initialGuests})
                          </Text>
                        )}
                      </View>

                      <View style={[styles.portalAddonCheckBadge, isSelected && styles.portalAddonCheckBadgeActive]}>
                        {isSelected ? (
                          <Check color="#FFFFFF" size={13} strokeWidth={2.8} />
                        ) : (
                          <Plus color="#94A3B8" size={13} strokeWidth={2.8} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Section 4: Promo Code & Discounts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <Tag color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Exclusive Promo Code</Text>
              <Text style={styles.sectionSubTitle}>Apply coupon for instant savings on this booking</Text>
            </View>
          </View>

          {appliedCoupon ? (
            <View style={styles.activeDiscountBanner}>
              <View style={styles.discountBadgeIcon}>
                <Gift color="#047857" size={20} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.discountCodeText}>{appliedCoupon.code} APPLIED!</Text>
                <Text style={styles.discountSubText}>You save ₹{appliedCoupon.discount} on this reservation</Text>
              </View>
              <TouchableOpacity onPress={() => setAppliedCoupon(null)}>
                <Text style={styles.removeDiscountBtn}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.promoInputRow}>
              <TextInput
                style={[styles.inputWrapper, { flex: 1, height: 44 }]}
                placeholder="Enter Promo Code (e.g. RACOONN1000)"
                placeholderTextColor="#94A3B8"
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyPromoBtn} onPress={() => handleApplyCoupon()}>
                <Text style={styles.applyPromoBtnText}>Apply Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {couponError ? <Text style={styles.errorAlertText}>{couponError}</Text> : null}
        </View>

        {/* Section 5: Itemized Price Summary */}
        <View style={styles.sectionCard} onLayout={(e) => { paymentSectionY.current = e.nativeEvent.layout.y; }}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.priceRowItem}>
            <Text style={styles.priceRowLabel}>
              {isPackageCheckout
                ? 'Package Price (Stays + Food + Activities)'
                : `Room Charges (${roomsCount} Room × ${nightsCount} Night)`}
            </Text>
            <Text style={styles.priceRowVal}>₹{roomChargesSubtotal.toLocaleString('en-IN')}</Text>
          </View>

          {!isPackageCheckout && addonsTotal > 0 && (
            <View style={styles.priceRowItem}>
              <Text style={styles.priceRowLabel}>Selected Add-ons ({selectedAddons.length})</Text>
              <Text style={styles.priceRowVal}>+₹{addonsTotal.toLocaleString('en-IN')}</Text>
            </View>
          )}

          <View style={styles.priceRowItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.priceRowLabel}>
                GST ({gstCalc.gstRate}%)
              </Text>
              <View style={styles.gstBadgePill}>
                <Text style={styles.gstBadgeText}>GST Extra</Text>
              </View>
            </View>
            <Text style={styles.priceRowVal}>+₹{gstTax.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.gstItcNoteText}>
            {gstCalc.itcNote}
          </Text>

          {discountAmount > 0 && (
            <View style={styles.priceRowItem}>
              <Text style={[styles.priceRowLabel, { color: '#059669', fontWeight: '800' }]}>
                Promo Discount ({appliedCoupon?.code})
              </Text>
              <Text style={[styles.priceRowVal, { color: '#059669', fontWeight: '900' }]}>
                -₹{discountAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.summaryLineDivider} />

          <View style={styles.finalTotalRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.finalTotalHeading}>Grand Total</Text>
              <Text style={[styles.finalTotalSub, { fontSize: 10.5, color: '#64748B', marginTop: 2 }]}>
                {isPackageCheckout
                  ? 'GST calculated according to Government of India tour package tax regulations (18% GST).'
                  : 'GST calculated according to Government of India hotel accommodation tax rules.'}
              </Text>
            </View>
            <Text style={styles.finalTotalAmount}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Section 6: Cancellation Policy */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <FileText color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 4 }}>
            {isPackageCheckout ? (
              <>
                <View style={styles.policyBulletRow}>
                  <CheckCircle2 color="#16A34A" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    After booking, you can request a full refund if you cancel within 48 hours.
                  </Text>
                </View>

                <View style={styles.policyBulletRow}>
                  <Clock color="#E86A70" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    Cancellations made after 48 hours will be subject to the tour operator’s cancellation policy.
                  </Text>
                </View>

                <View style={styles.policyBulletRow}>
                  <Mail color="#0F172A" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    To request a cancellation, please contact us by email.
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.policyBulletRow}>
                  <CheckCircle2 color="#16A34A" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    Free cancellation within 48 hours of booking, if check-in is at least 24 hours away.
                  </Text>
                </View>

                <View style={styles.policyBulletRow}>
                  <Clock color="#E86A70" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    Later cancellations depend on the property’s cancellation policy.
                  </Text>
                </View>

                <View style={styles.policyBulletRow}>
                  <Mail color="#0F172A" size={14} style={{ marginTop: 2 }} />
                  <Text style={styles.policyBulletText}>
                    Contact us by email for cancellation requests.
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Sticky CTA */}
      <View style={[styles.bottomStickyBar, { paddingBottom: bottomBarPadding }]}>
        <View>
          <Text style={styles.bottomPriceSub}>Total Amount</Text>
          <Text style={styles.bottomPriceMain}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          style={styles.payConfirmCTA}
          activeOpacity={0.9}
          onPress={handleOpenRazorpay}
        >
          <Text style={styles.payConfirmCTAText}>Pay & Confirm</Text>
          <ArrowRight color="#FFFFFF" size={16} />
        </TouchableOpacity>
      </View>

      {/* Official Razorpay Payment Gateway Checkout Modal Sheet Window */}
      <Modal
        visible={isRazorpayModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (!isRazorpayProcessing) setIsRazorpayModalOpen(false);
        }}
      >
        <TouchableWithoutFeedback onPress={() => !isRazorpayProcessing && setIsRazorpayModalOpen(false)}>
          <View style={styles.razorpayOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.razorpayCardWindow, { paddingBottom: Math.max(insets.bottom + 20, Platform.OS === 'android' ? 48 : 28) }]}>
                {/* Razorpay Official Header */}
                <View style={styles.razorpayHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.razorpayBrandRow}>
                      <View style={styles.razorpayLogoSquare}>
                        <Text style={styles.razorpayLogoLetter}>R</Text>
                      </View>
                      <Text style={styles.razorpayBrandTitle}>RAZORPAY</Text>
                      <View style={styles.razorpaySecurePill}>
                        <Lock color="#10B981" size={10} />
                        <Text style={styles.razorpaySecureText}>SECURED</Text>
                      </View>
                    </View>

                    <Text style={styles.razorpayMerchantName}>Racoonn Travel Pvt Ltd</Text>
                    <Text style={styles.razorpayOrderDesc}>{itemTitle}</Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <TouchableOpacity
                      style={styles.razorpayCloseCircle}
                      onPress={() => !isRazorpayProcessing && setIsRazorpayModalOpen(false)}
                    >
                      <X color="#94A3B8" size={16} />
                    </TouchableOpacity>

                    <Text style={styles.razorpayAmountLabel}>AMOUNT TO PAY</Text>
                    <Text style={styles.razorpayAmountVal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {isRazorpayProcessing ? (
                  <View style={styles.razorpayProcessingContainer}>
                    <ActivityIndicator size="large" color={Colors.brand.coral} />
                    <Text style={styles.razorpayProcessingTitle}>Processing Secure Payment...</Text>
                    <Text style={styles.razorpayProcessingSub}>Connecting to Razorpay Bank Gateway</Text>
                  </View>
                ) : (
                  <View style={styles.razorpayOptionsContainer}>
                    <Text style={styles.razorpaySelectLabel}>SELECT PAYMENT METHOD</Text>

                    {/* Option 1: UPI */}
                    <TouchableOpacity
                      style={[styles.razorpayOptionRow, selectedRazorpayOption === 'upi' && styles.razorpayOptionRowActive]}
                      onPress={() => setSelectedRazorpayOption('upi')}
                    >
                      <QrCode color={Colors.brand.coral} size={20} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.razorpayOptionTitle}>UPI / QR Code</Text>
                        <Text style={styles.razorpayOptionSub}>Google Pay, PhonePe, Paytm, BHIM</Text>
                      </View>
                      <View style={[styles.razorpayRadio, selectedRazorpayOption === 'upi' && styles.razorpayRadioActive]} />
                    </TouchableOpacity>

                    {/* Option 2: Cards */}
                    <TouchableOpacity
                      style={[styles.razorpayOptionRow, selectedRazorpayOption === 'card' && styles.razorpayOptionRowActive]}
                      onPress={() => setSelectedRazorpayOption('card')}
                    >
                      <CreditCard color={Colors.brand.coral} size={20} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.razorpayOptionTitle}>Cards (Credit / Debit)</Text>
                        <Text style={styles.razorpayOptionSub}>Visa, MasterCard, RuPay, Maestro</Text>
                      </View>
                      <View style={[styles.razorpayRadio, selectedRazorpayOption === 'card' && styles.razorpayRadioActive]} />
                    </TouchableOpacity>

                    {/* Option 3: Net Banking */}
                    <TouchableOpacity
                      style={[styles.razorpayOptionRow, selectedRazorpayOption === 'netbanking' && styles.razorpayOptionRowActive]}
                      onPress={() => setSelectedRazorpayOption('netbanking')}
                    >
                      <Building2 color={Colors.brand.coral} size={20} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.razorpayOptionTitle}>Net Banking</Text>
                        <Text style={styles.razorpayOptionSub}>HDFC, ICICI, SBI, Axis, Kotak & All Banks</Text>
                      </View>
                      <View style={[styles.razorpayRadio, selectedRazorpayOption === 'netbanking' && styles.razorpayRadioActive]} />
                    </TouchableOpacity>

                    {/* Option 4: Wallets & Pay Later */}
                    <TouchableOpacity
                      style={[styles.razorpayOptionRow, selectedRazorpayOption === 'wallet' && styles.razorpayOptionRowActive]}
                      onPress={() => setSelectedRazorpayOption('wallet')}
                    >
                      <Wallet color={Colors.brand.coral} size={20} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.razorpayOptionTitle}>Wallets & Pay Later</Text>
                        <Text style={styles.razorpayOptionSub}>Amazon Pay, Mobikwik, LazyPay</Text>
                      </View>
                      <View style={[styles.razorpayRadio, selectedRazorpayOption === 'wallet' && styles.razorpayRadioActive]} />
                    </TouchableOpacity>

                    {/* Execute Razorpay CTA Button */}
                    <TouchableOpacity
                      style={styles.razorpaySubmitCTA}
                      activeOpacity={0.9}
                      onPress={handleExecuteRazorpayPayment}
                    >
                      <Text style={styles.razorpaySubmitCTAText}>
                        Pay ₹{grandTotal.toLocaleString('en-IN')} via Razorpay
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Real Razorpay Web Gateway Modal */}
      <RazorpayCheckoutModal
        visible={isRazorpayWebViewVisible}
        onClose={handleRazorpayClose}
        onSuccess={handleRazorpaySuccess}
        onFailure={handleRazorpayFailure}
        amount={grandTotal}
        itemTitle={`${itemTitle} (${roomName})`}
        guestName={`${firstName} ${lastName}`.trim()}
        guestEmail={email.trim()}
        guestPhone={`${phoneCountry.dialCode}${phone.trim()}`}
        bookingId={pkgId}
        bookingType={bookingType}
        preferredMethod={selectedRazorpayOption}
      />

      {/* Booking Confirmation Loading Overlay */}
      <Modal visible={isRazorpayProcessing} transparent={true} animationType="fade">
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={Colors.brand.coral} />
            <Text style={styles.processingTitle}>Confirming Your Reservation...</Text>
            <Text style={styles.processingSub}>Payment verified with Razorpay. Saving booking details securely.</Text>
          </View>
        </View>
      </Modal>

      {/* Custom Validation & Incomplete Details Modal */}
      <Modal
        visible={validationModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setValidationModal((prev) => ({ ...prev, visible: false }))}
      >
        <TouchableWithoutFeedback onPress={() => setValidationModal((prev) => ({ ...prev, visible: false }))}>
          <View style={styles.customAlertOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.customAlertCard}>
                {/* Close Button top-right */}
                <TouchableOpacity
                  style={styles.customAlertCloseBtn}
                  onPress={() => setValidationModal((prev) => ({ ...prev, visible: false }))}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X color="#94A3B8" size={18} />
                </TouchableOpacity>

                {/* Top Glowing Icon Badge */}
                <View style={styles.customAlertIconBg}>
                  <AlertCircle color={Colors.brand.coral} size={30} strokeWidth={2.2} />
                </View>

                {/* Title */}
                <Text style={styles.customAlertTitle}>{validationModal.title}</Text>

                {/* Message */}
                <Text style={styles.customAlertMessage}>{validationModal.message}</Text>

                {/* Missing Fields List if any */}
                {validationModal.missingFields && validationModal.missingFields.length > 0 && (
                  <View style={styles.customAlertFieldsBox}>
                    <Text style={styles.customAlertFieldsBoxHeader}>REQUIRED INFORMATION:</Text>
                    {validationModal.missingFields.map((field, idx) => (
                      <View key={idx} style={styles.customAlertFieldRow}>
                        <View style={styles.customAlertFieldDot} />
                        <Text style={styles.customAlertFieldText}>{field}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action CTA */}
                <TouchableOpacity
                  style={styles.customAlertActionBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    if (validationModal.onAction) {
                      validationModal.onAction();
                    } else {
                      setValidationModal((prev) => ({ ...prev, visible: false }));
                    }
                  }}
                >
                  <Text style={styles.customAlertActionText}>
                    {validationModal.actionText || 'OK'}
                  </Text>
                  <ArrowRight color="#FFFFFF" size={16} />
                </TouchableOpacity>

                {/* Dismiss Link */}
                <TouchableOpacity
                  style={styles.customAlertDismissBtn}
                  onPress={() => setValidationModal((prev) => ({ ...prev, visible: false }))}
                >
                  <Text style={styles.customAlertDismissText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Country Selection Modal */}
      <Modal
        visible={isCountryModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCountryModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsCountryModalOpen(false)}>
          <View style={styles.selectionModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.selectionModalContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.selectionModalHeader}>
                  <Text style={styles.selectionModalTitle}>Select Country / Region</Text>
                  <TouchableOpacity
                    style={styles.selectionModalCloseBtn}
                    onPress={() => setIsCountryModalOpen(false)}
                  >
                    <X color="#94A3B8" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectionSearchBox}>
                  <Search color="#94A3B8" size={16} />
                  <TextInput
                    style={styles.selectionSearchInput}
                    placeholder="Search country..."
                    placeholderTextColor="#94A3B8"
                    value={countrySearchQuery}
                    onChangeText={setCountrySearchQuery}
                  />
                  {countrySearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setCountrySearchQuery('')}>
                      <X color="#94A3B8" size={14} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.selectionList} keyboardShouldPersistTaps="handled">
                  {COUNTRIES.filter((c) =>
                    c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
                  ).map((c) => {
                    const isSelected = selectedCountry.code === c.code;
                    return (
                      <TouchableOpacity
                        key={c.code}
                        style={[styles.selectionItemRow, isSelected && styles.selectionItemRowActive]}
                        onPress={() => {
                          setSelectedCountry(c);
                          setIsCountryModalOpen(false);
                          setCountrySearchQuery('');
                        }}
                      >
                        <Text style={styles.selectionItemFlag}>{c.flag}</Text>
                        <Text style={[styles.selectionItemText, isSelected && styles.selectionItemTextActive]}>
                          {c.name}
                        </Text>
                        {isSelected && <Check color={Colors.brand.coral} size={16} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Phone Country Code Modal */}
      <Modal
        visible={isPhoneCountryModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPhoneCountryModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsPhoneCountryModalOpen(false)}>
          <View style={styles.selectionModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.selectionModalContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.selectionModalHeader}>
                  <Text style={styles.selectionModalTitle}>Select Country Dial Code</Text>
                  <TouchableOpacity
                    style={styles.selectionModalCloseBtn}
                    onPress={() => setIsPhoneCountryModalOpen(false)}
                  >
                    <X color="#94A3B8" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectionSearchBox}>
                  <Search color="#94A3B8" size={16} />
                  <TextInput
                    style={styles.selectionSearchInput}
                    placeholder="Search country or code..."
                    placeholderTextColor="#94A3B8"
                    value={phoneCountrySearchQuery}
                    onChangeText={setPhoneCountrySearchQuery}
                  />
                  {phoneCountrySearchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setPhoneCountrySearchQuery('')}>
                      <X color="#94A3B8" size={14} />
                    </TouchableOpacity>
                  )}
                </View>

                <ScrollView style={styles.selectionList} keyboardShouldPersistTaps="handled">
                  {COUNTRIES.filter((c) =>
                    c.name.toLowerCase().includes(phoneCountrySearchQuery.toLowerCase()) ||
                    c.dialCode.includes(phoneCountrySearchQuery)
                  ).map((c) => {
                    const isSelected = phoneCountry.code === c.code;
                    return (
                      <TouchableOpacity
                        key={c.code}
                        style={[styles.selectionItemRow, isSelected && styles.selectionItemRowActive]}
                        onPress={() => {
                          setPhoneCountry(c);
                          setIsPhoneCountryModalOpen(false);
                          setPhoneCountrySearchQuery('');
                          setPhone((prev) => formatPhoneNumber(prev, c.dialCode));
                        }}
                      >
                        <Text style={styles.selectionItemFlag}>{c.flag}</Text>
                        <Text style={styles.selectionItemDialCode}>{c.dialCode}</Text>
                        <Text style={[styles.selectionItemText, isSelected && styles.selectionItemTextActive]} numberOfLines={1}>
                          {c.name}
                        </Text>
                        {isSelected && <Check color={Colors.brand.coral} size={16} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Arrival Time Selector Modal */}
      <Modal
        visible={isArrivalTimePickerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsArrivalTimePickerOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsArrivalTimePickerOpen(false)}>
          <View style={styles.selectionModalOverlay}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.selectionModalContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <View style={styles.selectionModalHeader}>
                  <Text style={styles.selectionModalTitle}>Estimated Arrival Time</Text>
                  <TouchableOpacity
                    style={styles.selectionModalCloseBtn}
                    onPress={() => setIsArrivalTimePickerOpen(false)}
                  >
                    <X color="#94A3B8" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={{ paddingVertical: 8 }}>
                  {ARRIVAL_TIME_OPTIONS.map((timeOption) => {
                    const isSelected = arrivalTime === timeOption;
                    return (
                      <TouchableOpacity
                        key={timeOption}
                        style={[styles.selectionItemRow, isSelected && styles.selectionItemRowActive]}
                        onPress={() => {
                          setArrivalTime(timeOption);
                          setIsArrivalTimePickerOpen(false);
                        }}
                      >
                        <Clock color={isSelected ? Colors.brand.coral : '#64748B'} size={18} style={{ marginRight: 10 }} />
                        <Text style={[styles.selectionItemText, isSelected && styles.selectionItemTextActive]}>
                          {timeOption}
                        </Text>
                        {isSelected && <Check color={Colors.brand.coral} size={16} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.brand.navy,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: Colors.brand.navy,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  sslBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sslBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.brand.coral,
    letterSpacing: 0.5,
  },
  trustShieldCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    paddingBottom: 110,
    gap: 14,
  },
  roomStepperCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  roomStepperWrapper: {
    position: 'relative',
    width: '100%',
  },
  roomStepperLinesLayer: {
    position: 'absolute',
    top: 13,
    left: 0,
    right: 0,
    height: 2.5,
  },
  roomConnectorSegment: {
    position: 'absolute',
    height: 2.5,
  },
  roomStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomStepItem: {
    flex: 1,
    alignItems: 'center',
  },
  roomStepCircleCompleted: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  roomStepCircleActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  roomStepInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  roomStepCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roomStepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  roomStepLabelActive: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Colors.brand.coral,
    textAlign: 'center',
  },
  roomStepLabelInactive: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepTabActive: {
    opacity: 1,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    backgroundColor: Colors.brand.coral,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  stepBadgeTextActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  stepLabelActive: {
    color: Colors.brand.navy,
    fontWeight: '900',
  },
  stepConnector: {
    height: 1,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  reservationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyThumb: {
    width: 82,
    height: 82,
    borderRadius: 16,
  },
  tagPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#047857',
    marginLeft: 3,
  },
  starRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  starRatingText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#92400E',
    marginLeft: 3,
  },
  reservationTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.brand.navy,
    lineHeight: 20,
  },
  locationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
  },
  reservationDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  reservationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  gridBox: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  gridVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginTop: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.brand.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  sectionSubTitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  inputTwoColumn: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldContainer: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.brand.navy,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quickChipText: {
    fontSize: 11,
    color: Colors.brand.navy,
    fontWeight: '700',
  },
  companionBadgesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  companionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  companionPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  removeCompanionX: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '800',
  },
  addCompanionBar: {
    flexDirection: 'row',
    gap: 8,
  },
  addCompanionBtn: {
    backgroundColor: Colors.brand.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 4,
  },
  addCompanionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  addonsGridContainer: {
    gap: 12,
  },
  addonBoxCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addonBoxCardActive: {
    backgroundColor: Colors.brand.sand,
    borderColor: Colors.brand.coral,
  },
  addonTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  addonCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonCheckCircleActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  addonTagPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  addonTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  addonCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  addonCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  addonFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addonPriceTag: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  addonSelectText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  activeDiscountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 8,
  },
  discountBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountCodeText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#047857',
  },
  discountSubText: {
    fontSize: 11,
    color: '#065F46',
  },
  removeDiscountBtn: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  applyPromoBtn: {
    backgroundColor: Colors.brand.coral,
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  applyPromoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  errorAlertText: {
    color: '#EF4444',
    fontSize: 11.5,
    marginBottom: 8,
  },
  quickCouponsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  quickCouponPill: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickCouponCode: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  quickCouponSavings: {
    fontSize: 10.5,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  priceRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceRowLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  priceRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  summaryLineDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  finalTotalHeading: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  finalTotalSub: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  finalTotalAmount: {
    fontSize: 21,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  trustBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brand.sand,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.25)',
  },
  trustBannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  trustBannerSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 12,
  },
  bottomPriceSub: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  bottomPriceMain: {
    fontSize: 21,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  payConfirmCTA: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    gap: 8,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payConfirmCTAText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '900',
  },

  // Razorpay Gateway Modal Styles
  razorpayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 43, 0.75)',
    justifyContent: 'flex-end',
  },
  razorpayCardWindow: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#02042B',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  razorpayBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  razorpayLogoSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  razorpayLogoLetter: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  razorpayBrandTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  razorpaySecurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  razorpaySecureText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
  },
  razorpayMerchantName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  razorpayOrderDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  razorpayCloseCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  razorpayAmountLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '800',
  },
  razorpayAmountVal: {
    color: Colors.brand.coral,
    fontSize: 18,
    fontWeight: '900',
  },
  razorpayProcessingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  razorpayProcessingTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginTop: 16,
  },
  razorpayProcessingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  razorpayOptionsContainer: {
    gap: 10,
  },
  razorpaySelectLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  razorpayOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  razorpayOptionRowActive: {
    backgroundColor: Colors.brand.sand,
    borderColor: Colors.brand.coral,
  },
  razorpayOptionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  razorpayOptionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  razorpayRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  razorpayRadioActive: {
    borderColor: Colors.brand.coral,
    backgroundColor: Colors.brand.coral,
  },
  razorpaySubmitCTA: {
    backgroundColor: '#02042B',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#02042B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  razorpaySubmitCTAText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  policyBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  policyBulletText: {
    flex: 1,
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  processingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 4, 43, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingCard: {
    backgroundColor: '#0B1329',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    maxWidth: 320,
  },
  processingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  processingSub: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  gstBadgePill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gstBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
  },
  gstItcNoteText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: -4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  customAlertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  customAlertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
    position: 'relative',
  },
  customAlertCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customAlertIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  customAlertTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  customAlertMessage: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  customAlertFieldsBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customAlertFieldsBoxHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  customAlertFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  customAlertFieldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand.coral,
    marginRight: 8,
  },
  customAlertFieldText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  customAlertActionBtn: {
    width: '100%',
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  customAlertActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  customAlertDismissBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  customAlertDismissText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  phoneDialCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  phoneFlagText: {
    fontSize: 18,
  },
  phoneDialCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  countryPickerFlag: {
    fontSize: 18,
  },
  countryPickerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  accordionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionContentContainer: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  arrivalTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 46,
  },
  arrivalSelectedText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  smokingRadioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  smokingRadioOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  smokingRadioOptionActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.08)',
    borderColor: Colors.brand.coral,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: Colors.brand.coral,
  },
  radioInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.brand.coral,
  },
  smokingOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  smokingOptionTextActive: {
    color: Colors.brand.navy,
    fontWeight: '800',
  },
  airportPickupCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    marginTop: 4,
  },
  airportPickupCardActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.08)',
    borderColor: Colors.brand.coral,
  },
  airportCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  airportCheckboxActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  airportPickupTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  airportPickupSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  travelerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  travelerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  travelerNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.brand.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  travelerNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  travelerHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  genderButtonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  genderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  genderBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  portalAddonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  portalAddonCardActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.05)',
    borderColor: Colors.brand.coral,
  },
  portalAddonIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.brand.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  portalAddonIconBoxActive: {
    backgroundColor: Colors.brand.coral,
  },
  portalAddonTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 2,
  },
  portalAddonDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  portalAddonPriceText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.brand.coral,
  },
  portalAddonPerPersonLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  portalAddonCheckBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalAddonCheckBadgeActive: {
    backgroundColor: Colors.brand.coral,
    borderColor: Colors.brand.coral,
  },
  selectionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  selectionModalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    maxHeight: '80%',
  },
  selectionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  selectionModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  selectionModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 42,
    gap: 8,
    marginBottom: 10,
  },
  selectionSearchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.brand.navy,
  },
  selectionList: {
    maxHeight: 340,
  },
  selectionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 10,
  },
  selectionItemRowActive: {
    backgroundColor: 'rgba(232, 106, 112, 0.08)',
  },
  selectionItemFlag: {
    fontSize: 20,
  },
  selectionItemDialCode: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.brand.navy,
    width: 50,
  },
  selectionItemText: {
    flex: 1,
    fontSize: 13.5,
    color: '#334155',
    fontWeight: '600',
  },
  selectionItemTextActive: {
    color: Colors.brand.coral,
    fontWeight: '800',
  },
});
