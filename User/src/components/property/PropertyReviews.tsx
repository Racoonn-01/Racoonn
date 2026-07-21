'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageCircle } from 'lucide-react';
import { getReviews, createReview } from '@/lib/appwrite/api';
import { Models } from 'appwrite';

const ALL_FILTERS = [
  'All',
  'View',
  'Hospitality',
  'Location',
  'Cleanliness',
  'Amenities',
  'Indoor spaces',
  'Comfort',
  'Getting around',
  'Family',
  'Condition',
  'Food'
];

interface ReviewDocument extends Models.Document {
  userName: string;
  category?: string;
  rating: number;
  text: string;
  vendorReply?: string;
  avatarUrl?: string;
}

interface Review {
  $id: string;
  userName: string;
  date: string;
  category: string;
  rating: number;
  text: string;
  vendorReply?: string;
  vendorReplyDate?: string;
  avatarUrl?: string;
  $createdAt: string;
}

export default function PropertyReviews({ propertyId, vendorId }: { propertyId?: string, vendorId?: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Write Review State
  const [newRating, setNewRating] = useState(0);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewCategory, setNewReviewCategory] = useState('View');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
    setLoading(true);
    try {
      const docs = await getReviews(propertyId!);
      const mapped = docs.map((d: unknown) => {
        const doc = d as ReviewDocument;
        return {
          $id: doc.$id,
          userName: doc.userName,
          date: new Date(doc.$createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }),
          category: doc.category || 'General',
          rating: doc.rating,
          text: doc.text,
          avatarUrl: doc.avatarUrl,
          vendorReply: doc.vendorReply,
          vendorReplyDate: doc.$updatedAt ? new Date(doc.$updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : undefined,
          $createdAt: doc.$createdAt,
        };
      });
      setReviews(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadReviews();
    }
  }, [propertyId, loadReviews]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#reviews-open') {
        setIsModalOpen(true);
        // Clear hash so it can be re-triggered without a full reload
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSubmitReview = async () => {
    if (!newReviewName || !newReviewText || newRating === 0) return;
    setIsSubmitting(true);
    try {
      await createReview({
        propertyId: propertyId!,
        vendorId: vendorId || '',
        userName: newReviewName,
        category: newReviewCategory,
        rating: newRating,
        text: newReviewText,
      });
      // Refresh reviews
      await loadReviews();
      setIsWriteModalOpen(false);
      setNewRating(0);
      setNewReviewText('');
      setNewReviewName('');
      setNewReviewCategory('View');
    } catch (err) {
      console.error("Failed to submit review", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(review => 
    activeFilter === 'All' ? true : review.category === activeFilter
  );

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(2)
    : '0.00';

  if (loading && reviews.length === 0) {
    return <div className="py-12 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-brand-coral border-t-transparent animate-spin" /></div>;
  }

  return (
    <>
      <div id="reviews" className="scroll-mt-24 border-t border-gray-200 pt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-[24px] font-semibold text-brand-navy flex items-center gap-2">
            Rating and reviews <span className="bg-brand-navy text-white text-sm px-2.5 py-1 rounded-full ml-1">{reviews.length}</span>
          </h2>
          <button 
            onClick={() => setIsWriteModalOpen(true)}
            className="px-6 py-2.5 bg-brand-coral text-white rounded-xl font-semibold text-[15px] hover:bg-[#d95d62] transition-colors"
          >
            Write a review
          </button>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar mb-8 pb-2">
          {ALL_FILTERS.map((filter, index) => (
            <button 
              key={index}
              onClick={() => {
                setActiveFilter(filter);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-full border border-gray-300 text-[14px] font-medium text-gray-700 whitespace-nowrap hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              {filter}
            </button>
          ))}
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-gray-500 py-8 text-center bg-gray-50 rounded-2xl">
            No reviews yet. Be the first to review this property!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {reviews.slice(0, 2).map((review) => (
              <div key={review.$id} className="bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 relative">
                    {review.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={review.avatarUrl} alt={review.userName} className="w-full h-full object-cover" />
                    ) : (
                      review.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#222]">{review.userName}</h4>
                    <p className="text-[13px] text-gray-500">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, index) => (
                    <Star 
                      key={index} 
                      size={14} 
                      className={`${index < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-[15px] text-gray-700 font-light leading-[1.6]">
                  {review.text}
                </p>
                {review.vendorReply && (
                  <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 flex gap-3">
                    <MessageCircle className="text-brand-coral shrink-0 mt-1" size={18} />
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[13px] font-semibold text-brand-navy">Response from Host</p>
                        {review.vendorReplyDate && (
                          <p className="text-[12px] text-gray-500">{review.vendorReplyDate}</p>
                        )}
                      </div>
                      <p className="text-[14px] text-gray-600 font-light leading-relaxed">{review.vendorReply}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {reviews.length > 0 && (
          <button 
            onClick={() => {
              setActiveFilter('All');
              setIsModalOpen(true);
            }}
            className="mt-8 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-[15px] hover:bg-gray-50 transition-colors"
          >
            Read all {reviews.length} reviews
          </button>
        )}
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {ALL_FILTERS.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeFilter === category 
                        ? 'bg-brand-navy text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="w-10 h-10" /> {/* Spacer for centering */}
            </div>

            {/* Modal Content */}
            <div className="max-w-250 mx-auto px-6 py-8">
              <div className="flex items-center gap-2 mb-8">
                <Star className="fill-current text-amber-400" size={28} />
                <h2 className="text-[28px] font-bold text-brand-navy">
                  {averageRating} · {reviews.length} reviews
                </h2>
              </div>
              
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        key={review.$id}
                        className="bg-gray-50 p-6 rounded-2xl h-fit"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 relative">
                            {review.avatarUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={review.avatarUrl} alt={review.userName} className="w-full h-full object-cover" />
                            ) : (
                              review.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#222]">{review.userName}</h4>
                            <p className="text-[13px] text-gray-500">{review.date} • {review.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5 mb-3">
                          {[...Array(5)].map((_, index) => (
                            <Star 
                              key={index} 
                              size={14} 
                              className={`${index < (review.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-[15px] text-gray-700 font-light leading-[1.6]">
                          {review.text}
                        </p>
                        {review.vendorReply && (
                          <div className="mt-4 bg-white p-4 rounded-xl border border-gray-100 flex gap-3">
                              <MessageCircle className="text-brand-coral shrink-0 mt-1" size={18} />
                              <div className="w-full">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-[13px] font-semibold text-brand-navy">Response from Host</p>
                                  {review.vendorReplyDate && (
                                    <p className="text-[12px] text-gray-500">{review.vendorReplyDate}</p>
                                  )}
                                </div>
                                <p className="text-[14px] text-gray-600 font-light leading-relaxed">{review.vendorReply}</p>
                              </div>
                            </div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="col-span-1 md:col-span-2 text-center py-12 text-gray-500"
                    >
                      No reviews found for this category yet.
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isWriteModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center">
              <button 
                onClick={() => setIsWriteModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mr-4"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-w-150 mx-auto px-6 py-10">
              <h2 className="text-[32px] font-bold text-brand-navy mb-10">
                Write a review
              </h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Your Name</h3>
                  <input 
                    type="text"
                    value={newReviewName}
                    onChange={(e) => setNewReviewName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none"
                  />
                </div>
                
                <div>
                  <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Overall rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star 
                          size={40} 
                          className={`${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[18px] font-semibold text-brand-navy mb-4">What aspect are you reviewing?</h3>
                  <select 
                    value={newReviewCategory}
                    onChange={(e) => setNewReviewCategory(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none bg-white appearance-none"
                  >
                    {ALL_FILTERS.filter(f => f !== 'All').map(filter => (
                      <option key={filter} value={filter}>{filter}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Your review</h3>
                  <textarea 
                    rows={6}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
                  <button 
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-6 py-3 font-semibold text-[15px] hover:underline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmitReview}
                    className={`px-8 py-3 rounded-xl font-semibold text-[15px] transition-colors flex items-center gap-2 ${
                      newRating > 0 && newReviewText.length > 0 && newReviewName.length > 0
                        ? 'bg-brand-coral text-white hover:bg-[#d95d62]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={newRating === 0 || newReviewText.length === 0 || newReviewName.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
