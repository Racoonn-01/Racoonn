"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, Filter, MessageSquare, FileText, Ban, MapPin, CreditCard, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        // Fetch all 3 collections
        const [bookingsRes, guestsRes, paymentsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, 'bookings', [Query.orderDesc('$createdAt')]),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_guests'),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_payments')
        ]);

        const mappedBookings = bookingsRes.documents.map(booking => {
          const guest = guestsRes.documents.find(g => g.bookingId === booking.$id);
          const payment = paymentsRes.documents.find(p => p.bookingId === booking.$id);

          let currentStatus = booking.status;
          if (currentStatus === 'Confirmed' && new Date(booking.checkOut).getTime() < new Date().getTime()) {
            currentStatus = 'Completed';
            databases.updateDocument(appwriteConfig.databaseId, 'bookings', booking.$id, { status: 'Completed' }).catch(console.error);
          }

          return {
            id: booking.$id.substring(0, 8).toUpperCase(),
            guest: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
            property: booking.hotelName || 'Racoonn Property',
            dates: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
            amount: payment ? `₹${payment.totalAmount}` : '₹0',
            status: currentStatus,
            email: guest?.email || 'N/A',
            phone: guest?.phone || 'N/A',
            guests: booking.adults || 1,
            nationality: guest?.country || 'N/A',
            specialRequests: guest?.specialRequests || '',
            paymentMethod: booking.paymentStatus || 'Card',
          };
        });

        setBookings(mappedBookings);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, []);

  return (
    <div className="space-y-6 relative">
      <AnimatePresence mode="wait">
        {!selectedBooking ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-heading font-bold text-secondary">Bookings</h2>
                <p className="text-slate-500 mt-1">Manage all your upcoming and past reservations.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border-slate-200 text-slate-600 gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>

      <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by guest name or booking ID..." 
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="border-slate-200 text-slate-600 gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4" />
              Filter Status
            </Button>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                <th className="p-4 font-medium">Booking ID</th>
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Property</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-center">Status</th>
                <th className="p-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <h3 className="text-lg font-heading font-semibold text-secondary">Loading bookings...</h3>
                      <p className="text-slate-500 mt-1">Please wait while we fetch your data.</p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length > 0 ? (
                bookings.map((booking, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={booking.id} 
                    onClick={() => setSelectedBooking(booking)}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    <td className="p-4 font-mono font-medium text-slate-600">{booking.id}</td>
                    <td className="p-4 font-semibold text-secondary flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                        {booking.guest.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      {booking.guest}
                    </td>
                    <td className="p-4 text-slate-600">{booking.property}</td>
                    <td className="p-4 text-slate-500 whitespace-nowrap">{booking.dates}</td>
                    <td className="p-4 font-semibold text-secondary text-right">{booking.amount}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Button variant="ghost" size="sm" className="text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Manage
                      </Button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <FileText className="h-8 w-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-heading font-semibold text-secondary">No bookings found</h3>
                      <p className="text-slate-500 mt-1">You don't have any bookings yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      </motion.div>
      ) : (
        <motion.div 
          key="details"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden"
        >
          <div className="flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="mb-6">
                <Button variant="ghost" onClick={() => setSelectedBooking(null)} className="mb-4 text-slate-500 hover:text-slate-700 -ml-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Bookings
                </Button>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-secondary">Manage Booking</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedBooking.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    selectedBooking.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    selectedBooking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <p className="text-slate-500 font-medium mt-1">
                  {selectedBooking.id}
                </p>
              </div>

                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center text-2xl font-black shrink-0">
                    {selectedBooking.guest.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-secondary">{selectedBooking.guest}</h3>
                    <p className="text-sm text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedBooking.property}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Guest Details</h4>
                  <div className="p-5 rounded-2xl bg-slate-50/80 ring-1 ring-slate-100 space-y-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">Email</p>
                        <p className="font-bold text-secondary text-sm break-all">{selectedBooking.email}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Phone</p>
                          <p className="font-bold text-secondary text-sm">{selectedBooking.phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Guests</p>
                          <p className="font-bold text-secondary text-sm">{selectedBooking.guests}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium mb-1">Nationality</p>
                        <p className="font-bold text-secondary text-sm">{selectedBooking.nationality}</p>
                      </div>
                    </div>
                    {selectedBooking.specialRequests && (() => {
                      const parts = selectedBooking.specialRequests.split('--- Additional Travelers ---');
                      const specialReqs = parts[0]?.trim();
                      const travelers = parts[1]?.trim();
                      
                      return (
                        <div className="pt-4 border-t border-slate-200/60 space-y-4">
                          {specialReqs && (
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-2">Special Requests</p>
                              <p className="text-sm font-semibold text-amber-900 bg-amber-50 p-3 rounded-xl ring-1 ring-amber-200/50 whitespace-pre-wrap">{specialReqs}</p>
                            </div>
                          )}
                          
                          {travelers && (
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-2">Additional Travelers</p>
                              <div className="grid grid-cols-1 gap-2">
                                {travelers.split(/(?=Guest \d+:)/).filter(Boolean).map((t: string, i: number) => {
                                  const match = t.match(/^(Guest \d+):\s*(.*)/);
                                  if (match) {
                                    const guestLabel = match[1];
                                    const guestStr = match[2].trim();
                                    
                                    // Try to parse "Name (Gender, DOB: Date)"
                                    const parsed = guestStr.match(/(.+?)\\s*\\((.+?),\\s*DOB:\\s*(.+?)\\)/);
                                    
                                    if (parsed) {
                                      return (
                                        <div key={i} className="bg-white p-4 rounded-xl ring-1 ring-slate-200 shadow-sm flex flex-col gap-3">
                                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{guestLabel}</span>
                                          <div className="grid grid-cols-3 gap-2">
                                            <div>
                                              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Name</p>
                                              <p className="text-sm font-semibold text-brand-navy">{parsed[1]}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Gender</p>
                                              <p className="text-sm font-semibold text-brand-navy">{parsed[2]}</p>
                                            </div>
                                            <div>
                                              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">DOB</p>
                                              <p className="text-sm font-semibold text-brand-navy">{parsed[3]}</p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    return (
                                      <div key={i} className="bg-white p-4 rounded-xl ring-1 ring-slate-200 shadow-sm flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{guestLabel}</span>
                                        <span className="text-sm font-semibold text-brand-navy">{guestStr}</span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={i} className="bg-white p-3 rounded-xl ring-1 ring-slate-200 shadow-sm">
                                      <span className="text-sm font-semibold text-brand-navy">{t.trim()}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Reservation Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-100">
                      <p className="text-xs text-slate-500 font-medium mb-1">Check-in</p>
                      <p className="font-bold text-secondary">{selectedBooking.dates.split(' - ')[0]}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">From 2:00 PM</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50/80 ring-1 ring-slate-100">
                      <p className="text-xs text-slate-500 font-medium mb-1">Check-out</p>
                      <p className="font-bold text-secondary">{selectedBooking.dates.split(' - ')[1]}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Until 11:00 AM</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Summary</h4>
                  <div className="p-5 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>Room charges</span>
                      <span>{selectedBooking.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>Taxes & Fees</span>
                      <span>₹45.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600 pt-1">
                      <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> Payment Method</span>
                      <span className="text-secondary">{selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="h-px bg-slate-100 my-2"></div>
                    <div className="flex justify-between items-center text-base font-black text-secondary">
                      <span>Total Paid</span>
                      <span className="text-[#E86A70]">₹{(parseFloat(selectedBooking.amount.replace(/[^0-9.-]+/g,"")) + 45).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 pb-6">
                  <Button className="w-full bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-[#E86A70]/20 gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Message Guest
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="font-bold h-12 rounded-xl border-slate-200 text-slate-600 gap-2">
                      <FileText className="w-4 h-4" />
                      Invoice
                    </Button>
                    <Button variant="outline" className="font-bold h-12 rounded-xl border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 gap-2">
                      <Ban className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
