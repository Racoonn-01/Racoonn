"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, HeadphonesIcon, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function SetupSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const features = [
    {
      id: "onboarding",
      title: "1-on-1 Onboarding",
      description: "Get paired with a dedicated success manager who will walk you through your first listing, optimizing your pricing, and getting your first booking.",
      icon: Users,
      visual: (
        <div className="w-full h-full relative bg-gradient-to-br from-[#1A2639] to-[#111827] rounded-3xl p-8 overflow-hidden flex flex-col justify-center border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA6A6E]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border-2 border-[#EA6A6E] shadow-[0_0_15px_rgba(234,106,110,0.5)]">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop" className="w-full h-full object-cover rounded-full p-1" alt="Success Manager" />
            </div>
            <div>
              <p className="text-xs text-[#EA6A6E] font-bold mb-1 uppercase tracking-wider">Your Success Manager</p>
              <p className="text-lg font-black text-white">Sarah Jenkins</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">Online now</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "support",
      title: "Premium Support",
      description: "Skip the generic chatbots. Gain direct, 24/7 access to our specialized support team based globally to handle any guest issues immediately.",
      icon: HeadphonesIcon,
      visual: (
        <div className="w-full h-full relative bg-gradient-to-br from-[#1A2639] to-[#111827] rounded-3xl p-8 overflow-hidden flex flex-col justify-center border border-white/10 shadow-2xl">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#EA6A6E]/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
          <div className="relative z-10 space-y-4 max-w-sm mx-auto w-full">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/10 rounded-tl-none w-[85%] self-start flex gap-3">
               <div className="w-8 h-8 rounded-full bg-[#EA6A6E] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(234,106,110,0.4)]">
                  <HeadphonesIcon className="w-4 h-4 text-white" />
               </div>
               <p className="text-sm font-medium text-slate-200">Hi there! I see your guest is having trouble with the lock. I've just dispatched maintenance.</p>
            </div>
            <div className="bg-[#EA6A6E] p-4 rounded-2xl shadow-[0_0_20px_rgba(234,106,110,0.2)] rounded-tr-none w-[75%] ml-auto text-white">
               <p className="text-sm font-bold">Wow, that was incredibly fast. Thank you!</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "revenue",
      title: "Revenue Optimization",
      description: "Our proprietary AI doesn't just suggest prices; it actively monitors market demand in your area to maximize your yield dynamically.",
      icon: TrendingUp,
      visual: (
        <div className="w-full h-full relative bg-gradient-to-br from-[#1A2639] to-[#111827] rounded-3xl p-8 overflow-hidden flex flex-col justify-end border border-white/10 shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#EA6A6E]/15 rounded-full blur-3xl" />
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl w-full">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Pricing Adjustments</p>
                  <p className="text-3xl font-black text-white">+$1,240 <span className="text-sm font-medium text-emerald-400 ml-2">This week</span></p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#EA6A6E]/20 flex items-center justify-center border border-[#EA6A6E]/30">
                  <Zap className="w-6 h-6 text-[#EA6A6E]" />
                </div>
             </div>
             <div className="flex items-end gap-3 h-32">
                {[40, 65, 45, 80, 55, 90, 100].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring" }}
                    className={cn(
                      "flex-1 rounded-t-md",
                      i === 6 ? "bg-gradient-to-t from-[#EA6A6E] to-rose-400 shadow-[0_0_15px_rgba(234,106,110,0.5)]" : "bg-white/20"
                    )}
                  />
                ))}
             </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <section id="setup" className="py-32 bg-[#151E2D] relative overflow-hidden font-['Poppins',_sans-serif]">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute -left-[20%] top-[20%] w-[500px] h-[500px] bg-[#EA6A6E]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -right-[10%] bottom-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight"
          >
            The Racoonn <span className="text-[#EA6A6E]">Advantage</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl font-medium text-slate-400 mt-6 max-w-2xl mx-auto"
          >
            We don't just list your property; we partner with you to build a highly profitable hospitality business.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Side: Interactive Tabs */}
          <div className="flex flex-col gap-4">
            {features.map((feature, index) => {
              const isActive = activeIndex === index;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "text-left p-6 md:p-8 rounded-3xl transition-all duration-500 border relative overflow-hidden group",
                    isActive 
                      ? "bg-white/10 border-[#EA6A6E]/50 shadow-[0_0_30px_rgba(234,106,110,0.15)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  <div className="flex items-start gap-6 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                      isActive ? "bg-[#EA6A6E] shadow-[0_0_15px_rgba(234,106,110,0.4)]" : "bg-white/10 text-slate-400 group-hover:bg-white/20"
                    )}>
                      <feature.icon className={cn("w-7 h-7", isActive ? "text-white" : "text-slate-300")} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold mb-3 transition-colors duration-300",
                        isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                      )}>
                        {feature.title}
                      </h3>
                      <p className={cn(
                        "leading-relaxed transition-colors duration-300",
                        isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"
                      )}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Subtle active background glow */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabGlow"
                      className="absolute inset-0 bg-gradient-to-r from-[#EA6A6E]/10 to-transparent opacity-50 pointer-events-none"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Side: Dynamic Visuals */}
          <div className="h-[500px] lg:h-[600px] w-full rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/10 bg-[#0B1120]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0"
              >
                {features[activeIndex].visual}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
