import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ArrowRight, Tag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export default function SpecialOffersSection() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Tag color={Colors.brand.coral} size={14} />
          <Text style={styles.badgeText}>Exclusive Member Offer</Text>
        </View>

        <Text style={styles.title}>Get 20% Off Your First Luxury Booking</Text>
        <Text style={styles.subtitle}>
          Sign up today and unlock exclusive member-only deals, early access to new properties, and VIP perks on your travels.
        </Text>

        <TouchableOpacity
          style={styles.claimBtn}
          onPress={() => router.push('/auth/register' as any)}
          activeOpacity={0.9}
        >
          <Text style={styles.claimBtnText}>Claim Your Discount</Text>
          <ArrowRight color="#FFFFFF" size={16} style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  card: {
    backgroundColor: Colors.brand.sand,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(232, 106, 112, 0.25)',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 106, 112, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: {
    color: Colors.brand.coral,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.brand.navy,
    marginBottom: 10,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  claimBtn: {
    backgroundColor: Colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
