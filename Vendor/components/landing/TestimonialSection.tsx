"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export function TestimonialSection() {
  const originalTestimonials = [
    {
      name: "Sarah Jenkins",
      role: "Boutique Hotel Owner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
      quote: "Switching to Racoonn was the best decision for our business. The 1-on-1 support is unmatched, and our occupancy rate jumped 40% in the first month.",
      earnings: "$14,500/mo"
    },
    {
      name: "David Chen",
      role: "Luxury Villa Host",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      quote: "The protection plan gave me the confidence to list my premium property. I've never felt so secure hosting guests.",
      earnings: "$22,000/mo"
    },
    {
      name: "Emma Rodriguez",
      role: "Property Manager",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop",
      quote: "The AI pricing tool is incredible. It dynamically adjusts our rates based on local demand, maximizing our revenue without lifting a finger.",
      earnings: "$18,200/mo"
    },
    {
      name: "Michael Chang",
      role: "Resort Director",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      quote: "Racoonn brings in high-quality guests that treat our property with respect. The verification process is a game changer.",
      earnings: "$45,000/mo"
    },
    {
      name: "Olivia Bennett",
      role: "Apartment Host",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
      quote: "I was skeptical at first, but the onboard success manager walked me through everything. I got my first booking within 24 hours!",
      earnings: "$8,400/mo"
    }
  ];

  // Duplicate the testimonials to create a seamless infinite loop
  const testimonials = [...originalTestimonials, ...originalTestimonials];

  return (
    <section className="py-32 bg-[#F8F9FA] relative overflow-hidden">
      {/* Fade edges for smooth enter/exit */}
      <div className="absolute left-0 top-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#F8F9FA] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#F8F9FA] to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-20 mb-16">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
            Don't just take our word for it.
          </h2>
          <p className="text-xl font-medium text-slate-500 mt-4 max-w-2xl mx-auto">
            Hear from property owners who have scaled their businesses with Racoonn.
          </p>
        </div>
      </div>

      {/* Infinite Carousel Container */}
      <div className="flex w-full overflow-hidden">
        <motion.div
          className="flex items-stretch gap-6 md:gap-8 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 40,
            ease: "linear",
          }}
          style={{ width: "fit-content" }}
          // Pause on hover
          whileHover={{ animationPlayState: "paused" }}
        >
          {testimonials.map((test, index) => (
            <div
              key={index}
              className="w-[350px] md:w-[450px] shrink-0 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-4xl p-8 md:p-10 flex flex-col transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="flex gap-1 text-amber-400 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-5 h-5 fill-amber-400" />
                ))}
              </div>
              
              <p className="text-slate-600 text-lg leading-relaxed flex-1 mb-10 italic">
                "{test.quote}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto pt-6 border-t border-slate-100">
                <img 
                  src={test.image} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md" 
                  alt={test.name} 
                />
                <div>
                  <h4 className="font-bold text-secondary text-lg">{test.name}</h4>
                  <p className="text-sm font-medium text-slate-400">{test.role}</p>
                </div>
                <div className="ml-auto text-right bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">Avg Revenue</p>
                  <p className="text-emerald-700 font-black text-sm">{test.earnings}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
