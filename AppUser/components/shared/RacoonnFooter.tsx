import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MapPin, Phone, Mail, Send } from 'lucide-react-native';
import Colors from '@/constants/Colors';

export default function RacoonnFooter() {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <View style={styles.footerContainer}>
      
      {/* 1. Brand Info & Newsletter Card */}
      <View style={styles.brandSection}>
        <Image
          source={require('@/assets/images/Racoonn-Logo-02.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.brandDesc}>
          Find your perfect stay effortlessly. We provide premium hotel bookings for modern travelers seeking seamless experiences around the globe.
        </Text>

        {/* Newsletter Subscription Box */}
        <View style={styles.newsletterCard}>
          <Text style={styles.newsletterTitle}>Subscribe to our Newsletter</Text>
          <Text style={styles.newsletterSub}>
            Get the latest updates and exclusive offers directly in your inbox.
          </Text>

          {subscribed ? (
            <View style={styles.subscribedBox}>
              <Text style={styles.subscribedText}>✓ Thank you for subscribing to Racoonn!</Text>
            </View>
          ) : (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.emailInput}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={handleSubscribe}
                activeOpacity={0.85}
              >
                <Send color="#FFFFFF" size={18} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 2. Explore Quick Links */}
      <View style={styles.sectionBlock}>
        <View style={styles.headingWrapper}>
          <Text style={styles.sectionHeading}>Explore</Text>
          <View style={styles.accentBar} />
        </View>

        <View style={styles.linksGrid}>
          {[
            'Blog',
            'Search Hotels',
            'Special Offers',
            'Activities',
            'Tour Packages',
            'Destinations',
          ].map((linkName, idx) => (
            <View key={idx} style={styles.linkRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.linkText}>{linkName}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 3. Contact Info */}
      <View style={styles.sectionBlock}>
        <View style={styles.headingWrapper}>
          <Text style={styles.sectionHeading}>Contact Info</Text>
          <View style={styles.accentBar} />
        </View>

        <View style={styles.contactList}>
          {/* Location */}
          <View style={styles.contactItem}>
            <View style={styles.iconCircle}>
              <MapPin color={Colors.brand.coral} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactValue}>
                123 Travel Avenue, Suite 400{'\n'}New York, NY 10012
              </Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.contactItem}>
            <View style={styles.iconCircle}>
              <Phone color={Colors.brand.coral} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>+1 (555) 123-4567</Text>
            </View>
          </View>

          {/* Email */}
          <View style={styles.contactItem}>
            <View style={styles.iconCircle}>
              <Mail color={Colors.brand.coral} size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@racoonn.com</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* 5. Bottom Copyright & Credits */}
      <View style={styles.bottomBar}>
        <Text style={styles.copyrightText}>
          © 2026 Racoonn. All rights reserved.
        </Text>
        <Text style={styles.creditsText}>
          Design and Developed By Preet Tech
        </Text>

        <View style={styles.policyRow}>
          <Text style={styles.policyText}>Terms & Conditions</Text>
          <Text style={styles.policyDot}>•</Text>
          <Text style={styles.policyText}>Privacy Policy</Text>
        </View>

        {/* Social Icons */}
        <View style={styles.socialRow}>
          {['f', 't', 'ig', 'in'].map((social, idx) => (
            <View key={idx} style={styles.socialCircle}>
              <Text style={styles.socialText}>{social}</Text>
            </View>
          ))}
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: Colors.brand.navy,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 120,
    marginTop: 20,
  },
  brandSection: {
    marginBottom: 28,
  },
  logoImage: {
    height: 40,
    width: 150,
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoMascot: {
    fontSize: 18,
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 20,
    marginBottom: 20,
  },
  newsletterCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  newsletterTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  newsletterSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  emailInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
  },
  sendBtn: {
    backgroundColor: Colors.brand.coral,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribedBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  subscribedText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 20,
  },
  sectionBlock: {
    marginBottom: 8,
  },
  headingWrapper: {
    marginBottom: 16,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accentBar: {
    height: 3,
    width: 32,
    backgroundColor: Colors.brand.coral,
    borderRadius: 2,
    marginTop: 4,
  },
  linksGrid: {
    gap: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: Colors.brand.coral,
    marginRight: 10,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brand.sky,
  },
  contactList: {
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 12,
    color: Colors.brand.sky,
    lineHeight: 18,
  },
  bottomBar: {
    alignItems: 'center',
    gap: 8,
  },
  copyrightText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  creditsText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  policyText: {
    fontSize: 12,
    color: Colors.brand.sky,
    fontWeight: '600',
  },
  policyDot: {
    color: '#64748B',
    fontSize: 12,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  socialCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
