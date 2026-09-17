"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-secondary relative pt-64 md:pt-72 lg:pt-80 pb-10 mt-40">
      
      {/* Overlapping CTA Card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-4 md:px-6 max-w-5xl z-20">
        <div className="bg-brand-coral rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-brand-coral/40 border border-white/20">
          <div className="text-center md:text-left text-white max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Ready to elevate your property?
            </h2>
            <p className="text-rose-100 text-lg font-medium">
              Join thousands of luxury hosts scaling their revenue with Racoonn's enterprise tools and premium network.
            </p>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Button className="w-full md:w-auto bg-white text-brand-coral hover:bg-slate-50 h-14 px-8 rounded-full text-lg font-bold shadow-xl transition-all hover:scale-105">
              Start Hosting Today
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4 pr-0 lg:pr-8">
            <Link href="/" className="inline-block mb-6">
              <span className="text-3xl font-black text-white tracking-tighter">
                racoonn<span className="text-brand-coral">.</span>
              </span>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Empowering luxury hospitality businesses worldwide to maximize revenue, reach premium travelers, and simplify management.
            </p>
            <div className="space-y-4">
              <p className="text-sm font-bold text-white uppercase tracking-wider">Subscribe to Host Insights</p>
              <div className="flex relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input 
                  placeholder="Enter your email" 
                  className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-full focus-visible:ring-brand-coral"
                />
                <Button className="absolute right-1 top-1 h-10 rounded-full bg-brand-coral hover:bg-rose-500 text-white px-6">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8 lg:pl-12">
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Platform</h4>
              <ul className="space-y-4">
                {["Features", "Dynamic Pricing", "Racoonn Shield", "Integrations"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-slate-400 hover:text-brand-coral transition-colors text-sm font-medium">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Resources</h4>
              <ul className="space-y-4">
                {["Help Center", "Host Guides", "Webinars", "API Documentation"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-slate-400 hover:text-brand-coral transition-colors text-sm font-medium">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Press", "Contact"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-slate-400 hover:text-brand-coral transition-colors text-sm font-medium">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Connect</h4>
              <div className="flex flex-wrap gap-3">
                {/* Custom SVG icons to avoid missing lucide brand icons */}
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-coral hover:text-white hover:border-brand-coral transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-coral hover:text-white hover:border-brand-coral transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-brand-coral hover:text-white hover:border-brand-coral transition-all">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-slate-500 text-sm">
          <p>© 2026 Racoonn Inc. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
