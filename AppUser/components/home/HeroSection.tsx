import React, { useState } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuthStore } from '../../store/authStore';

const tabs = [
  { id: 'stays', label: 'Stays', icon: Home },
  { id: 'packages', label: 'Packages', icon: Palmtree },
  { id: 'activities', label: 'Activities', icon: Ticket },
];

const CALENDAR_DAYS = [
  { day: 26, isCurrent: false },
  { day: 27, isCurrent: false },
  { day: 28, isCurrent: false },
  { day: 29, isCurrent: false },
  { day: 30, isCurrent: false },
  { day: 31, isCurrent: false },
  { day: 1, isCurrent: true },
  { day: 2, isCurrent: true },
  { day: 3, isCurrent: true },
  { day: 4, isCurrent: true },
  { day: 5, isCurrent: true },
  { day: 6, isCurrent: true },
  { day: 7, isCurrent: true },
  { day: 8, isCurrent: true },
  { day: 9, isCurrent: true },
  { day: 10, isCurrent: true },
  { day: 11, isCurrent: true },
  { day: 12, isCurrent: true },
  { day: 13, isCurrent: true },
  { day: 14, isCurrent: true },
  { day: 15, isCurrent: true },
  { day: 16, isCurrent: true },
  { day: 17, isCurrent: true },
  { day: 18, isCurrent: true },
  { day: 19, isCurrent: true },
  { day: 20, isCurrent: true },
  { day: 21, isCurrent: true },
  { day: 22, isCurrent: true },
  { day: 23, isCurrent: true },
  { day: 24, isCurrent: true },
  { day: 25, isCurrent: true },
  { day: 26, isCurrent: true },
  { day: 27, isCurrent: true },
  { day: 28, isCurrent: true },
  { day: 29, isCurrent: true },
  { day: 30, isCurrent: true },
  { day: 31, isCurrent: true },
];



export default function HeroSection() {
  const router = useRouter();
  const { user, profile, isAuthenticated, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState('stays');

  // Real-time notifications state
  const [notifications, setNotifications] = useState(() => [
    {
      id: '1',
      title: 'Welcome to Racoonn! 👋',
      message: 'Discover hand-picked luxury resorts, cozy homestays, and tour packages.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    },
    {
      id: '2',
      title: 'Special Offer Unlocked 🏷️',
      message: 'Get up to 20% off on special packages this week. Use code RACOON20.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    },
    {
      id: '3',
      title: 'Ask AI Concierge Ready 🤖',
      message: 'Try our AI travel assistant to plan your custom day-by-day itinerary.',
      time: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };
  
  // Search Inputs
  const [destination, setDestination] = useState('');
  const [packageDestination, setPackageDestination] = useState('');
  const [activitySearch, setActivitySearch] = useState('');

  // Dates
  const [checkIn, setCheckIn] = useState('Aug 1, 2026');
  const [checkOut, setCheckOut] = useState('Add dates');
  const [startDate, setStartDate] = useState('Add dates');
  const [endDate, setEndDate] = useState('Add dates');
  const [activityDate, setActivityDate] = useState('Add dates');

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

  const getGuestsText = () => {
    if (activeTab === 'activities') {
      if (totalGuestsOrParticipants === 0) return 'Add participants';
      return `${totalGuestsOrParticipants} Participant${totalGuestsOrParticipants > 1 ? 's' : ''}`;
    }
    if (totalGuestsOrParticipants === 0) return 'Add guests';
    return `${totalGuestsOrParticipants} Guest${totalGuestsOrParticipants > 1 ? 's' : ''}`;
  };

  const handleSelectDate = (dayItem: any) => {
    if (dayItem.isCurrent) {
      const formatted = `Aug ${dayItem.day}, 2026`;
      if (datePickerTarget === 'checkIn') {
        setCheckIn(formatted);
        const nextDayNum = dayItem.day + 1;
        setCheckOut(`Aug ${nextDayNum}, 2026`);
        // Automatically switch target to checkOut and keep picker open
        setDatePickerTarget('checkOut');
        setIsDatePickerOpen(true);
      } else if (datePickerTarget === 'checkOut') {
        setCheckOut(formatted);
        setIsDatePickerOpen(false);
      } else if (datePickerTarget === 'startDate') {
        setStartDate(formatted);
        const nextDayNum = dayItem.day + 1;
        setEndDate(`Aug ${nextDayNum}, 2026`);
        // Automatically switch target to endDate and keep picker open
        setDatePickerTarget('endDate');
        setIsDatePickerOpen(true);
      } else if (datePickerTarget === 'endDate') {
        setEndDate(formatted);
        setIsDatePickerOpen(false);
      } else if (datePickerTarget === 'activityDate') {
        setActivityDate(formatted);
        setIsDatePickerOpen(false);
      }
    }
  };

  const handleSearchSubmit = () => {
    if (activeTab === 'packages') {
      router.push({ pathname: '/packages' as any, params: { q: packageDestination } });
    } else if (activeTab === 'activities') {
      router.push({ pathname: '/activities' as any, params: { q: activitySearch } });
    } else {
      router.push({ pathname: '/stays' as any, params: { q: destination } });
    }
  };

  return (
    <View style={styles.heroContainer}>
      <View style={styles.heroBackground}>

        {/* Top Header Capsule with White Background */}
        <View style={styles.topHeaderWrapper}>
          <View style={styles.topHeaderCapsule}>
            <Image
              source={require('@/assets/images/Racoonn-Logo-02.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.bellBtn}
              onPress={openNotifSidebar}
              activeOpacity={0.8}
            >
              <Bell color={Colors.brand.navy} size={20} />
              {unreadCount > 0 && <View style={styles.notificationBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Title Greeting */}
        {/* <View style={styles.heroHeaderContainer}>
          <Text style={styles.heroMainHeading}>Find your next luxury stay ✨</Text>
        </View> */}

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

            {/* Big Coral Red Search Button */}
            <TouchableOpacity
              style={styles.searchSubmitBtn}
              activeOpacity={0.9}
              onPress={handleSearchSubmit}
            >
              <Text style={styles.searchSubmitText}>
                {activeTab === 'packages' ? 'Search Packages' : activeTab === 'activities' ? 'Search Activities' : 'Search Available Stays'}
              </Text>
              <View style={styles.arrowCircle}>
                <ArrowRight color="#FFFFFF" size={16} />
              </View>
            </TouchableOpacity>
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
                }}
              >
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setIsGuestsModalOpen(false)}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Interactive Calendar Date Picker Modal */}
      <Modal
        visible={isDatePickerOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDatePickerOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDatePickerOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.calendarCard}>
            <View style={styles.calendarHeaderRow}>
              <TouchableOpacity style={styles.monthNavBtn}>
                <ChevronLeft color={Colors.brand.navy} size={18} />
              </TouchableOpacity>
              <View style={{ alignItems: 'center' }}>
                <Text style={styles.monthTitle}>August 2026</Text>
                <Text style={{ fontSize: 11, color: Colors.brand.coral, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 }}>
                  {datePickerTarget === 'checkIn' ? '1. Select Check-In Date' : datePickerTarget === 'checkOut' ? '2. Select Check-Out Date' : datePickerTarget === 'startDate' ? '1. Select Start Date' : datePickerTarget === 'endDate' ? '2. Select End Date' : 'Select Date'}
                </Text>
              </View>
              <TouchableOpacity style={styles.monthNavBtn}>
                <ChevronRight color={Colors.brand.navy} size={18} />
              </TouchableOpacity>
            </View>

            <View style={styles.dayNamesRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((name, i) => (
                <Text key={i} style={styles.dayNameText}>
                  {name}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {CALENDAR_DAYS.map((item, idx) => {
                // Don't show back dates from previous month
                if (!item.isCurrent) {
                  return <View key={idx} style={[styles.dayCell, { opacity: 0 }]} />;
                }

                const parseDayFromStr = (str: string) => {
                  const match = str.match(/Aug (\d+)/i);
                  return match ? parseInt(match[1], 10) : 0;
                };

                const TODAY_DAY = 6; // Current day (Aug 6)
                const checkInDay = parseDayFromStr(checkIn);
                const checkOutDay = parseDayFromStr(checkOut);
                const startDay = parseDayFromStr(startDate);
                const endDay = parseDayFromStr(endDate);
                const activityDay = parseDayFromStr(activityDate);

                let isDisabled = item.day < TODAY_DAY;
                let isSelected = false;

                if (datePickerTarget === 'checkIn') {
                  isDisabled = item.day < TODAY_DAY;
                  isSelected = item.day === checkInDay;
                } else if (datePickerTarget === 'checkOut') {
                  isDisabled = item.day <= (checkInDay || TODAY_DAY);
                  isSelected = item.day === checkOutDay;
                } else if (datePickerTarget === 'startDate') {
                  isDisabled = item.day < TODAY_DAY;
                  isSelected = item.day === startDay;
                } else if (datePickerTarget === 'endDate') {
                  isDisabled = item.day <= (startDay || TODAY_DAY);
                  isSelected = item.day === endDay;
                } else if (datePickerTarget === 'activityDate') {
                  isDisabled = item.day < TODAY_DAY;
                  isSelected = item.day === activityDay;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={isDisabled}
                    onPress={() => handleSelectDate(item)}
                    style={[
                      styles.dayCell,
                      isDisabled && styles.dayCellDisabled,
                      isSelected && styles.dayCellSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayCellText,
                        isDisabled && styles.dayCellTextDisabled,
                        isSelected && styles.dayCellTextSelected,
                      ]}
                    >
                      {item.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
            <ScrollView style={styles.notifSidebarBodyScroll} showsVerticalScrollIndicator={false}>
              {notifications.map((item) => (
                <View key={item.id} style={[styles.notifSidebarItem, item.unread && styles.notifSidebarItemUnread]}>
                  <View style={styles.notifItemHeader}>
                    <Text style={styles.notifItemTitle}>{item.title}</Text>
                    <Text style={styles.notifItemTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifItemMessage}>{item.message}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Sidebar Footer */}
            <View style={styles.notifSidebarFooter}>
              <TouchableOpacity
                style={styles.clearNotifBtn}
                onPress={handleMarkAllAsRead}
              >
                <Text style={styles.clearNotifText}>Mark all as read</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 36,
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
  searchSubmitBtn: {
    backgroundColor: Colors.brand.coral,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  searchSubmitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginRight: 10,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  clearNotifBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  clearNotifText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: Colors.brand.navy,
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
