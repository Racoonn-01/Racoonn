"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Copy, Check, Clock, Zap } from "lucide-react";

interface VendorPromo {
  code: string;
  discountType: "percentage" | "flat" | "stay_x_pay_y";
  discountValue: number;
  status: string;
  bookingStartDate: string;
  bookingEndDate: string;
  propertyId: string;
  propertyName: string;
  roomId: string;
  roomName: string;
  vendorId?: string;
}

interface VendorPromoPopupProps {
  propertyId: string;
  vendorId?: string;
}

export default function VendorPromoPopup({ propertyId, vendorId }: VendorPromoPopupProps) {
  const [promo, setPromo] = useState<VendorPromo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function checkVendorPromotions() {
      if (typeof document === "undefined") return;

      const cookies = document.cookie.split(';');
      let matchedPromo: VendorPromo | null = null;

      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        if (eqPos === -1) continue;
        const name = cookie.slice(0, eqPos).trim();
        const value = cookie.slice(eqPos + 1).trim();

        if (name.startsWith('racoonn_vendor_offer_') || name.startsWith('racoonn_coupon_')) {
          try {
            const parsed: VendorPromo = JSON.parse(decodeURIComponent(value));
            
            // Validate status
            if (parsed.status !== "active") continue;
            
            // Validate date
            const today = new Date().toISOString().split('T')[0];
            if (parsed.bookingEndDate && parsed.bookingEndDate < today) continue;
            if (parsed.bookingStartDate && parsed.bookingStartDate > today) continue;

            // Validate property/vendor linkage
            // Offer matches if it's explicitly for this property
            // OR if it's for 'all' properties BUT the vendor matches this property's vendor
            // (For testing purposes, we also allow 'all' offers to show on mock properties)
            const isMockProperty = ["1", "2", "3", "4", "prop-default-1"].includes(propertyId);
            
            // Normalize mock property IDs from vendor portal to match user portal
            const normalizedParsedId = parsed.propertyId === "prop-default-1" ? "1" : parsed.propertyId;
            const normalizedPropertyId = propertyId === "prop-default-1" ? "1" : propertyId;

            if (
              normalizedParsedId === normalizedPropertyId || 
              (normalizedParsedId === "all" && (parsed.vendorId === vendorId || isMockProperty))
            ) {
              matchedPromo = parsed;
              break; // Stop at first valid match
            }
          } catch (e) {
            console.warn("Failed to parse coupon cookie", e);
          }
        }
      }

      if (matchedPromo) {
        setPromo(matchedPromo);
        setTimeout(() => setIsVisible(true), 1500);
      }
    }

    checkVendorPromotions();
  }, [propertyId, vendorId]);

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
    promo.discountType === "flat" ? `₹${promo.discountValue} FLAT OFF` : 
    "STAY & SAVE";

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
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-50 shadow-sm"
              aria-label="Close promotion"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight flex items-center gap-1.5 text-lg">
                    Special Property Offer <Zap className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                    {promo.roomName !== 'all' ? `For ${promo.roomName}` : 'For all rooms'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center mb-5">
                <p className="text-4xl font-black text-brand-navy mb-1">{discountText}</p>
                {promo.propertyName && (
                  <p className="text-sm text-slate-500 font-medium">
                    Applicable at {promo.propertyName}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 bg-slate-50 rounded-2xl border border-slate-100 p-2 pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">{promo.code ? "Code" : "Auto"}</span>
                  <span className="font-mono font-bold text-slate-900 tracking-wider text-lg">{promo.code || "APPLIED"}</span>
                </div>
                {promo.code ? (
                  <button
                    onClick={copyCode}
                    className={`h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md ${
                      copied 
                        ? "bg-emerald-500 text-white shadow-emerald-500/20" 
                        : "bg-brand-navy hover:bg-[#151E2D] text-white shadow-brand-navy/20"
                    }`}
                  >
                    {copied ? (
                      <><Check className="w-4 h-4" /> Copied</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Copy</>
                    )}
                  </button>
                ) : (
                  <div className="h-11 px-6 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md bg-emerald-500 text-white shadow-emerald-500/20">
                    <Check className="w-4 h-4" /> Active
                  </div>
                )}
              </div>

              {promo.bookingEndDate && (
                <div className="mt-5 flex items-center justify-center gap-1.5 text-sm text-slate-500 font-medium">
                  <Clock className="w-4 h-4" />
                  Valid until {new Date(promo.bookingEndDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
