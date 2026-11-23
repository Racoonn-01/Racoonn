"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Clock, Sparkles } from "lucide-react";
import { databases, appwriteConfig } from "@/lib/appwrite/config";
import { Query } from "appwrite";
import { usePathname } from "next/navigation";

interface Promotion {
  $id: string;
  name: string;
  code: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  status: string;
  validUntil: string;
  image?: string;
  campaignName?: string;
}

export default function PromoPopup() {
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    async function checkPromotions() {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.promotionsCollectionId,
          [
            Query.equal("status", "Active"),
            Query.orderDesc("$createdAt"),
            Query.limit(1)
          ]
        );

        if (res.documents.length > 0) {
          const activePromo = res.documents[0] as unknown as Promotion;
          
          // Check if valid
          if (activePromo.validUntil) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const validDate = new Date(activePromo.validUntil);
            if (validDate < today) return; // expired
          }

          // Show if not expired
          setPromo(activePromo);
          // Delay appearance slightly for better UX
          setTimeout(() => setIsVisible(true), 1500);
        }
      } catch (error) {
        console.log("Failed to fetch promotions or collection not available", error);
      }
    }
    checkPromotions();
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const copyCode = () => {
    if (promo) {
      navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!promo) return null;

  const discountText = 
    promo.discountType === "percentage" ? `${promo.discountValue}% OFF` : 
    promo.discountType === "flat" ? `₹${promo.discountValue} FLAT OFF` : `₹${promo.discountValue} FLAT OFF`;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-md relative bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -ml-10 -mb-10" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-50 shadow-sm"
              aria-label="Close promotion"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              {promo.image && (
                <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex items-center justify-center bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={promo.image} alt={promo.name} className="w-full h-auto object-contain" />
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-coral flex items-center justify-center shadow-lg shadow-brand-coral/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight">
                    {promo.campaignName || promo.name} <span className="text-brand-coral">Offer</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    Exclusive Deal
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center mb-5">
                <p className="text-4xl font-black text-brand-navy mb-1">{discountText}</p>
                {promo.minOrderValue > 0 && (
                  <p className="text-sm text-slate-500 font-medium">
                    On bookings above ₹{promo.minOrderValue}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl border border-slate-100 p-2 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Code</span>
                  <span className="font-mono font-bold text-slate-900 tracking-wider text-lg">{promo.code}</span>
                </div>
                <button
                  onClick={copyCode}
                  className={`h-12 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
                    copied 
                      ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                      : "bg-brand-navy hover:bg-slate-800 text-white shadow-brand-navy/20"
                  }`}
                >
                  {copied ? (
                    <><Check className="w-4 h-4" /> Copied</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy</>
                  )}
                </button>
              </div>

              {promo.validUntil && (
                <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500 font-medium">
                  <Clock className="w-4 h-4" />
                  Valid until {new Date(promo.validUntil).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
