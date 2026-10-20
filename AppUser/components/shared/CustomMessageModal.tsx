import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { AlertTriangle, AlertCircle, CheckCircle2, Info, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface CustomMessageModalProps {
  visible: boolean;
  type?: 'error' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  onClose?: () => void;
}

export default function CustomMessageModal({
  visible,
  type = 'error',
  title,
  message,
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  onClose,
}: CustomMessageModalProps) {
  if (!visible) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onPrimaryPress) {
      onPrimaryPress();
    }
  };

  const renderIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#FEF3C7' }]}>
            <AlertCircle color="#D97706" size={28} />
          </View>
        );
      case 'success':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#DCFCE7' }]}>
            <CheckCircle2 color="#16A34A" size={28} />
          </View>
        );
      case 'info':
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#E0E7FF' }]}>
            <Info color="#4F46E5" size={28} />
          </View>
        );
      case 'error':
      default:
        return (
          <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
            <AlertTriangle color="#EF4444" size={28} />
          </View>
        );
    }
  };

  const getPrimaryButtonBg = () => {
    if (type === 'warning') return '#D97706';
    if (type === 'success') return '#16A34A';
    if (type === 'info') return Colors.brand.navy || '#0F172A';
    return Colors.brand.coral || '#FF5A5F';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.card}>
              {/* Close X Button */}
              {onClose && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X color="#94A3B8" size={18} />
                </TouchableOpacity>
              )}

              {/* Icon Badge */}
              {renderIcon()}

              {/* Title & Message */}
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                {Boolean(secondaryButtonText && onSecondaryPress) && (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    activeOpacity={0.75}
                    onPress={onSecondaryPress}
                  >
                    <Text style={styles.secondaryBtnText}>{secondaryButtonText}</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: getPrimaryButtonBg() },
                    !secondaryButtonText && { flex: 1 },
                  ]}
                  activeOpacity={0.85}
                  onPress={onPrimaryPress || handleClose}
                >
                  <Text style={styles.primaryBtnText}>{primaryButtonText}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH - 48, 360),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
});
