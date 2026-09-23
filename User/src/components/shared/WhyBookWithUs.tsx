'use client';

import React from 'react';
import { CalendarCheck, BadgePercent, RefreshCw, Headset, Flame, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: CalendarCheck,
    title: 'Easy Booking',
    desc: 'We offer easy and convenient hotel bookings with attractive offers.',
    color: 'text-[#E86A6F]',
    bg: 'bg-[#E86A6F]/10'
  },
  {
    icon: BadgePercent,
    title: 'Lowest Price',
    desc: 'We ensure low rates on hotel reservations, holiday packages and tours.',
    color: 'text-[#E86A6F]',
    bg: 'bg-[#E86A6F]/10'
  },
  {
    icon: RefreshCw,
    title: 'Instant Refund',
    desc: 'Get instant refunds effortlessly on your travel bookings with us.',
    color: 'text-[#E86A6F]',
    bg: 'bg-[#E86A6F]/10'
  },
  {
    icon: Headset,
    title: '24/7 Support',
    desc: 'Get assistance 24/7 on any kind of travel related query. We are happy to assist you.',
    color: 'text-[#E86A6F]',
    bg: 'bg-[#E86A6F]/10'
  },
  {
    icon: Flame,
    title: 'Exciting Deals',
    desc: 'Enjoy exciting deals on hotels, resorts, car rentals and tour packages.',
    color: 'text-[#E86A6F]',
    bg: 'bg-[#E86A6F]/10'
  }
];

const reviews = [
  { title: "The price were better than...", body: "The price were better than other applications we have tried.", author: "Customer", time: "3 hours ago" },
  { title: "Best price deal", body: "Found the absolute best price deal here for our vacation.", author: "Customer", time: "3 hours ago" },
  { title: "Good experience", body: "Good experience overall. Easy to book and manage.", author: "Sunil Kumar", time: "9 hours ago" },
  { title: "The offers are good", body: "The offers are exceptionally good compared to competitors.", author: "Customer", time: "9 hours ago" },
  { title: "Great experience in booking", body: "Great experience in booking my stay for the weekend.", author: "Customer", time: "9 hours ago" },
  { title: "Highly recommended", body: "Customer support was amazing and very helpful.", author: "Priya Singh", time: "1 day ago" }
];

export default function WhyBookWithUs() {

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-navy">Why Book With Us?</h2>
        </div>

        {/* Features Row */}
        <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-12 md:divide-x divide-gray-100">
          {features.map((feature, idx) => (
            <div key={idx} className={`flex flex-row md:flex-col items-center md:items-center text-left md:text-center gap-4 md:gap-0 ${idx !== 0 ? 'md:pl-6 pt-4 md:pt-0 border-t border-gray-100 md:border-t-0' : ''}`}>
              <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center md:mb-4`}>
                <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-bold text-brand-navy mb-1 md:mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-[11px] md:text-xs leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Reviews Carousel */}
        <div className="relative group overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-16 before:bg-linear-to-r before:from-white before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-16 after:bg-linear-to-l after:from-white after:to-transparent">
          <motion.div 
            className="flex gap-4 pb-6 pt-2 w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          >
            {[...reviews, ...reviews].map((review, idx) => (
              <div 
                key={idx} 
                className="w-72 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col shrink-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-[#E86A6F] rounded-sm flex items-center justify-center">
                        <Star className="w-3.5 h-3.5 fill-white text-white" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500 ml-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                    Verified
                  </div>
                </div>
                
                <h4 className="font-bold text-brand-navy mb-2 line-clamp-1">{review.title}</h4>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{review.body}</p>
                
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-gray-700">{review.author}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
