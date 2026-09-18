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
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore(state => state.user);

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
        userName: user.name || 'Anonymous User',
        rating: rating,
        text: reviewText.trim(),
        category: 'general'
      });

      toast.success('Thank you for your review!');
      onClose();
      // Reset form
      setRating(0);
      setHoverRating(0);
      setReviewText('');
    } catch (error: unknown) {
      console.error('Failed to submit review:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-brand-navy">Leave a Review</DialogTitle>
          <DialogDescription>
            How was your stay at {booking?.hotel}?
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tap to Rate</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    size={36} 
                    className={`transition-colors ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-navy">Write your review</label>
            <textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-30 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || rating === 0 || reviewText.length < 10}
            className="bg-brand-coral hover:bg-brand-coral/90 text-white"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
