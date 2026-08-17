import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Download, CheckCircle, Printer } from 'lucide-react';
import Image from 'next/image';
import { calculateHotelGST } from '@/lib/utils/gst';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  mode: 'details' | 'invoice';
}

export default function BookingDetailsModal({ isOpen, onClose, booking, mode }: BookingDetailsModalProps) {
  if (!isOpen || !booking) return null;

  const rawAmount = Number(String(booking.amount || '').replace(/[^0-9]/g, '')) || 18999;
  const roomPricePerNight = booking.roomPricePerNight || Math.round(rawAmount / 1.18);
  const gstCalc = calculateHotelGST(roomPricePerNight, booking.nights || 1, 1);

  const roomCharges = booking.priceBeforeTax || gstCalc.priceBeforeTax;
  const gstRate = booking.gstPercentage ?? gstCalc.gstPercentage;
  const gstAmount = booking.gstAmount ?? gstCalc.gstAmount;
  const grandTotal = booking.priceAfterTax || rawAmount || gstCalc.priceAfterTax;
  const gstType = booking.gstType || gstCalc.gstType;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-brand-sand rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 bg-white border-b border-gray-100 shrink-0">
            <h3 className="text-xl font-bold text-brand-navy flex items-center gap-2">
              {mode === 'invoice' ? 'Booking Invoice' : 'Booking Details'}
            </h3>
            <div className="flex items-center gap-3">
              {mode === 'invoice' && (
                <button 
                  onClick={() => window.print()}
                  className="p-2 text-brand-coral hover:bg-brand-coral/10 rounded-full transition-colors flex items-center gap-2"
                  title="Print Invoice"
                >
                  <Printer size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 overflow-y-auto print:bg-white print:p-0 print:overflow-visible">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 print:flex-row">
              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden relative shrink-0 print:hidden">
                <Image src={booking.image} alt={booking.hotel} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-brand-navy">{booking.hotel}</h2>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {booking.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400 font-medium">Booking ID</p>
                    <p className="font-mono text-lg font-bold text-brand-navy">#{booking.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white border border-gray-200 text-brand-navy">
                    Status: <span className={booking.status === 'Cancelled' ? 'text-red-500' : 'text-green-600'}>{booking.status}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    HSN Code for Hotel rent: 9963
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 print:shadow-none print:border-gray-300">
              <h4 className="font-bold text-brand-navy mb-4 border-b border-gray-100 pb-2">Reservation Info</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Check In</p>
                  <p className="font-bold text-[15px] text-brand-navy">{booking.checkIn}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Check Out</p>
                  <p className="font-bold text-[15px] text-brand-navy">{booking.checkOut}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Guests</p>
                  <p className="font-bold text-[15px] text-brand-navy">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Payment</p>
                  <p className="font-bold text-[15px] text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Paid</p>
                </div>
              </div>
            </div>

            {/* Invoice / Pricing Breakdown */}
            {mode === 'invoice' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 print:shadow-none print:border-gray-300">
                <h4 className="font-bold text-brand-navy mb-4 border-b border-gray-100 pb-2">Tax Summary</h4>
                
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Charges</span>
                    <span className="font-semibold text-brand-navy">₹{roomCharges.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST Rate</span>
                    <span className="font-semibold text-brand-navy">{gstRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST Amount</span>
                    <span className="font-semibold text-brand-navy">₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST Type</span>
                    <span className="font-semibold text-emerald-600">{gstType}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-200">
                  <span className="font-bold text-brand-navy">Grand Total</span>
                  <span className="text-xl font-bold text-brand-coral">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>

                <p className="text-xs text-gray-400 mt-4 italic">
                  GST applied as per Government of India hotel accommodation GST slab based on room tariff.
                </p>
              </div>
            )}

            {mode === 'details' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-brand-navy mb-4 border-b border-gray-100 pb-2">Tax Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Room Tariff</span>
                      <span className="font-semibold text-brand-navy">₹{roomPricePerNight.toLocaleString('en-IN')} / Night</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Slab</span>
                      <span className="font-semibold text-brand-navy">{gstRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST Amount</span>
                      <span className="font-semibold text-brand-navy">₹{gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ITC Status</span>
                      <span className="font-semibold text-emerald-600">{gstType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="font-bold text-brand-navy mb-2 border-b border-gray-100 pb-2">Guest Details</h4>
                  <p className="text-sm text-gray-500 mb-2">Primary Guest is the account holder.</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-brand-navy">Total Payable:</span>
                    <span className="text-xl font-bold text-brand-coral">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
