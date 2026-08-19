"use client";

import { motion } from "framer-motion";
import { Check, Clock, ShieldCheck, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, name: "Create Account" },
  { id: 2, name: "Verification" },
  { id: 3, name: "Business Details" },
  { id: 4, name: "Property Info" },
  { id: 5, name: "Room Setup" },
  { id: 6, name: "Media Upload" },
  { id: 7, name: "Amenities" },
  { id: 8, name: "Banking" },
  { id: 9, name: "Review" },
];

export function ProgressSidebar({ currentStep }: { currentStep: number }) {
  const progressPercent = Math.min((currentStep / 9) * 100, 100);

  return (
    <div className="h-full flex flex-col p-8">
      {/* Logo */}
      <Link href="/" className="mb-12 inline-block">
        <Image src="/racoonn-logo.png" alt="Racoonn" width={120} height={40} className="h-8 w-auto" />
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-black text-[#1F2E4A] mb-2 font-['Poppins',_sans-serif]">Registration</h2>
        <p className="text-sm text-slate-500 font-medium">Get ready to welcome guests from around the globe.</p>
      </div>

      {/* Progress Stats */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Progress</span>
          <span className="text-sm font-black text-[#E86A70]">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#E86A70] to-[#f48a8e]" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "easeOut", duration: 0.8 }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Estimated time: ~10 mins</span>
        </div>
      </div>

      {/* Step List */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors duration-300",
                  isCompleted ? "border-[#E86A70] bg-[#E86A70] text-white" : isActive ? "border-[#E86A70] text-[#E86A70]" : "border-slate-200 text-slate-400"
                )}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{step.id}</span>}
                </div>
                
                <div className={cn(
                  "w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl transition-all duration-300 ml-4 md:ml-0 shadow-[0_0_15px_rgba(0,0,0,0.02)]",
                  isActive ? "bg-white border border-[#E86A70]/20 scale-105" : "bg-transparent border border-transparent"
                )}>
                  <p className={cn(
                    "text-sm font-bold",
                    isCompleted ? "text-slate-700" : isActive ? "text-[#E86A70]" : "text-slate-400"
                  )}>{step.name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
        <ShieldCheck className="w-8 h-8 text-emerald-500" />
        <div>
          <p className="text-xs font-bold text-slate-700">Bank-level Security</p>
          <p className="text-[10px] font-medium text-slate-400">Your data is encrypted & secure</p>
        </div>
      </div>
    </div>
  );
}
