"use client";

import { motion } from "framer-motion";
import { Landmark, Cpu, Newspaper, Compass, Palmtree, TrendingUp } from "lucide-react";

export function TrustedBanner() {
  const logos = [
    { name: "Forbes", icon: Landmark, color: "text-blue-700" },
    { name: "TechCrunch", icon: Cpu, color: "text-emerald-500" },
    { name: "The Wall Street Journal", icon: Newspaper, color: "text-slate-900" },
    { name: "Condé Nast Traveler", icon: Compass, color: "text-indigo-600" },
    { name: "Travel + Leisure", icon: Palmtree, color: "text-amber-500" },
    { name: "Bloomberg", icon: TrendingUp, color: "text-blue-500" },
  ];

  // Duplicate the array to create a seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-10 bg-slate-50 border-y border-slate-100 overflow-hidden relative">
      {/* Fade edges for smooth enter/exit */}
      <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto max-w-7xl">
        <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
          Featured in top publications
        </p>
        
        {/* Infinite Carousel Container */}
        <div className="flex w-full overflow-hidden">
          <motion.div
            className="flex items-center gap-16 md:gap-24"
            animate={{ x: ["0%", "-33.333333%"] }}
            transition={{
              repeat: Infinity,
              duration: 30,
              ease: "linear",
            }}
            // We use -33.333333% because the array is duplicated 3 times.
            // This ensures exactly one full original set scrolls by before resetting seamlessly.
            style={{ width: "fit-content" }}
          >
            {duplicatedLogos.map((logo, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 shrink-0 opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 cursor-pointer hover:scale-105"
              >
                <logo.icon className={`w-8 h-8 ${logo.color}`} strokeWidth={1.5} />
                <span className={`text-xl md:text-2xl font-black font-heading tracking-tight ${logo.color}`}>
                  {logo.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
