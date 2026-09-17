"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Clock, Building2, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function ApprovalPending() {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFBF7] flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-8 font-['Inter',_sans-serif]">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-coral/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />
      
      {/* Top Logo */}
      <div className="absolute top-8 left-8">
        <Image src="/racoonn-logo.png" alt="Racoonn" width={120} height={30} className="h-8 w-auto" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full text-center relative z-10"
      >
        {/* Success Icon Animation */}
        <motion.div variants={itemVariants} className="mb-8 relative inline-block">
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: [0, 1.2, 1] }} 
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.2)]"
          >
            <Check className="w-16 h-16 text-emerald-500 stroke-[3]" />
          </motion.div>
          
          {/* Confetti / Sparkles */}
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 180 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="absolute -top-4 -right-4 w-8 h-8 text-amber-400"
          >
            <Rocket className="w-full h-full" />
          </motion.div>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-black text-brand-navy mb-4 font-['Poppins',_sans-serif]">
          Property Submitted!
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-xl text-slate-500 font-medium mb-12 max-w-lg mx-auto">
          Our team is reviewing your property details. You'll be ready to accept bookings in no time.
        </motion.p>
        
        {/* Timeline Status */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-left mb-12 max-w-md mx-auto">
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-slate-200 before:to-transparent">
            
            <div className="relative flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center z-10 shrink-0 shadow-md shadow-emerald-500/20">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Application Submitted</h4>
                <p className="text-xs text-slate-500 font-medium">Today at 10:42 AM</p>
              </div>
            </div>

            <div className="relative flex items-center gap-6">
              <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-500 flex items-center justify-center z-10 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-brand-coral">Under Review</h4>
                <p className="text-xs text-slate-500 font-medium">Estimated time: 24-48 hours</p>
              </div>
            </div>

            <div className="relative flex items-center gap-6 opacity-40">
              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center z-10 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Ready for Bookings</h4>
                <p className="text-xs text-slate-500 font-medium">Pending approval</p>
              </div>
            </div>
            
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Link href="/vendor/dashboard">
            <Button className="h-14 px-10 bg-brand-navy hover:bg-[#151E2D] text-white rounded-full text-lg font-bold shadow-[0_0_30px_rgba(31,46,74,0.2)] hover:scale-105 transition-all">
              Go To Dashboard
            </Button>
          </Link>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
