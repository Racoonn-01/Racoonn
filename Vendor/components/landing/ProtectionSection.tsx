"use client";

import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Banknote, HeartHandshake, PhoneCall } from "lucide-react";

export function ProtectionSection() {
  const protections = [
    { 
      icon: UserCheck, 
      title: "Identity Verification", 
      desc: "Every guest is strictly verified using government IDs before they can book." 
    },
    { 
      icon: Banknote, 
      title: "$3M Damage Protection", 
      desc: "Comprehensive coverage for your property and belongings against accidental damage." 
    },
    { 
      icon: HeartHandshake, 
      title: "$1M Liability Insurance", 
      desc: "Protection against third-party bodily injury or property damage claims." 
    },
    { 
      icon: PhoneCall, 
      title: "24/7 Safety Line", 
      desc: "Immediate access to dedicated safety agents around the clock, anywhere in the world." 
    },
  ];

  return (
    <section id="protection" className="py-24 bg-secondary relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DCE8F5]/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* Left Text & Large Shield */}
          <div className="lg:w-5/12 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm relative"
            >
              <div className="absolute inset-0 bg-brand-coral/20 rounded-3xl blur-md" />
              <ShieldCheck className="w-10 h-10 text-brand-coral relative z-10" strokeWidth={2} />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
            >
              Absolute <br/>
              <span className="text-brand-coral">peace of mind.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl font-medium text-[#DCE8F5]/80 mt-6 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              We know your property is your most valuable asset. That's why we've built Racoonn Shield—included automatically and completely free with every single booking.
            </motion.p>
          </div>

          {/* Right Protection Features List */}
          <div className="lg:w-7/12 w-full">
            <div className="space-y-4">
              {protections.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 flex items-start gap-6 transition-all cursor-default"
                >
                  <div className="w-14 h-14 rounded-xl bg-brand-coral/10 border border-brand-coral/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-7 h-7 text-brand-coral" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{item.title}</h3>
                    <p className="text-[#DCE8F5]/70 leading-relaxed text-sm md:text-base">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
