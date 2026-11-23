"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Zap, BarChart3, ShieldCheck, Settings, ArrowRight, Headset, Wallet, Megaphone, Star, CalendarDays, PieChart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } },
};

const floatVariants: any = {
  float: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  floatReverse: {
    y: [0, 15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function HeroSection() {
  const [nights, setNights] = useState(18);
  const nightlyRate = 382.77; 
  const earnings = Math.round(nights * nightlyRate);

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-[#FDFBF7] font-['Poppins',_sans-serif]">
      {/* Decorative background shapes (static to prevent lag from huge blur animations) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#EAF2EE]/60 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      {/* Floating Animated Props */}
      <motion.div 
        variants={floatVariants}
        animate="float"
        className="absolute top-32 left-[10%] z-20 hidden lg:flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-50 text-[#EA6A6E]"
      >
        <Star className="w-5 h-5 fill-current" />
      </motion.div>
      <motion.div 
        variants={floatVariants}
        animate="floatReverse"
        className="absolute bottom-32 left-[45%] z-20 hidden xl:flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-50 text-[#202D42] -rotate-12"
      >
        <ShieldCheck className="w-6 h-6" />
      </motion.div>

      <div className="container relative z-10 mx-auto px-4 md:px-6 max-w-[1400px]">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8 xl:pr-10 z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              {/* Tagline */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white shadow-sm">
                <Zap className="w-4 h-4 text-[#202D42]" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-500 uppercase">
                  The all-in-one platform for hotel partners
                </span>
              </motion.div>
              
              {/* Headline */}
              <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-[70px] font-bold text-[#202D42] leading-[1.05] tracking-tight">
                Partner with <br className="hidden md:block"/>
                Raccoon Hotels. <br />
                <span className="text-[#EA6A6E] inline-block mt-1">Grow. Earn. Thrive.</span>
              </motion.h1>
              
              {/* Description */}
              <motion.p variants={itemVariants} className="text-lg text-[#5B6B63] leading-relaxed max-w-xl font-medium">
                Manage bookings, increase visibility, and maximize revenue with the tools and protection you need, all in one place.
              </motion.p>

              {/* 3 Columns Features */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 pt-4 max-w-xl">
                <motion.div whileHover={{ y: -5 }} className="space-y-2 cursor-default transition-transform flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-[#FCE9E9] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[#202D42]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#202D42]">More Bookings</h3>
                  <p className="text-xs text-slate-500 leading-snug">Reach millions of travelers worldwide</p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="space-y-2 cursor-default transition-transform flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-[#FCE9E9] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#202D42]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#202D42]">Secure & Protected</h3>
                  <p className="text-xs text-slate-500 leading-snug">$3M protection to keep you and your guests safe</p>
                </motion.div>
                <motion.div whileHover={{ y: -5 }} className="space-y-2 cursor-default transition-transform flex flex-col items-start">
                  <div className="w-10 h-10 rounded-full bg-[#FCE9E9] flex items-center justify-center">
                    <Settings className="w-5 h-5 text-[#202D42]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#202D42]">Smart & Simple</h3>
                  <p className="text-xs text-slate-500 leading-snug">Powerful tools to manage everything effortlessly</p>
                </motion.div>
              </motion.div>
              
              {/* CTA Area */}
              <motion.div variants={itemVariants} className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                  <Button className="bg-[#202D42] hover:bg-[#151E2D] text-white h-14 px-8 rounded-full text-base font-bold transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-[#202D42]/20">
                    Join Raccoon Hotels <ArrowRight className="w-4 h-4" />
                  </Button>
                </motion.div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold group cursor-default w-full sm:w-auto justify-center sm:justify-start">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                    <ShieldCheck className="w-5 h-5 text-[#EA6A6E]" />
                  </motion.div>
                  $3M Protection Included
                </div>
              </motion.div>
            </motion.div>
          </div>

        {/* Right Column: Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative lg:absolute lg:top-0 lg:right-0 lg:w-[55%] lg:h-full h-[400px] lg:min-h-[600px] mt-12 lg:mt-0"
          >
            {/* The curved background image (matches the wavy look) */}
            <div 
              className="absolute inset-0 bg-cover bg-center lg:rounded-bl-[200px] lg:rounded-tl-[80px] rounded-[40px] overflow-hidden shadow-2xl origin-bottom-right"
              style={{
                backgroundImage: "url('/raccoon_hero.png')",
                backgroundPosition: "center center"
              }}
            >
              {/* Overlay for better readability if needed */}
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
