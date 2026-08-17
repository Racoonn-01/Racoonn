import RazorpayCheckout from 'react-native-razorpay';
import { NativeModules, Platform } from 'react-native';

type RazorpayPaymentInput = {
  amount: number;
  name: string;
  email: string;
  contact: string;
  description: string;
  bookingId: string;
  bookingType: string;
};

type RazorpayOrderResponse = {
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  error?: string;
};

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '');
const apiBaseUrl = Platform.OS === 'android' && configuredApiBaseUrl?.includes('localhost')
  ? configuredApiBaseUrl.replace('localhost', '10.0.2.2')
  : configuredApiBaseUrl;
const razorpayKeyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;

async function requestPaymentApi(path: string, body: Record<string, unknown>) {
  try {
    return await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    const deviceHint = Platform.OS === 'android'
      ? 'For a physical Android device, set EXPO_PUBLIC_API_BASE_URL to your computer’s LAN IP, for example http://192.168.1.10:5005.'
      : 'Confirm the backend is running and that EXPO_PUBLIC_API_BASE_URL is reachable from this device.';
    throw new Error(`Cannot reach the payment service at ${apiBaseUrl}. Start it with \"cd Backend && npm run dev\". ${deviceHint}`);
  }
}

export async function collectRazorpayPayment(input: RazorpayPaymentInput) {
  if (!apiBaseUrl) {
    throw new Error('Payment service URL is not configured.');
  }

  if (!razorpayKeyId) {
    throw new Error('Razorpay public key is not configured.');
  }

  if (!NativeModules.RNRazorpayCheckout) {
    throw new Error('Razorpay requires a native development build. Expo Go does not include the Razorpay SDK. Run "npx expo run:android" from AppUser, then open the rebuilt app.');
  }

  const orderResponse = await requestPaymentApi('/api/payments/razorpay/order', {
    amount: input.amount,
    bookingId: input.bookingId,
    bookingType: input.bookingType,
  });
  const orderPayload = (await orderResponse.json()) as RazorpayOrderResponse;

  if (!orderResponse.ok || !orderPayload.order) {
    throw new Error(orderPayload.error || 'Unable to create Razorpay order.');
  }

  const payment = await RazorpayCheckout.open({
    key: razorpayKeyId,
    amount: orderPayload.order.amount,
    currency: orderPayload.order.currency,
    name: 'Racoonn Travel',
    description: input.description,
    order_id: orderPayload.order.id,
    prefill: { name: input.name, email: input.email, contact: input.contact },
    theme: { color: '#E86A70' },
  });

  const verificationResponse = await requestPaymentApi('/api/payments/razorpay/verify', payment);
  const verification = (await verificationResponse.json()) as { verified?: boolean; error?: string };

  if (!verificationResponse.ok || !verification.verified) {
    throw new Error(verification.error || 'Payment verification failed.');
  }

  return payment;
}
