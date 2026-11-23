"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

export function FAQSection() {
  const faqs = [
    {
      q: "How does the 1-on-1 onboarding work?",
      a: "Once you sign up, you're assigned a dedicated Success Manager. They will schedule a video or phone call to help you set up your profile, optimize your pricing using our AI tools, and get your first listing live."
    },
    {
      q: "What makes Racoonn different from other platforms?",
      a: "We focus on luxury, boutique, and high-quality properties. We provide enterprise-grade analytics, dynamic AI pricing, and direct support to help you run a scalable business, not just a side hustle."
    },
    {
      q: "How does Racoonn Shield protect me?",
      a: "Racoonn Shield is included automatically. It offers strict guest identity verification, up to $3M in property damage protection, and $1M in liability insurance for absolute peace of mind."
    },
    {
      q: "What are the platform fees?",
      a: "We charge a flat 3% payment processing and platform fee on successful bookings. There are no setup fees, hidden charges, or subscription costs."
    },
    {
      q: "How do payouts work?",
      a: "Payouts are released to your bank account 24 hours after a guest checks in. You can track all incoming payouts directly from your Vendor Dashboard."
    }
  ];

  return (
    <section id="faq" className="py-32 bg-[#F4F0EA]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-start max-w-7xl mx-auto">
          
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-secondary tracking-tight mb-6">
                Frequently Asked <br/>Questions
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-md">
                Everything you need to know about partnering with Racoonn and elevating your property business.
              </p>
            </motion.div>
          </div>

          <div className="lg:col-span-7">
            <Accordion className="w-full space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AccordionItem 
                    value={`item-${i}`} 
                    className="bg-white border border-slate-200 rounded-2xl px-6 data-[state=open]:shadow-md transition-all"
                  >
                    <AccordionTrigger className="text-left text-lg md:text-xl font-bold text-secondary hover:no-underline py-6">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 leading-relaxed pb-6 text-base md:text-lg">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
          
        </div>
      </div>
    </section>
  );
}
