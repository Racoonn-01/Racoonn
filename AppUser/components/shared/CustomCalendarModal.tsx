import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { parseFlexibleDate, formatDisplayDate } from '../../utils/dateUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface CustomCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  checkInDate: string; // e.g. "13 Oct, 2026"
  checkOutDate?: string; // e.g. "14 Oct, 2026"
  onSelectDates: (checkIn: string, checkOut: string) => void;
  initialStep?: 'checkin' | 'checkout';
  mode?: 'range' | 'single';
}

export default function CustomCalendarModal({
  visible,
  onClose,
  checkInDate,
  checkOutDate = '',
  onSelectDates,
  initialStep = 'checkin',
  mode = 'range',
}: CustomCalendarModalProps) {
  const insets = useSafeAreaInsets();

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [activeStep, setActiveStep] = useState<'checkin' | 'checkout'>(initialStep);

  const [tempCheckIn, setTempCheckIn] = useState<Date>(() => {
    const inD = parseFlexibleDate(checkInDate);
    return inD.getTime() < today.getTime() ? today : inD;
  });

  const [tempCheckOut, setTempCheckOut] = useState<Date>(() => {
    const inD = parseFlexibleDate(checkInDate);
    const safeIn = inD.getTime() < today.getTime() ? today : inD;
    const outD = parseFlexibleDate(checkOutDate);
    if (!checkOutDate || outD.getTime() <= safeIn.getTime()) {
      const next = new Date(safeIn);
      next.setDate(next.getDate() + 1);
      return next;
    }
    return outD;
  });

  const [viewDate, setViewDate] = useState<Date>(() => {
    const inD = parseFlexibleDate(checkInDate);
    const safeIn = inD.getTime() < today.getTime() ? today : inD;
    return new Date(safeIn.getFullYear(), safeIn.getMonth(), 1);
  });

  // Re-sync on modal open so dates and month are always live and current
  useEffect(() => {
    if (visible) {
      const inD = parseFlexibleDate(checkInDate);
      const safeIn = inD.getTime() < today.getTime() ? today : inD;
      setTempCheckIn(safeIn);

      const outD = parseFlexibleDate(checkOutDate);
      if (!checkOutDate || outD.getTime() <= safeIn.getTime()) {
        const next = new Date(safeIn);
        next.setDate(next.getDate() + 1);
        setTempCheckOut(next);
      } else {
        setTempCheckOut(outD);
      }

      setViewDate(new Date(safeIn.getFullYear(), safeIn.getMonth(), 1));
      setActiveStep(initialStep);
    }
  }, [visible, checkInDate, checkOutDate, initialStep, today]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  const isCurrentOrPastMonth =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const handlePrevMonth = () => {
    if (isCurrentOrPastMonth) return;
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isBetweenDays = (target: Date, start: Date, end: Date) => {
    const t = target.getTime();
    return t > start.getTime() && t < end.getTime();
  };

  const handleDatePress = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    // Strict block: never allow backdate before today
    if (selected.getTime() < today.getTime()) {
      return;
    }

    if (mode === 'single') {
      setTempCheckIn(selected);
      return;
    }

    if (activeStep === 'checkin') {
      setTempCheckIn(selected);
      // Automatically set checkout to next day if previous checkout <= selected
      let nextOut = tempCheckOut;
      if (!tempCheckOut || tempCheckOut.getTime() <= selected.getTime()) {
        nextOut = new Date(selected.getTime() + 86400000);
        setTempCheckOut(nextOut);
      }
      setActiveStep('checkout');
    } else {
      if (selected.getTime() <= tempCheckIn.getTime()) {
        // If user tapped a date on/before check-in, set it as new check-in instead!
        setTempCheckIn(selected);
        const nextOut = new Date(selected.getTime() + 86400000);
        setTempCheckOut(nextOut);
      } else {
        setTempCheckOut(selected);
      }
    }
  };

  const handleApply = () => {
    if (mode === 'single') {
      onSelectDates(formatDisplayDate(tempCheckIn), formatDisplayDate(tempCheckIn));
      onClose();
      return;
    }
    onSelectDates(formatDisplayDate(tempCheckIn), formatDisplayDate(tempCheckOut));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                { paddingBottom: Math.max(insets.bottom + 16, 24) },
              ]}
            >
              {/* Drag Handle */}
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.modalTitle}>
                    {mode === 'single'
                      ? 'Select Start Date'
                      : activeStep === 'checkin'
                      ? 'Select Check-In Date'
                      : 'Select Check-Out Date'}
                  </Text>
                  <Text style={styles.modalSubTitle}>
                    {mode === 'single'
                      ? 'Tap any date to set Start Date'
                      : activeStep === 'checkin'
                      ? 'Tap any date to set Check-In'
                      : `Check-In: ${formatDisplayDate(tempCheckIn)}. Choose Check-Out date.`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <X color="#64748B" size={18} />
                </TouchableOpacity>
              </View>

              {/* Step Switcher Tabs (Only for Range Mode) */}
              {mode !== 'single' && (
                <View style={styles.stepTabsRow}>
                  <TouchableOpacity
                    style={[
                      styles.stepTab,
                      activeStep === 'checkin' && styles.stepTabActive,
                    ]}
                    onPress={() => setActiveStep('checkin')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.stepTabText,
                        activeStep === 'checkin' && styles.stepTabTextActive,
                      ]}
                    >
                      1. CHECK-IN ({formatDisplayDate(tempCheckIn)})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.stepTab,
                      activeStep === 'checkout' && styles.stepTabActive,
                    ]}
                    onPress={() => setActiveStep('checkout')}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.stepTabText,
                        activeStep === 'checkout' && styles.stepTabTextActive,
                      ]}
                    >
                      2. CHECK-OUT ({formatDisplayDate(tempCheckOut)})
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Calendar Month Header & Nav */}
              <View style={styles.calendarNavRow}>
                <TouchableOpacity
                  style={[
                    styles.navArrowBtn,
                    isCurrentOrPastMonth && { opacity: 0.25, backgroundColor: '#F1F5F9' },
                  ]}
                  disabled={isCurrentOrPastMonth}
                  onPress={handlePrevMonth}
                  activeOpacity={0.7}
                >
                  <ChevronLeft
                    color={isCurrentOrPastMonth ? '#94A3B8' : Colors.brand.navy}
                    size={20}
                  />
                </TouchableOpacity>

                <View style={styles.monthDisplayWrap}>
                  <CalendarIcon color={Colors.brand.coral} size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.monthYearTitle}>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.navArrowBtn}
                  onPress={handleNextMonth}
                  activeOpacity={0.7}
                >
                  <ChevronRight color={Colors.brand.navy} size={20} />
                </TouchableOpacity>
              </View>

              {/* Day of Week Labels */}
              <View style={styles.weekDaysRow}>
                {WEEK_DAYS.map((wd, i) => (
                  <Text key={i} style={styles.weekDayText}>
                    {wd}
                  </Text>
                ))}
              </View>

              {/* 7-Column Days Grid */}
              <View style={styles.daysGrid}>
                {/* Empty offset days */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCellEmpty} />
                ))}

                {/* Actual days in month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const currentCellDate = new Date(viewYear, viewMonth, dayNum);

                  const isPast = currentCellDate.getTime() < today.getTime();
                  const isCheckInSelected = isSameDay(currentCellDate, tempCheckIn);
                  const isCheckOutSelected = isSameDay(currentCellDate, tempCheckOut);
                  const isInRange =
                    mode === 'single'
                      ? false
                      : isBetweenDays(currentCellDate, tempCheckIn, tempCheckOut);

                  let isDisabled = isPast;
                  if (mode !== 'single' && activeStep === 'checkout') {
                    isDisabled = isPast || currentCellDate.getTime() <= tempCheckIn.getTime();
                  }

                  const isHighlighted =
                    mode === 'single'
                      ? isCheckInSelected
                      : isCheckInSelected || isCheckOutSelected;

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      disabled={isDisabled}
                      onPress={() => handleDatePress(dayNum)}
                      activeOpacity={0.8}
                      style={[
                        styles.dayCell,
                        isInRange && styles.dayCellInRange,
                        isHighlighted && styles.dayCellSelected,
                        isDisabled && styles.dayCellDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isInRange && styles.dayTextInRange,
                          isHighlighted && styles.dayTextSelected,
                          isDisabled && styles.dayTextDisabled,
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Confirm / Continue Button */}
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.88}
              >
                <Text style={styles.applyBtnText}>
                  {mode === 'single'
                    ? 'Confirm Start Date'
                    : activeStep === 'checkin'
                    ? 'Continue to Check-Out Date →'
                    : 'Confirm Dates'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 6,
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.3,
  },
  modalSubTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 16,
    gap: 4,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  stepTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stepTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  stepTabTextActive: {
    color: Colors.brand.coral,
    fontWeight: '900',
  },
  calendarNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplayWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthYearTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  weekDayText: {
    width: (SCREEN_WIDTH - 48) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayCellEmpty: {
    width: (SCREEN_WIDTH - 48) / 7,
    height: 40,
  },
  dayCell: {
    width: (SCREEN_WIDTH - 48) / 7,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellInRange: {
    backgroundColor: '#FFF1F2',
    borderRadius: 0,
  },
  dayCellSelected: {
    backgroundColor: Colors.brand.coral,
    borderRadius: 20,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  dayCellDisabled: {
    opacity: 0.28,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  dayTextInRange: {
    color: Colors.brand.coral,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dayTextDisabled: {
    color: '#94A3B8',
  },
  applyBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
