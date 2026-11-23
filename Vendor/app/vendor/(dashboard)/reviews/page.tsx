"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquareReply, AlertTriangle, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const FILTERS = [
  "All", "View", "Hospitality", "Location", "Cleanliness", 
  "Amenities", "Indoor spaces", "Comfort", "Getting around", 
  "Family", "Condition", "Food"
];

interface Review {
  $id: string;
  propertyId: string;
  vendorId: string;
  userName: string;
  category: string;
  rating: number;
  text: string;
  vendorReply?: string;
  $createdAt: string;
  // Hydrated
  propertyName?: string;
}

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState("All");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState<Record<string, boolean>>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch reviews for vendor
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.reviewCollectionId,
        [
          Query.equal("vendorId", user!.$id),
          Query.orderDesc("$createdAt")
        ]
      );
      
      const fetchedReviews = response.documents as unknown as Review[];
      
      // 2. Hydrate property names
      const propertyMap: Record<string, string> = {};
      const hydrated = await Promise.all(fetchedReviews.map(async (review) => {
        if (!propertyMap[review.propertyId]) {
          try {
            const propDoc = await databases.getDocument(
              appwriteConfig.databaseId,
              appwriteConfig.propertyCollectionId,
              review.propertyId
            );
            propertyMap[review.propertyId] = propDoc.propertyName || propDoc.title || 'Unknown Property';
          } catch {
            propertyMap[review.propertyId] = 'Unknown Property';
          }
        }
        return {
          ...review,
          propertyName: propertyMap[review.propertyId]
        };
      }));
      
      setReviews(hydrated);
      
      // Initialize reply texts
      const initialReplies: Record<string, string> = {};
      hydrated.forEach(r => {
        if (r.vendorReply) {
          initialReplies[r.$id] = r.vendorReply;
        }
      });
      setReplyTexts(initialReplies);
      
    } catch (error) {
      console.error("Failed to fetch reviews", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      void fetchReviews();
    } else {
      setLoading(false);
    }
  }, [user, fetchReviews]);

  const handleReplySubmit = async (reviewId: string) => {
    const text = replyTexts[reviewId];
    if (!text || !text.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }
    
    setSubmittingReply(reviewId);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.reviewCollectionId,
        reviewId,
        {
          vendorReply: text.trim()
        }
      );
      toast.success("Reply submitted successfully");
      setSheetOpen(prev => ({...prev, [reviewId]: false}));
      await fetchReviews(); // Refresh
    } catch (error) {
      console.error("Failed to submit reply", error);
      toast.error("Failed to submit reply");
    } finally {
      setSubmittingReply(null);
    }
  };

  const filteredReviews = reviews.filter(review => 
    activeFilter === "All" ? true : (review.category || 'General') === activeFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Reviews</h2>
          <p className="text-slate-500 mt-1">Monitor guest feedback and respond to reviews.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {FILTERS.map(filter => (
          <Button 
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            className={`rounded-full shrink-0 ${activeFilter === filter ? 'bg-primary text-white hover:bg-primary/90' : 'text-slate-600 border-slate-200 hover:bg-slate-100'}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredReviews.length > 0 ? (
          filteredReviews.map((review, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={review.$id}
            >
              <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-secondary">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-heading font-bold text-secondary">{review.userName}</h4>
                        <p className="text-xs text-slate-500">
                          {review.propertyName} • {new Date(review.$createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-5 h-5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    &ldquo;{review.text}&rdquo;
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-slate-100">
                    <Sheet open={sheetOpen[review.$id]} onOpenChange={(open) => setSheetOpen(prev => ({...prev, [review.$id]: open}))}>
                      <SheetTrigger render={
                        <Button variant={review.vendorReply ? "outline" : "default"} size="sm" className={`w-full sm:w-auto ${review.vendorReply ? "text-slate-600" : "bg-primary hover:bg-primary/90 text-white"}`}>
                          <MessageSquareReply className="w-4 h-4 mr-2" />
                          {review.vendorReply ? "Edit Reply" : "Reply to Review"}
                        </Button>
                      } />
                      <SheetContent className="w-full sm:max-w-xl p-0 bg-white border-l shadow-2xl flex flex-col h-full overflow-hidden">
                        <SheetHeader className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                          <SheetTitle className="text-2xl font-heading font-black text-secondary">
                            Reply to {review.userName}
                          </SheetTitle>
                          <SheetDescription className="text-slate-500">
                            Your response will be public on your property listing.
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8 relative">
                            <div className="absolute -left-3 top-5 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-slate-50 border-b-8 border-b-transparent"></div>
                            <div className="absolute -left-3.25 top-5 w-0 h-0 border-t-8 border-t-transparent border-r-12 border-r-slate-100 border-b-8 border-b-transparent -z-10"></div>
                            <div className="flex gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-slate-700 italic">
                              &ldquo;{review.text}&rdquo;
                            </p>
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-semibold text-secondary">Your Response</label>
                            <Textarea 
                              className="min-h-50 resize-none text-base p-4"
                              placeholder="Thank the guest for their feedback..."
                              value={replyTexts[review.$id] || ""}
                              onChange={(e) => setReplyTexts(prev => ({...prev, [review.$id]: e.target.value}))}
                            />
                            
                            <div className="bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100/50">
                              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                              <div className="text-sm text-amber-800">
                                <p className="font-semibold mb-1">Professional Guidelines</p>
                                <ul className="list-disc pl-4 space-y-1 opacity-90">
                                  <li>Always remain professional and polite</li>
                                  <li>Address specific points mentioned in the review</li>
                                  <li>Avoid defensive language</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-white" 
                            size="lg"
                            onClick={() => handleReplySubmit(review.$id)}
                            disabled={submittingReply === review.$id}
                          >
                            {submittingReply === review.$id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4 mr-2" />
                            )}
                            {submittingReply === review.$id ? "Publishing..." : "Publish Reply"}
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <MessageSquareReply className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary mb-1">No reviews yet</h3>
            <p className="text-slate-500">When guests leave reviews, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
