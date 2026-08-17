import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, UserCircle, CreditCard, RefreshCcw, Building2, AlertTriangle, Copyright, Mail } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconBox}>
            <ShieldCheck color={Colors.brand.coral} size={32} />
          </View>
          <Text style={styles.heroTitle}>Terms & Conditions</Text>
          <Text style={styles.heroSub}>
            Everything you need to know about using the Racoonn platform safely and securely for your bookings.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>1. Introduction</Text>
          </View>
          <Text style={styles.sectionText}>
            Welcome to Racoonn. These Terms and Conditions govern your use of the Racoonn mobile application and services. By accessing or using our Platform, you explicitly agree to comply with and be bound by these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserCircle color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>2. User Accounts</Text>
          </View>
          <Text style={styles.sectionText}>
            To unlock the full potential of Racoonn, registration is required. When you create an account with us, you guarantee that the information provided is accurate. You are responsible for maintaining the confidentiality of your account credentials.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>3. Booking & Payments</Text>
          </View>
          <Text style={styles.sectionText}>
            When you finalize a reservation through Racoonn, you are establishing a direct contractual relationship with the property Vendor. Room rates displayed include the base tariff. Payments are processed instantly through authorized providers.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <RefreshCcw color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>4. Cancellations & Refunds</Text>
          </View>
          <Text style={styles.sectionText}>
            Cancellation and prepayment policies vary depending on the property type. To cancel a booking, you must utilize the automated cancellation workflow within your Racoonn user dashboard.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Building2 color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>5. Vendor Responsibilities</Text>
          </View>
          <Text style={styles.sectionText}>
            Racoonn provides a technology platform but does not own or operate the physical properties. We are not liable for discrepancies between listing photos and the actual property or quality of services at the property.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>6. User Conduct</Text>
          </View>
          <Text style={styles.sectionText}>
            By engaging with our platform, you agree to refrain from any abusive, fraudulent, or harmful activities, including creating fake reservations or compromising platform integrity.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Copyright color={Colors.brand.coral} size={20} />
            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          </View>
          <Text style={styles.sectionText}>
            The Racoonn brand, logo, and aggregated content are the exclusive property of Racoonn Ltd. Unauthorized duplication or distribution is strictly prohibited.
          </Text>
        </View>

        <View style={styles.contactSection}>
          <View style={styles.sectionHeader}>
            <Mail color="#FFF" size={20} />
            <Text style={[styles.sectionTitle, { color: '#FFF' }]}>Contact Us</Text>
          </View>
          <Text style={[styles.sectionText, { color: '#E2E8F0' }]}>
            Our legal and support teams are available 24/7. Email us at legal@racoonn.com to clarify any doubts you might have regarding these policies.
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
