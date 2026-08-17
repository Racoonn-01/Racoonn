import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sendLocalNotification } from '@/services/notificationService';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Tag,
  Sparkles,
  Calendar,
  Users,
  BedDouble,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Check,
  Star,
  Lock,
  Zap,
  Gift,
  X,
  QrCode,
  Wallet,
  Building2,
  FileText,
  Info,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { createBooking, getProperties } from '../../lib/appwrite/api';
import { collectRazorpayPayment } from '../../lib/razorpay';
import { calculateHotelGST } from '../../utils/gst';

const CURATED_ADDONS = [
  {
    id: 'add-1',
    title: 'Private SUV Airport Transfer',
    subtitle: 'Chauffeur pickup in luxury Innova Crysta / Fortuner',
    price: 1500,
    tag: 'Popular',
  },
  {
    id: 'add-2',
    title: 'Candlelight Gourmet Dinner',
    subtitle: '3-Course romantic dinner with complimentary wine & flowers',
    price: 2500,
    tag: 'Romantic',
  },
  {
    id: 'add-3',
    title: 'Himalayan Spa & Aromatherapy',
    subtitle: '60-min herbal body massage & deep thermal sauna session',
    price: 1800,
    tag: 'Relaxing',
  },
  {
    id: 'add-4',
    title: 'Drone & HD Photography Session',
    subtitle: '2-hour guided mountain photo shoot with 50 edited photos',
    price: 2200,
    tag: 'Trending',
  },
];

const QUICK_REQUEST_CHIPS = ['High Floor', 'Quiet Room', 'Early Check-in', 'Honeymoon Decor'];

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user, profile } = useAuthStore();

  const [realProperty, setRealProperty] = useState<any>(null);

  // Fetch real property from Appwrite database if available
  useEffect(() => {
    async function fetchRealHotel() {
      if (params.id) {
        try {
          const docs = await getProperties();
          if (docs && docs.length > 0) {
            const found = docs.find((d: any) => String(d.$id) === String(params.id));
            if (found) {
              setRealProperty(found);
            }
          }
        } catch (e) {
          console.log('Error fetching property document in checkout:', e);
        }
      }
    }
    fetchRealHotel();
  }, [params.id]);

  const pkgId = (params.id as string) || realProperty?.$id || 'pkg-1';
  const itemTitle = (params.packageTitle as string) || realProperty?.propertyName || realProperty?.title || 'Selected Hotel Stay';
  const location = (params.location as string) || realProperty?.location || (realProperty?.city ? `${realProperty.city}, ${realProperty.state || ''}` : '') || 'Uttarakhand, India';
  const image = (params.image as string) || realProperty?.photos?.[0] || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop';
  const roomName = (params.roomName as string) || 'Standard Room';
  const bookingType = (params.bookingType as string) || 'hotel';

  const initialGuests = Number(params.guests || 2);
  const nightsCount = Math.max(1, Number(params.nights || 1));
  const roomsCount = Math.max(1, Number(params.rooms || 1));

  const checkIn = (params.checkIn as string) || (new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const checkOut = (params.checkOut as string) || (new Date(Date.now() + 86400000)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const baseRate = Number(params.totalPrice) > 0
    ? Number(params.totalPrice)
    : Number(realProperty?.price || 3500) * nightsCount * roomsCount;

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [arrivalTime, setArrivalTime] = useState('02:00 PM - 04:00 PM');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (profile || user) {
      const fullName = profile?.name || user?.name || '';
      const parts = fullName.trim().split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(profile?.email || user?.email || '');
      setPhone(profile?.phone || user?.phone || '');
    }
  }, [profile, user]);

  // Extra Companions (Clean start)
  const [companions, setCompanions] = useState<string[]>([]);
  const [companionInput, setCompanionInput] = useState('');

  // Selected Add-ons (Clean start)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Promo Code State (Clean start)
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Razorpay Gateway Sheet State
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [selectedRazorpayOption, setSelectedRazorpayOption] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [isRazorpayProcessing, setIsRazorpayProcessing] = useState(false);

  // Calculations (Statutory Government of India Hotel Accommodation GST Slabs)
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const item = CURATED_ADDONS.find((a) => a.id === id);
    return sum + (item ? item.price : 0);
  }, 0);

  const perNightTariff = baseRate > 0 ? Math.round(baseRate / (roomsCount * nightsCount)) : 3500;
  const gstCalc = calculateHotelGST(perNightTariff, nightsCount, roomsCount, addonsTotal);

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const roomChargesSubtotal = gstCalc.subtotal;
  const gstTax = gstCalc.gstAmount;
  const grandTotal = Math.max(0, roomChargesSubtotal + addonsTotal + gstTax - discountAmount);

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

  const addCompanion = () => {
    if (!companionInput.trim()) return;
    setCompanions([...companions, companionInput.trim()]);
    setCompanionInput('');
  };

  const removeCompanion = (idx: number) => {
    setCompanions(companions.filter((_, i) => i !== idx));
  };

  const addQuickRequest = (chipText: string) => {
    if (specialRequests.includes(chipText)) return;
    setSpecialRequests((prev) => (prev ? `${prev}, ${chipText}` : chipText));
  };

  const handleOpenRazorpay = () => {
    if (!user?.$id) {
      Alert.alert('Sign in required', 'Please sign in before confirming your booking.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => router.push('/auth/login' as any) },
      ]);
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
      Alert.alert('Incomplete Details', 'Please complete primary guest contact information.');
      return;
    }
    setIsRazorpayModalOpen(true);
  };

  const handleExecuteRazorpayPayment = async () => {
    setIsRazorpayProcessing(true);
    try {
      const checkInDay = Number(checkIn.split(' ')[0]) || 1;
      const checkOutDay = Number(checkOut.split(' ')[0]) || checkInDay + 1;
      await collectRazorpayPayment({
        amount: grandTotal,
        name: `${firstName} ${lastName}`.trim(),
        email: email.trim(),
        contact: phone.trim(),
        description: itemTitle,
        bookingId: pkgId,
        bookingType,
      });
      const bookingId = await createBooking({
        userId: user!.$id,
        hotelId: pkgId,
        hotelName: itemTitle,
        hotelLocation: location,
        hotelImage: image,
        checkIn,
        checkOut,
        nights: Math.max(1, checkOutDay - checkInDay),
        adults: initialGuests,
        guest: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          specialRequests: [specialRequests, arrivalTime ? `Arrival time: ${arrivalTime}` : '', companions.length ? `Additional guests: ${companions.join(', ')}` : ''].filter(Boolean).join('\n'),
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
      setIsRazorpayModalOpen(false);

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
      console.error('Failed to create booking:', error);
      setIsRazorpayProcessing(false);
      Alert.alert('Booking failed', 'We could not confirm your booking. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Step Indicator Tabs */}
        <View style={styles.stepperCard}>
          <TouchableOpacity
            style={[styles.stepTab, activeStep === 1 && styles.stepTabActive]}
            onPress={() => scrollToStep(1)}
          >
            <View style={[styles.stepBadge, activeStep === 1 && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, activeStep === 1 && styles.stepBadgeTextActive]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, activeStep === 1 && styles.stepLabelActive]}>Guest Info</Text>
          </TouchableOpacity>

          <View style={styles.stepConnector} />

          <TouchableOpacity
            style={[styles.stepTab, activeStep === 2 && styles.stepTabActive]}
            onPress={() => scrollToStep(2)}
          >
            <View style={[styles.stepBadge, activeStep === 2 && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, activeStep === 2 && styles.stepBadgeTextActive]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, activeStep === 2 && styles.stepLabelActive]}>Add-ons</Text>
          </TouchableOpacity>

          <View style={styles.stepConnector} />

          <TouchableOpacity
            style={[styles.stepTab, activeStep === 3 && styles.stepTabActive]}
            onPress={() => scrollToStep(3)}
          >
            <View style={[styles.stepBadge, activeStep === 3 && styles.stepBadgeActive]}>
              <Text style={[styles.stepBadgeText, activeStep === 3 && styles.stepBadgeTextActive]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, activeStep === 3 && styles.stepLabelActive]}>Payment</Text>
          </TouchableOpacity>
        </View>

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
                  <Text style={styles.starRatingText}>4.98</Text>
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

          {/* 2x2 Date & Traveler Info */}
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
        </View>

        {/* Section 1: Guest Information */}
        <View style={styles.sectionCard} onLayout={(e) => { guestSectionY.current = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <User color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Primary Guest Details</Text>
              <Text style={styles.sectionSubTitle}>Used for instant confirmation voucher & check-in</Text>
            </View>
          </View>

          <View style={styles.inputTwoColumn}>
            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholder="First name"
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
                  placeholder="Last name"
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
                placeholder="name@domain.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Mobile Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <Phone color="#64748B" size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder="+91 98765 43210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Estimated Arrival Time</Text>
            <View style={styles.inputWrapper}>
              <Clock color="#64748B" size={16} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                value={arrivalTime}
                onChangeText={setArrivalTime}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Special Requests (Optional)</Text>
            <TextInput
              style={[styles.inputWrapper, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
              multiline
              placeholder="Tell us any specific requests or instructions..."
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
        </View>

        {/* Section 2: Companion Travelers */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <Users color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Companions & Guest List</Text>
              <Text style={styles.sectionSubTitle}>Add fellow travelers staying with you</Text>
            </View>
          </View>

          <View style={styles.companionBadgesList}>
            {companions.map((comp, idx) => (
              <View key={idx} style={styles.companionPill}>
                <CheckCircle2 color={Colors.brand.coral} size={14} style={{ marginRight: 6 }} />
                <Text style={styles.companionPillText}>{comp}</Text>
                {idx > 0 && (
                  <TouchableOpacity onPress={() => removeCompanion(idx)} style={{ marginLeft: 6 }}>
                    <Text style={styles.removeCompanionX}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.addCompanionBar}>
            <TextInput
              style={[styles.inputWrapper, { flex: 1, height: 42 }]}
              placeholder="Companion Full Name"
              placeholderTextColor="#94A3B8"
              value={companionInput}
              onChangeText={setCompanionInput}
            />
            <TouchableOpacity style={styles.addCompanionBtn} onPress={addCompanion}>
              <Plus color="#FFFFFF" size={15} />
              <Text style={styles.addCompanionBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 3: Curated Add-ons & Experiences */}
        <View style={styles.sectionCard} onLayout={(e) => { addonsSectionY.current = e.nativeEvent.layout.y; }}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <Sparkles color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Curated Add-on Experiences</Text>
              <Text style={styles.sectionSubTitle}>Personalize your upcoming journey with luxury perks</Text>
            </View>
          </View>

          <View style={styles.addonsGridContainer}>
            {CURATED_ADDONS.map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return (
                <TouchableOpacity
                  key={addon.id}
                  style={[styles.addonBoxCard, isSelected && styles.addonBoxCardActive]}
                  activeOpacity={0.88}
                  onPress={() => toggleAddon(addon.id)}
                >
                  <View style={styles.addonTopHeader}>
                    <View style={[styles.addonCheckCircle, isSelected && styles.addonCheckCircleActive]}>
                      {isSelected && <Check color="#FFFFFF" size={12} />}
                    </View>
                    <View style={styles.addonTagPill}>
                      <Text style={styles.addonTagText}>{addon.tag}</Text>
                    </View>
                  </View>

                  <Text style={styles.addonCardTitle}>{addon.title}</Text>
                  <Text style={styles.addonCardSub}>{addon.subtitle}</Text>

                  <View style={styles.addonFooterRow}>
                    <Text style={styles.addonPriceTag}>+₹{addon.price.toLocaleString('en-IN')}</Text>
                    <Text style={styles.addonSelectText}>{isSelected ? 'Added ✓' : '+ Add'}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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

          {/* Quick Apply Coupons */}
          <View style={styles.quickCouponsGrid}>
            <TouchableOpacity style={styles.quickCouponPill} onPress={() => handleApplyCoupon('RACOONN1000')}>
              <Text style={styles.quickCouponCode}>RACOONN1000</Text>
              <Text style={styles.quickCouponSavings}>Save ₹1,000</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickCouponPill} onPress={() => handleApplyCoupon('WELCOME500')}>
              <Text style={styles.quickCouponCode}>WELCOME500</Text>
              <Text style={styles.quickCouponSavings}>Save ₹500</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 5: Itemized Price Summary */}
        <View style={styles.sectionCard} onLayout={(e) => { paymentSectionY.current = e.nativeEvent.layout.y; }}>
          <Text style={styles.sectionTitle}>Price Summary</Text>

          <View style={styles.priceRowItem}>
            <Text style={styles.priceRowLabel}>Room Charges ({roomsCount} Room × {nightsCount} Night)</Text>
            <Text style={styles.priceRowVal}>₹{roomChargesSubtotal.toLocaleString('en-IN')}</Text>
          </View>

          {addonsTotal > 0 && (
            <View style={styles.priceRowItem}>
              <Text style={styles.priceRowLabel}>Selected Add-ons ({selectedAddons.length})</Text>
              <Text style={styles.priceRowVal}>+₹{addonsTotal.toLocaleString('en-IN')}</Text>
            </View>
          )}

          <View style={styles.priceRowItem}>
            <Text style={styles.priceRowLabel}>
              GST ({gstCalc.gstPercentage}%) [{gstCalc.gstType}]
            </Text>
            <Text style={styles.priceRowVal}>+₹{gstTax.toLocaleString('en-IN')}</Text>
          </View>

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
                GST calculated according to Government of India hotel accommodation tax rules.
              </Text>
            </View>
            <Text style={styles.finalTotalAmount}>₹{grandTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Section 6: Cancellation Policy & GST Tax Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconBg}>
              <FileText color={Colors.brand.coral} size={18} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>Cancellation Policy & GST Tax Slabs</Text>
              <Text style={styles.sectionSubTitle}>HSN/SAC Code: 996311 · Hotel Accommodation</Text>
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 4 }}>
            <View style={styles.policyBulletRow}>
              <CheckCircle2 color="#16A34A" size={14} style={{ marginTop: 2 }} />
              <Text style={styles.policyBulletText}>
                <Text style={{ fontWeight: '800', color: '#16A34A' }}>Free Cancellation:</Text> Cancel up to 48 hours before check-in date for a 100% full refund (including all statutory GST taxes).
              </Text>
            </View>

            <View style={styles.policyBulletRow}>
              <Clock color="#E86A70" size={14} style={{ marginTop: 2 }} />
              <Text style={styles.policyBulletText}>
                <Text style={{ fontWeight: '800', color: '#E86A70' }}>24 to 48 Hours:</Text> Cancellations made between 24 and 48 hours before check-in incur a 20% cancellation fee.
              </Text>
            </View>

            <View style={styles.policyBulletRow}>
              <Tag color="#0F172A" size={14} style={{ marginTop: 2 }} />
              <Text style={styles.policyBulletText}>
                <Text style={{ fontWeight: '800', color: '#0F172A' }}>GST Tax Slabs & HSN Code 996311:</Text> Billed under Indian GST SAC Code 996311 (18% GST slab for tariffs above ₹7,500/night). CGST (9%) and SGST (9%) are itemized on your downloadable PDF tax invoice.
              </Text>
            </View>
          </View>
        </View>

        {/* Guarantee Banner Card */}
        <View style={styles.trustBannerCard}>
          <ShieldCheck color={Colors.brand.coral} size={30} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.trustBannerTitle}>Racoonn 100% Assurance Guarantee</Text>
            <Text style={styles.trustBannerSub}>
              Free cancellation up to 48 hours before check-in. Instant refund processed directly to your account.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Sticky CTA */}
      <View style={styles.bottomStickyBar}>
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
              <View style={[styles.razorpayCardWindow, { paddingBottom: Math.max(insets.bottom + 20, 28) }]}>
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
    </SafeAreaView>
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
    paddingVertical: 14,
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
});
