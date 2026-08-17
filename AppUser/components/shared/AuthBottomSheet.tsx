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
import { useRouter } from 'expo-router';
import { X, LogIn, UserPlus } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface AuthBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

const { height } = Dimensions.get('window');

export default function AuthBottomSheet({ visible, onClose }: AuthBottomSheetProps) {
  const router = useRouter();

  const handleNavigate = (path: '/auth/login' | '/auth/register') => {
    onClose();
    // Allow modal to close smoothly before navigating
    setTimeout(() => {
      router.push(path as any);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Drag Indicator */}
              <View style={styles.dragIndicator} />

              {/* Close Button */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X color="#64748B" size={20} />
              </TouchableOpacity>

              {/* Content Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Sign in to Book</Text>
                <Text style={styles.subtitle}>
                  Join Racoonn for exclusive members-only deals and to easily manage your bookings.
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  activeOpacity={0.85}
                  onPress={() => handleNavigate('/auth/login')}
                >
                  <LogIn color="#FFFFFF" size={18} style={styles.btnIcon} />
                  <Text style={styles.primaryBtnText}>Log In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.85}
                  onPress={() => handleNavigate('/auth/register')}
                >
                  <UserPlus color={Colors.brand.navy} size={18} style={styles.btnIcon} />
                  <Text style={styles.secondaryBtnText}>Create an Account</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.5)', // Dark semi-transparent
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: height * 0.7,
  },
  dragIndicator: {
    width: 48,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    marginTop: 10,
    marginBottom: 32,
    paddingRight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.brand.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    color: Colors.brand.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 8,
  },
});
