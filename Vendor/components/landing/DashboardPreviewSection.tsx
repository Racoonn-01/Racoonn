"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function DashboardPreviewSection() {
  const benefits = [
    "Dynamic Pricing",
    "Occupancy Insights",
    "Revenue Reports",
    "Performance Analytics",
    "Smart Recommendations"
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Abstract representation of a revenue chart */}
            <div className="aspect-square md:aspect-[4/3] rounded-3xl bg-slate-50 border border-slate-100 shadow-2xl overflow-hidden relative flex flex-col p-8">
              <h4 className="text-xl font-heading font-bold text-secondary mb-8">Revenue Growth Analytics</h4>
              <div className="flex-1 flex items-end gap-4 h-full">
                {[40, 70, 45, 90, 65, 100].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1), ease: "easeOut" }}
                    className="flex-1 bg-gradient-to-t from-brand-coral/80 to-brand-coral rounded-t-md relative group cursor-pointer"
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-brand-navy text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      ${h * 120}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Decorative background blobs */}
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Maximize Profits</h2>
              <h3 className="text-3xl md:text-5xl font-heading font-black text-secondary leading-tight">
                Data-driven tools to skyrocket your revenue
              </h3>
            </div>
            
            <p className="text-lg text-slate-500 leading-relaxed">
              Our intelligent dashboard provides you with actionable insights, allowing you to optimize pricing, forecast occupancy, and out-perform the competition in your local market.
            </p>
            
            <div className="space-y-4 pt-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-4 shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-lg font-semibold text-secondary">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Button className="h-14 px-8 text-base bg-primary hover:bg-primary/90 text-white font-bold rounded-full">
                Start Growing Today
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
