import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Hotel, Home } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const bookingReference = bookingId || 'BOOKING CONFIRMED';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.brand.navy} />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <CheckCircle2 color={Colors.brand.coral} size={64} />
        </View>

        <Text style={styles.title}>Booking Confirmed! 🎉</Text>
        <Text style={styles.subtitle}>
          Your stay has been reserved successfully. We have sent the confirmation voucher to your email.
        </Text>

        <View style={styles.card}>
          <Text style={styles.bookingIdLabel}>Booking Reference ID</Text>
          <Text style={styles.bookingId}>{bookingReference}</Text>


        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/profile' as any)}
          >
            <Hotel color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.replace('/' as any)}
          >
            <Home color={Colors.brand.navy} size={18} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.brand.softCoral,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.brand.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
    marginVertical: 14,
  },
  btnRow: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  secondaryBtnText: {
    color: Colors.brand.navy,
    fontSize: 15,
    fontWeight: '800',
  },
});
