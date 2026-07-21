'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, FileText, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { databases } from '@/lib/appwrite/config';
import { useAuthStore } from '@/store/authStore';
import { Query } from 'appwrite';
import CancelBookingModal from './CancelBookingModal';
import BookingDetailsModal from './BookingDetailsModal';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export interface UIBooking {
  id: string;
  rawId: string;
  hotel: string;
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

        return {
          id: String(doc.$id).substring(0, 8).toUpperCase(),
          rawId: String(doc.$id),
          hotel: String(doc.hotelName),
          location: String(doc.hotelLocation),
          checkIn: new Date(String(doc.checkIn)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          checkOut: new Date(String(doc.checkOut)).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          rawCheckIn: String(doc.checkIn),
          guests: `${doc.adults} Adults${doc.children ? `, ${doc.children} Child` : ''}`,
          amount: payment ? `₹${Number((payment as Record<string, unknown>).totalAmount).toLocaleString()}` : `₹${(Number(doc.nights) * 32000).toLocaleString()}`,
          status: currentStatus === 'Confirmed' ? 'Upcoming' : currentStatus,
          image: String(doc.hotelImage),
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
    fetchBookings(false).catch(console.error);
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
                    <Image src={booking.image} alt={booking.hotel} fill className="object-cover" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-navy uppercase">
                      {booking.status}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-heading font-bold text-brand-navy">{booking.hotel}</h3>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {booking.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 font-medium">Booking ID</p>
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
                    <div className="mt-auto flex flex-wrap gap-3">
                      <button 
                        onClick={() => setBookingToView({ booking, mode: 'details' })}
                        className="px-5 py-2.5 bg-brand-navy hover:bg-brand-coral text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => setBookingToView({ booking, mode: 'invoice' })}
                        className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-brand-navy text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <FileText size={16} /> Invoice
                      </button>
                      
                      {booking.status === 'Completed' && (
                        <button className="px-5 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral text-sm font-bold rounded-xl transition-colors flex items-center gap-2 ml-auto">
                          <Star size={16} /> Leave Review
                        </button>
                      )}
                      {booking.status === 'Upcoming' && (
                        <button 
                          onClick={() => setBookingToCancel(booking)}
                          className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-bold rounded-xl transition-colors ml-auto"
                        >
                          Cancel
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
    </div>
  );
}
