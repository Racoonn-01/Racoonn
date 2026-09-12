'use client';

import React from 'react';
import { Target, Heart, Globe, Award, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const stats = [
  { value: '50K+', label: 'Happy Travelers' },
  { value: '1,200+', label: 'Luxury Hotels' },
  { value: '150+', label: 'Destinations' },
  { value: '24/7', label: 'Customer Support' },
];

const values = [
  {
    icon: Heart,
    title: 'Customer First',
    description: 'Every decision we make is centered around providing the best possible experience for our travelers.'
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'We rigorously verify every property and partner to ensure your bookings are 100% secure.'
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description: 'We believe travel should be accessible to everyone, everywhere, without borders or friction.'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'From budget to luxury, we only list properties that meet our strict quality and hygiene standards.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-87.5 flex items-center justify-center overflow-hidden bg-brand-navy">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop" 
            alt="Beautiful luxury hotel" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/60 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center pt-10">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-brand-coral/20 border border-brand-coral/30 text-brand-coral text-xs font-bold uppercase tracking-wider mb-4">
            <Globe className="w-3.5 h-3.5" /> Our Story
          </span>
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Elevating Your Travel Experience
          </h1>
          <p className="text-brand-sky/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            We curate exceptional stays across the globe, transforming ordinary trips into unforgettable journeys.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 -mt-10 mb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-lg shadow-brand-navy/5 p-6 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-gray-100">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center px-2">
                  <h3 className="text-2xl md:text-3xl font-heading font-bold text-brand-navy mb-1">{stat.value}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="order-2 lg:order-1 relative group">
              <div className="aspect-4/3 relative rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" 
                  alt="Happy travelers" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-2 md:-right-6 bg-white p-5 rounded-xl shadow-xl border border-gray-100 max-w-55">
                <div className="w-10 h-10 bg-brand-coral/10 rounded-lg flex items-center justify-center mb-3">
                  <Target className="w-5 h-5 text-brand-coral" />
                </div>
                <h4 className="text-base font-bold text-brand-navy mb-1">Our Mission</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">To empower individuals to explore the world with absolute confidence.</p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 lg:pl-6">
              <span className="text-brand-coral font-bold tracking-wider uppercase text-xs mb-3 block">About Racoonn</span>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-navy mb-5 leading-tight">
                Born out of a simple desire to travel better.
              </h2>
              <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
                <p>
                  Racoonn started when a group of passionate travelers realized how fragmented booking accommodations had become. Between hidden fees, deceptive photos, and poor customer service, the joy of planning a trip was getting lost.
                </p>
                <p>
                  We built this platform to fix that. We partner directly with top-tier properties to guarantee you get the best rates without surprises. Our dedicated team works around the clock to ensure every listing meets our rigorous standards.
                </p>
                <p className="text-brand-navy font-bold text-base pt-4 border-t border-gray-100">
                  "Our goal isn't just to book you a room. It's to find you a home anywhere in the world."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-brand-navy mb-3">Why Choose Us</h2>
            <p className="text-gray-500 text-sm">The principles that guide every feature we build and every interaction we have with our community.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-coral/10 transition-colors">
                  <value.icon className="w-6 h-6 text-brand-navy group-hover:text-brand-coral transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{value.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="bg-brand-navy rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
                Ready for your next adventure?
              </h2>
              <p className="text-brand-sky/70 text-sm mb-8 max-w-lg mx-auto">
                Join thousands of travelers who trust us for their hotel bookings. Find your perfect stay today.
              </p>
              <Link 
                href="/search" 
                className="inline-flex items-center gap-2 bg-brand-coral hover:bg-[#d95d63] text-white px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-brand-coral/20 hover:-translate-y-0.5"
              >
                Explore Hotels
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
