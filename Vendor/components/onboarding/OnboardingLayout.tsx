"use client";

import { motion } from "framer-motion";
import { ProgressSidebar } from "./ProgressSidebar";
import Link from "next/link";
import Image from "next/image";

export function OnboardingLayout({ children, currentStep }: { children: React.ReactNode, currentStep: number }) {
  // Mobile Sticky Progress (0 to 100 based on steps 1-9)
  const progressPercent = Math.min((currentStep / 9) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FDFBF7] font-['Inter',_sans-serif]">
      
      {/* Mobile Header & Progress (Visible only on mobile/tablet) */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Image src="/racoonn-logo.png" alt="Racoonn" width={100} height={30} className="h-6 w-auto" />
          </Link>
          <span className="text-sm font-bold text-slate-500">Step {currentStep} of 9</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#E86A70]" 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ ease: "easeOut", duration: 0.5 }}
          />
        </div>
      </div>

      {/* Desktop Sidebar (30%) */}
      <div className="hidden lg:block w-[30%] min-w-[320px] max-w-[400px] border-r border-slate-200 bg-white shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-10 sticky top-0 h-screen">
        <ProgressSidebar currentStep={currentStep} />
      </div>

      {/* Main Content Area (70%) */}
      <div className="flex-1 w-full lg:w-[70%] min-h-screen flex flex-col relative overflow-hidden">
        {/* Subtle background gradients for premium feel */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[100px] pointer-events-none translate-y-1/3 -translate-x-1/3" />
        
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 lg:px-12 lg:py-16 relative z-10 flex flex-col">
          {children}
        </main>
      </div>

    </div>
  );
}
