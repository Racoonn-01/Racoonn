import { redirect } from 'next/navigation';
import Link from 'next/link';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';
const COLLECTION_ID = 'abandoned_checkouts';

export default async function RecoverCheckoutPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const token = resolvedParams.token;
  
  if (!token) {
    redirect('/');
  }

  let checkout: any = null;

  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('recoveryToken', token)
    ]);
    if (response.documents.length > 0) {
      checkout = response.documents[0];
    }
  } catch (error) {
    console.error('Error recovering checkout:', error);
  }

  if (!checkout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h1>
          <p className="text-gray-600 mb-6">This checkout recovery link is invalid or has expired.</p>
          <Link href="/" className="inline-block bg-brand-coral text-white font-bold px-6 py-3 rounded-xl hover:bg-opacity-90">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  if (checkout.status === 'BOOKED' || checkout.status === 'PAYMENT_COMPLETED') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Already Booked!</h1>
          <p className="text-gray-600 mb-6">This booking has already been successfully completed.</p>
          <Link href="/profile" className="inline-block bg-brand-coral text-white font-bold px-6 py-3 rounded-xl hover:bg-opacity-90">
            View My Bookings
          </Link>
        </div>
      </div>
    );
  }

  // Build the target checkout URL
  let targetUrl = '/checkout';

  if (checkout.checkoutUrl) {
    try {
      // Support both relative (/checkout?...) and absolute (http://.../checkout?...)
      const parsed = new URL(checkout.checkoutUrl, 'https://racoonn.com');
      const pathname = parsed.pathname.startsWith('/checkout') ? parsed.pathname : '/checkout';
      const sp = parsed.searchParams;
      sp.set('recovered', 'true');
      const search = sp.toString() ? `?${sp.toString()}` : '';
      targetUrl = `${pathname}${search}`;
    } catch (e) {
      console.error('Error parsing checkoutUrl:', e);
    }
  } else if (checkout.hotelId) {
    // Reconstruct checkout URL from saved document fields if checkoutUrl is absent
    const sp = new URLSearchParams();
    sp.set('hotelId', checkout.hotelId);
    if (checkout.roomName) sp.set('roomName', checkout.roomName);
    if (checkout.amount) sp.set('price', String(checkout.amount));
    if (checkout.checkIn) sp.set('checkIn', checkout.checkIn);
    if (checkout.checkOut) sp.set('checkOut', checkout.checkOut);
    if (checkout.guests) sp.set('guests', checkout.guests);
    sp.set('recovered', 'true');
    targetUrl = `/checkout?${sp.toString()}`;
  }

  // Update abandoned checkout record status (keep emailSent: true to prevent duplicate emails)
  try {
    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, checkout.$id, {
      status: 'RECOVERING',
      emailSent: true 
    });
  } catch (updateErr) {
    console.error('Failed to update checkout document on recovery:', updateErr);
  }

  // Perform redirect outside of try/catch so Next.js NEXT_REDIRECT is not caught
  redirect(targetUrl);
}
