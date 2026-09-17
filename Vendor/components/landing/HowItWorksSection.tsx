"use client";

import { motion } from "framer-motion";
import { UserPlus, Building2, CalendarCheck, DollarSign } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      title: "Create Account",
      desc: "Sign up in minutes. No credit card required to get started.",
      icon: UserPlus,
    },
    {
      num: "02",
      title: "Add Property",
      desc: "Upload photos, set prices, and list your rooms on our platform.",
      icon: Building2,
    },
    {
      num: "03",
      title: "Receive Bookings",
      desc: "Start getting reservations instantly from global travelers.",
      icon: CalendarCheck,
    },
    {
      num: "04",
      title: "Earn Revenue",
      desc: "Get paid securely and watch your hospitality business grow.",
      icon: DollarSign,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brand-navy relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Simple Process</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-black text-white leading-tight">
            How to get started
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-700/50" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 rounded-full bg-brand-navy border-4 border-slate-800 flex items-center justify-center relative z-10 mb-8 group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-xl">
                <step.icon className="w-8 h-8 text-primary" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {step.num}
                </div>
              </div>
              <h4 className="text-xl font-heading font-bold text-white mb-3">{step.title}</h4>
              <p className="text-slate-400">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
