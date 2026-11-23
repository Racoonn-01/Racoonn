"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      target: "For Small Properties",
      price: "12%",
      period: "per booking",
      description: "Perfect for single villas, homestays, and boutique properties.",
      features: [
        "Global listing exposure",
        "Basic dashboard analytics",
        "Secure payment processing",
        "24/7 email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      target: "For Growing Businesses",
      price: "10%",
      period: "per booking",
      description: "Ideal for multi-property owners and mid-sized hotels.",
      features: [
        "Everything in Starter",
        "Advanced revenue insights",
        "Dynamic pricing tools",
        "Priority phone support",
        "API integrations",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      target: "For Hotel Chains",
      price: "Custom",
      period: "commission",
      description: "Tailored solutions for large resorts and hotel chains.",
      features: [
        "Dedicated account manager",
        "Custom dashboard branding",
        "Volume discounts",
        "24/7 priority SLA support",
        "On-site training",
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Transparent Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-heading font-black text-secondary leading-tight mb-4">
            No hidden fees. Only pay when you get a booking.
          </h3>
          <p className="text-lg text-slate-500">
            Choose the plan that fits your business scale.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-3xl overflow-hidden ${
                plan.popular 
                  ? "ring-4 ring-primary shadow-2xl scale-105 z-10" 
                  : "ring-1 ring-slate-200 shadow-lg mt-8 mb-8"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center py-2 text-sm font-bold tracking-wider uppercase">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h4 className="text-2xl font-heading font-bold text-secondary mb-1">{plan.name}</h4>
                <p className="text-sm font-medium text-slate-500 mb-6">{plan.target}</p>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-black text-secondary">{plan.price}</span>
                  <span className="text-slate-500 font-medium">{plan.period}</span>
                </div>
                
                <p className="text-slate-600 mb-8 pb-8 border-b border-slate-100">
                  {plan.description}
                </p>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className={`w-5 h-5 ${plan.popular ? "text-primary" : "text-slate-400"}`} />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full h-12 rounded-xl text-base font-bold transition-all ${
                    plan.popular 
                      ? "bg-primary hover:bg-primary/90 text-white" 
                      : "bg-slate-100 hover:bg-slate-200 text-secondary"
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
