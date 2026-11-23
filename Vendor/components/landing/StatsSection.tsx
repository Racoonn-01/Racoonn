"use client";

import { motion } from "framer-motion";
import { Users, Building, Globe, Star } from "lucide-react";

export function TrustedBySection() {
  return (
    <div className="py-12 bg-white border-b border-slate-100">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
          Trusted by Hospitality Businesses Worldwide
        </p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Mock Logos - In reality these would be SVG imports */}
          <div className="text-2xl font-black font-heading tracking-tighter text-secondary">HILTON</div>
          <div className="text-2xl font-black font-heading tracking-tighter text-secondary">MARRIOTT</div>
          <div className="text-2xl font-black font-heading tracking-tighter text-secondary">HYATT</div>
          <div className="text-2xl font-black font-heading tracking-tighter text-secondary">FOUR SEASONS</div>
          <div className="text-2xl font-black font-heading tracking-tighter text-secondary hidden sm:block">WYNDHAM</div>
        </div>
      </div>
    </div>
  );
}

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "50,000+",
      label: "Monthly Travelers",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Building,
      value: "10,000+",
      label: "Properties Listed",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: Globe,
      value: "100+",
      label: "Destinations",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Star,
      value: "95%",
      label: "Partner Satisfaction",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-slate-50 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <h3 className="text-4xl md:text-5xl font-heading font-black text-secondary mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-slate-500 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
