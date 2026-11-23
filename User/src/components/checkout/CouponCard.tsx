"use client";
import { Tag, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CouponCard() {
  const [code, setCode] = useState("SUMMER2026");
  const [applied, setApplied] = useState(true);

  const handleApply = () => {
    if (code.trim()) {
      setApplied(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#DCE8F5] p-6 md:p-8">
      <h2 className="text-xl font-poppins font-bold text-brand-navy mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-brand-coral" /> Have a Promo Code?
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Enter coupon code" 
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (applied) setApplied(false);
            }}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all uppercase font-medium placeholder:font-normal placeholder:normal-case" 
          />
        </div>
        <button 
          onClick={handleApply}
          disabled={!code.trim() || applied}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            applied 
              ? "bg-green-500 text-white cursor-default" 
              : "bg-brand-navy hover:bg-brand-navy/90 text-white"
          }`}
        >
          {applied ? "Applied" : "Apply"}
        </button>
      </div>

      <AnimatePresence>
        {applied && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-lg border border-green-200 bg-green-50 flex items-start gap-3"
          >
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm mb-0.5">'{code}' applied successfully!</p>
              <p className="text-green-700 text-xs">You saved ₹2,000 on your booking.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
