"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquareReply, AlertTriangle, Send } from "lucide-react";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const FILTERS = [
  "All", "View", "Hospitality", "Location", "Cleanliness", 
  "Amenities", "Indoor spaces", "Comfort", "Getting around", 
  "Family", "Condition", "Food"
];

const reviews: any[] = [];

export default function ReviewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

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
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={review.id}
            >
              <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-xl bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-secondary">
                        {review.guest.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-lg font-heading font-bold text-secondary">{review.guest}</h4>
                        <p className="text-xs text-slate-500">{review.property} • {review.date}</p>
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
                    <Sheet>
                      <SheetTrigger render={
                        <Button variant={review.replied ? "outline" : "default"} size="sm" className={`w-full sm:w-auto ${review.replied ? "text-slate-600" : "bg-primary hover:bg-primary/90 text-white"}`}>
                          <MessageSquareReply className="w-4 h-4 mr-2" />
                          {review.replied ? "Edit Reply" : "Reply to Review"}
                        </Button>
                      } />
                      <SheetContent className="w-full sm:max-w-xl p-0 bg-white border-l shadow-2xl flex flex-col h-full overflow-hidden">
                        <SheetHeader className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50 shrink-0">
                          <SheetTitle className="text-2xl font-heading font-black text-secondary">
                            Reply to {review.guest}
                          </SheetTitle>
                          <SheetDescription className="text-slate-500">
                            Your response will be public on your property listing.
                          </SheetDescription>
                        </SheetHeader>
                        
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                            <div className="flex gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                            <p className="text-sm text-slate-600 italic">"{review.text}"</p>
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-sm font-bold text-secondary uppercase tracking-wider">Your Reply</label>
                            <textarea 
                              className="w-full h-48 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none leading-relaxed"
                              placeholder="Write a professional and polite response..."
                              value={replyTexts[review.id] ?? (review.replied ? review.replyText : "")}
                              onChange={(e) => setReplyTexts({ ...replyTexts, [review.id]: e.target.value })}
                            ></textarea>
                            <p className="text-xs text-slate-400 text-right font-mono">
                              {((replyTexts[review.id] ?? (review.replied ? review.replyText : "")) || "").length} / 500
                            </p>
                          </div>
                        </div>

                        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0">
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold gap-2 text-base">
                            <Send className="w-5 h-5" />
                            Publish Reply
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                    
                    <Button variant="ghost" size="sm" className="w-full sm:w-auto text-slate-400 hover:text-amber-600">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="p-16 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-secondary">No reviews yet</h3>
              <p className="text-slate-500 mt-1 max-w-sm">When guests leave a review after their stay, you will be able to read and reply to them here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
