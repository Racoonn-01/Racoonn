'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createReview, getProperty } from '@/lib/appwrite/api';
import { useAuthStore } from '@/store/authStore';
import { UIBooking } from './BookingsSection';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: UIBooking | null;
}

export default function LeaveReviewModal({ isOpen, onClose, booking }: LeaveReviewModalProps) {
  const user = useAuthStore(state => state.user);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState(user?.name || '');
  const [aspect, setAspect] = useState('Overall Stay');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!booking || !user) return;
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (reviewText.trim().length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    try {
      // We need vendorId, which we can get by fetching the property
      const property = await getProperty(booking.hotelId);
      const vendorId = property ? property.vendorId : 'unknown';

      await createReview({
        propertyId: booking.hotelId,
        vendorId: vendorId,
        userName: userName.trim() || 'Anonymous User',
        rating: rating,
        text: reviewText.trim(),
        category: aspect
      });

      toast.success('Thank you for your review!');
      onClose();
      // Reset form
      setRating(0);
      setHoverRating(0);
      setReviewText('');
      setAspect('Overall Stay');
    } catch (error: unknown) {
      console.error('Failed to submit review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-6 sm:p-8 bg-white border-0 shadow-2xl rounded-3xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-heading font-bold text-brand-navy">Leave a Review</DialogTitle>
          <DialogDescription className="text-gray-500 text-sm mt-1">
            How was your stay at <span className="font-bold text-brand-navy">{booking?.hotel}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 bg-white">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-colors focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/20 outline-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    size={32} 
                    className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-brand-coral text-brand-coral' : 'fill-gray-100 text-gray-200'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">What aspect are you reviewing?</label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
              className="flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-colors focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/20 outline-none appearance-none cursor-pointer"
            >
              <option value="Overall Stay">Overall Stay</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Service">Service</option>
              <option value="Location">Location</option>
              <option value="Facilities">Facilities</option>
              <option value="Value for Money">Value for Money</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Review</label>
            <textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
              className="flex w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm transition-colors focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/20 outline-none min-h-28 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 gap-3 flex-col sm:flex-row">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting} className="rounded-xl border-gray-200 hover:bg-gray-100 font-bold h-11 w-full sm:w-auto">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0 || reviewText.length < 10}
            className="bg-brand-coral hover:bg-brand-coral/90 text-white rounded-xl font-bold h-11 w-full sm:w-auto"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
