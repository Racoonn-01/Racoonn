'use client';
import { optimizeAppwriteImage } from "@/lib/optimizeImage";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { databases } from '@/lib/appwrite/config';
import { useAuthStore } from '@/store/authStore';
import { Query } from 'appwrite';
import CancelBookingModal from './CancelBookingModal';
import BookingDetailsModal from './BookingDetailsModal';
import LeaveReviewModal from './LeaveReviewModal';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export interface UIBooking {
  id: string;
  rawId: string;
  hotelId: string;
  hotel: string;
  roomName: string;
  location: string;
  checkIn: string;
  checkOut: string;
  rawCheckIn: string;
  guests: string;
  amount: string;
  status: string;
  image: string;
}

export default function BookingsSection() {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [bookings, setBookings] = useState<UIBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingToCancel, setBookingToCancel] = useState<UIBooking | null>(null);
  const [bookingToView, setBookingToView] = useState<{ booking: UIBooking, mode: 'details' | 'invoice' } | null>(null);
  const [bookingToReview, setBookingToReview] = useState<UIBooking | null>(null);
  const user = useAuthStore(state => state.user);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) setIsLoading(true);
      
      const [bookingsResponse, paymentsResponse] = await Promise.all([
        databases.listDocuments(DATABASE_ID, 'bookings', [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt')
        ]),
        databases.listDocuments(DATABASE_ID, 'booking_payments')
      ]);
      
      // Map appwrite documents to our UI structure
      const formatted: UIBooking[] = bookingsResponse.documents.map((appwriteDoc) => {
        const doc = appwriteDoc as unknown as Record<string, unknown>;
        const payment = paymentsResponse.documents.find(p => p.bookingId === doc.$id);
        
        let currentStatus = String(doc.status);
        if (currentStatus === 'Confirmed' && new Date(String(doc.checkOut)).getTime() < new Date().getTime()) {
          currentStatus = 'Completed';
          databases.updateDocument(DATABASE_ID, 'bookings', String(doc.$id), { status: 'Completed' }).catch(console.error);
        }

        const rawImg = String(doc.roomImage || doc.hotelImage || '').trim();
        const finalImg = (rawImg.startsWith('http') || rawImg.startsWith('/')) 
          ? rawImg 
          : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop';

        return {
          id: String(doc.$id).substring(0, 8).toUpperCase(),
          rawId: String(doc.$id),
          hotelId: String(doc.hotelId),
          hotel: String(doc.hotelName),
          roomName: String(doc.roomName || ''),
          location: String(doc.hotelLocation),
          checkIn: new Date(String(doc.checkIn)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          checkOut: new Date(String(doc.checkOut)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          rawCheckIn: String(doc.checkIn),
          guests: `${doc.adults} Adults${doc.children ? `, ${doc.children} Child` : ''}`,
          amount: payment ? `₹${Number((payment as Record<string, unknown>).totalAmount).toLocaleString()}` : `₹${(doc.priceAfterTax ? Number(doc.priceAfterTax) : (doc.totalAmount ? Number(doc.totalAmount) : (Number(doc.nights) * Number(doc.roomPricePerNight || 0)))).toLocaleString()}`,
          status: currentStatus === 'Confirmed' ? 'Upcoming' : currentStatus,
          image: finalImg,
        };
      });
      setBookings(formatted);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Initial fetch doesn't need to trigger loading state since it's true by default
    const load = async () => {
      await fetchBookings(false);
    };
    load().catch(console.error);
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(b => b.status === activeTab);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-heading text-3xl font-bold mb-2">My Bookings</h2>
        <p className="text-gray-500">View and manage your upcoming and past trips.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 pb-px">
        {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as 'Upcoming' | 'Completed' | 'Cancelled')}
            className={`pb-4 px-2 font-bold transition-all relative ${
              activeTab === tab ? 'text-brand-coral' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="bookings-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-coral" />
            )}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 flex justify-center items-center">
             <Loader2 className="w-8 h-8 text-brand-coral animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center bg-gray-50 rounded-3xl border border-gray-100 border-dashed"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="text-gray-300" size={24} />
                </div>
                <h3 className="font-bold text-lg text-brand-navy">No {activeTab.toLowerCase()} bookings</h3>
                <p className="text-gray-500 text-sm mt-1">When you book a trip, it will show up here.</p>
                <button className="mt-6 text-brand-coral font-bold hover:underline">Explore Destinations</button>
              </motion.div>
            ) : (
              filteredBookings.map((booking) => (
                <motion.div
                  key={booking.rawId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden relative shrink-0">
                    <Image src={optimizeAppwriteImage(booking.image)} alt={booking.hotel} fill className="object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-navy uppercase">
                      {booking.status}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-3 sm:gap-2 mb-2">
                      <div className="order-2 sm:order-1 pr-0 sm:pr-4">
                        <h3 className="text-xl font-heading font-bold text-brand-navy leading-tight">{booking.hotel}</h3>
                        {booking.roomName && (
                          <p className="text-sm font-semibold text-brand-navy/80 mt-0.5">{booking.roomName}</p>
                        )}
                        <p className="text-gray-500 text-sm flex items-start gap-1 mt-1.5">
                          <MapPin size={14} className="shrink-0 mt-0.5" /> 
                          <span className="line-clamp-2 leading-snug">{booking.location}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0 order-1 sm:order-2 bg-gray-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg sm:rounded-none w-full sm:w-auto flex justify-between sm:block items-center">
                        <p className="text-xs sm:text-sm text-gray-400 font-medium">Booking ID</p>
                        <p className="font-mono text-sm font-bold text-brand-navy">#{booking.id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 my-4 border-y border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Check In</p>
                        <p className="font-bold text-sm text-brand-navy">{booking.checkIn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Check Out</p>
                        <p className="font-bold text-sm text-brand-navy">{booking.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Guests</p>
                        <p className="font-bold text-sm text-brand-navy">{booking.guests}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Amount</p>
                        <p className="font-bold text-sm text-brand-coral">{booking.amount}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 sm:mt-auto pt-4 sm:pt-0 flex flex-col sm:flex-row gap-3 justify-end border-t sm:border-t-0 border-gray-50">
                      {booking.status === 'Completed' && (
                        <button 
                          onClick={() => setBookingToReview(booking)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <Star size={16} /> Leave Review
                        </button>
                      )}
                      {booking.status === 'Upcoming' && (
                        <button 
                          onClick={() => setBookingToCancel(booking)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-bold rounded-xl transition-colors text-center"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
        <CancelBookingModal 
          isOpen={!!bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          booking={bookingToCancel}
          onSuccess={() => {
            setBookingToCancel(null);
            fetchBookings(true).catch(console.error); // refresh the list with loading state
          }}
        />
      <BookingDetailsModal
        isOpen={!!bookingToView}
        onClose={() => setBookingToView(null)}
        booking={bookingToView?.booking}
        mode={bookingToView?.mode || 'details'}
      />
      <LeaveReviewModal
        isOpen={!!bookingToReview}
        onClose={() => setBookingToReview(null)}
        booking={bookingToReview}
      />
    </div>
  );
}
