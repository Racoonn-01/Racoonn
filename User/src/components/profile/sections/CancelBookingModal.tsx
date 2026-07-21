import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { databases } from '@/lib/appwrite/config';
import { toast } from 'react-hot-toast';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onSuccess: () => void;
}

export default function CancelBookingModal({ isOpen, onClose, booking, onSuccess }: CancelBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  // Simple cancellation logic: 
  // If cancelled within 48 hours of check-in, charge a 20% fee. Otherwise, free.
  const checkInDate = new Date(booking.rawCheckIn || booking.checkIn);
  const now = new Date();
  const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  const hasCancellationFee = hoursUntilCheckIn < 48 && hoursUntilCheckIn > 0;
  const cancellationFeeAmount = hasCancellationFee ? "20% of the total booking amount" : "₹0 (Free Cancellation)";

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        'bookings',
        booking.rawId,
        {
          status: 'Cancelled',
        }
      );
      toast.success("Booking cancelled successfully.");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-brand-navy flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              Cancel Booking
            </h3>
            <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-700 font-medium mb-4">
              Are you sure you want to cancel your booking at <span className="font-bold">{booking.hotel}</span>?
            </p>

            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
              <h4 className="font-bold text-brand-navy mb-2 text-sm uppercase tracking-wider">Cancellation Policy</h4>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2 mb-4">
                <li>Cancellations made more than 48 hours before check-in are 100% free of charge.</li>
                <li>Cancellations made within 24 to 48 hours of check-in will incur a 20% cancellation fee.</li>
                <li>No-shows or cancellations within 24 hours are non-refundable.</li>
              </ul>
              
              <div className="mt-4 p-4 rounded-lg bg-white border border-gray-200">
                <p className="text-sm text-gray-500 font-medium mb-1">Estimated Cancellation Fee for this booking:</p>
                <p className={`text-lg font-bold ${hasCancellationFee ? 'text-red-500' : 'text-green-600'}`}>
                  {cancellationFeeAmount}
                </p>
                {hasCancellationFee && (
                  <p className="text-xs text-red-400 mt-1">Because you are cancelling within 48 hours of check-in.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Keep Booking
              </button>
              <button 
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Confirm Cancellation
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
