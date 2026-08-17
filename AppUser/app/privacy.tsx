import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, Database, Eye, Share2, Lock, Cookie, Server, Mail } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <ShieldCheck color={Colors.brand.coral} size={32} />
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSub}>
            We are committed to protecting your personal information and your right to privacy.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Database color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          </View>
          <Text style={styles.sectionText}>
            We collect personal information that you voluntarily provide to us when you register on the Racoonn Platform, such as Names, phone numbers, email addresses, Payment Data, and Booking Data.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
          </View>
          <Text style={styles.sectionText}>
            We process your information to facilitate account creation, fulfill bookings, deliver targeted advertising, and respond to user inquiries.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Share2 color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>3. Data Sharing & Vendors</Text>
          </View>
          <Text style={styles.sectionText}>
            To provide our services, we may share your essential details with third-party vendors and hotel partners so they can prepare for your stay.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Lock color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>4. Data Security</Text>
          </View>
          <Text style={styles.sectionText}>
            We rely on robust encryption, SSL certificates, and secure cloud infrastructure to protect your personal information.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Cookie color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>5. Cookies & Tracking</Text>
          </View>
          <Text style={styles.sectionText}>
            We may use cookies and similar tracking technologies to access or store information to improve your user experience and maintain platform analytics.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>6. Data Retention</Text>
          </View>
          <Text style={styles.sectionText}>
            We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <Mail color="#FFF" size={20} />
            <Text style={[styles.sectionTitle, { color: '#FFF' }]}>Contact Us</Text>
          </View>
          <Text style={[styles.sectionText, { color: '#E2E8F0' }]}>
            If you have questions about your privacy rights, email our Data Protection Officer at privacy@racoonn.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Black',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginLeft: 12,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
});
