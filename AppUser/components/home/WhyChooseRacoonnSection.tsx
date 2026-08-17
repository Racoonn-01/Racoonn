import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, ShieldCheck, CreditCard, Headphones } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const features = [
  {
    icon: <CheckCircle2 size={28} color={Colors.brand.coral} />,
    title: 'Seamless Booking',
    description: 'Experience a smooth and hassle-free booking process from search to confirmation in just a few clicks.',
  },
  {
    icon: <ShieldCheck size={28} color={Colors.brand.coral} />,
    title: 'Trusted Stays',
    description: 'Every property on Racoonn is verified and reviewed to ensure you get exactly what you expect.',
  },
  {
    icon: <CreditCard size={28} color={Colors.brand.coral} />,
    title: 'Secure Payments',
    description: 'Your transactions are encrypted and secured with industry-leading payment gateways.',
  },
  {
    icon: <Headphones size={28} color={Colors.brand.coral} />,
    title: '24/7 Support',
    description: 'Our dedicated travel experts are always available to help you before, during, and after your trip.',
  },
];

export default function WhyChooseRacoonnSection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Why Choose Racoonn</Text>
        <Text style={styles.subtitle}>
          We redefine travel by combining luxury, trust, and convenience into one seamless platform.
        </Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature, idx) => (
          <View key={idx} style={styles.card}>
            <View style={styles.iconCircle}>{feature.icon}</View>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDesc}>{feature.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginTop: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232, 106, 112, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.brand.sky,
    lineHeight: 19,
  },
});
