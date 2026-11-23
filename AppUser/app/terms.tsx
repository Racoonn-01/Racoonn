import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ShieldCheck,
  FileText,
  UserCheck,
  Layers,
  KeyRound,
  Ban,
  Clock,
  CreditCard,
  Receipt,
  RefreshCcw,
  Copyright,
  Lock,
  AlertTriangle,
  Scale,
  Briefcase,
  Building2,
} from 'lucide-react-native';
import Colors from '@/constants/Colors';

const termsSections = [
  {
    num: '1',
    title: 'Parties and Agreement',
    icon: ShieldCheck,
    content:
      'These Terms of Use ("Terms") constitute an electronic agreement between CIELLE TRAVELS PRIVATE LIMITED, operating the Racoonn platform ("Racoonn", "we", "us" or "Facilitator"), and the business, organization or authorized individual subscribing for or using Racoonn’s business travel and booking services ("Client", "you" or "your").\n\nBy signing an Order Form, creating or using a Business or Guest Account, or accessing the Racoonn platform and services, you acknowledge that you have read, understood and accepted these Terms. These Terms, together with any applicable Order Form, Annexures, Booking Conditions and Privacy Policy, constitute the Agreement.',
    callout:
      'Order of Precedence: If there is an inconsistency, the following order shall apply: (1) Order Form; (2) applicable Annexures or special commercial terms; (3) these Terms.',
  },
  {
    num: '2',
    title: 'Definitions',
    icon: FileText,
    definitions: [
      { term: 'Applicable Laws', desc: 'All laws, rules, regulations, orders and directions having force of law in India and applicable to the parties or Services.' },
      { term: 'Authorised User', desc: 'An employee, agent, representative or other person authorised by the Client to use Racoonn.' },
      { term: 'Business Account', desc: 'The Client’s administrative account through which Authorised Users may access the Services.' },
      { term: 'Platform', desc: 'Racoonn’s mobile applications, websites (racoonn.com), dashboards, booking systems, APIs, processes and other digital channels.' },
      { term: 'Primary Service Provider', desc: 'The third-party hotel, homestay, resort, tour operator, or transport provider ultimately responsible for delivering the Travel Service.' },
      { term: 'Travel Services', desc: 'The underlying travel services, including hotels, homestays, rooms, activities, tours, transfers, packages or other travel products supplied by Primary Service Providers.' },
      { term: 'Service Fee', desc: 'The fee payable to Racoonn for its facilitation or platform services, as specified in the applicable Order Form or Booking.' },
    ],
  },
  {
    num: '3',
    title: 'Scope of Services',
    icon: Layers,
    content:
      'Racoonn provides a technology-enabled travel booking and facilitation platform. Unless expressly stated in an Order Form, Racoonn acts as an intermediary/aggregator and is not the actual supplier of the underlying Travel Services.\n\nEach Travel Service may be governed by the separate terms, fare rules, cancellation rules, check-in rules and other conditions of the applicable Primary Service Provider. The Client agrees to comply with those conditions.',
  },
  {
    num: '4',
    title: 'Licence and Access',
    icon: KeyRound,
    content:
      'Subject to these Terms, Racoonn grants the Client a limited, non-exclusive, non-transferable and revocable right to access and use the Services for its internal travel requirements.\n\nThe Client is responsible for all actions and omissions of its Authorised Users. Client credentials may not be shared or transferred. The Client must promptly notify Racoonn of suspected unauthorized access.',
  },
  {
    num: '5',
    title: 'Usage Restrictions',
    icon: Ban,
    restrictions: [
      'Copy, reproduce or create a database from the Platform or its content except as expressly permitted.',
      'Remove or alter Racoonn’s copyright, trademark, security or proprietary notices.',
      'Modify, adapt, translate, reverse engineer, decompile or disassemble the Platform.',
      'Resell, sublicense, lease, distribute or commercially exploit the Services.',
      'Use automated tools, bots, scrapers or other mechanisms to extract Platform data.',
      'Attempt to bypass authentication, security, licensing or access controls.',
      'Introduce malware, viruses or other harmful code.',
      'Use the Services for unlawful, fraudulent or unauthorized activities.',
    ],
  },
  {
    num: '6',
    title: 'Client Responsibilities',
    icon: UserCheck,
    content:
      'The Client shall provide accurate information and reasonable cooperation necessary for Racoonn to provide the Services. The Client is responsible for its devices, internet/network connectivity, account security, traveller information, booking instructions and compliance with applicable laws.',
  },
  {
    num: '7',
    title: 'Platform Availability',
    icon: Clock,
    content:
      'Racoonn will use commercially reasonable efforts to make the Platform available. Availability may be interrupted for maintenance, upgrades, security events, technical failures, third-party failures or circumstances beyond Racoonn’s reasonable control. Racoonn does not guarantee uninterrupted or error-free operation.',
  },
  {
    num: '8',
    title: 'Bookings, Prices and Payments',
    icon: CreditCard,
    content:
      'The Client may be shown a Listing Price, applicable taxes, Service Fees, payment charges and other amounts before completing a Booking. Prices and availability may change until confirmation.\n\nA Booking becomes confirmed only when Racoonn or the relevant Service Provider issues a confirmation/reference number or voucher through an authorized channel.',
  },
  {
    num: '9',
    title: 'Invoices and Taxes',
    icon: Receipt,
    content:
      'Racoonn (through CIELLE TRAVELS PRIVATE LIMITED, GSTIN: 05AAOCC0859Q1Z0) will issue invoices for amounts for which it is legally responsible to invoice. A Primary Service Provider may separately issue an invoice for the underlying Travel Service where applicable.\n\nEach party shall comply with applicable GST (SAC 996311 / 998559), withholding tax and other tax obligations applicable to it.',
  },
  {
    num: '10',
    title: 'Cancellation, Modification and Refunds',
    icon: RefreshCcw,
    content:
      'Bookings are subject to the cancellation, modification, refund and no-show policies applicable to the relevant Travel Service. Racoonn facilitates eligible cancellation or refund requests.',
    cancellationCards: [
      {
        title: 'Standard Hotel Bookings',
        rules: [
          'Free cancellation up to 48 hours prior to check-in.',
          'Cancellations within 48 hours incur a 1-night retention fee.',
          'No-shows are 100% non-refundable.',
        ],
      },
      {
        title: 'Holiday Packages',
        rules: [
          'Free cancellation up to 7 days before departure.',
          '50% retention charge between 3 to 7 days.',
          'Non-refundable within 72 hours of departure.',
        ],
      },
    ],
    footer:
      'Approved refunds are processed to the original payment method within 5 to 7 business days.',
  },
  {
    num: '11',
    title: 'Intellectual Property',
    icon: Copyright,
    content:
      'Racoonn and/or its licensors retain all right, title and interest in the Platform, software, interfaces, designs, databases, content, trademarks, technology and Services, including modifications and improvements. No intellectual property rights are transferred to the Client.',
  },
  {
    num: '12',
    title: 'Data Privacy and Security',
    icon: Lock,
    content:
      'The parties shall process personal data in accordance with applicable data-protection law and Racoonn’s Privacy Policy. Racoonn maintains reasonable technical and organizational security measures appropriate to the nature of the information processed.',
  },
  {
    num: '13',
    title: 'Disclaimers & Limitation of Liability',
    icon: AlertTriangle,
    content:
      'The Platform and Services are provided on an "as is" and "as available" basis. Racoonn does not control or guarantee the quality, safety, legality, availability, accuracy or performance of third-party Travel Services. The Primary Service Provider remains responsible for delivery of its Travel Service.\n\nTo the maximum extent permitted by law, Racoonn’s aggregate liability arising from the Services shall not exceed the Service Fees actually paid or payable by the Client to Racoonn during the twelve (12) months preceding the event.',
  },
  {
    num: '14',
    title: 'Dispute Resolution & Governing Law',
    icon: Scale,
    content:
      'This Agreement shall be governed by the laws of India. The parties shall first attempt to resolve disputes through good-faith discussions within fifteen (15) working days of written notice. Subject to mandatory statutory jurisdiction, disputes shall be subject to the courts at Udham Singh Nagar / Nainital, Uttarakhand, India.',
  },
];

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>LEGAL & COMPLIANCE</Text>
          </View>
          <Text style={styles.heroTitle}>Terms of Use</Text>
          <Text style={styles.heroSub}>
            Racoonn Travel Platform • Operative Master Service Agreement & Platform Guidelines
          </Text>

          <View style={styles.metaCard}>
            <Text style={styles.metaText}>Operated by: <Text style={styles.metaBold}>CIELLE TRAVELS PRIVATE LIMITED</Text></Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaSub}>Effective Date: October 12, 2026</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaSub}>Version 2.4</Text>
            </View>
          </View>
        </View>

        {/* Content Clauses */}
        {termsSections.map((s, idx) => {
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

              {s.callout && (
                <View style={styles.calloutBox}>
                  <Text style={styles.calloutText}>{s.callout}</Text>
                </View>
              )}

              {s.definitions && (
                <View style={styles.defContainer}>
                  {s.definitions.map((d, i) => (
                    <View key={i} style={styles.defRow}>
                      <Text style={styles.defTerm}>{d.term}: </Text>
                      <Text style={styles.defDesc}>{d.desc}</Text>
                    </View>
                  ))}
                </View>
              )}

              {s.restrictions && (
                <View style={styles.restrictionsList}>
                  {s.restrictions.map((r, i) => (
                    <View key={i} style={styles.pointRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.pointText}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}

              {s.cancellationCards && (
                <View style={styles.cancelCardsGrid}>
                  {s.cancellationCards.map((c, i) => (
                    <View key={i} style={styles.cancelCard}>
                      <Text style={styles.cancelCardTitle}>{c.title}</Text>
                      {c.rules.map((rule, rIdx) => (
                        <View key={rIdx} style={styles.pointRow}>
                          <Text style={styles.bulletDot}>•</Text>
                          <Text style={styles.pointText}>{rule}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              )}

              {s.footer && (
                <Text style={styles.cancelFooter}>{s.footer}</Text>
              )}
            </View>
          );
        })}

        {/* Contact Details & Grievance Redressal */}
        <View style={styles.contactCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.iconCircle, { backgroundColor: '#FFFFFF' }]}>
              <Building2 color={Colors.brand.coral} size={18} />
            </View>
            <Text style={styles.sectionTitle}>15. Contact & Grievance Redressal</Text>
          </View>

          <View style={styles.contactBlock}>
            <Text style={styles.contactBlockHeading}>Racoonn / CIELLE TRAVELS PRIVATE LIMITED</Text>
            <Text style={styles.contactText}>CIN: U79110UR2023PTC015707 • GSTIN: 05AAOCC0859Q1Z0</Text>
            <Text style={styles.contactText}>Registered & Corporate Office: SECOND FLOOR PSA PLAZA, SHOP NO 207, NAINITAL ROAD, Rudrapur, Udham Singh Nagar, Uttarakhand, 263153</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://racoonn.com')}>
              <Text style={styles.contactLink}>Website: https://racoonn.com</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@racoonn.com')}>
              <Text style={styles.contactLink}>Support / Inquiries: info@racoonn.com | +91 8954442144</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactBlock}>
            <Text style={styles.contactBlockHeading}>Grievance Officer (IT Act & Consumer Protection Rules)</Text>
            <Text style={styles.contactText}>Designation: Nodal Grievance Redressal Officer</Text>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@racoonn.com')}>
              <Text style={styles.contactLink}>Grievance Email: info@racoonn.com</Text>
            </TouchableOpacity>
            <Text style={styles.contactFootnote}>
              * Grievances are acknowledged within 48 hours and resolved within 30 days of receipt as prescribed by statutory rules.
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
  calloutBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calloutText: {
    fontSize: 12.5,
    fontFamily: 'Inter-Medium',
    color: '#475569',
    lineHeight: 18,
  },
  defContainer: {
    gap: 8,
    marginTop: 4,
  },
  defRow: {
    marginBottom: 2,
  },
  defTerm: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
  },
  defDesc: {
    fontSize: 12.5,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    lineHeight: 18,
  },
  restrictionsList: {
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
  cancelCardsGrid: {
    gap: 10,
    marginTop: 10,
  },
  cancelCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelCardTitle: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  cancelFooter: {
    fontSize: 12.5,
    fontFamily: 'Inter-Medium',
    color: '#0F172A',
    marginTop: 10,
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
