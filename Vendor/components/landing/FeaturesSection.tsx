"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Globe, TrendingUp, Laptop, ShieldCheck, LineChart, Headset } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      title: "More Bookings",
      description: "Access millions of travelers from around the world looking for properties exactly like yours.",
      icon: Globe,
    },
    {
      title: "Revenue Growth",
      description: "Increase your occupancy rates and maximize profits with our dynamic pricing tools.",
      icon: TrendingUp,
    },
    {
      title: "Easy Management",
      description: "Manage rooms, rates, and availability effortlessly from a centralized, intuitive dashboard.",
      icon: Laptop,
    },
    {
      title: "Secure Payments",
      description: "Get paid fast and securely. We handle all payment processing and fraud prevention.",
      icon: ShieldCheck,
    },
    {
      title: "Guest Insights",
      description: "Understand guest behavior and preferences with detailed analytics and reporting.",
      icon: LineChart,
    },
    {
      title: "Dedicated Support",
      description: "Our 24/7 partner support team is always ready to help you succeed and grow.",
      icon: Headset,
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Why Partner With Us</h2>
          <h3 className="text-3xl md:text-5xl font-heading font-black text-secondary leading-tight">
            Everything you need to <span className="text-primary">grow</span> your business
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="border-0 shadow-none bg-slate-50 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ring-1 ring-slate-100 rounded-2xl h-full">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-heading font-bold text-secondary mb-3">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
