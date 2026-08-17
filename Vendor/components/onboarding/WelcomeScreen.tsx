"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe2, ShieldCheck, Headphones, Zap, ArrowRight } from "lucide-react";
import Image from "next/image";

export function WelcomeScreen({ onNext }: { onNext: () => void }) {
  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.7, delay: i * 0.1, ease: [0.25, 0.4, 0.1, 1] }
    })
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex overflow-hidden">
      {/* Left Column: Content */}
      <div className="w-full lg:w-[55%] flex flex-col relative z-10 overflow-y-auto">
        {/* Top Navbar */}
        <div className="px-6 md:px-12 py-8 flex items-center w-full shrink-0">
          <Image src="/racoonn-logo-text.png" alt="Racoonn" width={140} height={40} className="h-8 md:h-10 w-auto" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-3xl mx-auto w-full py-12">
          <motion.div 
            custom={0} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-100 mb-8 w-fit shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-600 tracking-wider uppercase">Partner Program Application</span>
          </motion.div>
          
          <motion.h1 
            custom={1} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-black text-slate-900 leading-[1.1] tracking-tight mb-6 font-heading"
          >
            Grow your hospitality <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-500 to-orange-400">business</span> globally.
          </motion.h1>
          
          <motion.p 
            custom={2} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-xl"
          >
            Join Racoonn&apos;s premium network. Reach millions of travelers, manage bookings effortlessly, and maximize your revenue without the hassle.
          </motion.p>
          
          <motion.div 
            custom={3} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="flex flex-col sm:flex-row gap-5 items-center mb-14"
          >
            <Button onClick={onNext} className="h-16 px-10 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300">
              Start Registration <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="text-sm text-slate-500 font-medium px-2 text-center sm:text-left">Takes only 5 minutes</p>
          </motion.div>

          <motion.div 
            custom={4} initial="hidden" animate="visible" variants={fadeUpVariants}
            className="flex items-center gap-6 pt-8 border-t border-slate-100"
          >
            <div className="flex -space-x-3 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/100?img=1" className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover" alt="Partner" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/100?img=2" className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover" alt="Partner" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://i.pravatar.cc/100?img=3" className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover" alt="Partner" />
              <div className="w-12 h-12 rounded-full border-4 border-white shadow-sm bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 z-10">+2k</div>
            </div>
            <div className="text-sm font-medium text-slate-600">
              Join <span className="font-bold text-slate-900">2,000+ properties</span> already earning with Racoonn.
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Column: Visuals */}
      <div className="hidden lg:flex w-[45%] relative bg-slate-900 overflow-hidden items-center justify-center p-12 lg:p-16">
        <Image 
          src="/raccoon_hero.png" 
          alt="Luxury Resort" 
          fill
          className="object-cover opacity-60 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        {/* Glassmorphism Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.1, 1] }}
          className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/10 rounded-4xl p-10 shadow-2xl shadow-black/50"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-heading font-bold text-white">Why Racoonn?</h3>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md shadow-inner border border-white/5">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="space-y-8">
            {[
              { icon: Globe2, title: "10,000+ Travelers", desc: "Access a massive global audience.", color: "text-blue-300", bg: "bg-blue-500/20" },
              { icon: ShieldCheck, title: "Secure Payouts", desc: "Automated, on-time bank transfers.", color: "text-emerald-300", bg: "bg-emerald-500/20" },
              { icon: Headphones, title: "Dedicated Support", desc: "24/7 priority partner assistance.", color: "text-rose-300", bg: "bg-rose-500/20" },
              { icon: Zap, title: "Fast Onboarding", desc: "List your property in under 10 minutes.", color: "text-amber-300", bg: "bg-amber-500/20" },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner ${feature.bg}`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <div className="pt-1">
                  <h4 className="text-white font-semibold text-lg mb-1 tracking-tight">{feature.title}</h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
