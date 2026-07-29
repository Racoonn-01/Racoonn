"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, Filter, MessageSquare, FileText, Ban, MapPin, CreditCard, ArrowLeft, Loader2, Printer, X, Users, User, Building, Calendar, CheckCircle2, Headphones } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState<"guest" | "settlement">("guest");

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

          let totalPaidNum = payment ? Number(payment.totalAmount) : 0;
          let baseRoomNum = payment ? Number(payment.roomPrice) : 0;
          let gstAmountNum = payment ? Number(payment.taxes) : 0;

          const nights = booking.nights || 1;

          if (!baseRoomNum && totalPaidNum) {
            const approxNightPrice = totalPaidNum / nights;
            let deducedRate = 5;
            if (approxNightPrice <= 1050) deducedRate = 0;
            else if (approxNightPrice <= 7875) deducedRate = 5;
            else deducedRate = 18;

            baseRoomNum = Math.round((totalPaidNum / (1 + deducedRate / 100)) * 100) / 100;
            gstAmountNum = Math.round((totalPaidNum - baseRoomNum) * 100) / 100;
          } else if (baseRoomNum && !totalPaidNum) {
            const pricePerNight = baseRoomNum / nights;
            let deducedRate = 5;
            if (pricePerNight <= 1000) deducedRate = 0;
            else if (pricePerNight <= 7500) deducedRate = 5;
            else deducedRate = 18;

            gstAmountNum = Math.round((baseRoomNum * (deducedRate / 100)) * 100) / 100;
            totalPaidNum = baseRoomNum + gstAmountNum;
          } else if (!baseRoomNum && !totalPaidNum) {
            baseRoomNum = 5000;
            gstAmountNum = 250;
            totalPaidNum = 5250;
          }

          const pricePerNight = baseRoomNum / nights;
          let effectiveGstRate = booking.gstRate;
          if (effectiveGstRate === undefined || effectiveGstRate === null) {
            if (pricePerNight <= 1000) effectiveGstRate = 0;
            else if (pricePerNight <= 7500) effectiveGstRate = 5;
            else effectiveGstRate = 18;
          }

          // Enforce exact statutory GST calculation
          if (effectiveGstRate === 0) {
            gstAmountNum = 0;
            totalPaidNum = baseRoomNum;
          } else {
            gstAmountNum = Math.round((baseRoomNum * (effectiveGstRate / 100)) * 100) / 100;
            totalPaidNum = Math.round((baseRoomNum + gstAmountNum) * 100) / 100;
          }

          return {
            id: booking.$id.substring(0, 8).toUpperCase(),
            guest: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
            property: booking.hotelName || 'Racoonn Property',
            dates: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
            amount: `₹${totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            baseAmount: baseRoomNum,
            gstAmount: gstAmountNum,
            totalPaid: totalPaidNum,
            gstRate: effectiveGstRate,
            nights: nights,
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
            className="space-y-6 print:hidden print-hidden"
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
          className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden print:hidden print-hidden"
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

                {(() => {
                  const baseRoomAmount = selectedBooking.baseAmount || parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                  const gstRate = selectedBooking.gstRate ?? 5;
                  const gstAmount = selectedBooking.gstAmount ?? Math.round((baseRoomAmount * (gstRate / 100)) * 100) / 100;
                  const totalPaid = selectedBooking.totalPaid ?? (baseRoomAmount + gstAmount);

                  return (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Summary</h4>
                      <div className="p-5 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Room charges</span>
                          <span>₹{baseRoomAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                          <span>Taxes & GST ({gstRate === 0 ? '0% - Exempt' : `${gstRate}%`})</span>
                          <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-slate-600 pt-1">
                          <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> Payment Method ({selectedBooking.paymentMethod || 'Online'})</span>
                        </div>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <div className="flex justify-between items-center text-base font-black text-secondary">
                          <span>Total Paid</span>
                          <span className="text-[#E86A70]">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {(() => {
                  const handleMessageGuest = () => {
                    if (!selectedBooking) return;
                    const phoneDigits = (selectedBooking.phone || '').replace(/[^0-9]/g, '');
                    const customText = `Hello ${selectedBooking.guest}, regarding your booking (${selectedBooking.id}) at ${selectedBooking.property} for dates ${selectedBooking.dates}. Thank you for choosing Racoonn!`;
                    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(customText)}`;
                    window.open(whatsappUrl, '_blank');
                  };

                  return (
                    <div className="space-y-3 pt-4 pb-6 print:hidden print-hidden">
                      <Button 
                        onClick={handleMessageGuest}
                        className="w-full bg-[#E86A70] hover:bg-[#E86A70]/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-[#E86A70]/20 gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        <MessageSquare className="w-5 h-5" />
                        Message Guest
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => setIsInvoiceOpen(true)}
                          variant="outline" 
                          className="font-bold h-12 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 gap-2 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 text-slate-500" />
                          Invoice
                        </Button>
                        <Button 
                          variant="outline" 
                          className="font-bold h-12 rounded-xl border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 gap-2 cursor-pointer"
                        >
                          <Ban className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Smooth Animated Invoice Popup Modal */}
      <AnimatePresence>
        {isInvoiceOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInvoiceOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity print:hidden"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="printable-invoice-modal relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/10 overflow-hidden z-10 flex flex-col max-h-[92vh] print:shadow-none print:ring-0 print:max-h-none print:w-full"
            >
              {/* Modal Header Bar (Hidden on print) */}
              <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0 border-b border-slate-800 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-32 bg-white/10 rounded-lg p-1 flex items-center justify-center border border-white/10">
                    <Image
                      src="/racoonn-logo-text.png"
                      alt="Racoonn Logo"
                      fill
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                  {/* Toggle Tabs for Vendor Portal */}
                  <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 ml-2">
                    <button
                      onClick={() => setActiveInvoiceTab("guest")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeInvoiceTab === "guest" ? "bg-[#E86A70] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      Guest Tax Invoice
                    </button>
                    <button
                      onClick={() => setActiveInvoiceTab("settlement")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeInvoiceTab === "settlement" ? "bg-[#E86A70] text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                    >
                      Vendor Settlement Statement
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Invoice Document Body */}
              <div className="printable-invoice p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 font-sans print:overflow-visible print:p-0">
                
                {activeInvoiceTab === "settlement" ? (
                  /* Vendor Settlement Statement Body */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <span className="inline-block px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs mb-2">
                          VENDOR SETTLEMENT STATEMENT
                        </span>
                        <h3 className="text-2xl font-black text-[#1F2E4A]">SETT-{selectedBooking.id}</h3>
                        <p className="text-xs text-slate-500 mt-1">Property: <span className="font-bold text-slate-800">{selectedBooking.property}</span></p>
                      </div>
                      <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                        <p>Statement Date: <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                        <p>Settlement Status: <span className="font-bold text-emerald-600 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">PAYOUT SETTLED</span></p>
                      </div>
                    </div>

                    {(() => {
                      const roomAmountNum = parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                      const nights = selectedBooking.nights || 1;
                      const pricePerNight = roomAmountNum / nights;
                      
                      let gstRate = selectedBooking.gstRate;
                      if (gstRate === undefined || gstRate === null) {
                        if (pricePerNight <= 1000) gstRate = 0;
                        else if (pricePerNight <= 7500) gstRate = 5;
                        else gstRate = 18;
                      }

                      const gstAmount = Math.round((roomAmountNum * (gstRate / 100)) * 100) / 100;
                      const grossGuestPaid = Math.round((roomAmountNum + gstAmount) * 100) / 100;
                      const platformCommissionAmount = Math.round((roomAmountNum * 0.18) * 100) / 100; // Calculated strictly on roomAmount
                      const netVendorPayout = Math.round((grossGuestPaid - platformCommissionAmount) * 100) / 100;

                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Gross Guest Paid</span>
                              <p className="text-xl font-bold text-slate-900">₹{grossGuestPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">GST Collected (Pass-thru)</span>
                              <p className="text-xl font-bold text-slate-900">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/60">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">Platform Fee (18%)</span>
                              <p className="text-xl font-bold text-amber-900">- ₹{platformCommissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                              <p className="text-[10px] text-amber-700 mt-0.5">Computed on room base rate</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">Net Vendor Payout</span>
                              <p className="text-xl font-black text-emerald-900">₹{netVendorPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>

                          <div className="bg-white p-5 rounded-2xl border border-slate-100 space-y-3 text-xs">
                            <h4 className="font-bold text-slate-800 uppercase tracking-wider">Payout Account & Transfer Details</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-medium text-slate-600">
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase">Bank Account</span>
                                <span className="font-semibold text-slate-900">HDFC Bank (****4892)</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase">Bank IFSC Code</span>
                                <span className="font-semibold text-slate-900">HDFC0001234</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase">Payout Ref ID</span>
                                <span className="font-semibold text-slate-900">TXN994029384</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px] uppercase">Settlement Date</span>
                                <span className="font-semibold text-slate-900">{selectedBooking.dates.split(' - ')[0]}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <>
                {/* Top Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-slate-100">
                  {/* Left: Company Branding */}
                  <div className="space-y-1.5 max-w-md">
                    <div className="relative h-12 w-44 mb-2">
                      <Image
                        src="/racoonn-logo-text.png"
                        alt="Racoonn"
                        fill
                        className="object-contain object-left"
                        unoptimized
                      />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Racoonn Hospitality Pvt. Ltd.</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      123, 4th Floor, Tech Park One,<br />
                      Sector 62, Noida, Uttar Pradesh - 201309, India
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      support@racoonn.com &nbsp;•&nbsp; +91 120 456 7890
                    </p>
                    <p className="text-xs font-bold text-slate-700 pt-0.5">
                      GSTIN: 09AABCR1234A1Z5
                    </p>
                  </div>

                  {/* Right: Invoice Details & Badge */}
                  <div className="text-left sm:text-right space-y-2">
                    <div className="sm:flex sm:justify-end">
                      <span className="inline-block px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#E86A70] text-white shadow-xs">
                        TAX INVOICE
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">INVOICE NUMBER</span>
                      <h3 className="text-2xl font-black text-[#1F2E4A] tracking-tight">INV-{selectedBooking.id}</h3>
                    </div>
                    <div className="text-xs font-medium text-slate-600 space-y-1 pt-1">
                      <div className="flex justify-start sm:justify-end gap-3">
                        <span className="text-slate-400">Invoice Date :</span>
                        <span className="font-semibold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex justify-start sm:justify-end gap-3">
                        <span className="text-slate-400">Booking Date :</span>
                        <span className="font-semibold text-slate-800">{selectedBooking.dates.split(' - ')[0]}</span>
                      </div>
                      <div className="flex justify-start sm:justify-end gap-3">
                        <span className="text-slate-400">Payment Date :</span>
                        <span className="font-semibold text-slate-800">{selectedBooking.dates.split(' - ')[0]}</span>
                      </div>
                      <div className="flex justify-start sm:justify-end gap-3">
                        <span className="text-slate-400">Invoice Status :</span>
                        <span className="font-bold text-emerald-600 uppercase tracking-wider text-xs">
                          {selectedBooking.status || 'COMPLETED'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Column Meta Info Grid Box */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-xs p-6 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  
                  {/* Col 1: Billed To */}
                  <div className="space-y-2 pr-2">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E86A70]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">BILLED TO (GUEST)</span>
                    </div>
                    <h4 className="text-base font-bold text-[#1F2E4A]">{selectedBooking.guest || 'Valued Guest'}</h4>
                    <p className="text-xs text-slate-600 break-all">{selectedBooking.email || 'guest@racoonn.com'}</p>
                    <p className="text-xs text-slate-600 font-medium">{selectedBooking.phone || '+91 98765 43210'}</p>
                    <p className="text-xs text-slate-500 leading-relaxed pt-1">
                      {selectedBooking.guestAddress || 'India'}
                    </p>
                  </div>

                  {/* Col 2: Reservation & Property */}
                  <div className="space-y-2 md:pl-6 pr-2 pt-4 md:pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E86A70]">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">RESERVATION & PROPERTY</span>
                    </div>
                    <h4 className="text-base font-bold text-[#1F2E4A]">{selectedBooking.property}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedBooking.hotelLocation || 'India'}
                    </p>
                    <p className="text-xs text-slate-600 font-medium">+91 120 456 7890</p>
                    <p className="text-xs font-bold text-slate-700 pt-1">GSTIN: 09AABCR1234A1Z5</p>
                  </div>

                  {/* Col 3: Dates & Stay Details */}
                  <div className="space-y-1.5 md:pl-6 pt-4 md:pt-0 text-xs">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-7 w-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E86A70]">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">STAY & BOOKING INFO</span>
                    </div>
                    
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Booking ID</span>
                      <span className="font-semibold text-slate-800">RCN-{selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Confirmation No</span>
                      <span className="font-semibold text-slate-800">CNF-{selectedBooking.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Check-in</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.dates.split(' - ')[0]} (02:00 PM)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Check-out</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.dates.split(' - ')[1] || selectedBooking.dates.split(' - ')[0]} (11:00 AM)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Nights / Rooms</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.nights || 1} {(selectedBooking.nights || 1) === 1 ? 'Night' : 'Nights'} / 1 Room</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Room Type</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.roomName || selectedBooking.property}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-slate-50">
                      <span className="text-slate-400">Payment Method</span>
                      <span className="font-semibold text-slate-800">{selectedBooking.paymentMethod || 'Online (Razorpay)'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Payment Status</span>
                      <span className="font-bold text-emerald-600">Paid</span>
                    </div>
                  </div>
                </div>

                {/* Middle 2-Column Section: Left (Invoice Breakdown & Tax), Right (Guest List & Payment Details) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left 7 Cols: Invoice & Tax Breakdown */}
                  <div className="md:col-span-7 space-y-6">
                    
                    {/* Invoice Breakdown Card */}
                    <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">INVOICE BREAKDOWN</h4>
                      
                      {(() => {
                        const roomAmountNum = selectedBooking.baseAmount || parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                        const nights = selectedBooking.nights || 1;
                        const pricePerNight = roomAmountNum / nights;
                        
                        let gstRate = selectedBooking.gstRate;
                        if (gstRate === undefined || gstRate === null) {
                          if (pricePerNight <= 1000) gstRate = 0;
                          else if (pricePerNight <= 7500) gstRate = 5;
                          else gstRate = 18;
                        }

                        const totalTaxAmt = selectedBooking.gstAmount ?? (Math.round((roomAmountNum * (gstRate / 100)) * 100) / 100);
                        const totalPaidNum = selectedBooking.totalPaid ?? (roomAmountNum + totalTaxAmt);

                        return (
                          <div className="space-y-3">
                            <div className="rounded-xl border border-slate-100 overflow-hidden text-xs">
                              <div className="bg-slate-50 p-2.5 font-bold uppercase text-slate-500 grid grid-cols-2">
                                <span>DESCRIPTION</span>
                                <span className="text-right">AMOUNT (INR)</span>
                              </div>
                              <div className="p-3 border-b border-slate-100 grid grid-cols-2 text-slate-700">
                                <div>
                                  <p className="font-bold text-slate-900">Room Base Charges ({nights} {nights === 1 ? 'Night' : 'Nights'})</p>
                                  <p className="text-[11px] text-slate-500">{selectedBooking.roomName || selectedBooking.property}</p>
                                </div>
                                <span className="text-right font-bold text-slate-900 self-center">₹{roomAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="p-3 border-b border-slate-100 grid grid-cols-2 text-slate-700 font-medium">
                                <span>Taxes & GST ({gstRate}%)</span>
                                <span className="text-right font-bold text-slate-900">₹{totalTaxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="p-3 bg-slate-50 grid grid-cols-2 font-bold text-slate-900">
                                <span>Total Amount Paid by Guest</span>
                                <span className="text-right text-[#E86A70]">₹{totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Green Total Paid Banner */}
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-emerald-900 text-sm">Total Paid</h5>
                                  <p className="text-[10px] text-emerald-700">(Inclusive of all statutory taxes)</p>
                                </div>
                              </div>
                              <span className="text-xl font-black text-emerald-800">₹{totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Tax Breakdown Card (Only shown if GST rate > 0) */}
                    {(() => {
                      const roomAmountNum = selectedBooking.baseAmount || parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                      const nights = selectedBooking.nights || 1;
                      const pricePerNight = roomAmountNum / nights;
                      
                      let rate = selectedBooking.gstRate;
                      if (rate === undefined || rate === null) {
                        if (pricePerNight <= 1000) rate = 0;
                        else if (pricePerNight <= 7500) rate = 5;
                        else rate = 18;
                      }

                      if (rate === 0) return null;

                      const halfRate = (rate / 2).toFixed(1);
                      const totalTaxAmt = selectedBooking.gstAmount ?? (Math.round((roomAmountNum * (rate / 100)) * 100) / 100);
                      const halfTaxAmt = Math.round((totalTaxAmt / 2) * 100) / 100;

                      return (
                        <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">STATUTORY GST TAX BREAKDOWN</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              GST @ {rate}%
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="rounded-xl border border-slate-100 overflow-hidden text-xs">
                              <div className="bg-slate-50 p-2.5 font-bold uppercase text-slate-500 grid grid-cols-4">
                                <span>TAX TYPE</span>
                                <span>RATE</span>
                                <span>TAXABLE AMT</span>
                                <span className="text-right">TAX AMT</span>
                              </div>
                              <div className="p-2.5 border-b border-slate-100 grid grid-cols-4 text-slate-700 font-medium">
                                <span className="font-bold text-slate-900">CGST</span>
                                <span>{halfRate}%</span>
                                <span>₹{roomAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span className="text-right font-semibold">₹{halfTaxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="p-2.5 border-b border-slate-100 grid grid-cols-4 text-slate-700 font-medium">
                                <span className="font-bold text-slate-900">SGST</span>
                                <span>{halfRate}%</span>
                                <span>₹{roomAmountNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                <span className="text-right font-semibold">₹{halfTaxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="p-2.5 bg-slate-50 flex justify-between items-center font-bold text-slate-900">
                                <span>TOTAL GST TAX</span>
                                <span className="text-right">₹{totalTaxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* ITC Compliance Note */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-medium text-slate-600">
                              {rate === 5 && <p className="font-bold text-slate-800">Note: GST @ 5% (Input Tax Credit Not Allowed)</p>}
                              {rate === 18 && <p className="font-bold text-slate-800">Note: GST @ 18% (Input Tax Credit Allowed)</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Right 5 Cols: Guest List & Payment Details */}
                  <div className="md:col-span-5 space-y-6">
                    
                    {/* Guest List Card */}
                    <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-slate-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">GUEST DETAILS</h4>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">Guests: {selectedBooking.guests || 2}</span>
                      </div>

                      {/* Guest Items */}
                      <div className="space-y-2 text-xs">
                        {/* Primary Guest */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">1</span>
                            <div>
                              <p className="font-bold text-slate-900">{selectedBooking.guest || 'Primary Guest'}</p>
                              <p className="text-[10px] text-[#E86A70] font-semibold">Primary Guest</p>
                            </div>
                          </div>
                          <span className="text-slate-500 font-medium">Adult</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details Card */}
                    <div className="border border-slate-100 rounded-2xl p-5 bg-white shadow-xs space-y-3 text-xs">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">PAYMENT DETAILS</h4>
                      </div>

                      {(() => {
                        const roomAmountNum = parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                        const gstRate = selectedBooking.gstRate ?? 5;
                        const totalTaxAmt = Math.round((roomAmountNum * (gstRate / 100)) * 100) / 100;
                        const totalPaidNum = roomAmountNum + totalTaxAmt;

                        return (
                          <div className="space-y-2 pt-1 font-medium text-slate-600">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Transaction ID</span>
                              <span className="font-semibold text-slate-800">TXN-{selectedBooking.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Payment ID</span>
                              <span className="font-semibold text-slate-800">PAY-{selectedBooking.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Paid Amount</span>
                              <span className="font-bold text-slate-900">₹{totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Paid Via</span>
                              <span className="font-semibold text-slate-800">{selectedBooking.paymentMethod || 'Online (Razorpay / UPI)'}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

                {/* Terms & Conditions */}
                <div className="pt-6 border-t border-slate-100 space-y-1 text-[11px] text-slate-500 leading-relaxed py-3">
                  <h5 className="font-bold uppercase tracking-wider text-slate-700 text-xs mb-1">TERMS & CONDITIONS</h5>
                  <p>• Check-in time: 02:00 PM | Check-out time: 11:00 AM</p>
                  <p>• Early check-in and late check-out are subject to availability.</p>
                  <p>• For cancellations and refunds, please refer to the booking policy.</p>
                  <p>• This is a computer generated invoice and does not require signature.</p>
                </div>

                {/* Dark Footer Banner */}
                <div className="bg-[#1F2E4A] rounded-2xl px-5 py-3.5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-[#E86A70] shrink-0">
                      <Headphones className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-bold text-white">Need Help?</span>
                      <span className="text-slate-300 text-[11px] whitespace-nowrap">support@racoonn.com</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300 text-[11px] whitespace-nowrap">+91 120 456 7890</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 sm:text-right shrink-0">
                    <span className="text-slate-300 text-[11px] whitespace-nowrap">Thank you for booking with Racoonn!</span>
                    <div className="h-6 w-6 rounded-full bg-[#E86A70] flex items-center justify-center text-white shrink-0 font-bold text-xs">
                      R
                    </div>
                  </div>
                </div>
                </>
                )}

              </div>

              {/* Modal Footer (Hidden on print) */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 print:hidden">
                <Button
                  onClick={() => window.print()}
                  variant="outline"
                  className="font-bold rounded-xl h-11 border-slate-200 text-slate-700 hover:bg-slate-100 gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </Button>
                
                <Button
                  onClick={() => setIsInvoiceOpen(false)}
                  variant="outline"
                  className="font-bold rounded-xl h-11 border-slate-200 text-slate-600 hover:bg-slate-100 px-6 cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
