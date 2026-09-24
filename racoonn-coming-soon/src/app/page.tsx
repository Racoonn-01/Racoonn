"use client";

import Image from 'next/image';
import { ArrowRight, Building, Compass, MapPin, Mountain, Tent } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center items-center p-6 relative overflow-hidden text-brand-navy font-sans">
      {/* Animated Background Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-150 h-150 bg-brand-coral/15 rounded-full blur-[100px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.8, 0.5],
          x: [0, -50, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-brand-sky/40 rounded-full blur-[100px] pointer-events-none" 
      />

      {/* Floating Animated Icons */}
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20%] left-[15%] text-brand-coral/20 pointer-events-none hidden md:block"
      >
        <Compass className="w-16 h-16" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[25%] left-[20%] text-brand-navy/10 pointer-events-none hidden md:block"
      >
        <Mountain className="w-24 h-24" />
      </motion.div>
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[30%] right-[15%] text-brand-coral/20 pointer-events-none hidden md:block"
      >
        <MapPin className="w-12 h-12" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-[20%] right-[20%] text-brand-navy/10 pointer-events-none hidden md:block"
      >
        <Tent className="w-16 h-16" />
      </motion.div>
      
      <div className="max-w-5xl w-full text-center z-10 space-y-8 relative mt-16 md:mt-0">
        
        {/* Centered Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
           <Image 
             src="/horizontal-logo.png" 
             alt="Racoonn Logo" 
             width={200} 
             height={67} 
             className="w-48 md:w-56 h-auto mix-blend-multiply drop-shadow-sm" 
           />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-heading font-black tracking-tighter leading-none mb-6 flex flex-col sm:flex-row items-center justify-center gap-y-2 sm:gap-x-[0.25em]">
            <span className="text-transparent bg-clip-text bg-linear-to-br from-brand-navy via-brand-navy to-brand-navy/70 pb-4">Coming</span>
            <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-coral to-[#FF8A90] relative inline-block">
              Soon
              <motion.svg 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
                className="absolute w-full h-4 md:h-6 -bottom-2 md:-bottom-4 left-0 text-brand-coral/30" viewBox="0 0 100 10" preserveAspectRatio="none"
              >
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </motion.svg>
            </span>
          </h1>
        </motion.div>
        


        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex justify-center"
        >
          <a href="https://partner.racoonn.com" className="relative group inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-coral rounded-2xl blur-lg opacity-30 group-hover:opacity-60 group-hover:blur-xl transition-all duration-500" />
            <div className="relative flex items-center gap-3 px-8 py-5 md:px-10 md:py-6 rounded-2xl bg-linear-to-br from-brand-coral to-[#E05259] text-white font-bold text-lg md:text-xl border border-brand-coral/20 shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <Building className="w-6 h-6" />
              <span>List Your Property</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-300" />
            </div>
          </a>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-6 md:bottom-8 text-center text-xs md:text-sm font-medium text-brand-charcoal/40 w-full z-10 px-6 tracking-wide flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2"
      >
        <span>&copy; {new Date().getFullYear()} Racoonn. All rights reserved.</span>
        <span className="hidden md:inline">|</span>
        <span>
          Design & Developed By <a href="https://preettech.com" target="_blank" rel="noopener noreferrer" className="text-brand-coral hover:text-[#E05259] transition-colors hover:underline font-bold">Preet Tech</a>
        </span>
      </motion.div>
    </main>
  );
}
