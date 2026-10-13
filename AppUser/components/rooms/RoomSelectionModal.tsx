import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, User, Maximize2, ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RoomSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  rooms: any[];
  hotelTitle: string;
  totalGuests: number;
  selectedRoomsCount: number;
  onSelectRoom: (room: any) => void;
}

export default function RoomSelectionModal({
  visible,
  onClose,
  rooms,
  hotelTitle,
  totalGuests,
  selectedRoomsCount,
  onSelectRoom,
}: RoomSelectionModalProps) {
  const insets = useSafeAreaInsets();

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
                {
                  maxHeight: SCREEN_HEIGHT * 0.85,
                  paddingBottom: insets.bottom > 0
                    ? (insets.bottom + 12)
                    : (Platform.OS === 'android' ? 44 : 20),
                },
              ]}
            >
              {/* Top Drag Indicator */}
              <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
              </View>

              {/* Header */}
              <View style={styles.headerRow}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.modalTitle}>Select a Room</Text>
                  <Text style={styles.modalSubTitle} numberOfLines={1}>
                    Choose your room at {hotelTitle}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <X color="#475569" size={20} />
                </TouchableOpacity>
              </View>

              {/* Rooms List */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              >
                {rooms && rooms.length > 0 ? (
                  rooms.map((room, idx) => {
                    const maxCap = room.maximumCapacity || room.occupancy || 4;
                    const requiredRooms = Math.max(
                      selectedRoomsCount,
                      Math.ceil(totalGuests / maxCap)
                    );
                    const safeGuestsPerRoom = Math.ceil(totalGuests / requiredRooms);
                    const extraGuests = Math.max(
                      0,
                      safeGuestsPerRoom - (room.standardCapacity || 2)
                    );
                    const epc = Number(room.extraPersonCharge || 0);
                    const basePrice = Number(room.price || 0);
                    const pricePerNight = basePrice + extraGuests * epc;
                    const displayTotal = pricePerNight * requiredRooms;

                    const roomImage =
                      room.images?.[0] ||
                      room.photos?.[0] ||
                      room.image ||
                      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&auto=format&fit=crop';

                    const roomOccupied = room.occupiedCount || 0;
                    const totalRms = room.totalRooms !== undefined && room.totalRooms !== null ? Number(room.totalRooms) : 0;
                    const roomAvail = room.availableRooms !== undefined
                      ? Number(room.availableRooms)
                      : Math.max(0, totalRms - roomOccupied);

                    const isSoldOut = roomAvail <= 0 || roomAvail < requiredRooms;

                    return (
                      <View key={room.id || idx} style={styles.roomCard}>
                        {/* Thumbnail */}
                        <Image
                          source={{ uri: roomImage }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />

                        {/* Details */}
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomName} numberOfLines={1}>
                            {room.name}
                          </Text>

                          <View style={styles.badgeRow}>
                            <View style={styles.specBadge}>
                              <User size={12} color="#64748B" style={{ marginRight: 4 }} />
                              <Text style={styles.specBadgeText}>Max: {maxCap}</Text>
                            </View>

                            {Boolean(room.size) && (
                              <View style={styles.specBadge}>
                                <Maximize2 size={12} color="#64748B" style={{ marginRight: 4 }} />
                                <Text style={styles.specBadgeText}>{room.size} sq ft</Text>
                              </View>
                            )}
                          </View>

                          {/* Price & Action */}
                          <View style={styles.priceActionRow}>
                            <View>
                              <View style={styles.priceLine}>
                                <Text style={styles.roomPrice}>
                                  ₹{displayTotal.toLocaleString('en-IN')}
                                </Text>
                                <Text style={styles.perNightLabel}>/night</Text>
                              </View>
                              {requiredRooms > 1 && (
                                <Text style={styles.roomCountHint}>
                                  For {requiredRooms} rooms
                                </Text>
                              )}
                            </View>

                            <TouchableOpacity
                              style={[
                                styles.selectBtn,
                                isSoldOut && styles.selectBtnDisabled,
                              ]}
                              disabled={isSoldOut}
                              onPress={() => {
                                onClose();
                                onSelectRoom(room);
                              }}
                              activeOpacity={0.88}
                            >
                              <Text style={styles.selectBtnText}>
                                {isSoldOut ? 'Unavailable' : 'Select'}
                              </Text>
                              {!isSoldOut && (
                                <ArrowRight color="#FFFFFF" size={14} style={{ marginLeft: 4 }} />
                              )}
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No rooms available right now.</Text>
                  </View>
                )}
              </ScrollView>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.brand.navy,
    letterSpacing: -0.4,
  },
  modalSubTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#0F172A',
  },
  roomInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.brand.navy,
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  specBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  specBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  priceActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  perNightLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 2,
  },
  roomCountHint: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.brand.navy,
  },
  gstHint: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  selectBtn: {
    backgroundColor: Colors.brand.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  selectBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
