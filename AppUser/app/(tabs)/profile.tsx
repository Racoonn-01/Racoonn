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
  AlertTriangle,
  Trash2,
  Bell,
} from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import Colors from '@/constants/Colors';
import { calculateHotelGST } from '../../utils/gst';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../lib/appwrite/auth';
import { cancelBooking } from '../../lib/appwrite/api';
import { databases } from '../../lib/appwrite/config';
import { Query } from 'react-native-appwrite';
import { useRouter, useFocusEffect } from 'expo-router';
import { sendLocalNotification } from '../../services/notificationService';
import { useNotificationStore } from '../../store/notificationStore';

const DATABASE_ID =
  process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
  '6a3cec630035d63ea963';

export default function UserPortalProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, isAuthenticated, isLoading, checkAuth, logout, deleteAccount } = useAuthStore();
  const { unreadCount } = useNotificationStore();

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Modal Visibility States
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // 🌟 Generate & Download PDF Invoice (Identical to User Portal)
  const handleDownloadInvoice = async (item: any) => {
    try {
      setGeneratingPdfId(item.$id || item.bookingId || 'temp');
      const bookingRef = item.bookingId || item.$id?.substring(0, 8)?.toUpperCase() || 'RAC-893420';
      const invoiceNo = `INV-${bookingRef}`;
      const titleName = item.hotelName || item.itemTitle || item.title || 'Racoonn Verified Stay';
      const hotelLoc = item.hotelLocation || item.location || '';
      const guestFullName = `${firstName} ${lastName}`.trim() || user?.name || 'Valued Guest';
      const guestEmailAddr = email || user?.email || 'guest@racoonn.com';
      const isPackage =
        (item.roomId || '').startsWith('Package:') ||
        (item.roomName || '').toLowerCase().includes('package') ||
        (item.hotelId || '').startsWith('pkg-') ||
        (item.hotelName || '').toLowerCase().includes('package');

      const totalPaid = Number(
        item.payment?.totalAmount || item.priceAfterTax || item.totalAmount || item.amount || 0
      );
      const nights = Math.max(1, Number(item.nights) || 1);
      const adults = Math.max(1, Number(item.adults) || 1);
      const gstAmount = Number(item.payment?.taxes || item.gstAmount || 0);
      const gstRate = Number(item.gstPercentage || (gstAmount > 0 ? (isPackage ? 18 : 5) : 0));
      const addonsTotal = Number(item.payment?.serviceFees || 0);
      const basePrice = Math.max(0, totalPaid - addonsTotal - gstAmount);
      const checkIn = item.checkIn || item.checkInDate || item.startDate || 'N/A';
      const checkOut = item.checkOut || item.checkOutDate || item.endDate || 'N/A';
      const invoiceDateStr = (item.$createdAt ? new Date(item.$createdAt) : new Date()).toLocaleDateString('en-GB');

      // Try fetching the official server PDF from /api/invoice/download first
      let serverPdfDownloaded = false;
      const downloadEndpoints = [
        ...(process.env.EXPO_PUBLIC_API_BASE_URL ? [`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/invoice/download`] : []),
        'https://racoonn.com/api/invoice/download',
        'http://192.168.1.36:5005/api/invoice/download',
        'http://192.168.1.7:5005/api/invoice/download',
        'http://localhost:5005/api/invoice/download',
        'http://localhost:3000/api/invoice/download',
      ];

      for (const endpoint of downloadEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              hotelName: titleName,
              hotelLocation: hotelLoc,
              price: totalPaid,
              nights,
              checkIn,
              checkOut,
              adults,
              email: guestEmailAddr,
              firstName: guestFullName.split(' ')[0] || 'Guest',
              lastName: guestFullName.split(' ').slice(1).join(' ') || '',
              bookingId: item.$id || item.bookingId,
              displayBookingId: bookingRef,
              invoiceNumber: invoiceNo,
              addonsList: addonsTotal > 0 ? [{ name: 'Additional Services', price: addonsTotal }] : [],
              gstRate,
              gstAmount,
              isPackage,
            }),
          });

          if (res.ok) {
            const blob = await res.blob();
            const reader = new FileReader();
            const base64Promise = new Promise<string>((resolve, reject) => {
              reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data.split(',')[1]);
              };
              reader.onerror = reject;
            });
            reader.readAsDataURL(blob);
            const base64Content = await base64Promise;

            const fileUri = `${FileSystem.cacheDirectory}Invoice-${bookingRef}.pdf`;
            await FileSystem.writeAsStringAsync(fileUri, base64Content, {
              encoding: FileSystem.EncodingType.Base64,
            });

            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri, {
                UTI: '.pdf',
                mimeType: 'application/pdf',
                dialogTitle: `Download Racoonn Invoice ${invoiceNo}`,
              });
            }
            serverPdfDownloaded = true;
            break;
          }
        } catch {
          // fallback to next endpoint or HTML generation
        }
      }

      // If server download wasn't available, generate the identical User Portal HTML invoice using expo-print
      if (!serverPdfDownloaded) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; margin: 0; padding: 40px; background: #FFFFFF; }
                .inv-box { max-width: 680px; margin: auto; }
                .top-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
                .brand-title { font-size: 26px; font-weight: 900; color: #E11D48; letter-spacing: 1px; margin: 0 0 4px 0; }
                .company-name { font-size: 11px; font-weight: 800; color: #1F2937; margin-bottom: 3px; }
                .company-meta { font-size: 9.5px; color: #6B7280; line-height: 1.5; }
                .inv-header-meta { text-align: right; }
                .inv-word { font-size: 28px; font-weight: 900; color: #1F2937; margin: 0 0 4px 0; }
                .meta-line { font-size: 10px; color: #6B7280; line-height: 1.6; }
                .divider { border: none; border-top: 1px solid #E5E7EB; margin: 20px 0; }
                .info-grid { display: flex; justify-content: space-between; margin-bottom: 28px; }
                .info-col { width: 48%; }
                .info-title { font-size: 12px; font-weight: 800; color: #1F2937; margin-bottom: 6px; }
                .info-sub { font-size: 10.5px; color: #6B7280; line-height: 1.5; }
                .stay-table { width: 100%; border-collapse: collapse; margin-bottom: 26px; }
                .stay-table th { background: #F9FAFB; padding: 10px 14px; font-size: 10px; font-weight: 800; color: #1F2937; text-align: left; }
                .stay-table td { padding: 10px 14px; font-size: 10px; color: #1F2937; border-bottom: 1px solid #F3F4F6; }
                .breakdown-box { width: 60%; margin-left: auto; margin-top: 16px; }
                .breakdown-title { font-size: 11px; font-weight: 800; color: #1F2937; margin-bottom: 12px; text-align: right; }
                .bd-row { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 8px; }
                .bd-lbl { color: #6B7280; }
                .bd-val { font-weight: 700; color: #1F2937; }
                .total-line { display: flex; justify-content: space-between; border-top: 1px solid #E5E7EB; padding-top: 10px; margin-top: 10px; font-size: 14px; font-weight: 900; }
                .total-lbl { color: #E11D48; }
                .total-val { color: #1F2937; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; }
                .footer-thanks { font-size: 11px; font-weight: 800; color: #1F2937; margin-bottom: 4px; }
                .footer-sub { font-size: 9px; color: #6B7280; }
              </style>
            </head>
            <body>
              <div class="inv-box">
                <div class="top-row">
                  <div>
                    <h1 class="brand-title">RACOONN</h1>
                    <div class="company-name">CIELLE TRAVELS PRIVATE LIMITED</div>
                    <div class="company-meta">
                      GSTIN - 05AAOCC0859Q1Z0<br/>
                      SECOND FLOOR  PSA PLAZA, SHOP NO 207 , NAINITAL ROAD,<br/>
                      Rudrapur, Udham Singh Nagar, Uttarakhand, 263153<br/>
                      Phone: +91 8954442144 | Email: info@racoonn.com
                    </div>
                  </div>
                  <div class="inv-header-meta">
                    <div class="inv-word">INVOICE</div>
                    <div class="meta-line">Date: ${invoiceDateStr}</div>
                    <div class="meta-line">Booking Ref: <strong>${bookingRef}</strong></div>
                    <div class="meta-line">Invoice No: <strong>${invoiceNo}</strong></div>
                  </div>
                </div>

                <hr class="divider" />

                <div class="info-grid">
                  <div class="info-col">
                    <div class="info-title">Billed To</div>
                    <div class="info-sub">
                      <strong style="color: #1F2937;">${guestFullName}</strong><br/>
                      ${guestEmailAddr}
                    </div>
                  </div>
                  <div class="info-col">
                    <div class="info-title">${isPackage ? 'Package Details' : 'Hotel Details'}</div>
                    <div class="info-sub">
                      <strong style="color: #1F2937;">${titleName}</strong><br/>
                      ${hotelLoc}
                    </div>
                  </div>
                </div>

                <table class="stay-table">
                  <thead>
                    <tr>
                      <th style="width: 50%;">Description</th>
                      <th style="width: 50%;">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${isPackage ? `
                      <tr>
                        <td>Starting Date</td>
                        <td>${checkIn}</td>
                      </tr>
                      <tr>
                        <td>Duration</td>
                        <td>${nights} Night(s)</td>
                      </tr>
                      <tr>
                        <td>Guests</td>
                        <td>${adults} Adult(s)</td>
                      </tr>
                    ` : `
                      <tr>
                        <td>Check-In Date</td>
                        <td>${checkIn}</td>
                      </tr>
                      <tr>
                        <td>Check-Out Date</td>
                        <td>${checkOut}</td>
                      </tr>
                      <tr>
                        <td>Duration</td>
                        <td>${nights} Night(s)</td>
                      </tr>
                      <tr>
                        <td>Guests</td>
                        <td>${adults} Adult(s)</td>
                      </tr>
                    `}
                  </tbody>
                </table>

                <div class="breakdown-box">
                  <div class="breakdown-title">Financial Breakdown</div>
                  <div class="bd-row">
                    <span class="bd-lbl">Base Price (Excl. GST):</span>
                    <span class="bd-val">INR ${basePrice.toLocaleString('en-IN')}</span>
                  </div>
                  ${addonsTotal > 0 ? `
                  <div class="bd-row">
                    <span class="bd-lbl">Add-ons / Services:</span>
                    <span class="bd-val">INR ${addonsTotal.toLocaleString('en-IN')}</span>
                  </div>
                  ` : ''}
                  <div class="bd-row">
                    <span class="bd-lbl">GST (${gstRate}%):</span>
                    <span class="bd-val">INR ${gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div class="total-line">
                    <span class="total-lbl">Total Paid:</span>
                    <span class="total-val">INR ${totalPaid.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div class="footer">
                  <div class="footer-thanks">Thank you for booking with Racoonn!</div>
                  <div class="footer-sub">This is a computer-generated invoice and does not require a physical signature.</div>
                </div>
              </div>
            </body>
          </html>
        `;

        if (Platform.OS === 'android') {
          await Print.printAsync({ html: htmlContent });
        } else {
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
              UTI: '.pdf',
              mimeType: 'application/pdf',
              dialogTitle: `Download Racoonn Invoice ${invoiceNo}`,
            });
          } else {
            await Print.printAsync({ html: htmlContent });
          }
        }
      }
      setGeneratingPdfId(null);
    } catch (err) {
      setGeneratingPdfId(null);
      console.error('Invoice PDF error:', err);
      Alert.alert('Download Error', 'Could not generate or download PDF invoice. Please try again.');
    }
  };

  // Custom Cancellation State (No native Alert warning popup)
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const handleCancelBooking = (booking: any) => {
    setCancelModalBooking(booking);
  };

  const handleConfirmCancelBooking = async () => {
    if (!cancelModalBooking) return;
    try {
      setIsCancelling(true);
      const bTitle = cancelModalBooking.hotelName || cancelModalBooking.propertyName || 'Stay';
      const bRef = (cancelModalBooking.$id || '').substring(0, 8).toUpperCase();
      await cancelBooking(cancelModalBooking.$id);
      await fetchBookings();

      sendLocalNotification({
        title: '❌ Booking Cancelled',
        body: `Your reservation #${bRef} for ${bTitle} has been cancelled.`,
        data: { url: '/(tabs)/profile', type: 'cancellation' },
      });

      setCancelModalBooking(null);
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      Alert.alert('Cancellation Error', err?.message || 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [checkAuth])
  );

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

  const handleConfirmDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await deleteAccount();
      setShowDeleteModal(false);
      Alert.alert(
        'Account Deleted',
        'Your Racoonn account and personal data have been permanently deleted.'
      );
    } catch (err) {
      console.error('Failed to delete account:', err);
      Alert.alert(
        'Deletion Error',
        'Could not complete account deletion. Please check your internet connection or contact 24/7 support.'
      );
    } finally {
      setIsDeletingAccount(false);
    }
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
            {/* Notifications & Alerts */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.75}
              onPress={() => router.push('/notifications' as any)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Bell color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.menuRowTitle}>Notifications & Alerts</Text>
                    {unreadCount > 0 && (
                      <View style={{ backgroundColor: Colors.brand.coral, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '800' }}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuRowSub}>Reminders, booking updates & preferences</Text>
                </View>
              </View>
              <ChevronRight color="#94A3B8" size={18} />
            </TouchableOpacity>

            {/* Privacy */}
            <TouchableOpacity style={styles.menuRowItem} activeOpacity={0.75} onPress={() => router.push('/privacy' as any)}>
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <ShieldCheck color={Colors.brand.coral} size={18} />
                </View>
                <View>
                  <Text style={styles.menuRowTitle}>Privacy & Policy</Text>
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
            {/* Delete Account */}
            <TouchableOpacity
              style={styles.menuRowItem}
              activeOpacity={0.75}
              onPress={() => setShowDeleteModal(true)}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: '#FFF1F2' }]}>
                  <Trash2 color="#E11D48" size={18} />
                </View>
                <View>
                  <Text style={[styles.menuRowTitle, { color: '#E11D48' }]}>Delete Account</Text>
                  <Text style={styles.menuRowSub}>Permanently delete your Racoonn account</Text>
                </View>
              </View>
              <ChevronRight color="#E11D48" size={18} />
            </TouchableOpacity>

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

                      {/* Booking Actions Row: Download Invoice & Cancel Booking */}
                      <View style={styles.bookingActionButtonsRow}>
                        <TouchableOpacity
                          style={styles.cardInvoiceBtn}
                          activeOpacity={0.8}
                          disabled={generatingPdfId === (b.$id || b.bookingId)}
                          onPress={() => handleDownloadInvoice(b)}
                        >
                          {generatingPdfId === (b.$id || b.bookingId) ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                          ) : (
                            <>
                              <Download size={14} color="#0F172A" style={{ marginRight: 6 }} />
                              <Text style={styles.cardInvoiceBtnText}>Download Invoice</Text>
                            </>
                          )}
                        </TouchableOpacity>

                        {(b.status === 'Confirmed' || b.status === 'Upcoming') && (
                          <TouchableOpacity
                            style={styles.cancelBookingBtn}
                            activeOpacity={0.8}
                            disabled={isCancelling && cancelModalBooking?.$id === b.$id}
                            onPress={() => handleCancelBooking(b)}
                          >
                            {isCancelling && cancelModalBooking?.$id === b.$id ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <Text style={styles.cancelBookingBtnText}>Cancel Booking</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 🛑 Custom Cancel Reservation Modal */}
      <Modal
        visible={!!cancelModalBooking}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          if (!isCancelling) setCancelModalBooking(null);
        }}
      >
        <View style={styles.cancelModalOverlay}>
          <View style={styles.cancelDialogBox}>
            <View style={styles.cancelIconBadge}>
              <AlertTriangle color="#EF4444" size={26} />
            </View>
            <Text style={styles.cancelDialogTitle}>Cancel Reservation?</Text>
            <Text style={styles.cancelDialogSub}>
              Are you sure you want to cancel your reservation for{' '}
              <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                {cancelModalBooking?.hotelName || cancelModalBooking?.packageName || 'this stay'}
              </Text>
              ?
            </Text>

            {cancelModalBooking && (
              <View style={styles.cancelBookingSummaryCard}>
                <View style={styles.cancelBookingSummaryRow}>
                  <Text style={styles.cancelBookingSummaryLabel}>Booking ID</Text>
                  <Text style={styles.cancelBookingSummaryValue}>
                    {cancelModalBooking?.bookingId || cancelModalBooking?.$id?.slice(-8).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.cancelBookingSummaryRow}>
                  <Text style={styles.cancelBookingSummaryLabel}>Dates</Text>
                  <Text style={styles.cancelBookingSummaryValue}>
                    {cancelModalBooking?.checkIn || cancelModalBooking?.startDate || 'N/A'} → {cancelModalBooking?.checkOut || cancelModalBooking?.endDate || 'N/A'}
                  </Text>
                </View>
                <View style={styles.cancelBookingSummaryRow}>
                  <Text style={styles.cancelBookingSummaryLabel}>Total Amount</Text>
                  <Text style={[styles.cancelBookingSummaryValue, { color: '#0F172A', fontWeight: '900' }]}>
                    ₹{Number(cancelModalBooking?.totalAmount || cancelModalBooking?.totalPrice || cancelModalBooking?.price || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.cancelPolicyNoticeBox}>
              <Text style={styles.cancelPolicyNoticeTitle}>Cancellation & Refund Policy</Text>
              <Text style={styles.cancelPolicyNoticeText}>
                As per property policy, cancellations may be subject to cancellation charges or non-refundable terms. Any eligible refund will be processed back to your original payment method.
              </Text>
            </View>

            <View style={styles.cancelDialogBtnRow}>
              <TouchableOpacity
                style={styles.keepBookingBtn}
                disabled={isCancelling}
                onPress={() => setCancelModalBooking(null)}
              >
                <Text style={styles.keepBookingText}>Keep Booking</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmCancelBookingBtn}
                disabled={isCancelling}
                onPress={handleConfirmCancelBooking}
              >
                {isCancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmCancelBookingText}>Yes, Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Dialog */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => !isDeletingAccount && setShowDeleteModal(false)}
      >
        <View style={styles.logoutModalOverlay}>
          <View style={styles.logoutDialogBox}>
            <View style={[styles.logoutIconBadge, { backgroundColor: '#FFE4E6' }]}>
              <AlertTriangle color="#E11D48" size={24} />
            </View>
            <Text style={styles.logoutDialogTitle}>Delete Account Permanently?</Text>
            <Text style={styles.logoutDialogSub}>
              This action cannot be undone. All your profile information, active bookings, saved vouchers, and preferences will be permanently wiped.
            </Text>

            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningText}>
                ⚠️ You will immediately lose access to your Racoonn account.
              </Text>
            </View>

            <View style={styles.logoutDialogBtnRow}>
              <TouchableOpacity
                style={styles.cancelLogoutBtn}
                disabled={isDeletingAccount}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelLogoutText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmLogoutBtn, { backgroundColor: '#E11D48' }]}
                disabled={isDeletingAccount}
                onPress={handleConfirmDeleteAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmLogoutText}>Yes, Delete</Text>
                )}
              </TouchableOpacity>
            </View>
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
                <Text style={styles.modalSub}>Racoonn assistance & customer service</Text>
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
              {/* Direct Contact Grouped Card */}
              <Text style={styles.supportSectionTitle}>CONTACT US DIRECTLY</Text>
              
              <View style={styles.supportGroupedCard}>
                <TouchableOpacity
                  style={styles.contactRowItem}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('tel:+918954442144')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#FFF1F2' }]}>
                    <PhoneCall color={Colors.brand.coral} size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>Call Customer Support</Text>
                    <Text style={styles.contactRowSub}>+91 8954442144</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>

                <View style={styles.fieldDividerHorizontal} />

                <TouchableOpacity
                  style={styles.contactRowItem}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('https://wa.me/918954442144')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#DCFCE7' }]}>
                    <MessageSquare color="#16A34A" size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>WhatsApp Concierge</Text>
                    <Text style={styles.contactRowSub}>+91 8954442144</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>

                <View style={styles.fieldDividerHorizontal} />

                <TouchableOpacity
                  style={[styles.contactRowItem, { borderBottomWidth: 0 }]}
                  activeOpacity={0.75}
                  onPress={() => Linking.openURL('mailto:info@racoonn.com')}
                >
                  <View style={[styles.contactRowIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Mail color="#2563EB" size={18} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.contactRowTitle}>Email Support</Text>
                    <Text style={styles.contactRowSub}>info@racoonn.com</Text>
                  </View>
                  <ChevronRight color="#94A3B8" size={18} />
                </TouchableOpacity>
              </View>

              {/* FAQs Accordion Cards (Separated with Gaps) */}
              <Text style={[styles.supportSectionTitle, { marginTop: 18 }]}>FREQUENTLY ASKED QUESTIONS</Text>

              <View style={{ gap: 10 }}>
                {[
                  {
                    q: 'How do I book a stay?',
                    a: 'You can book a stay by searching for your desired destination, selecting your dates, and choosing a hotel from the results. Follow the checkout process to confirm your reservation.',
                  },
                  {
                    q: 'How can I change my booking dates?',
                    a: "To change your booking dates, please go to 'My Account' > 'My Bookings', select the booking you wish to modify, and choose the 'Modify Dates' option. Please note that changes are subject to availability and may incur additional charges.",
                  },
                  {
                    q: 'When will I be charged for my booking?',
                    a: 'Payment terms depend on the specific booking rate. Some bookings require upfront payment, while others allow you to pay at the property. The payment details are always shown before you confirm your booking.',
                  },
                  {
                    q: 'Are pets allowed in the hotels?',
                    a: "Pet policies are determined by each individual property. Use the 'Pet Friendly' filter when searching for hotels to find accommodations that welcome your furry friends.",
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
  bookingActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  cardInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardInvoiceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  cancelBookingBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBookingBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
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
  deleteWarningBox: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    width: '100%',
  },
  deleteWarningText: {
    fontSize: 12,
    color: '#E11D48',
    fontWeight: '600',
    lineHeight: 17,
    textAlign: 'center',
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
  /* Custom Cancel Reservation Modal Styles */
  cancelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cancelDialogBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cancelIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cancelDialogTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  cancelDialogSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  cancelBookingSummaryCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  cancelBookingSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2.5,
  },
  cancelBookingSummaryLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  cancelBookingSummaryValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  cancelPolicyNoticeBox: {
    width: '100%',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 11,
    borderWidth: 1,
    borderColor: '#FECDD3',
    marginBottom: 18,
  },
  cancelPolicyNoticeTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  cancelPolicyNoticeText: {
    fontSize: 11,
    color: '#991B1B',
    lineHeight: 15,
  },
  cancelDialogBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  keepBookingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBookingText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#475569',
  },
  confirmCancelBookingBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBookingText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

