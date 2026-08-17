declare module 'react-native-razorpay' {
  type RazorpayOptions = Record<string, unknown>;

  type RazorpayPaymentResult = {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  };

  const RazorpayCheckout: {
    open(options: RazorpayOptions): Promise<RazorpayPaymentResult>;
  };

  export default RazorpayCheckout;
}
