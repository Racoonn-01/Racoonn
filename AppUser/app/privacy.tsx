import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ShieldCheck,
  Database,
  Eye,
  Scale,
  Share2,
  Lock,
  Cookie,
  Server,
  KeyRound,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Mail,
  Building2,
  FileText,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';

const sections = [
  {
    num: '1',
    title: 'Overview & Scope',
    icon: ShieldCheck,
    content:
      'This Privacy Policy describes the privacy practices of CIELLE TRAVELS PRIVATE LIMITED ("Racoonn", "we", "us", or "our"), operating the platform at https://racoonn.com and its allied mobile dashboards and reservation systems.\n\nWe respect your right to privacy and are committed to safeguarding personal data in accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act), the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.\n\nBy accessing our platform, registering an account, or making a travel booking through Racoonn, you consent to the collection, use, and disclosure of your personal data as outlined in this Privacy Policy.',
  },
  {
    num: '2',
    title: 'Information We Collect',
    icon: Database,
    subItems: [
      {
        heading: 'A. Personal Identification & Contact Details',
        body: 'Full name, email address, mobile phone number, postal address, date of birth, gender, and government-issued photo identification details (such as Aadhaar, Voter ID, Driving Licence, or Passport details when mandated by hotel check-in regulations).',
      },
      {
        heading: 'B. Reservation & Travel Preferences',
        body: 'Check-in and check-out dates, destination choices, room category selections, number of guests and children, dietary preferences, special assistance requests, co-traveller names, and holiday package itineraries.',
      },
      {
        heading: 'C. Transactional & Invoicing Data',
        body: 'Booking reference numbers, order history, billing addresses, GSTIN numbers (for corporate business invoicing), and payment transaction IDs returned by our payment gateways.',
      },
      {
        heading: 'D. Technical & Usage Information',
        body: 'IP addresses, browser type, device identifiers, operating system version, search queries, page interaction timings, referring URLs, and analytics telemetry.',
      },
    ],
  },
  {
    num: '3',
    title: 'How We Use Your Personal Data',
    icon: Eye,
    points: [
      'Fulfilling Reservations: Confirming hotel room allocations, holiday packages, tour guide reservations, and generating official booking vouchers.',
      'Customer Support & Communication: Sending booking confirmations via email and SMS, itinerary updates, payment receipts, check-in reminders, and handling cancellation requests.',
      'Tax & Statutory Compliance: Generating valid GST tax invoices (under SAC 996311 / SAC 998559) and maintaining accounting ledgers required under Indian taxation laws.',
      'Fraud Prevention & Safety: Verifying payment authorizations, detecting suspicious account logins, combating bot attacks, and preventing fraudulent reservations.',
      'Platform Optimization: Analyzing search trends and user experience data to improve our search filters, hotel recommendations, and page load speeds.',
    ],
  },
  {
    num: '4',
    title: 'Lawful Grounds for Processing (DPDP Act, 2023)',
    icon: Scale,
    points: [
      'Consent: When you provide clear, affirmative consent upon signing up or placing a booking.',
      'Performance of Contract: To execute the travel booking contract formed between you and the property or tour operator.',
      'Legal Obligation: To satisfy statutory accounting, GST audit records, or law enforcement disclosure directives.',
      'Legitimate Uses: For safeguarding network security, resolving disputes, and enforcing our Terms of Use.',
    ],
  },
  {
    num: '5',
    title: 'Data Sharing with Hotels & Service Partners',
    icon: Share2,
    subItems: [
      {
        heading: 'Hotel & Homestay Partners:',
        body: 'We provide the booked property with your primary guest name, phone number, check-in dates, and room selection to ensure seamless check-in and room readiness.',
      },
      {
        heading: 'Tour & Transport Operators:',
        body: 'For holiday packages, essential traveler details are shared with our verified tour operators and transfer drivers for pickup arrangements.',
      },
      {
        heading: 'Infrastructure & Communication Vendors:',
        body: 'Cloud database providers, transactional email relays, and SMS notification partners operating under strict confidentiality covenants.',
      },
    ],
    note: 'We do not sell, rent, or trade your personal data to third-party telemarketers or unauthorized advertising networks under any circumstances.',
  },
  {
    num: '6',
    title: 'Payment Processing & Financial Data',
    icon: Lock,
    content:
      'Your financial security is paramount. Racoonn integrates with RBI-authorized, PCI-DSS Level 1 certified payment gateways (including Razorpay, PhonePe, Cashfree, UPI, and major Indian banking networks).\n\nWe never store raw credit card numbers, CVV codes, or net banking passwords on Racoonn servers. All payment instrument data is encrypted and transmitted directly through tokenized banking gateways. Racoonn only receives a secure transaction token, transaction status (Success/Failure), and payment reference ID.',
  },
  {
    num: '7',
    title: 'Cookies, Web Beacons & Tracking',
    icon: Cookie,
    points: [
      'Essential Session Storage: Required to keep you authenticated, maintain your booking checkout state, and secure application requests.',
      'Analytics Telemetry: Evaluates aggregated metrics, screen view durations, and search funnel drop-offs.',
      'Preference Storage: Remembers your preferred currency (INR), destination filters, and search dates.',
    ],
  },
  {
    num: '8',
    title: 'Data Retention & Storage',
    icon: Server,
    content:
      'We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, resolve disputes, and comply with mandatory legal, tax, and auditing requirements in India.\n\nBooking transaction records and statutory GST tax invoices are retained for a minimum statutory period of eight (8) years in accordance with Section 36 of the Central Goods and Services Tax Act, 2017. Following the expiration of required retention periods, personal data is permanently deleted or anonymized.',
  },
  {
    num: '9',
    title: 'Information Security Measures',
    icon: KeyRound,
    points: [
      'End-to-end transport layer security (TLS 1.3 / SSL encryption) on all communications.',
      'Restricted role-based access control (RBAC) limiting customer data access strictly to authorized support personnel.',
      'Automated database backups and encrypted cloud storage infrastructure.',
      'Periodic vulnerability scanning and API endpoint protection against SQL injection and cross-site scripting (XSS).',
    ],
  },
  {
    num: '10',
    title: 'Your Privacy Rights & Choices',
    icon: UserCheck,
    points: [
      'Right to Access: You can request a summary of the personal data we hold about you and your booking history.',
      'Right to Correction & Erasure: You can update inaccurate profile information or request the deletion of your account (subject to statutory invoicing retention limits).',
      'Right to Withdraw Consent: You may opt out of non-essential promotional communications at any time via unsubscribe links or by emailing us.',
      'Right of Grievance Redressal: You have the right to register a grievance with our designated Grievance Officer regarding any data handling concern.',
    ],
  },
  {
    num: '11',
    title: "Children's Privacy",
    icon: AlertCircle,
    content:
      'Racoonn does not knowingly collect personal data from individuals under 18 years of age without parental or guardian supervision. Minors may only travel as co-guests on reservations made by an adult legal guardian. If we discover that personal data of a minor has been collected without verifiable parental consent, we will promptly delete such information.',
  },
  {
    num: '12',
    title: 'Updates to this Privacy Policy',
    icon: RefreshCw,
    content:
      'We may update this Privacy Policy from time to time to accommodate evolving legal mandates, technological advancements, or changes in our operational procedures. When updates are published, the revised "Effective Date" at the top of this document will be amended accordingly. We encourage you to review this page periodically.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>LEGAL & DATA PROTECTION</Text>
          </View>
          <Text style={styles.heroTitle}>Privacy Policy</Text>
          <Text style={styles.heroSub}>
            How Racoonn collects, handles, stores, and safeguards your personal data across our mobile platform and reservation systems.
          </Text>

          <View style={styles.metaCard}>
            <Text style={styles.metaText}>Operated by: <Text style={styles.metaBold}>CIELLE TRAVELS PRIVATE LIMITED</Text></Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaSub}>Effective Date: October 12, 2026</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaSub}>Version 2.1</Text>
            </View>
          </View>
        </View>

        {/* Policy Sections */}
        {sections.map((s, idx) => {
          const IconComp = s.icon;
          return (
            <View key={idx} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconCircle}>
                  <IconComp color={Colors.brand.coral} size={18} />
                </View>
                <Text style={styles.sectionTitle}>{s.num}. {s.title}</Text>
              </View>

              {s.content && (
                <Text style={styles.sectionParagraph}>{s.content}</Text>
              )}

              {s.subItems && (
                <View style={styles.subItemsContainer}>
                  {s.subItems.map((item, i) => (
                    <View key={i} style={styles.subItemBox}>
                      <Text style={styles.subItemHeading}>{item.heading}</Text>
                      <Text style={styles.subItemBody}>{item.body}</Text>
                    </View>
                  ))}
                </View>
              )}

              {s.points && (
                <View style={styles.pointsList}>
                  {s.points.map((pt, i) => (
                    <View key={i} style={styles.pointRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.pointText}>{pt}</Text>
                    </View>
                  ))}
                </View>
              )}

              {s.note && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>* {s.note}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Section 13: Grievance Officer & Contact Details */}
        <View style={styles.contactCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
              <Building2 color={Colors.brand.coral} size={18} />
            </View>
            <Text style={styles.sectionTitle}>13. Grievance Officer & Contact Details</Text>
          </View>

          <View style={styles.contactBlock}>
            <Text style={styles.contactBlockHeading}>Data Controller / Operating Entity</Text>
            <Text style={styles.contactText}><Text style={styles.metaBold}>CIELLE TRAVELS PRIVATE LIMITED</Text> (operating Racoonn)</Text>
            <Text style={styles.contactText}>CIN: U79110UR2023PTC015707 • GSTIN: 05AAOCC0859Q1Z0</Text>
            <Text style={styles.contactText}>Registered & Corporate Office: SECOND FLOOR PSA PLAZA, SHOP NO 207, NAINITAL ROAD, Rudrapur, Udham Singh Nagar, Uttarakhand, 263153</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@racoonn.com')}>
              <Text style={styles.contactLink}>General Inquiries: info@racoonn.com | +91 8954442144</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactBlock}>
            <Text style={styles.contactBlockHeading}>Nodal Grievance & Data Protection Officer</Text>
            <Text style={styles.contactText}>
              Under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DPDP Act, 2023:
            </Text>
            <Text style={styles.contactText}>Designation: Grievance Redressal Officer</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@racoonn.com')}>
              <Text style={styles.contactLink}>Email: info@racoonn.com</Text>
            </TouchableOpacity>
            <Text style={styles.contactFootnote}>
              * Grievances are acknowledged within 48 hours and resolved within thirty (30) days as prescribed by law.
            </Text>
          </View>
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 17,
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
    marginBottom: 20,
    marginTop: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: Colors.brand.coral,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Inter-Black',
    color: '#0F172A',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  metaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  metaBold: {
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaSub: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  metaDot: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    flex: 1,
  },
  sectionParagraph: {
    fontSize: 13.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 21,
  },
  subItemsContainer: {
    gap: 8,
    marginTop: 4,
  },
  subItemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subItemHeading: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  subItemBody: {
    fontSize: 12.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 18,
  },
  pointsList: {
    gap: 8,
    marginTop: 4,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    color: Colors.brand.coral,
    marginRight: 8,
    lineHeight: 20,
  },
  pointText: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 19,
    flex: 1,
  },
  noteBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  noteText: {
    fontSize: 11.5,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    color: '#64748B',
    lineHeight: 16,
  },
  contactCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactBlock: {
    marginTop: 6,
    gap: 4,
  },
  contactBlockHeading: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 18,
  },
  contactLink: {
    fontSize: 12.5,
    fontFamily: 'Inter-SemiBold',
    color: Colors.brand.coral,
    marginTop: 2,
  },
  contactFootnote: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
});
