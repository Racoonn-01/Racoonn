import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Image,
  Animated,
  Easing,
} from 'react-native';
import {
  Home,
  Palmtree,
  Ticket,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  ChevronDown,
  ArrowRight,
  Bell,
  BellOff,
  CheckCheck,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { usePropertyFilterStore } from '../../store/propertyFilterStore';
import { useNotificationStore, AppNotification } from '../../store/notificationStore';
import { parseFlexibleDate, formatDisplayDate } from '../../utils/dateUtils';
import CustomCalendarModal from '../shared/CustomCalendarModal';

const tabs = [
  { id: 'stays', label: 'Stays', icon: Home },
  { id: 'packages', label: 'Packages', icon: Palmtree },
  { id: 'activities', label: 'Activities', icon: Ticket },
];

interface HeroSectionProps {
  onOpenNotifications?: () => void;
  openNotifCounter?: number;
}

export default function HeroSection({ onOpenNotifications, openNotifCounter }: HeroSectionProps = {}) {
  const router = useRouter();
  const { user, profile, isAuthenticated, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('stays');

  // Real-time notifications from persistent store (no fake notifications)
  const {
    notifications,
    markAllAsRead,
    markAsRead,
    removeNotification,
    clearAll,
    syncUserNotifications,
  } = useNotificationStore();

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    useNotificationStore.getState().loadNotifications();
    const currentUserId = user?.$id || profile?.userId;
    if (currentUserId) {
      syncUserNotifications(currentUserId);
    }
  }, [user?.$id, profile?.userId, syncUserNotifications]);

  const handleNotificationPress = async (item: AppNotification) => {
    if (item.unread) {
      await markAsRead(item.id);
    }
    closeNotifSidebar();
    if (item.data?.url) {
      router.push(item.data.url as any);
    }
  };
  
  // Search Inputs
  const [destination, setDestination] = useState('');
  const [packageDestination, setPackageDestination] = useState('');
  const [activitySearch, setActivitySearch] = useState('');

  // Dates (Live Realtime, strictly current & future dates)
  const [checkIn, setCheckIn] = useState(() => formatDisplayDate(new Date()));
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatDisplayDate(d);
  });
  const [startDate, setStartDate] = useState(() => formatDisplayDate(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return formatDisplayDate(d);
  });
  const [activityDate, setActivityDate] = useState(() => formatDisplayDate(new Date()));

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Smooth Right Sidebar Animated Values
  const [notifSlideAnim] = useState(() => new Animated.Value(400));
  const [notifOpacityAnim] = useState(() => new Animated.Value(0));

  const openNotifSidebar = () => {
    setIsNotificationsOpen(true);
    Animated.parallel([
      Animated.timing(notifSlideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(notifOpacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (openNotifCounter && openNotifCounter > 0) {
      openNotifSidebar();
    }
  }, [openNotifCounter]);

  const closeNotifSidebar = () => {
    Animated.parallel([
      Animated.timing(notifSlideAnim, {
        toValue: 400,
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(notifOpacityAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsNotificationsOpen(false);
    });
  };

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    'checkIn' | 'checkOut' | 'startDate' | 'endDate' | 'activityDate'
  >('checkIn');

  // Guests & Participants Counter State
  const [isGuestsModalOpen, setIsGuestsModalOpen] = useState(false);
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infantsCount, setInfantsCount] = useState(0);

  const totalGuestsOrParticipants = adultsCount + childrenCount;

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const aiPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let pulseLoop: Animated.CompositeAnimation | null = null;
    if (isAiAnalyzing) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(aiPulseAnim, {
            toValue: 1.15,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(aiPulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    } else {
      aiPulseAnim.setValue(1);
    }
    return () => {
      if (pulseLoop) pulseLoop.stop();
    };
  }, [isAiAnalyzing, aiPulseAnim]);

  const getGuestsText = () => {
    if (activeTab === 'activities') {
      if (totalGuestsOrParticipants === 0) return 'Add participants';
      return `${totalGuestsOrParticipants} Participant${totalGuestsOrParticipants > 1 ? 's' : ''}`;
    }
    if (totalGuestsOrParticipants === 0) return 'Add guests';
    return `${totalGuestsOrParticipants} Guest${totalGuestsOrParticipants > 1 ? 's' : ''}`;
  };

  const handleAiSearchSubmit = (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : aiQuery).trim();
    if (!q) return;
    setIsAiAnalyzing(true);
    setTimeout(() => {
      setIsAiAnalyzing(false);
      setIsAiModalOpen(false);
      setAiQuery('');
      router.push({
        pathname: '/(tabs)/search' as any,
        params: {
          ai: q,
        },
      });
    }, 2000);
  };

  const handleSearchSubmit = () => {
    if (activeTab === 'packages') {
      router.push({ pathname: '/packages' as any, params: { q: packageDestination } });
    } else if (activeTab === 'activities') {
      router.push({ pathname: '/activities' as any, params: { q: activitySearch } });
    } else {
      const parsedIn = parseFlexibleDate(checkIn && checkIn !== 'Add dates' ? checkIn : new Date());
      const formattedIn = formatDisplayDate(parsedIn);

      let formattedOut = '';
      if (checkOut && checkOut !== 'Add dates') {
        formattedOut = formatDisplayDate(parseFlexibleDate(checkOut));
      } else {
        const nextDay = new Date(parsedIn);
        nextDay.setDate(nextDay.getDate() + 1);
        formattedOut = formatDisplayDate(nextDay);
      }

      const totalGuests = Math.max(1, adultsCount + childrenCount);
      const calculatedRooms = Math.max(1, Math.ceil(totalGuests / 4));

      // Persist in global propertyFilterStore so all sections have auto-selected criteria
      usePropertyFilterStore.getState().setFilters({
        checkIn: formattedIn,
        checkOut: formattedOut,
        adults: adultsCount,
        children: childrenCount,
        infants: infantsCount,
        rooms: calculatedRooms,
        destination: destination,
      });

      router.push({
        pathname: '/(tabs)/search' as any,
        params: {
          q: destination,
          checkIn: formattedIn,
          checkOut: formattedOut,
          adults: String(adultsCount),
          children: String(childrenCount),
          infants: String(infantsCount),
          guests: String(totalGuests),
          rooms: String(calculatedRooms),
        },
      });
    }
  };

  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroBackground}>

        {/* Main Floating Search Card Box */}
        <View style={styles.cardContainer}>
          <View style={styles.searchCard}>
            {/* Category Segmented Switcher */}
            <View style={styles.segmentedContainer}>
              {tabs.map((tab) => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                    activeOpacity={0.85}
                  >
                    <IconComp
                      color={isActive ? '#FFFFFF' : '#64748B'}
                      size={15}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* FORM FIELDS PER ACTIVE TAB */}

            {/* TAB 1: STAYS */}
            {activeTab === 'stays' && (
              <View style={styles.formFieldsContainer}>
                {/* Where are you going? */}
                <View style={styles.fieldBoxFull}>
                  <View style={styles.fieldIconBadge}>
                    <MapPin color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Where to?</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Search destination, resort or city"
                      placeholderTextColor="#94A3B8"
                      value={destination}
                      onChangeText={setDestination}
                    />
                  </View>
                </View>

                {/* Check-in & Check-out */}
                <View style={styles.multiFieldsRow}>
                  <TouchableOpacity
                    style={[
                      styles.fieldBoxCol,
                      datePickerTarget === 'checkIn' && isDatePickerOpen && styles.fieldBoxActive,
                    ]}
                    activeOpacity={0.9}
                    onPress={() => {
                      setDatePickerTarget('checkIn');
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <View style={styles.fieldIconBadge}>
                      <CalendarIcon color={Colors.brand.coral} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldTitle}>Check-in</Text>
                      <Text style={styles.fieldValue}>{checkIn}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.fieldBoxCol,
                      datePickerTarget === 'checkOut' && isDatePickerOpen && styles.fieldBoxActive,
                    ]}
                    activeOpacity={0.9}
                    onPress={() => {
                      setDatePickerTarget('checkOut');
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <View style={styles.fieldIconBadge}>
                      <CalendarIcon color={Colors.brand.coral} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldTitle}>Check-out</Text>
                      <Text style={styles.fieldValue}>{checkOut}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Guests */}
                <TouchableOpacity
                  style={styles.fieldBoxFull}
                  activeOpacity={0.9}
                  onPress={() => setIsGuestsModalOpen(true)}
                >
                  <View style={styles.fieldIconBadge}>
                    <Users color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Guests</Text>
                    <Text style={styles.fieldValue}>{getGuestsText()}</Text>
                  </View>
                  <ChevronDown color="#94A3B8" size={18} />
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 2: PACKAGES */}
            {activeTab === 'packages' && (
              <View style={styles.formFieldsContainer}>
                <View style={styles.fieldBoxFull}>
                  <View style={styles.fieldIconBadge}>
                    <MapPin color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Where to?</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Search destination or package"
                      placeholderTextColor="#94A3B8"
                      value={packageDestination}
                      onChangeText={setPackageDestination}
                    />
                  </View>
                </View>

                <View style={styles.multiFieldsRow}>
                  <TouchableOpacity
                    style={styles.fieldBoxCol}
                    activeOpacity={0.9}
                    onPress={() => {
                      setDatePickerTarget('startDate');
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <View style={styles.fieldIconBadge}>
                      <CalendarIcon color={Colors.brand.coral} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldTitle}>Start date</Text>
                      <Text style={styles.fieldValue}>{startDate}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fieldBoxCol}
                    activeOpacity={0.9}
                    onPress={() => {
                      setDatePickerTarget('endDate');
                      setIsDatePickerOpen(true);
                    }}
                  >
                    <View style={styles.fieldIconBadge}>
                      <CalendarIcon color={Colors.brand.coral} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldTitle}>End date</Text>
                      <Text style={styles.fieldValue}>{endDate}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.fieldBoxFull}
                  activeOpacity={0.9}
                  onPress={() => setIsGuestsModalOpen(true)}
                >
                  <View style={styles.fieldIconBadge}>
                    <Users color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Guests</Text>
                    <Text style={styles.fieldValue}>{getGuestsText()}</Text>
                  </View>
                  <ChevronDown color="#94A3B8" size={18} />
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 3: ACTIVITIES */}
            {activeTab === 'activities' && (
              <View style={styles.formFieldsContainer}>
                <View style={styles.fieldBoxFull}>
                  <View style={styles.fieldIconBadge}>
                    <MapPin color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Experience / Activity</Text>
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="Trekking, rafting, sightseeing..."
                      placeholderTextColor="#94A3B8"
                      value={activitySearch}
                      onChangeText={setActivitySearch}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.fieldBoxFull}
                  activeOpacity={0.9}
                  onPress={() => {
                    setDatePickerTarget('activityDate');
                    setIsDatePickerOpen(true);
                  }}
                >
                  <View style={styles.fieldIconBadge}>
                    <CalendarIcon color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Date</Text>
                    <Text style={styles.fieldValue}>{activityDate}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.fieldBoxFull}
                  activeOpacity={0.9}
                  onPress={() => setIsGuestsModalOpen(true)}
                >
                  <View style={styles.fieldIconBadge}>
                    <Users color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldTitle}>Participants</Text>
                    <Text style={styles.fieldValue}>{getGuestsText()}</Text>
                  </View>
                  <ChevronDown color="#94A3B8" size={18} />
                </TouchableOpacity>
              </View>
            )}

            {/* 2 Action Buttons: Ask AI & Search (Matches User Portal) */}
            <View style={styles.actionButtonsRow}>
              {/* Left Button: Ask AI */}
              <TouchableOpacity
                style={styles.askAiBtn}
                activeOpacity={0.85}
                onPress={() => setIsAiModalOpen(true)}
              >
                <View style={styles.askAiIconWrapper}>
                  <Image
                    source={require('@/assets/images/Racoonn-Logo-03.png')}
                    style={styles.askAiAvatarImg}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.askAiBtnText}>Ask AI</Text>
              </TouchableOpacity>

              {/* Right Button: Search */}
              <TouchableOpacity
                style={styles.searchSubmitBtnRow}
                activeOpacity={0.88}
                onPress={handleSearchSubmit}
              >
                <Text style={styles.searchSubmitTextRow}>Search</Text>
                <View style={styles.arrowCircleRow}>
                  <ArrowRight color="#FFFFFF" size={16} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Guests / Participants Counter Picker Modal */}
      <Modal
        visible={isGuestsModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGuestsModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsGuestsModalOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.guestsCard}>
            <View style={styles.guestsHeader}>
              <View>
                <Text style={styles.guestsTitle}>
                  {activeTab === 'activities' ? 'Participants' : 'Guests'}
                </Text>
                <Text style={styles.guestsSub}>
                  {activeTab === 'activities'
                    ? 'Select number of participants'
                    : 'Select total number of guests'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsGuestsModalOpen(false)}
              >
                <X color={Colors.brand.navy} size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.guestsBody}>
              {/* Adults Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Adults</Text>
                  <Text style={styles.counterSub}>Ages 13 or above</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterBtn, adultsCount <= 1 && styles.counterBtnDisabled]}
                    disabled={adultsCount <= 1}
                    onPress={() => setAdultsCount((c) => Math.max(1, c - 1))}
                  >
                    <Minus color={adultsCount <= 1 ? '#CBD5E1' : Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{adultsCount}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setAdultsCount((c) => c + 1)}
                  >
                    <Plus color={Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Children Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Children</Text>
                  <Text style={styles.counterSub}>Ages 2 – 12</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterBtn, childrenCount <= 0 && styles.counterBtnDisabled]}
                    disabled={childrenCount <= 0}
                    onPress={() => setChildrenCount((c) => Math.max(0, c - 1))}
                  >
                    <Minus color={childrenCount <= 0 ? '#CBD5E1' : Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{childrenCount}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setChildrenCount((c) => c + 1)}
                  >
                    <Plus color={Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Infants Counter */}
              <View style={styles.counterRow}>
                <View>
                  <Text style={styles.counterTitle}>Infants</Text>
                  <Text style={styles.counterSub}>Under 2 years</Text>
                </View>
                <View style={styles.counterControls}>
                  <TouchableOpacity
                    style={[styles.counterBtn, infantsCount <= 0 && styles.counterBtnDisabled]}
                    disabled={infantsCount <= 0}
                    onPress={() => setInfantsCount((c) => Math.max(0, c - 1))}
                  >
                    <Minus color={infantsCount <= 0 ? '#CBD5E1' : Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                  <Text style={styles.counterValue}>{infantsCount}</Text>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setInfantsCount((c) => c + 1)}
                  >
                    <Plus color={Colors.brand.navy} size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.guestsFooter}>
              <TouchableOpacity
                onPress={() => {
                  setAdultsCount(1);
                  setChildrenCount(0);
                  setInfantsCount(0);
                  usePropertyFilterStore.getState().setFilters({
                    adults: 1,
                    children: 0,
                    infants: 0,
                    rooms: 1,
                  });
                }}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => {
                  usePropertyFilterStore.getState().setFilters({
                    adults: adultsCount,
                    children: childrenCount,
                    infants: infantsCount,
                    rooms: Math.max(1, Math.ceil((adultsCount + childrenCount) / 4)),
                  });
                  setIsGuestsModalOpen(false);
                }}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Dynamic Real-time Calendar Modal with exact live dates and strict backdate prevention */}
      <CustomCalendarModal
        visible={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        checkInDate={
          activeTab === 'packages'
            ? (startDate !== 'Add dates' ? startDate : checkIn)
            : activeTab === 'activities'
            ? (activityDate !== 'Add dates' ? activityDate : checkIn)
            : checkIn
        }
        checkOutDate={
          activeTab === 'packages'
            ? (endDate !== 'Add dates' ? endDate : checkOut)
            : activeTab === 'activities'
            ? (activityDate !== 'Add dates' ? activityDate : checkIn)
            : checkOut
        }
        initialStep={
          datePickerTarget === 'checkOut' || datePickerTarget === 'endDate'
            ? 'checkout'
            : 'checkin'
        }
        mode={activeTab === 'activities' ? 'single' : 'range'}
        onSelectDates={(newIn, newOut) => {
          if (activeTab === 'packages') {
            setStartDate(newIn);
            setEndDate(newOut);
          } else if (activeTab === 'activities') {
            setActivityDate(newIn);
          } else {
            setCheckIn(newIn);
            setCheckOut(newOut);
            usePropertyFilterStore.getState().setFilters({
              checkIn: newIn,
              checkOut: newOut,
            });
          }
          setIsDatePickerOpen(false);
        }}
      />

      {/* 🔔 Smooth Right Notification Sidebar Drawer (Opens & Closes from Right) */}
      <Modal
        visible={isNotificationsOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeNotifSidebar}
      >
        <Animated.View style={[styles.sidebarDrawerOverlay, { opacity: notifOpacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeNotifSidebar}
          />
          <Animated.View
            style={[
              styles.notifSidebarCard,
              { transform: [{ translateX: notifSlideAnim }] },
            ]}
          >
            {/* Sidebar Header */}
            <View style={styles.notifSidebarHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.notifBellIconBox}>
                  <Bell color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.notifSidebarTitle}>Notifications</Text>
                    {unreadCount > 0 && (
                      <View style={styles.notifBadgePill}>
                        <Text style={styles.notifBadgeText}>{unreadCount} New</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notifSidebarSub}>Real-time updates & exclusive offers</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeCircleBtn}
                onPress={closeNotifSidebar}
              >
                <X color="#0F172A" size={18} />
              </TouchableOpacity>
            </View>

            {/* Sidebar Body List */}
            {notifications.length === 0 ? (
              <View style={styles.notifEmptyContainer}>
                <View style={styles.notifEmptyIconCircle}>
                  <BellOff color="#94A3B8" size={32} />
                </View>
                <Text style={styles.notifEmptyTitle}>No Notifications</Text>
                <Text style={styles.notifEmptySubtitle}>
                  You're all caught up! Real-time booking confirmations, payment receipts, and travel alerts will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.notifSidebarBodyScroll} showsVerticalScrollIndicator={false}>
                {notifications.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.82}
                    onPress={() => handleNotificationPress(item)}
                    style={[
                      styles.notifSidebarItem,
                      item.unread && styles.notifSidebarItemUnread,
                    ]}
                  >
                    <View style={styles.notifItemHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                        {item.unread && <View style={styles.notifUnreadDot} />}
                        <Text style={styles.notifItemTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.notifItemTime}>{item.time}</Text>
                        <TouchableOpacity
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => removeNotification(item.id)}
                        >
                          <Trash2 color="#94A3B8" size={14} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.notifItemMessage}>{item.message}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Sidebar Footer */}
            {notifications.length > 0 && (
              <View style={styles.notifSidebarFooter}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    style={styles.clearNotifBtn}
                    onPress={() => markAllAsRead()}
                    activeOpacity={0.7}
                  >
                    <CheckCheck color={Colors.brand.navy} size={15} style={{ marginRight: 5 }} />
                    <Text style={styles.clearNotifText}>Mark all read</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.clearNotifBtn, { backgroundColor: '#F1F5F9' }]}
                  onPress={() => {
                    closeNotifSidebar();
                    router.push('/notifications' as any);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.clearNotifText, { color: '#0F172A', fontWeight: '700' }]}>View All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.clearNotifBtn, { backgroundColor: '#FEE2E2' }]}
                  onPress={clearAll}
                  activeOpacity={0.7}
                >
                  <Trash2 color="#EF4444" size={15} style={{ marginRight: 5 }} />
                  <Text style={[styles.clearNotifText, { color: '#EF4444' }]}>Clear all</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Navigation Slide-over Drawer Modal */}
      <Modal
        visible={isMenuOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.drawerContainer}>
          <View style={styles.drawerHeader}>
            <View style={styles.logoRow}>
              <Text style={styles.logoMascot}>🦝</Text>
              <Text style={styles.drawerLogoText}>racoonn</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsMenuOpen(false)}>
              <X color={Colors.brand.navy} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.drawerContent}>
            {isAuthenticated && (
              <View style={styles.userProfileCard}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {(profile?.name || user?.name || 'R').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.drawerUserName}>
                    {profile?.name || user?.name || 'Traveler'}
                  </Text>
                  <Text style={styles.drawerUserEmail}>
                    {profile?.email || user?.email || 'traveler@racoonn.com'}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/' as any);
                }}
              >
                <Home color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>Explore Stays</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/packages' as any);
                }}
              >
                <Palmtree color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>Tour Packages</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/two' as any);
                }}
              >
                <Text style={{ fontSize: 18 }}>❤️</Text>
                <Text style={styles.menuItemText}>Saved Wishlist</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/profile' as any);
                }}
              >
                <Users color={Colors.brand.coral} size={20} />
                <Text style={styles.menuItemText}>My Account & Bookings</Text>
              </TouchableOpacity>
            </View>

            {isAuthenticated ? (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                  setIsMenuOpen(false);
                  await logout();
                }}
              >
                <Text style={styles.logoutText}>Sign Out</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push('/auth/login' as any);
                }}
              >
                <Text style={styles.loginText}>Sign In / Register</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* 🌟 Ask AI Modal (Matches User Portal AI Assistant) */}
      <Modal
        visible={isAiModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!isAiAnalyzing) setIsAiModalOpen(false);
        }}
      >
        <View style={styles.aiModalOverlay}>
          <TouchableOpacity
            style={styles.aiModalBackdrop}
            activeOpacity={1}
            onPress={() => {
              if (!isAiAnalyzing) setIsAiModalOpen(false);
            }}
          />

          <View style={styles.aiModalCard}>
            {/* Header */}
            <View style={styles.aiModalHeader}>
              <View style={styles.aiModalTitleRow}>
                <View style={styles.aiModalMascotBox}>
                  <Image
                    source={require('@/assets/images/Racoonn-Logo-03.png')}
                    style={styles.aiModalMascotImg}
                    resizeMode="contain"
                  />
                </View>
                <View>
                  <Text style={styles.aiModalTitle}>Ask Racoonn AI</Text>
                  <Text style={styles.aiModalSub}>Smart search in natural language or Hinglish</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  if (!isAiAnalyzing) setIsAiModalOpen(false);
                }}
                style={styles.aiModalCloseBtn}
              >
                <X color="#64748B" size={20} />
              </TouchableOpacity>
            </View>

            {isAiAnalyzing ? (
              /* Analyzing Screen (Matches User Portal Mascot Pulse) */
              <View style={styles.aiAnalyzingBox}>
                <Animated.View
                  style={[
                    styles.aiAnalyzingPulseCircle,
                    { transform: [{ scale: aiPulseAnim }] },
                  ]}
                >
                  <Image
                    source={require('@/assets/images/Racoonn-Logo-03.png')}
                    style={styles.aiAnalyzingMascot}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text style={styles.aiAnalyzingTitle}>Racoonn AI is analyzing...</Text>
                <Text style={styles.aiAnalyzingSub}>
                  Finding the perfect properties for your prompt
                </Text>
              </View>
            ) : (
              /* Input & Sample Prompts Screen */
              <View style={styles.aiInputBody}>
                <View style={styles.aiTextInputWrapper}>
                  <TextInput
                    style={styles.aiTextInput}
                    placeholder="e.g. Find me a luxury pool villa in Manali for 2 adults under ₹5000..."
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={aiQuery}
                    onChangeText={setAiQuery}
                    autoFocus
                  />
                  {aiQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setAiQuery('')}
                      style={styles.aiClearInputBtn}
                    >
                      <X color="#94A3B8" size={16} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Quick Suggestion Chips */}
                <Text style={styles.aiSuggestionsLabel}>Try asking:</Text>
                <View style={styles.aiChipsRow}>
                  {[
                    'Saste hotels in Nainital',
                    'Beachfront villa with pool',
                    'Family homestay in Dehradun under ₹3000',
                    'Pet-friendly luxury resort in Goa',
                  ].map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      style={styles.aiChipItem}
                      activeOpacity={0.8}
                      onPress={() => {
                        setAiQuery(chip);
                        handleAiSearchSubmit(chip);
                      }}
                    >
                      <Text style={styles.aiChipText}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit AI Button */}
                <TouchableOpacity
                  style={[
                    styles.aiSubmitBtn,
                    !aiQuery.trim() && styles.aiSubmitBtnDisabled,
                  ]}
                  activeOpacity={0.88}
                  disabled={!aiQuery.trim()}
                  onPress={() => handleAiSearchSubmit()}
                >
                  <Text style={styles.aiSubmitBtnText}>Search with AI</Text>
                  <ArrowRight color="#FFFFFF" size={17} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  heroBackground: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 24,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  topHeaderWrapper: {
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 20,
  },
  topHeaderCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: Colors.brand.coral,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  logoImage: {
    height: 36,
    width: 130,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMascot: {
    fontSize: 18,
  },

  heroGreetingBox: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  heroMainHeading: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  heroSubHeading: {
    fontSize: 13.5,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginTop: 4,
    paddingBottom: 4,
  },
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 16,
  },
  segmentBtnActive: {
    backgroundColor: Colors.brand.coral,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  fieldIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(232, 106, 112, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  formFieldsContainer: {
    gap: 12,
  },
  fieldBoxFull: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldBoxCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldBoxActive: {
    borderColor: Colors.brand.coral,
    borderWidth: 1.5,
  },
  multiFieldsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  fieldInput: {
    fontSize: 13,
    color: Colors.brand.navy,
    marginTop: 2,
    padding: 0,
  },
  fieldValue: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  /* 🌟 2 Action Buttons Row: Ask AI & Search (Exact Match to Image 2) */
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  askAiBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1.2,
    borderColor: '#FECDD3',
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 16,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  askAiIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  askAiAvatarImg: {
    width: 20,
    height: 20,
  },
  askAiBtnText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
  },
  searchSubmitBtnRow: {
    flex: 1.15,
    backgroundColor: Colors.brand.coral,
    borderRadius: 30,
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  searchSubmitTextRow: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    marginRight: 8,
  },
  arrowCircleRow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* 🌟 Ask AI Modal Styles */
  aiModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  aiModalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  aiModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  aiModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  aiModalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  aiModalMascotBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiModalMascotImg: {
    width: 28,
    height: 28,
  },
  aiModalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
  },
  aiModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  aiModalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInputBody: {
    marginTop: 4,
  },
  aiTextInputWrapper: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderRadius: 18,
    padding: 14,
    minHeight: 110,
    position: 'relative',
  },
  aiTextInput: {
    fontSize: 14.5,
    color: '#0F172A',
    lineHeight: 22,
    textAlignVertical: 'top',
    padding: 0,
    margin: 0,
    flex: 1,
  },
  aiClearInputBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
  },
  aiSuggestionsLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#475569',
    marginTop: 14,
    marginBottom: 8,
  },
  aiChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  aiChipItem: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  aiChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  aiSubmitBtn: {
    backgroundColor: Colors.brand.coral,
    borderRadius: 24,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  aiSubmitBtnDisabled: {
    opacity: 0.5,
  },
  aiSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '800',
  },
  aiAnalyzingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 16,
  },
  aiAnalyzingPulseCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  aiAnalyzingMascot: {
    width: 52,
    height: 52,
  },
  aiAnalyzingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginBottom: 6,
    textAlign: 'center',
  },
  aiAnalyzingSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Calendar Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavBtn: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  dayNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayNameText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    borderRadius: 19,
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellSelected: {
    backgroundColor: Colors.brand.coral,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.navy,
  },
  dayCellTextDisabled: {
    color: '#CBD5E1',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  /* Guests Counter Modal Styles */
  guestsCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  guestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 16,
  },
  guestsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  guestsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  guestsBody: {
    gap: 16,
    marginBottom: 20,
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  counterSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterBtnDisabled: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
    width: 24,
    textAlign: 'center',
  },
  guestsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textDecorationLine: 'underline',
  },
  applyBtn: {
    backgroundColor: Colors.brand.coral,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  /* Drawer Styles */
  drawerContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.brand.coral,
    marginLeft: 8,
  },
  drawerContent: {
    padding: 24,
  },
  userProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
  },
  drawerUserEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuList: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginLeft: 14,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  loginBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  /* 🔔 Right Notification Sidebar Drawer Styles */
  sidebarDrawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  notifSidebarCard: {
    width: '86%',
    maxWidth: 380,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    paddingTop: 48,
    paddingBottom: 24,
  },
  notifSidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notifBellIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifSidebarTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  notifSidebarSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  notifBadgePill: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  notifBadgeText: {
    color: Colors.brand.coral,
    fontSize: 11,
    fontWeight: '800',
  },
  notifSidebarBodyScroll: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  notifSidebarItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  notifSidebarItemUnread: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
  },
  notifItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  notifItemTime: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  notifItemMessage: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  notifSidebarFooter: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  clearNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  clearNotifText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  notifEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  notifEmptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  notifEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  notifEmptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  notifUnreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.brand.coral,
    marginRight: 6,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
