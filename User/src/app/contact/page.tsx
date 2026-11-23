"use client";

import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-brand-navy pt-32 pb-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Get in Touch</h1>
          <p className="text-gray-300 text-lg">Have a question or need assistance? Our team is here to help you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Mail size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Email Us</h3>
              <p className="text-gray-500 mb-4 text-sm">We'll get back to you within 24 hours.</p>
              <a href="mailto:info@racoonn.com" className="text-brand-coral font-semibold hover:underline">info@racoonn.com</a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Phone size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Call Us</h3>
              <p className="text-gray-500 mb-4 text-sm">Available 24/7 for urgent inquiries.</p>
              <a href="tel:+918954442144" className="text-brand-coral font-semibold hover:underline">+91 8954442144</a>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                <MapPin size={28} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">Office</h3>
              <p className="text-gray-500 text-sm">Uttarakhand, India</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 h-full">
              <h2 className="text-2xl font-bold text-brand-navy mb-6">Send us a message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all" placeholder="john@example.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all" placeholder="How can we help?" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral transition-all resize-none" placeholder="Write your message here..."></textarea>
                </div>

                <button type="button" className="w-full sm:w-auto px-8 py-3.5 bg-brand-coral text-white font-semibold rounded-xl shadow-md hover:bg-brand-coral/90 transition-all flex items-center justify-center gap-2">
                  <Send size={18} />
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
