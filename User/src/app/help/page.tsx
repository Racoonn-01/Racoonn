import React from 'react';
import { Mail, Phone, MessageSquare, ChevronDown, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I book a stay?",
      answer: "You can book a stay by searching for your desired destination, selecting your dates, and choosing a hotel from the results. Follow the checkout process to confirm your reservation."
    },
    {
      question: "What is your cancellation policy?",
      answer: "Cancellation policies vary by property. You can find the specific cancellation policy for your booking on the hotel details page and in your confirmation email."
    },
    {
      question: "How can I change my booking dates?",
      answer: "To change your booking dates, please go to 'My Account' > 'My Bookings', select the booking you wish to modify, and choose the 'Modify Dates' option. Please note that changes are subject to availability and may incur additional charges."
    },
    {
      question: "When will I be charged for my booking?",
      answer: "Payment terms depend on the specific booking rate. Some bookings require upfront payment, while others allow you to pay at the property. The payment details are always shown before you confirm your booking."
    },
    {
      question: "Are pets allowed in the hotels?",
      answer: "Pet policies are determined by each individual property. Use the 'Pet Friendly' filter when searching for hotels to find accommodations that welcome your furry friends."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="bg-brand-navy pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-brand-coral/30 to-transparent"></div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-brand-coral/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">How can we help you?</h1>
          <p className="text-brand-sky/80 text-lg mb-10 max-w-2xl mx-auto">
            Search our knowledge base or browse categories below to find the answers you need for a seamless travel experience.
          </p>
          
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-12 relative z-20">
        
        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <BookOpen size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Booking Guide</h3>
            <p className="text-gray-500 mb-4 line-clamp-2">Learn everything about how to make, manage, and modify your reservations.</p>
            <Link href="#" className="text-brand-coral font-semibold hover:underline flex items-center gap-1">Read articles <ChevronDown className="w-4 h-4 -rotate-90" /></Link>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Live Chat</h3>
            <p className="text-gray-500 mb-4 line-clamp-2">Chat directly with our support team for immediate assistance with your booking.</p>
            <button className="text-brand-coral font-semibold hover:underline flex items-center gap-1">Start chat <ChevronDown className="w-4 h-4 -rotate-90" /></button>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
              <Phone size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-navy mb-3">Call Support</h3>
            <p className="text-gray-500 mb-4 line-clamp-2">Our support team is available 24/7 to help you over the phone.</p>
            <p className="text-brand-navy font-semibold text-lg">+91 8954442144</p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Quick answers to questions you may have about our platform.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-lg text-brand-navy hover:text-brand-coral transition-colors">
                  {faq.question}
                  <span className="ml-4 shrink-0 transition duration-300 group-open:-rotate-180">
                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-brand-coral" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Still need help */}
        <div className="mt-20 max-w-4xl mx-auto bg-brand-navy rounded-3xl p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Still need help?</h2>
          <p className="text-brand-sky/80 mb-8 max-w-xl mx-auto relative z-10">
            Can&apos;t find the answer you&apos;re looking for? Please contact our friendly support team and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button className="bg-brand-coral hover:bg-[#d95d63] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
