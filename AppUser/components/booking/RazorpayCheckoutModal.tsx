import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, X, ShieldCheck, AlertCircle } from 'lucide-react-native';
import Colors from '../../constants/Colors';

export type RazorpaySuccessData = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

export type RazorpayCheckoutModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: (data: RazorpaySuccessData) => void;
  onFailure: (error?: { description?: string; code?: string }) => void;
  amount: number; // in INR (e.g. 4200)
  itemTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingId?: string;
  bookingType?: string;
  preferredMethod?: 'upi' | 'card' | 'netbanking' | 'wallet' | string;
};

export function RazorpayCheckoutModal({
  visible,
  onClose,
  onSuccess,
  onFailure,
  amount,
  itemTitle,
  guestName,
  guestEmail,
  guestPhone,
  bookingId = 'rcn_booking',
  bookingType = 'stay',
  preferredMethod = 'card',
}: RazorpayCheckoutModalProps) {
  const insets = useSafeAreaInsets();
  const razorpayKey =
    process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TkA5mTntz9ooat';

  const amountInPaise = Math.round((Number(amount) || 0) * 100);

  const htmlContent = useMemo(() => {
    const safeTitle = (itemTitle || 'Room Reservation').replace(/"/g, '\\"');
    const safeName = (guestName || 'Valued Guest').replace(/"/g, '\\"');
    const safeEmail = (guestEmail?.trim() || 'guest@racoonn.com').replace(/"/g, '\\"');
    const cleanPhone = (guestPhone || '').replace(/[^0-9+]/g, '');
    const safePhone = (cleanPhone || '9876543210').replace(/"/g, '\\"');
    const safeBookingId = (bookingId || 'rcn').replace(/"/g, '\\"');
    const safeMethod = (preferredMethod || 'card').toLowerCase().replace(/"/g, '\\"');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Razorpay Checkout</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }
    html, body {
      width: 100%;
      height: 100%;
      background-color: #0B1329;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .loader-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
      text-align: center;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(255, 255, 255, 0.12);
      border-top-color: #E86A70;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .title {
      font-size: 17px;
      font-weight: 700;
      color: #F8FAFC;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }
    .subtitle {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.4;
      max-width: 260px;
    }
    .error-card {
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      text-align: center;
    }
    .retry-btn {
      margin-top: 16px;
      background-color: #E86A70;
      color: #ffffff;
      padding: 10px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      cursor: pointer;
    }
  </style>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body>
  <div class="loader-card" id="loaderBox">
    <div class="spinner"></div>
    <div class="title">Connecting to Razorpay</div>
    <div class="subtitle">Opening encrypted payment gateway for ₹${amount.toLocaleString('en-IN')}...</div>
  </div>

  <div class="error-card" id="errorBox">
    <div class="title" style="color: #EF4444;">Unable to load payment gateway</div>
    <div class="subtitle" id="errorMessage">Please check your internet connection and try again.</div>
    <button class="retry-btn" onclick="location.reload()">Retry</button>
  </div>

  <script>
    function postMsg(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    var checkoutStarted = false;
    function initCheckout() {
      if (checkoutStarted) return;
      if (!window.Razorpay) {
        return;
      }
      checkoutStarted = true;

      try {
        var options = {
          key: "${razorpayKey}",
          amount: ${amountInPaise},
          currency: "INR",
          name: "CIELLE TRAVELS PVT LTD",
          description: "${safeTitle}",
          image: "https://racoonn.com/favicon.png",
          prefill: {
            name: "${safeName}",
            email: "${safeEmail}",
            contact: "${safePhone}",
            method: "${safeMethod}"
          },
          config: {
            display: {
              blocks: {
                preferred: {
                  name: "${safeMethod === 'card' ? 'Pay via Cards (Credit/Debit)' : safeMethod === 'upi' ? 'Pay via UPI / QR' : safeMethod === 'netbanking' ? 'Pay via Net Banking' : 'Pay via Wallets'}",
                  instruments: [
                    { method: "${safeMethod}" }
                  ]
                }
              },
              sequence: ["block.preferred"],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          notes: {
            bookingType: "${bookingType}",
            bookingId: "${safeBookingId}"
          },
          theme: {
            color: "#E86A70",
            backdrop_color: "#0B1329"
          },
          handler: function(response) {
            postMsg({
              event: 'SUCCESS',
              data: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || '',
                razorpay_signature: response.razorpay_signature || ''
              }
            });
          },
          modal: {
            ondismiss: function() {
              postMsg({ event: 'DISMISSED' });
            },
            escape: true,
            backdropclose: false
          }
        };

        var rzp = new Razorpay(options);

        rzp.on('payment.failed', function(resp) {
          postMsg({
            event: 'FAILED',
            error: resp.error || { description: 'Payment declined or failed' }
          });
        });

        rzp.open();
      } catch (e) {
        postMsg({
          event: 'ERROR',
          error: { description: e.message || 'Checkout initialization failed' }
        });
      }
    }

    var checkInterval = setInterval(function() {
      if (window.Razorpay) {
        clearInterval(checkInterval);
        initCheckout();
      }
    }, 120);

    setTimeout(function() {
      clearInterval(checkInterval);
      if (!checkoutStarted && !window.Razorpay) {
        document.getElementById('loaderBox').style.display = 'none';
        document.getElementById('errorBox').style.display = 'flex';
        postMsg({
          event: 'ERROR',
          error: { description: 'Razorpay checkout script timed out. Please check your internet connection.' }
        });
      }
    }, 12000);
  </script>
</body>
</html>`;
  }, [razorpayKey, amountInPaise, amount, itemTitle, guestName, guestEmail, guestPhone, bookingId, bookingType, preferredMethod]);

  const handleMessage = (event: any) => {
    try {
      const rawData = event?.nativeEvent?.data;
      if (!rawData) return;
      const parsed = JSON.parse(rawData);

      if (parsed.event === 'SUCCESS') {
        onSuccess(parsed.data);
      } else if (parsed.event === 'DISMISSED') {
        onClose();
        Alert.alert(
          'Payment Incomplete',
          'You exited Razorpay without completing payment. Your booking was not confirmed and no money was deducted.'
        );
      } else if (parsed.event === 'FAILED' || parsed.event === 'ERROR') {
        onFailure(parsed.error);
        Alert.alert(
          'Payment Unsuccessful',
          parsed.error?.description || 'Your transaction could not be processed. Please try again with another payment method.'
        );
      }
    } catch (e) {
      console.warn('[Razorpay] Failed to parse message from WebView:', e);
    }
  };

  const handleShouldStartLoad = (request: { url: string }) => {
    const url = request.url;
    if (
      url.startsWith('upi://') ||
      url.startsWith('phonepe://') ||
      url.startsWith('paytmmp://') ||
      url.startsWith('gpay://') ||
      url.startsWith('cred://')
    ) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert(
              'UPI App Not Found',
              'The selected UPI app was not found on your device. You can enter your UPI ID directly in Razorpay.'
            );
          }
        })
        .catch((err) => {
          console.warn('[Razorpay] Linking error for UPI scheme:', err);
        });
      return false;
    }

    if (url.startsWith('intent://')) {
      try {
        const match = url.match(/scheme=([^;]+)/);
        const scheme = match ? match[1] : 'upi';
        const fallbackUrl = url.replace('intent://', `${scheme}://`);
        Linking.openURL(fallbackUrl).catch(() => {});
      } catch {}
      return false;
    }

    return true;
  };

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleManualClose = () => {
    setShowCancelConfirm(true);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleManualClose}
    >
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
        {/* Top Razorpay Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>R</Text>
            </View>
            <View>
              <View style={styles.brandRow}>
                <Text style={styles.headerTitle}>RAZORPAY</Text>
                <View style={styles.securedPill}>
                  <Lock color="#10B981" size={10} />
                  <Text style={styles.securedText}>SECURE</Text>
                </View>
              </View>
              <Text style={styles.headerSub}>
                ₹{amount.toLocaleString('en-IN')} • 256-Bit SSL
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleManualClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>

        {/* Razorpay WebView Viewport */}
        <View style={styles.webviewWrapper}>
          <WebView
            originWhitelist={['*']}
            source={{
              html: htmlContent,
              baseUrl: 'https://racoonn.com',
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            allowsInlineMediaPlayback={true}
            mixedContentMode="always"
            onMessage={handleMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            style={styles.webview}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loaderCenter}>
                <ActivityIndicator size="large" color={Colors.brand.coral} />
                <Text style={styles.loaderText}>Loading Razorpay Gateway...</Text>
              </View>
            )}
          />
        </View>

        {/* Bottom Trust Footer */}
        <View
          style={[
            styles.bottomFooter,
            {
              paddingBottom: Math.max(
                insets.bottom > 0 ? insets.bottom + 10 : (Platform.OS === 'android' ? 36 : 14),
                14
              ),
            },
          ]}
        >
          <ShieldCheck color="#10B981" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.footerText}>
            Protected by Razorpay PCI-DSS Level 1 Security
          </Text>
        </View>

        {/* Custom Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <View style={styles.confirmOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowCancelConfirm(false)}>
              <View style={styles.confirmBackdrop} />
            </TouchableWithoutFeedback>

            <View style={styles.confirmCard}>
              <TouchableOpacity
                style={styles.confirmCloseBtn}
                onPress={() => setShowCancelConfirm(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color="#94A3B8" size={16} />
              </TouchableOpacity>

              <View style={styles.confirmIconBg}>
                <AlertCircle color={Colors.brand.coral} size={30} strokeWidth={2.2} />
              </View>

              <Text style={styles.confirmTitle}>Cancel Payment?</Text>

              <Text style={styles.confirmMessage}>
                Are you sure you want to cancel? Your reservation will not be confirmed.
              </Text>

              <View style={styles.confirmAmountBadge}>
                <Text style={styles.confirmAmountLabel}>AMOUNT PENDING</Text>
                <Text style={styles.confirmAmountValue}>₹{amount.toLocaleString('en-IN')}</Text>
              </View>

              <View style={styles.confirmBtnStack}>
                <TouchableOpacity
                  style={styles.confirmKeepPayingBtn}
                  activeOpacity={0.88}
                  onPress={() => setShowCancelConfirm(false)}
                >
                  <Text style={styles.confirmKeepPayingText}>Keep Paying</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmCancelBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    setShowCancelConfirm(false);
                    onClose();
                  }}
                >
                  <Text style={styles.confirmCancelText}>Cancel Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1329',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B1329',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0C2340',
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoBadgeText: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '800',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  securedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  securedText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 3,
    letterSpacing: 0.4,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webviewWrapper: {
    flex: 1,
    backgroundColor: '#0B1329',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0B1329',
  },
  loaderCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0B1329',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 12,
  },
  bottomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B1329',
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 19, 41, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
    elevation: 9999,
  },
  confirmBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 15,
    position: 'relative',
  },
  confirmCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  confirmMessage: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  confirmAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  confirmAmountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  confirmAmountValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  confirmBtnStack: {
    width: '100%',
    gap: 10,
  },
  confirmKeepPayingBtn: {
    width: '100%',
    backgroundColor: Colors.brand.coral,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brand.coral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmKeepPayingText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  confirmCancelBtn: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
