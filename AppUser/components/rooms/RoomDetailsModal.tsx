import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Users,
  Maximize2,
  BedDouble,
  Wifi,
  Snowflake,
  Coffee,
  Tv,
  Bath,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import RoomImageSlider from './RoomImageSlider';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  room: any | null;
  pricing?: any;
  requiredRooms?: number;
  availableRooms?: number;
  propertyAmenities?: string[];
  isUnavailable?: boolean;
  unavailableReason?: string;
  onReserve: (room: any) => void;
}

export default function RoomDetailsModal({
  visible,
  onClose,
  room,
  pricing,
  requiredRooms = 1,
  availableRooms,
  propertyAmenities,
  isUnavailable = false,
  unavailableReason = '',
  onReserve,
}: RoomDetailsModalProps) {
  const insets = useSafeAreaInsets();
  const bottomNavPadding = insets.bottom > 0
    ? (insets.bottom + 10)
    : (Platform.OS === 'android' ? 44 : 16);

  if (!room) return null;

  const roomImages = room.photos && Array.isArray(room.photos) && room.photos.length > 0
    ? room.photos
    : room.images && Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : room.image ? [room.image] : [];

  const maxCapacity = room.maximumCapacity || room.occupancy || 4;
  const roomSize = room.size || 350;
  const hasDescription = Boolean(
    room.description &&
    typeof room.description === 'string' &&
    room.description.trim().length > 0 &&
    !room.description.includes('Experience luxury, privacy, and scenic nature')
  );
  const description = hasDescription ? room.description.trim() : '';

  const amenitiesList: string[] = Array.isArray(room.amenities) && room.amenities.length > 0
    ? room.amenities
    : Array.isArray(room.inclusions) && room.inclusions.length > 0
      ? room.inclusions
      : [];

  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) {
      return <Wifi size={16} color={Colors.brand.coral} />;
    }
    if (lower.includes('ac') || lower.includes('air cond') || lower.includes('climate')) {
      return <Snowflake size={16} color={Colors.brand.coral} />;
    }
    if (lower.includes('coffee') || lower.includes('tea') || lower.includes('bar') || lower.includes('breakfast') || lower.includes('service')) {
      return <Coffee size={16} color={Colors.brand.coral} />;
    }
    if (lower.includes('tv') || lower.includes('screen') || lower.includes('monitor') || lower.includes('entertainment')) {
      return <Tv size={16} color={Colors.brand.coral} />;
    }
    if (lower.includes('bath') || lower.includes('shower') || lower.includes('toilet') || lower.includes('geyser') || lower.includes('pool')) {
      return <Bath size={16} color={Colors.brand.coral} />;
    }
    if (lower.includes('bed') || lower.includes('linen') || lower.includes('mattress')) {
      return <BedDouble size={16} color={Colors.brand.coral} />;
    }
    return <CheckCircle2 size={16} color={Colors.brand.coral} />;
  };

  const displayPrice = pricing?.roomSubtotal
    ? pricing.roomSubtotal * requiredRooms
    : Number(room.price || 0) * requiredRooms;

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
            <View style={[styles.modalCard, { maxHeight: SCREEN_HEIGHT * 0.9 }]}>
              {/* Top Drag Indicator */}
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Close Button Header */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.8}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X color="#475569" size={20} />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {/* 1. Room Image Slider */}
                <View style={styles.sliderContainer}>
                  <RoomImageSlider images={roomImages} sliderHeight={220} />
                </View>

                {/* 2. Room Title & Quick Stat Row */}
                <View style={styles.headerSection}>
                  <Text style={styles.roomTypeTag}>ROOM DETAILS</Text>
                  <Text style={styles.roomTitle}>{room.name}</Text>

                  {/* Quick Stat Inline Row matching web portal (Image 2) */}
                  <View style={styles.roomStatsInlineRow}>
                    <View style={styles.roomStatInlineItem}>
                      <Users size={14} color="#64748B" style={{ marginRight: 5 }} />
                      <Text style={styles.roomStatInlineText}>Up to {maxCapacity} guests</Text>
                    </View>
                    <Text style={styles.roomStatDivider}>|</Text>
                    <View style={styles.roomStatInlineItem}>
                      <Maximize2 size={14} color="#64748B" style={{ marginRight: 5 }} />
                      <Text style={styles.roomStatInlineText}>Size: {roomSize} sq ft</Text>
                    </View>
                    {Boolean(room.beds && room.beds.trim()) && (
                      <>
                        <Text style={styles.roomStatDivider}>|</Text>
                        <View style={styles.roomStatInlineItem}>
                          <BedDouble size={14} color="#64748B" style={{ marginRight: 5 }} />
                          <Text style={styles.roomStatInlineText}>{room.beds.trim()}</Text>
                        </View>
                      </>
                    )}
                  </View>

                  {/* Room Inventory display matching Image 2 */}
                  <View style={styles.roomInventoryRow}>
                    <BedDouble
                      size={16}
                      color={(availableRooms ?? 1) > 0 ? '#10B981' : '#EF4444'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.roomInventoryText,
                        { color: (availableRooms ?? 1) > 0 ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {availableRooms ?? 1} {(availableRooms ?? 1) === 1 ? 'room' : 'rooms'} left
                    </Text>
                  </View>
                </View>

                {/* 3. About This Space (only if non-empty) */}
                {hasDescription ? (
                  <>
                    <View style={styles.sectionDivider} />
                    <View style={styles.section}>
                      <Text style={styles.sectionHeading}>About this space</Text>
                      <Text style={styles.descriptionText}>{description}</Text>
                    </View>
                  </>
                ) : null}

                {/* 4. What This Room Offers (only if real amenities exist) */}
                {amenitiesList && amenitiesList.length > 0 ? (
                  <>
                    <View style={styles.sectionDivider} />
                    <View style={styles.section}>
                      <Text style={styles.sectionHeading}>What this room offers</Text>
                      <View style={styles.amenityGrid}>
                        {amenitiesList.map((amenity, idx) => (
                          <View key={idx} style={styles.amenityBadge}>
                            <View style={styles.amenityIconWrap}>
                              {getAmenityIcon(amenity)}
                            </View>
                            <Text style={styles.amenityName} numberOfLines={2}>
                              {amenity}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </>
                ) : null}
              </ScrollView>

              {/* Bottom Reservation Bar */}
              <View style={[styles.bottomStickyBar, { paddingBottom: bottomNavPadding }]}>
                <View style={styles.priceContainer}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceAmount}>₹{displayPrice.toLocaleString('en-IN')}</Text>
                    <Text style={styles.perNightLabel}>/ night</Text>
                  </View>
                  {requiredRooms > 1 && (
                    <Text style={styles.subDetailText}>For {requiredRooms} rooms</Text>
                  )}
                  {pricing && pricing.extraGuests > 0 && (
                    <Text style={styles.extraGuestText}>
                      Includes ₹{(pricing.extraGuestAmount * requiredRooms).toLocaleString('en-IN')} extra bed
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.reserveBtn,
                    isUnavailable && styles.reserveBtnDisabled,
                  ]}
                  disabled={isUnavailable}
                  onPress={() => {
                    onClose();
                    onReserve(room);
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.reserveBtnText}>
                    {isUnavailable ? 'Unavailable' : 'Reserve Room'}
                  </Text>
                  {!isUnavailable && <ArrowRight color="#FFFFFF" size={16} style={{ marginLeft: 4 }} />}
                </TouchableOpacity>
              </View>

              {isUnavailable && unavailableReason ? (
                <View style={styles.unavailableBanner}>
                  <Text style={styles.unavailableReasonText}>{unavailableReason}</Text>
                </View>
              ) : null}
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
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  handleBar: {
    width: 44,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sliderContainer: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  roomTypeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.4,
    marginBottom: 12,
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
  roomInventoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 8,
  },
  roomInventoryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    fontWeight: '400',
  },
  amenityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBadge: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  amenityIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  amenityName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.brand.navy,
    flex: 1,
  },
  bottomStickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  priceContainer: {
    flex: 1,
    marginRight: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.5,
  },
  perNightLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  subDetailText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brand.navy,
    marginTop: 2,
  },
  extraGuestText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.brand.coral,
    marginTop: 1,
  },
  gstTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 1,
  },
  reserveBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reserveBtnDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  reserveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  unavailableBanner: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  unavailableReasonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
  },
});
