import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LogOut,
  Award,
  CheckCircle2,
  Heart,
  User as UserIcon,
  Calendar,
  Globe,
  Mail,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
  Phone,
  PhoneCall,
  MessageSquare,
  X,
  Ticket,
  SlidersHorizontal,
  HelpCircle,
  CreditCard,
  Download,
  FileText,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import Colors from '@/constants/Colors';
import { calculateHotelGST } from '../../utils/gst';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../lib/appwrite/auth';
import { databases } from '../../lib/appwrite/config';
import { Query } from 'react-native-appwrite';
import { useRouter } from 'expo-router';

const DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
  '6a3cec630035d63ea963';

export default function UserPortalProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  // Form State
  const initialFirstName = profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || '';
  const initialLastName =
    profile?.name?.split(' ').slice(1).join(' ') || user?.name?.split(' ').slice(1).join(' ') || '';

  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [gender, setGender] = useState(profile?.gender || 'Male');
  const [dob, setDob] = useState(profile?.dob || '2004-05-25');
  const [nationality, setNationality] = useState(profile?.nationality || 'India');
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus || 'Single');
  const [anniversary, setAnniversary] = useState((profile as any)?.anniversary || '');
  const [city, setCity] = useState(profile?.city || '');
  const [state, setState] = useState(profile?.state || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Bookings State
  const [bookingTab, setBookingTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Modal Visibility States
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // 🌟 Generate & Download PDF Invoice
  const handleDownloadInvoice = async (item: any) => {
    try {
      setGeneratingPdfId(item.$id || item.bookingId || 'temp');
      const bookingRef = item.bookingId || item.$id?.substring(0, 8)?.toUpperCase() || 'RAC-893420';
      const titleName = item.hotelName || item.itemTitle || item.title || 'Luxury Resort & Stay';
      const guestFullName = `${firstName} ${lastName}`.trim() || user?.name || 'Valued Guest';
      const guestEmailAddr = email || user?.email || 'guest@racoonn.com';
      const guestPhoneNum = phone || '+91 9876543210';

      // Load racoon-favicon.jpg as base64 for embedding in PDF
      let logoBase64 = '';
      try {
        const logoAsset = Asset.fromModule(require('../../assets/images/racoon-favicon.jpg'));
        if (!logoAsset.downloaded) {
          await logoAsset.downloadAsync();
        }
        if (logoAsset.localUri) {
          logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } catch (e) {
        console.log('Favicon base64 load error:', e);
      }

      // 🌟 Precise Mathematical GST Calculation (Grand Total ALWAYS equals Room Charges + GST Amount)
      const totalPaid = Number(item.payment?.totalAmount || item.priceAfterTax || item.totalAmount || item.amount || 0);
      const nights = Math.max(1, Number(item.nights) || 1);
      const rooms = Math.max(1, Number(item.rooms) || 1);

      let roomChargesVal: number;
      let gstRateVal: number;
      let gstTypeVal: string;
      let gstAmountVal: number;
      let grandTotalVal: number;
      let perNightTariff: number;

      if (item.priceBeforeTax && item.gstAmount && item.priceAfterTax) {
        roomChargesVal = Math.round(Number(item.priceBeforeTax));
        gstRateVal = Number(item.gstPercentage ?? 5);
        gstAmountVal = Math.round(Number(item.gstAmount));
        grandTotalVal = roomChargesVal + gstAmountVal; // GUARANTEED MATHEMATICAL SUM
        gstTypeVal = item.gstType || (gstRateVal === 18 ? 'With ITC' : gstRateVal === 5 ? 'Without ITC' : 'Exempt');
        perNightTariff = Math.round(roomChargesVal / (nights * rooms));
      } else {
        const approxPerNight = totalPaid / (nights * rooms);
        if (approxPerNight <= 1000) {
          gstRateVal = 0;
          gstTypeVal = 'Exempt';
        } else if (approxPerNight <= 7875) {
          gstRateVal = 5;
          gstTypeVal = 'Without ITC';
        } else {
          gstRateVal = 18;
          gstTypeVal = 'With ITC';
        }

        roomChargesVal = Math.round(totalPaid / (1 + gstRateVal / 100));
        gstAmountVal = Math.round((roomChargesVal * gstRateVal) / 100);
        grandTotalVal = roomChargesVal + gstAmountVal; // GUARANTEED MATHEMATICAL SUM
        perNightTariff = Math.round(roomChargesVal / (nights * rooms));
      }

      const cgstVal = Math.round(gstAmountVal / 2);
      const sgstVal = gstAmountVal - cgstVal;

      const paidDateStr = (item.$createdAt ? new Date(item.$createdAt) : new Date()).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0F172A; padding: 32px; background: #FFFFFF; }
              .invoice-box { max-width: 720px; margin: auto; border: 1px solid #E2E8F0; padding: 36px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
              .top-row { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #F1F5F9; }
              .brand { font-size: 26px; font-weight: 900; color: #0F172A; letter-spacing: 2px; line-height: 1.1; }
              .brand-tag { font-size: 9.5px; font-weight: 800; color: #E86A70; letter-spacing: 2px; margin-top: 2px; text-transform: uppercase; }
              .inv-head { text-align: right; }
              .inv-title { font-size: 20px; font-weight: 900; color: #E86A70; letter-spacing: 1px; }
              .inv-sub { font-size: 11.5px; color: #64748B; margin-top: 3px; }
              .paid-badge { display: inline-block; background: #DCFCE7; color: #16A34A; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-top: 6px; }
              .details-grid { display: flex; justify-content: space-between; margin-top: 28px; margin-bottom: 28px; }
              .col { width: 48%; }
              .col-lbl { font-size: 10px; font-weight: 800; color: #94A3B8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 6px; }
              .col-val-title { font-size: 15px; font-weight: 800; color: #0F172A; }
              .col-val-sub { font-size: 12px; color: #475569; margin-top: 3px; }
              .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #F1F5F9; font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="top-row">
                <div style="display: flex; align-items: center;">
                  ${
                    logoBase64
                      ? `<img src="data:image/jpeg;base64,${logoBase64}" style="width: 44px; height: 44px; border-radius: 10px; margin-right: 14px; object-fit: cover; border: 1px solid #E2E8F0;" />`
                      : ''
                  }
                  <div>
                    <div class="brand">RACOONN</div>
                    <div class="brand-tag">Luxury Stays & Experiences</div>
                    <div style="font-size: 10.5px; color: #64748B; margin-top: 4px;">
                      GSTIN: <strong>05AACCR9841B1Z2</strong> | SAC Code: <strong>996311</strong>
                    </div>
                  </div>
                </div>
                <div class="inv-head">
                  <div class="inv-title">TAX INVOICE</div>
                  <div class="inv-sub">Invoice #: <strong>INV-${bookingRef}</strong></div>
                  <div class="inv-sub">Issued: <strong>${paidDateStr}</strong></div>
                  <div class="inv-sub">HSN / SAC: <strong>996311</strong></div>
                  <div><span class="paid-badge">✓ FULLY PAID</span></div>
                </div>
              </div>

              <div class="details-grid">
                <div class="col">
                  <div class="col-lbl">BILL TO (GUEST)</div>
                  <div class="col-val-title">${guestFullName}</div>
                  <div class="col-val-sub">Email: ${guestEmailAddr}</div>
                  <div class="col-val-sub">Phone: ${guestPhoneNum}</div>
                </div>
                <div class="col">
                  <div class="col-lbl">RESERVATION & TAX DETAILS</div>
                  <div class="col-val-title">${titleName}</div>
                  <div class="col-val-sub">Check-In: ${item.checkIn || 'N/A'} | Check-Out: ${item.checkOut || 'N/A'}</div>
                  <div class="col-val-sub">Per Night Tariff: ₹${perNightTariff.toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style="margin-top: 24px; margin-bottom: 24px; background: #F8FAFC; border: 1px solid #E2E8F0; padding: 22px; border-radius: 18px;">
                <div style="font-size: 14px; font-weight: 900; color: #0F172A; margin-bottom: 14px; border-bottom: 2px solid #CBD5E1; padding-bottom: 8px; letter-spacing: 0.5px;">
                  TAX SUMMARY
                </div>
                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">Room Charges (Subtotal)</td>
                    <td style="text-align: right; font-weight: 800; color: #0F172A;">₹${roomChargesVal.toLocaleString('en-IN')}</td>
                  </tr>
                  ${
                    gstRateVal > 0
                      ? `
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">Central GST (CGST @ ${(gstRateVal / 2).toFixed(1)}%)</td>
                    <td style="text-align: right; font-weight: 700; color: #334155;">₹${cgstVal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">State GST (SGST @ ${(gstRateVal / 2).toFixed(1)}%)</td>
                    <td style="text-align: right; font-weight: 700; color: #334155;">₹${sgstVal.toLocaleString('en-IN')}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">Total GST Rate</td>
                    <td style="text-align: right; font-weight: 800; color: #0F172A;">${gstRateVal}%</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">Total GST Amount</td>
                    <td style="text-align: right; font-weight: 800; color: #0F172A;">₹${gstAmountVal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #475569;">GST Type / Category</td>
                    <td style="text-align: right; font-weight: 800; color: #059669;">${gstTypeVal}</td>
                  </tr>
                  <tr style="border-top: 2px solid #CBD5E1; font-weight: 900; font-size: 16px;">
                    <td style="padding-top: 12px; color: #0F172A;">Grand Total</td>
                    <td style="text-align: right; padding-top: 12px; color: #E86A70;">₹${grandTotalVal.toLocaleString('en-IN')}</td>
                  </tr>
                </table>
                <div style="font-size: 10.5px; color: #64748B; margin-top: 14px; font-style: italic;">
                  GST applied as per Government of India hotel accommodation GST slab based on room tariff.
                </div>
              </div>

              <div class="footer">
                Thank you for choosing Racoonn! This digital receipt is valid proof of payment.<br/>
                Racoonn Corporate Desk • GSTIN: 05AACCR9841B1Z2 • SAC Code: 996311 • support@racoonn.com
              </div>
            </div>
          </body>
        </html>
      `;

      // 🌟 Failsafe PDF Download & Print Engine for Android & iOS
      try {
        if (Platform.OS === 'android') {
          // On Android, printAsync opens native Android Save as PDF / Download sheet cleanly without file permission errors
          await Print.printAsync({ html: htmlContent });
        } else {
          // On iOS, generate file and open native Share / Save to Files sheet
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              UTI: '.pdf',
              mimeType: 'application/pdf',
              dialogTitle: `Download Racoonn Invoice INV-${bookingRef}`,
            });
          } else {
            await Print.printAsync({ html: htmlContent });
          }
        }
      } catch (fileErr) {
        console.warn('PDF file share fallback to Print.printAsync:', fileErr);
        await Print.printAsync({ html: htmlContent });
      }
      setGeneratingPdfId(null);
    } catch (err) {
      setGeneratingPdfId(null);
      console.error('Invoice PDF error:', err);
      Alert.alert('Download Error', 'Could not generate or download PDF invoice. Please try again.');
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (profile || user) {
      const pName = profile?.name || user?.name || '';
      queueMicrotask(() => {
        setFirstName(pName.split(' ')[0] || '');
        setLastName(pName.split(' ').slice(1).join(' ') || '');
        setGender(profile?.gender || 'Male');
        setDob(profile?.dob || '2004-05-25');
        setNationality(profile?.nationality || 'India');
        setMaritalStatus(profile?.maritalStatus || 'Single');
        setCity(profile?.city || '');
        setState(profile?.state || '');
        setPhone(profile?.phone || '');
        setEmail(profile?.email || user?.email || '');
      });
    }
  }, [profile, user]);

  // Fetch Appwrite Bookings & Payments (Realtime Appwrite Sync matching User Portal)
  const fetchBookings = useCallback(async () => {
    if (!user?.$id) return;
    try {
      setLoadingBookings(true);
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'bookings', [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
        ]),
        databases.listDocuments(DATABASE_ID, 'booking_payments').catch(() => ({ documents: [] })),
      ]);

      const formatted = bookingsResponse.documents.map((doc: any) => {
        const payment = paymentsResponse.documents.find((p: any) => p.bookingId === doc.$id);

        let currentStatus = String(doc.status || 'Confirmed');
        if (currentStatus === 'Confirmed' && doc.checkOut && new Date(String(doc.checkOut)).getTime() < Date.now()) {
          currentStatus = 'Completed';
          databases.updateDocument(DATABASE_ID, 'bookings', doc.$id, { status: 'Completed' }).catch(console.error);
        }

        const totalAmountVal = payment
          ? Number(payment.totalAmount)
          : Number(doc.totalPrice || doc.amount || (Number(doc.nights || 1) * 18999));

        return {
          $id: doc.$id,
          bookingId: doc.$id,
          hotelName: doc.hotelName || doc.propertyName || 'Luxury Stay',
          location: doc.hotelLocation || doc.location || 'Uttarakhand',
          checkIn: doc.checkIn || 'N/A',
          checkOut: doc.checkOut || 'N/A',
          nights: Number(doc.nights) || 1,
          totalAmount: totalAmountVal,
          amount: totalAmountVal,
          status: currentStatus,
          paymentStatus: doc.paymentStatus || 'Paid',
          guests: doc.adults ? `${doc.adults} Adults${doc.children ? `, ${doc.children} Child` : ''}` : '2 Guests',
          image: doc.hotelImage || '',
          $createdAt: doc.$createdAt,
          payment: payment
            ? {
                roomPrice: payment.roomPrice,
                taxes: payment.taxes,
                serviceFees: payment.serviceFees,
                discount: payment.discount,
                totalAmount: payment.totalAmount,
              }
            : {
                roomPrice: Math.round(totalAmountVal / 1.18),
                taxes: totalAmountVal - Math.round(totalAmountVal / 1.18),
                serviceFees: 0,
                discount: 0,
                totalAmount: totalAmountVal,
              },
        };
      });

      setBookings(formatted);
    } catch (err) {
      console.error('Error listing user bookings from Appwrite:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [user]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchBookings();
    });
  }, [fetchBookings]);

  useEffect(() => {
    if (isBookingsModalOpen || isPaymentHistoryModalOpen) {
      queueMicrotask(() => {
        fetchBookings();
      });
    }
  }, [isBookingsModalOpen, isPaymentHistoryModalOpen, fetchBookings]);

  const handleSaveProfile = async () => {
    if (!user?.$id && !profile?.$id) {
      Alert.alert('Error', 'User profile not found. Please log in.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('idle');
      const updatedName = `${firstName} ${lastName}`.trim();
      const targetId = profile?.$id || user?.$id || '';

      await authService.saveUserProfile(targetId, {
        name: updatedName,
        email,
        phone,
        gender,
        dob,
        nationality,
        maritalStatus,
        city,
        state,
      });

      await checkAuth();
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingTab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'Upcoming';
    if (bookingTab === 'Completed') return b.status === 'Completed';
    if (bookingTab === 'Cancelled') return b.status === 'Cancelled';
    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator color={Colors.brand.coral} size="large" />
        <Text style={{ marginTop: 12, color: '#64748B', fontSize: 13, fontWeight: '600' }}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------
  // GUEST / LOGGED OUT STATE
  // ----------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={[styles.cleanHeader, { paddingTop: Math.max(insets.top + 8, 20) }]}>
          <Text style={styles.cleanHeaderTitle}>Profile & Account</Text>
          <Text style={styles.cleanHeaderSub}>Log in to manage bookings, e-tickets & saved stays</Text>
        </View>

        <ScrollView contentContainerStyle={styles.guestScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeHeroCard}>
            <View style={styles.mascotRingWrapper}>
              <View style={styles.mascotInnerSquare}>
                <Image
                  source={require('@/assets/images/racoon-favicon.jpg')}
                  style={{ width: '100%', height: '100%', borderRadius: 20 }}
                  resizeMode="cover"
                />
              </View>
            </View>

            <Text style={styles.welcomeHeading}>Welcome to Racoonn</Text>
            <Text style={styles.welcomeSubText}>
              Sign in to access your hotel vouchers, track active bookings, and unlock exclusive member rates.
            </Text>

            <View style={styles.authActionRow}>
              <TouchableOpacity
                style={styles.signInPrimaryBtn}
                activeOpacity={0.88}
                onPress={() => router.push('/auth/login' as any)}
              >
                <Text style={styles.signInPrimaryText}>Sign In</Text>
                <ArrowRight color="#FFFFFF" size={16} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerSecondaryBtn}
                activeOpacity={0.88}
                onPress={() => router.push('/auth/register' as any)}
              >
                <Text style={styles.registerSecondaryText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const displayName = profile?.name || user?.name || 'blackrolex1144';
  const displayEmail = profile?.email || user?.email || 'blackrolex1144@gmail.com';

  // ----------------------------------------------------
  // 🌟 FULL-SCREEN EDIT PROFILE VIEW (HIGH-END REDESIGN)
  // ----------------------------------------------------
  if (isPersonalModalOpen) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Header Bar */}
          <View style={[styles.editScreenHeader, { paddingTop: Math.max(insets.top + 8, 16) }]}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={() => setIsPersonalModalOpen(false)}
            >
              <ChevronLeft color="#0F172A" size={20} />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.editScreenTitle}>Personal Information</Text>
              <Text style={styles.editScreenSub}>Update check-in details & contact info</Text>
            </View>

            <TouchableOpacity
              style={styles.headerSaveBtn}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.brand.coral} size="small" />
              ) : (
                <Text style={styles.headerSaveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.editScreenBody}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Row 1: FIRST & MIDDLE NAME | LAST NAME */}
            <View style={styles.formTileRow}>
              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>FIRST & MIDDLE NAME</Text>
                <TextInput
                  style={styles.formTileInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Work"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>LAST NAME</Text>
                <TextInput
                  style={styles.formTileInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Himanshu"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Row 2: GENDER | DATE OF BIRTH */}
            <View style={styles.formTileRow}>
              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>GENDER</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Select"
                    placeholderTextColor="#94A3B8"
                  />
                  <ChevronDown color="#94A3B8" size={16} />
                </View>
              </View>

              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>DATE OF BIRTH</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={dob}
                    onChangeText={setDob}
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#94A3B8"
                  />
                  <Calendar color="#0F172A" size={16} />
                </View>
              </View>
            </View>

            {/* Row 3: NATIONALITY */}
            <View style={styles.formTileRow}>
              <View style={[styles.formTileCard, { width: '100%' }]}>
                <Text style={styles.formTileLabel}>NATIONALITY</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={nationality}
                    onChangeText={setNationality}
                    placeholder="Select Nationality"
                    placeholderTextColor="#94A3B8"
                  />
                  <ChevronDown color="#94A3B8" size={16} />
                </View>
              </View>
            </View>

            {/* Row 4: MARITAL STATUS | ANNIVERSARY */}
            <View style={styles.formTileRow}>
              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>MARITAL STATUS</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={maritalStatus}
                    onChangeText={setMaritalStatus}
                    placeholder="Select Status"
                    placeholderTextColor="#94A3B8"
                  />
                  <ChevronDown color="#94A3B8" size={16} />
                </View>
              </View>

              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>ANNIVERSARY</Text>
                <TextInput
                  style={styles.formTileInput}
                  value={anniversary}
                  onChangeText={setAnniversary}
                  placeholder="DD / Month"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Row 5: CITY OF RESIDENCE | STATE */}
            <View style={styles.formTileRow}>
              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>CITY OF RESIDENCE</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Select City"
                    placeholderTextColor="#94A3B8"
                  />
                  <ChevronDown color="#94A3B8" size={16} />
                </View>
              </View>

              <View style={styles.formTileCard}>
                <Text style={styles.formTileLabel}>STATE</Text>
                <View style={styles.tileSelectRow}>
                  <TextInput
                    style={[styles.formTileInput, { flex: 1 }]}
                    value={state}
                    onChangeText={setState}
                    placeholder="Select State"
                    placeholderTextColor="#94A3B8"
                  />
                  <ChevronDown color="#94A3B8" size={16} />
                </View>
              </View>
            </View>

            <Text style={styles.gstCaptionText}>Required for GST purpose on your tax invoice</Text>

            {/* Contact Details Section */}
            <View style={{ marginTop: 24, marginBottom: 12 }}>
              <Text style={styles.contactDetailsHeading}>Contact Details</Text>
              <Text style={styles.contactDetailsSub}>
                Add contact information to receive booking details & other alerts
              </Text>
            </View>

            {/* MOBILE NUMBER */}
            <View style={[styles.formTileCard, { width: '100%', marginBottom: 12 }]}>
              <Text style={styles.formTileLabel}>MOBILE NUMBER</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Phone color="#64748B" size={16} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.formTileInput, { flex: 1 }]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 9876543210"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* EMAIL ID */}
            <View style={[styles.formTileCard, { width: '100%', marginBottom: 12 }]}>
              <Text style={styles.formTileLabel}>EMAIL ID</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Mail color="#64748B" size={16} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.formTileInput, { flex: 1 }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="blackrolex1144@gmail.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {saveStatus === 'success' && (
              <View style={styles.saveSuccessBanner}>
                <CheckCircle2 color="#16A34A" size={16} style={{ marginRight: 6 }} />
                <Text style={styles.saveSuccessText}>Profile details updated successfully!</Text>
              </View>
            )}

            {/* 🌟 Big Primary Save Profile Button */}
            <TouchableOpacity
              style={styles.saveProfileMainBtn}
              onPress={handleSaveProfile}
              disabled={isSaving}
              activeOpacity={0.88}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <CheckCircle2 color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
                  <Text style={styles.saveProfileMainText}>Save Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Top Header Bar */}
        <View style={[styles.profileTopBar, { paddingTop: Math.max(insets.top + 8, 20) }]}>
          <View>
            <Text style={styles.topBarTitle}>Account & Settings</Text>
            <Text style={styles.topBarSub}>Manage check-in details & app preferences</Text>
          </View>
        </View>

        {/* 🌟 1. User Hero Card */}
        <View style={styles.userHeroCard}>
          <View style={styles.heroCardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroUserName}>{displayName}</Text>
              <Text style={styles.heroUserEmail}>{displayEmail}</Text>
            </View>

            <TouchableOpacity
              style={styles.editProfileBtn}
              activeOpacity={0.8}
              onPress={() => setIsPersonalModalOpen(true)}
            >
              <SlidersHorizontal color={Colors.brand.coral} size={14} style={{ marginRight: 4 }} />
              <Text style={styles.editProfileBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Interactive Stat Cards Grid */}
          <View style={styles.statsCardsRow}>
            <TouchableOpacity
              style={styles.statCardTile}
              activeOpacity={0.85}
              onPress={() => setIsBookingsModalOpen(true)}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#FFF1F2' }]}>
                <Ticket color={Colors.brand.coral} size={18} />
              </View>
              <Text style={styles.statTileVal}>{bookings.length || 0}</Text>
              <Text style={styles.statTileLbl}>Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCardTile}
              activeOpacity={0.85}
              onPress={() => router.push('/stays' as any)}
            >
              <View style={[styles.statIconBadge, { backgroundColor: '#FFF1F2' }]}>
                <Heart color={Colors.brand.coral} size={18} />
              </View>
              <Text style={styles.statTileVal}>
                {(profile?.savedHotels?.length || 0) + (profile?.savedPackages?.length || 0)}
              </Text>
              <Text style={styles.statTileLbl}>Saved</Text>
            </TouchableOpacity>

            <View style={styles.statCardTile}>
              <View style={[styles.statIconBadge, { backgroundColor: '#FFF1F2' }]}>
                <Award color={Colors.brand.coral} size={18} />
              </View>
              <Text style={styles.statTileVal}>2026</Text>
              <Text style={styles.statTileLbl}>Member</Text>
            </View>
          </View>
        </View>

        {/* 🌟 2. Grouped Settings Sections (iOS Style) */}

        {/* SECTION A: ACCOUNT & RESERVATIONS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderLabel}>ACCOUNT & RESERVATIONS</Text>

          <View style={styles.groupedCard}>
            {/* Profile Setting */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.75}
              onPress={() => setIsPersonalModalOpen(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <UserIcon color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Profile Settings</Text>
                  <Text style={styles.menuRowSub}>Personal details, name & check-in info</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* My Bookings */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.75}
              onPress={() => setIsBookingsModalOpen(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Calendar color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>My Bookings ({bookings.length})</Text>
                  <Text style={styles.menuRowSub}>Active e-tickets & past check-ins</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* Saved Wishlist */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.75}
              onPress={() => router.push('/two' as any)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Heart color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Saved Wishlist</Text>
                  <Text style={styles.menuRowSub}>View your bookmarked properties</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* Payment History */}
            <TouchableOpacity
              style={[styles.menuRowItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.75}
              onPress={() => setIsPaymentHistoryModalOpen(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <CreditCard color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Payment History</Text>
                  <Text style={styles.menuRowSub}>Tax invoices, transactions & receipts</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION B: PREFERENCES & SECURITY */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderLabel}>PREFERENCES & SECURITY</Text>

          <View style={styles.groupedCard}>
            {/* Privacy */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.75} onPress={() => router.push('/privacy' as any)}>
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <ShieldCheck color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Privacy & Security</Text>
                  <Text style={styles.menuRowSub}>Account security & data policies</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* Terms & Conditions */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.75} onPress={() => router.push('/terms' as any)}>
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <FileText color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Terms & Conditions</Text>
                  <Text style={styles.menuRowSub}>Platform rules & legal terms</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* Help & Support */}
            <TouchableOpacity
              style={[styles.menuRowItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.75}
              onPress={() => setIsSupportModalOpen(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <HelpCircle color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>24/7 Support & Concierge</Text>
                  <Text style={styles.menuRowSub}>Help center & customer service</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION C: ACCOUNT ACTIONS */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderLabel}>ACCOUNT ACTIONS</Text>

          <View style={styles.groupedCard}>
            {/* Log Out */}
            <TouchableOpacity
              style={[styles.menuRowItem, { borderBottomWidth: 0 }]}
              activeOpacity={0.75}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <LogOut color="#EF4444" size={18} />
                </View>
                <View>
                  <Text style={[styles.menuRowTitle, { color: '#EF4444' }]}>Log Out</Text>
                  <Text style={styles.menuRowSub}>Sign out of your Racoonn account</Text>
                </View>
              </View>
              <ChevronRight color="#EF4444" size={18} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>



      {/* 🌟 Bookings Modal */}
      <Modal
        visible={isBookingsModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBookingsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>My Bookings</Text>
                <Text style={styles.modalSub}>Manage active vouchers and past check-ins</Text>
              </View>
              <TouchableOpacity
                style={styles.closeCircleBtn}
                onPress={() => setIsBookingsModalOpen(false)}
              >
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.bookingTabsRow}>
              {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.bookingTabBtn, bookingTab === tab && styles.bookingTabBtnActive]}
                  onPress={() => setBookingTab(tab)}
                >
                  <Text style={[styles.bookingTabText, bookingTab === tab && styles.bookingTabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {loadingBookings ? (
                <ActivityIndicator color={Colors.brand.coral} size="large" style={{ marginVertical: 30 }} />
              ) : filteredBookings.length === 0 ? (
                <View style={styles.emptyBookingsBox}>
                  <Ticket color="#94A3B8" size={40} />
                  <Text style={styles.emptyBookingsTitle}>No {bookingTab.toLowerCase()} bookings</Text>
                  <Text style={styles.emptyBookingsSub}>Your reserved stays will appear here.</Text>
                </View>
              ) : (
                filteredBookings.map((b) => {
                  const perNight = b.roomPricePerNight || Math.round(Number(b.totalAmount || 0) / 1.18);
                  const gstCalc = calculateHotelGST(perNight, b.nights || 1, b.rooms || 1);
                  const gstSlab = b.gstPercentage ?? gstCalc.gstPercentage;
                  const gstAmt = b.gstAmount ?? gstCalc.gstAmount;
                  const itcStatus = b.gstType || gstCalc.gstType;

                  return (
                    <View key={b.$id} style={styles.bookingCardItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={styles.bookingTitle}>{b.hotelName || 'Reserved Hotel Stay'}</Text>
                          <Text style={styles.bookingDates}>{b.checkIn} → {b.checkOut}</Text>
                        </View>
                        <Text style={styles.bookingAmount}>₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}</Text>
                      </View>

                      {/* Tax Information Card */}
                      <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' }}>
                        <Text style={{ fontSize: 11.5, fontWeight: '800', color: Colors.brand.navy, marginBottom: 6 }}>
                          Tax Information
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>Room Tariff</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>₹{Number(perNight).toLocaleString('en-IN')} / Night</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>GST Slab</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>{gstSlab}%</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>GST Amount</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#0F172A' }}>₹{Number(gstAmt).toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
                          <Text style={{ fontSize: 11, color: '#64748B' }}>ITC Status</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>{itcStatus}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutDialogBox}>
            <View style={styles.logoutIconBadge}>
              <LogOut color="#EF4444" size={24} />
            </View>
            <Text style={styles.logoutDialogTitle}>Log Out of Racoonn?</Text>
            <Text style={styles.logoutDialogSub}>
              You will need to sign back in to access your booked vouchers and profile preferences.
            </Text>

            <View style={styles.logoutDialogBtnRow}>
              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelLogoutText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🌟 24/7 Support & Concierge Modal */}
      <Modal
        visible={isSupportModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSupportModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>24/7 Support & Concierge</Text>
                <Text style={styles.modalSub}>Racoonn VIP assistance & customer service</Text>
              </View>

              <TouchableOpacity
                style={styles.closeCircleBtn}
                onPress={() => setIsSupportModalOpen(false)}
              >
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 }}
            >
              {/* Concierge Pill Header */}
              <View style={styles.conciergePillHeader}>
                <View style={styles.conciergeIconRing}>
                  <HelpCircle color={Colors.brand.coral} size={20} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.conciergePillTitle}>24/7 VIP Concierge Desk</Text>
                  <Text style={styles.conciergePillSub}>
                    Direct line to assistance for hotel vouchers, modifications & instant queries.
                  </Text>
                </View>
              </View>

              {/* Direct Contact Grouped Card */}
              <Text style={styles.supportSectionTitle}>CONTACT US DIRECTLY</Text>
              
              <View style={styles.supportGroupedCard}>
                <TouchableOpacity
                  style={styles.contactRowItem}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('tel:+9118001234567')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#FFF1F2' }]}>
                    <PhoneCall color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>Call Customer Support</Text>
                    <Text style={styles.contactRowSub}>+91 1800 123 4567 (Toll-Free 24/7)</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>

                <View style={styles.fieldDividerHorizontal} />

                <TouchableOpacity
                  style={styles.contactRowItem}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('https://wa.me/919876543210')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#DCFCE7' }]}>
                    <MessageSquare color="#16A34A" size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>WhatsApp Concierge</Text>
                    <Text style={styles.contactRowSub}>Chat instantly with our VIP assistant</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>

                <View style={styles.fieldDividerHorizontal} />

                <TouchableOpacity
                  style={[styles.contactRowItem, { borderBottomWidth: 0 }]}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('mailto:support@racoonn.com')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Mail color="#2563EB" size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>Email Support</Text>
                    <Text style={styles.contactRowSub}>support@racoonn.com</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>
              </View>

              {/* FAQs Accordion Cards (Separated with Gaps) */}
              <Text style={[styles.supportSectionTitle, { marginTop: 18 }]}>FREQUENTLY ASKED QUESTIONS</Text>

              <View style={{ gap: 10 }}>
                {[
                  {
                    q: 'What GST tax slabs & HSN SAC code apply to my bookings?',
                    a: 'All hotel stay reservations are billed under Indian GST SAC Code 996311. Statutory GST slabs apply: 12% GST for room tariffs up to ₹7,500/night and 18% GST for tariffs above ₹7,500/night. CGST (9%) and SGST (9%) are itemized on your downloadable PDF tax invoice.',
                  },
                  {
                    q: 'What is the booking cancellation & GST refund policy?',
                    a: 'Free cancellation is available up to 48 hours prior to check-in for a 100% full refund (including all statutory GST taxes). Cancellations between 24 and 48 hours before check-in incur a 20% fee. No-shows or cancellations within 24 hours of check-in are non-refundable.',
                  },
                  {
                    q: 'How do I cancel or modify my booking?',
                    a: 'Go to My Bookings on your profile screen, select your active booking voucher, and tap "Modify or Cancel Booking". Cancellation fees depend on hotel policy.',
                  },
                  {
                    q: 'Where can I find my hotel voucher?',
                    a: 'Your digital check-in voucher is generated instantly after booking and can be accessed under My Bookings at any time, even offline.',
                  },
                  {
                    q: 'How do I request early check-in or late check-out?',
                    a: 'Contact our WhatsApp Concierge above with your booking ID. Our team will coordinate directly with the hotel front desk on your behalf.',
                  },
                  {
                    q: 'What payment methods are supported on Racoonn?',
                    a: 'We accept Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Net Banking, and Racoonn Pay later options.',
                  },
                ].map((faq, idx) => {
                  const isOpen = activeFaqIndex === idx;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={styles.faqCardTile}
                      activeOpacity={0.8}
                      onPress={() => setActiveFaqIndex(isOpen ? null : idx)}
                    >
                      <View style={styles.faqHeaderRow}>
                        <Text style={styles.faqQuestionText}>{faq.q}</Text>
                        <ChevronDown
                          color="#64748B"
                          size={16}
                          style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                        />
                      </View>
                      {isOpen && <Text style={styles.faqAnswerText}>{faq.a}</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🌟 PAYMENT HISTORY MODAL */}
      <Modal
        visible={isPaymentHistoryModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPaymentHistoryModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>Payment History</Text>
                <Text style={styles.modalSub}>View transaction receipts & download PDF tax invoices</Text>
              </View>
              <TouchableOpacity
                style={styles.closeCircleBtn}
                onPress={() => setIsPaymentHistoryModalOpen(false)}
              >
                <X color="#64748B" size={18} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 }}
            >
              {loadingBookings ? (
                <ActivityIndicator color={Colors.brand.coral} size="large" style={{ marginVertical: 40 }} />
              ) : bookings.length === 0 ? (
                <View style={styles.emptyBookingsBox}>
                  <CreditCard color="#94A3B8" size={40} />
                  <Text style={styles.emptyBookingsTitle}>No Payment Transactions</Text>
                  <Text style={styles.emptyBookingsSub}>
                    You have not made any payments yet. Confirmed booking tax invoices will automatically appear here.
                  </Text>
                </View>
              ) : (
                bookings.map((item, idx) => {
                  const itemRef = item.bookingId || item.$id?.substring(0, 8)?.toUpperCase() || `RAC-${idx + 100}`;
                  const title = item.hotelName || item.itemTitle || item.propertyName || item.title || 'Luxury Resort & Stay';
                  const total = item.payment?.totalAmount || item.totalAmount || item.amount || 0;
                  const isDownloading = generatingPdfId === (item.$id || item.bookingId);
                  const dateStr = (item.$createdAt ? new Date(item.$createdAt) : new Date()).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <View key={item.$id || idx} style={styles.paymentCardTile}>
                      <View style={styles.paymentTileHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paymentItemTitle}>{title}</Text>
                          <Text style={styles.paymentRefText}>Ref #: INV-{itemRef}</Text>
                        </View>

                        <View style={styles.paymentStatusBadge}>
                          <CheckCircle2 color="#16A34A" size={12} style={{ marginRight: 4 }} />
                          <Text style={styles.paymentStatusText}>
                            {String(item.status || 'PAID').toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.fieldDividerHorizontal} />

                      <View style={styles.paymentTileDetailsRow}>
                        <View>
                          <Text style={styles.paymentMetaLabel}>DATE & TIME</Text>
                          <Text style={styles.paymentMetaVal}>{dateStr}</Text>
                        </View>

                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.paymentMetaLabel}>TOTAL PAID</Text>
                          <Text style={styles.paymentAmountText}>₹{Number(total).toLocaleString('en-IN')}</Text>
                        </View>
                      </View>

                      {/* Download Invoice Button */}
                      <TouchableOpacity
                        style={styles.downloadInvoiceBtn}
                        activeOpacity={0.8}
                        onPress={() => handleDownloadInvoice(item)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <ActivityIndicator color={Colors.brand.coral} size="small" />
                        ) : (
                          <>
                            <Download color={Colors.brand.coral} size={15} style={{ marginRight: 6 }} />
                            <Text style={styles.downloadInvoiceBtnText}>Download Invoice (PDF)</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    paddingBottom: 120,
  },
  profileTopBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topBarTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  /* 🌟 Full Screen Edit Profile Header & Styles */
  editScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editScreenTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  editScreenSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  /* 🌟 24/7 Support & Concierge Modal Styles (Clean Grouped Cards) */
  conciergePillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 16,
  },
  conciergeIconRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergePillTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  conciergePillSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  supportSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  supportGroupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  contactRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  contactRowIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  contactRowSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  faqCardTile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 2,
  },
  faqRowItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  faqAnswerText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
  },
  /* 🌟 Screenshot-Matching Form Tile Card Styles */
  formTileRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formTileCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
  },
  formTileLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  formTileInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  tileSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gstCaptionText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  contactDetailsHeading: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  contactDetailsSub: {
    fontSize: 12,
    color: '#64748B',
  },
  editBlueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  headerSaveBtn: {
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  headerSaveBtnText: {
    color: Colors.brand.coral,
    fontSize: 13,
    fontWeight: '800',
  },
  formSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupedFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  formGridRowGrouped: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  formFieldGrouped: {
    flex: 1,
  },
  formLabelGrouped: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  formInputGrouped: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  fieldDividerVertical: {
    width: 1,
    height: 32,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 12,
  },
  fieldDividerHorizontal: {
    height: 1,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  formFieldRowFull: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithIconGrouped: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  formInputBareGrouped: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  saveProfileMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.brand.coral,
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  saveProfileMainText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  editScreenBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  stickySaveFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  topBarSub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  /* 🌟 User Hero Card */
  userHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroUserName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroUserEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  editProfileBtnText: {
    color: Colors.brand.coral,
    fontSize: 12,
    fontWeight: '800',
  },
  statsCardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCardTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statTileVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  statTileLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  /* 🌟 Grouped iOS Menu Sections */
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  groupedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  menuRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuRowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuRowSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
  },
  /* Modal Styles */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCardLarge: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 20,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalScrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  /* Form Field Styles (Matches Image 1) */
  formGridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  formFieldHalf: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formFieldFull: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  formInput: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formInputBare: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    padding: 0,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 12,
  },
  saveSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  saveSuccessText: {
    color: '#15803D',
    fontSize: 12.5,
    fontWeight: '700',
  },
  modalFooterRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  savePrimaryBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  savePrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  /* Bookings Modal Styles */
  bookingTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  bookingTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  bookingTabBtnActive: {
    backgroundColor: Colors.brand.navy,
  },
  bookingTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  bookingTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyBookingsBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyBookingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 10,
  },
  emptyBookingsSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  bookingCardItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  bookingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  bookingDates: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  bookingAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.brand.coral,
    marginTop: 6,
  },
  /* Logout Dialog */
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoutDialogBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  logoutIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoutDialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  logoutDialogSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  logoutDialogBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmLogoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  /* Guest State Styles */
  cleanHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cleanHeaderTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  cleanHeaderSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  guestScrollContent: {
    padding: 20,
  },
  welcomeHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mascotRingWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mascotInnerSquare: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  welcomeHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  welcomeSubText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  authActionRow: {
    width: '100%',
    gap: 10,
  },
  signInPrimaryBtn: {
    backgroundColor: Colors.brand.coral,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  registerSecondaryBtn: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  registerSecondaryText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  /* 🌟 Payment History Card Styles */
  paymentCardTile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  paymentTileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  paymentItemTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 2,
  },
  paymentRefText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  paymentTileDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  paymentMetaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  paymentMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  paymentAmountText: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.brand.navy,
  },
  downloadInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginTop: 4,
  },
  downloadInvoiceBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.brand.coral,
  },
});
