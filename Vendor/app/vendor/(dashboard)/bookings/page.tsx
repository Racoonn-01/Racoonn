"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, Filter, MessageSquare, FileText, Ban, MapPin, CreditCard, ArrowLeft, Loader2, Printer, X, Users, User, Building, Calendar, CheckCircle2, Headphones, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { calculateCancellationRefund } from "@/lib/cancellation";
import { useAuthStore } from "@/store/authStore";
import SingleWithdrawalModal from "@/components/vendor/SingleWithdrawalModal";

export default function BookingsPage() {
  const { user, profile } = useAuthStore();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState<"guest" | "settlement">("guest");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [cancellationSummary, setCancellationSummary] = useState<any>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) || 
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    async function fetchBookings() {
      try {
        setIsLoading(true);
        if (!user?.$id) return;

        // Fetch vendor's properties first
        const propertiesRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId || "Properties",
          [Query.equal("vendorId", user.$id)]
        );
        const vendorPropertyIds = propertiesRes.documents.map((p: any) => p.$id);

        if (vendorPropertyIds.length === 0) {
          setBookings([]);
          setIsLoading(false);
          return;
        }

        // Fetch all 3 collections
        const [bookingsRes, guestsRes, paymentsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, 'bookings', [Query.orderDesc('$createdAt'), Query.limit(1000)]),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_guests', [Query.limit(1000)]),
          databases.listDocuments(appwriteConfig.databaseId, 'booking_payments', [Query.limit(1000)])
        ]);

        const vendorBookings = bookingsRes.documents.filter(b => vendorPropertyIds.includes(b.hotelId));

        const mappedBookings = vendorBookings.map(booking => {
          const guest = guestsRes.documents.find(g => g.bookingId === booking.$id);
          const payment = paymentsRes.documents.find(p => p.bookingId === booking.$id);

          let currentStatus = booking.status;
          if (currentStatus === 'Confirmed' && new Date(booking.checkOut).getTime() < new Date().getTime()) {
            currentStatus = 'Completed';
            databases.updateDocument(appwriteConfig.databaseId, 'bookings', booking.$id, { status: 'Completed' }).catch(console.error);
          }

          let totalPaidNum = payment ? Number(payment.totalAmount) : (booking.totalAmount ? Number(booking.totalAmount) : (booking.priceAfterTax ? Number(booking.priceAfterTax) : 0));
          let baseRoomNum = payment ? Number(payment.roomPrice) : (booking.priceBeforeTax ? Number(booking.priceBeforeTax) : 0);
          let gstAmountNum = payment ? Number(payment.taxes) : (booking.gstAmount ? Number(booking.gstAmount) : 0);
          let addonsNum = payment ? Number(payment.serviceFees) : (booking.addons ? Number(booking.addons) : 0);
          let discountNum = payment ? Number(payment.discount) : (booking.discount ? Number(booking.discount) : 0);

          const nights = booking.nights || 1;

          if (!baseRoomNum && totalPaidNum) {
            let deducedRate = 5;
            if (totalPaidNum <= 1000) deducedRate = 0;
            else if (totalPaidNum <= 7875) deducedRate = 5;
            else deducedRate = 18;

            baseRoomNum = Math.round((totalPaidNum / (1 + deducedRate / 100)) * 100) / 100;
            gstAmountNum = Math.round((totalPaidNum - baseRoomNum) * 100) / 100;
          } else if (baseRoomNum && !totalPaidNum) {
            let deducedRate = 5;
            if (baseRoomNum <= 1000) deducedRate = 0;
            else if (baseRoomNum <= 7500) deducedRate = 5;
            else deducedRate = 18;

            gstAmountNum = Math.round((baseRoomNum * (deducedRate / 100)) * 100) / 100;
            totalPaidNum = baseRoomNum + gstAmountNum;
          } else if (!baseRoomNum && !totalPaidNum) {
            baseRoomNum = 0;
            gstAmountNum = 0;
            totalPaidNum = 0;
          }

          let effectiveGstRate = booking.gstPercentage ?? booking.gstRate;
          if (effectiveGstRate === undefined || effectiveGstRate === null) {
            if (baseRoomNum <= 1000) effectiveGstRate = 0;
            else if (baseRoomNum <= 7500) effectiveGstRate = 5;
            else effectiveGstRate = 18;
          }

          // Ensure totalPaidNum includes all components if we fell back to booking fields
          if (!payment && !booking.totalAmount) {
            totalPaidNum = baseRoomNum + gstAmountNum + addonsNum - discountNum;
          }

          return {
            docId: booking.$id,
            id: booking.$id.substring(0, 8).toUpperCase(),
            guest: guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Guest',
            property: booking.hotelName || 'Racoonn Property',
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            dates: `${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}`,
            amount: `₹${totalPaidNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            baseAmount: baseRoomNum,
            gstAmount: gstAmountNum,
            addons: addonsNum,
            discount: discountNum,
            totalPaid: totalPaidNum,
            gstRate: effectiveGstRate,
            nights: nights,
            status: currentStatus,
            email: guest?.email || 'N/A',
            phone: guest?.phone || 'N/A',
            guests: booking.adults || 1,
            nationality: guest?.country || 'N/A',
            specialRequests: guest?.specialRequests || '',
            paymentMethod: booking.paymentMethod || 'Online (UPI / Cards)',
            refundEligible: booking.refundEligible,
            refundPercentage: booking.refundPercentage,
            refundAmount: booking.refundAmount,
            refundStatus: booking.refundStatus,
            cancellationReason: booking.cancellationReason,
            cancelledAt: booking.cancelledAt,
          };
        });

        setBookings(mappedBookings);
        
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const autoBookingId = params.get('bookingId');
          if (autoBookingId) {
            const bookingToSelect = mappedBookings.find((b: any) => b.docId === autoBookingId);
            if (bookingToSelect) {
              setSelectedBooking(bookingToSelect);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookings();
  }, [user?.$id]);

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 bg-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 w-full sm:w-auto text-slate-600 font-medium h-10"
            >
              <option value="All">Filter Status: All</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
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
              ) : filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
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
                      let specialReqs = parts[0]?.trim() || '';
                      specialReqs = specialReqs.replace(/\[GST Info:.*?\]/g, '').trim();
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

              </div>

              {/* Right Column */}
              <div className="space-y-8">                {(() => {
                  const baseRoomAmount = selectedBooking.baseAmount || parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                  const gstRate = selectedBooking.gstRate ?? 5;
                  const gstAmount = selectedBooking.gstAmount ?? Math.round((baseRoomAmount * (gstRate / 100)) * 100) / 100;
                  const addonsNum = selectedBooking.addons || 0;
                  const discountNum = selectedBooking.discount || 0;
                  const totalPaid = selectedBooking.totalPaid ?? (baseRoomAmount + gstAmount + addonsNum - discountNum);

                  return (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Summary</h4>
                      <div className="p-5 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm space-y-3">
                        {(() => {
                          let vendorDiscount = 0;
                          let racoonnDiscount = 0;
                          if (selectedBooking.specialRequests) {
                            const vdMatch = selectedBooking.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
                            if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
                            const rdMatch = selectedBooking.specialRequests.match(/RacoonnDiscount=₹?([0-9.]+)/);
                            if (rdMatch) racoonnDiscount = parseFloat(rdMatch[1]);
                          } else {
                            vendorDiscount = discountNum;
                          }
                          const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
                          const feePercent = profile?.allow24PercentGst ? 24 : 18;
                          const platformFee = Math.round(vendorGross * (feePercent / 100));
                          const vendorNet = vendorGross - platformFee;

                          return (
                            <>
                              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Room charges</span>
                                <span>₹{baseRoomAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              {addonsNum > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                  <span>Service Add-ons</span>
                                  <span>₹{addonsNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              {vendorDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-amber-600">
                                  <span>Vendor Coupon Applied</span>
                                  <span>-₹{vendorDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              {racoonnDiscount > 0 && (
                                <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                                  <span>Platform Promo (Covered by Racoonn)</span>
                                  <span>-₹{racoonnDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Taxes & GST ({gstRate === 0 ? '0% - Exempt' : `${gstRate}%`})</span>
                                <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-medium text-slate-600 pt-1">
                                <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> Payment Method ({selectedBooking.paymentMethod || 'Online'})</span>
                              </div>
                              <div className="h-px bg-slate-100 my-2"></div>
                              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                                <span>Gross Booking Value (Room + Addons)</span>
                                <span>₹{(baseRoomAmount + addonsNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm font-medium text-rose-500">
                                <span>Platform Fee ({feePercent}%)</span>
                                <span>-₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="h-px bg-slate-200/50 my-3"></div>
                              <div className="flex justify-between items-center text-base font-black text-emerald-600">
                                <span>Vendor Net Revenue</span>
                                <span>₹{vendorNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                              </div>
                              
                              <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
                                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
                                  <span>Total Guest Paid (incl GST)</span>
                                  <span>₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                              </div>
                            </>
                          );
                        })()}
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

                  const handleInitiateCancel = () => {
                    if (!selectedBooking) return;
                    const totalPaid = selectedBooking.totalPaid || 0;
                    
                    const calc = {
                      refundPercentage: 100,
                      refundAmount: totalPaid,
                      cancellationFee: 0,
                      bookingStatus: 'Cancelled',
                      reason: 'Vendor initiated cancellation',
                      refundStatus: totalPaid > 0 ? 'Pending' : 'N/A'
                    };
                    setCancellationSummary(calc);
                    setIsCancelModalOpen(true);
                  };



                  const isAlreadyCancelled = selectedBooking.status?.toLowerCase().includes('cancel') || selectedBooking.status === 'No Show' || selectedBooking.status === 'Completed';

                  return (
                    <div className="space-y-3 pt-4 pb-6 print:hidden print-hidden">
                      <div className="flex flex-col gap-3">
                        <Button 
                          disabled={isAlreadyCancelled}
                          onClick={handleInitiateCancel}
                          variant="outline" 
                          className={`w-full font-bold h-12 rounded-xl border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 gap-2 cursor-pointer ${isAlreadyCancelled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Ban className="w-4 h-4" />
                          {isAlreadyCancelled ? 'Cancelled' : 'Cancel Booking'}
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

      {/* Cancellation Confirmation Modal */}
      <AnimatePresence>
        {isCancelModalOpen && cancellationSummary && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6"
            >
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-secondary">Cancel Booking?</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Booking #{selectedBooking.id}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Since you are cancelling this booking, the guest is eligible for a full <strong className="text-slate-900">100%</strong> refund.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Booking Amount</span>
                    <span className="font-bold text-slate-900">₹{(selectedBooking.totalPaid || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium hidden">
                    <span>Cancellation Fee</span>
                    <span className="font-bold text-red-600">₹0</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Refund Amount ({cancellationSummary.refundPercentage}%)</span>
                    <span className="font-bold text-emerald-600">₹{cancellationSummary.refundAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium pt-1">
                    <span>Expected Refund Timeline</span>
                    <span className="font-semibold text-slate-700">5–7 Business Days</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200 font-semibold">
                ⚠️ This action cannot be undone. Room availability will be automatically released upon cancellation.
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isCancelling}
                  className="w-1/2 h-12 font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Keep Booking
                </Button>
                <Button
                  onClick={() => {
                    const handleConfirmCancel = async () => {
                      if (!selectedBooking || !cancellationSummary) return;
                      try {
                        setIsCancelling(true);
                        const updatePayload = {
                          status: 'Cancelled'
                        };

                        await databases.updateDocument(
                          appwriteConfig.databaseId,
                          'bookings',
                          selectedBooking.docId || selectedBooking.id,
                          updatePayload
                        );

                        setSelectedBooking((prev: any) => ({
                          ...prev,
                          ...updatePayload,
                        }));

                        setBookings((prevBookings) =>
                          prevBookings.map((b) =>
                            b.id === selectedBooking.id
                              ? { ...b, ...updatePayload }
                              : b
                          )
                        );

                        setIsCancelModalOpen(false);
                      } catch (err) {
                        console.error("Failed to cancel booking:", err);
                        alert("Error executing cancellation. Please try again.");
                      } finally {
                        setIsCancelling(false);
                      }
                    };
                    handleConfirmCancel();
                  }}
                  disabled={isCancelling}
                  className="w-1/2 h-12 font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 cursor-pointer gap-2"
                >
                  {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cancel Booking
                </Button>
              </div>
            </motion.div>
          </div>
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
                <div className="flex items-center gap-3 font-bold text-sm">
                  Vendor Settlement Statement
                </div>
                <button
                  onClick={() => setIsInvoiceOpen(false)}
                  className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Invoice Document Body */}
              <div className="printable-invoice flex-1 min-h-0 p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 font-sans print:overflow-visible print:p-0">
                
                <AnimatePresence mode="wait">
                  {/* Vendor Settlement Statement Body */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                      <div>
                        <span className="inline-block px-3.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs mb-2">
                          VENDOR SETTLEMENT STATEMENT
                        </span>
                        <h3 className="text-2xl font-black text-brand-navy">SETT-{selectedBooking.id}</h3>
                        <p className="text-xs text-slate-500 mt-1">Property: <span className="font-bold text-slate-800">{selectedBooking.property}</span></p>
                      </div>
                      <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                        <p>Statement Date: <span className="font-bold text-slate-800">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></p>
                        <p>Settlement Status: <span className="font-bold text-emerald-600 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">PAYOUT SETTLED</span></p>
                        <p className="font-bold text-slate-700 mt-1">HSN Code for Hotel rent: 9963</p>
                      </div>
                    </div>

                    {(() => {
                      const baseRoomAmount = selectedBooking.baseAmount || parseFloat((selectedBooking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
                      const addonsNum = selectedBooking.addons || 0;
                      const discountNum = selectedBooking.discount || 0;
                      
                      let gstRate = selectedBooking.gstRate;
                      if (gstRate === undefined || gstRate === null) {
                        const nights = selectedBooking.nights || 1;
                        const pricePerNight = baseRoomAmount / nights;
                        if (pricePerNight <= 1000) gstRate = 0;
                        else if (pricePerNight <= 7500) gstRate = 5;
                        else gstRate = 18;
                      }

                      const gstAmount = selectedBooking.gstAmount ?? Math.round((baseRoomAmount * (gstRate / 100)) * 100) / 100;
                      
                      let vendorDiscount = 0;
                      let racoonnDiscount = 0;
                      if (selectedBooking.specialRequests) {
                        const vdMatch = selectedBooking.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
                        if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
                        const rdMatch = selectedBooking.specialRequests.match(/RacoonnDiscount=₹?([0-9.]+)/);
                        if (rdMatch) racoonnDiscount = parseFloat(rdMatch[1]);
                      } else {
                        vendorDiscount = discountNum;
                      }

                      const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
                      const feePercent = profile?.allow24PercentGst ? 24 : 18;
                      const platformCommissionAmount = Math.round(vendorGross * (feePercent / 100) * 100) / 100;
                      const netVendorPayout = Math.round((vendorGross - platformCommissionAmount) * 100) / 100;
                      const grossGuestPaid = selectedBooking.totalPaid ?? (baseRoomAmount + gstAmount + addonsNum - discountNum);

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
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">Platform Fee ({feePercent}%)</span>
                              <p className="text-xl font-bold text-amber-900">- ₹{platformCommissionAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                              <p className="text-[10px] text-amber-700 mt-0.5">Computed on gross room revenue</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">Net Vendor Payout</span>
                              <p className="text-xl font-black text-emerald-900">₹{netVendorPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </motion.div>
                </AnimatePresence>

              </div>

              {/* Modal Footer (Hidden on print) */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0 print:hidden justify-end">
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

      {/* Remove SingleWithdrawalModal completely since we don't need it */}
    </div>
  );
}
