import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { MapPin, Bell, Camera, ShieldCheck, ArrowRight } from 'lucide-react-native';

const STORAGE_KEY = '@appuser_initial_permissions_requested_v2';
const { width } = Dimensions.get('window');

interface InitialPermissionsModalProps {
  onComplete?: () => void;
}

export default function InitialPermissionsModal({ onComplete }: InitialPermissionsModalProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((hasAsked) => {
        if (isMounted && !hasAsked) {
          setVisible(true);
        }
      })
      .catch((err) => {
        console.warn('Failed to check permission storage key:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAllowPermissions = async () => {
    setLoading(true);
    try {
      // 1. Request Location Permission
      try {
        await Location.requestForegroundPermissionsAsync();
      } catch (locErr) {
        console.warn('Location permission error:', locErr);
      }

      // 2. Request Notification Permission (safely for standalone & dev builds)
      try {
        const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
        if (!isExpoGo) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const Notifications = require('expo-notifications');
          if (Notifications && typeof Notifications.requestPermissionsAsync === 'function') {
            await Notifications.requestPermissionsAsync();
          }
        }
      } catch (notifErr) {
        console.warn('Notification permission error:', notifErr);
      }

      // 3. Request Camera & Media Library Permission
      try {
        await ImagePicker.requestCameraPermissionsAsync();
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      } catch (camErr) {
        console.warn('Camera/Media permission error:', camErr);
      }

      // 4. Save key to AsyncStorage so it won't prompt again
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {
      console.error('Error requesting initial permissions:', err);
    } finally {
      setLoading(false);
      setVisible(false);
      if (onComplete) onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {
      console.warn('Failed to save skip key:', err);
    }
    setVisible(false);
    if (onComplete) onComplete();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={handleSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconHeader}>
            <View style={styles.badgeIconBg}>
              <ShieldCheck size={28} color="#4F46E5" />
            </View>
          </View>

          <Text style={styles.title}>Welcome to Racoonn!</Text>
          <Text style={styles.subtitle}>
            To provide a seamless experience, Racoonn requires the following app permissions:
          </Text>

          <View style={styles.featureList}>
            {/* Feature 1: Location */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#EEF2FF' }]}>
                <MapPin size={22} color="#4F46E5" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Location Access</Text>
                <Text style={styles.featureDescription}>
                  Discover nearby hotels, stays, and activities around your current area.
                </Text>
              </View>
            </View>

            {/* Feature 2: Notifications */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Bell size={22} color="#D97706" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Push Notifications</Text>
                <Text style={styles.featureDescription}>
                  Get instant updates on booking status, check-in reminders & discounts.
                </Text>
              </View>
            </View>

            {/* Feature 3: Camera & Photos */}
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Camera size={22} color="#059669" />
              </View>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Camera & Media Library</Text>
                <Text style={styles.featureDescription}>
                  Upload profile avatars, booking document verifications & review photos.
                </Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAllowPermissions}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Allow & Continue</Text>
                  <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: Math.min(width - 40, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconHeader: {
    marginBottom: 12,
  },
  badgeIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  featureList: {
    width: '100%',
    marginBottom: 24,
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#64748B',
    lineHeight: 16,
  },
  actionContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
