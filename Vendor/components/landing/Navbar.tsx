"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AuthModal = ({ children }: { children: React.ReactElement }) => {
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin');

  return (
    <Dialog onOpenChange={(open) => { if(open) setView('signin') }}>
      <DialogTrigger render={children} />
      <DialogContent className="w-full max-w-md p-8 rounded-3xl bg-white border-none shadow-2xl [&>button]:top-4 [&>button]:right-4 [&>button]:w-8 [&>button]:h-8 [&>button]:bg-slate-100 [&>button]:rounded-full [&>button]:flex [&>button]:items-center [&>button]:justify-center hover:[&>button]:bg-slate-200 transition-colors">
        <div className="text-center mb-8">
          <DialogTitle className="text-[28px] font-heading font-bold text-[#222] mb-1 tracking-tight">
            {view === 'signin' ? 'Welcome back' : view === 'signup' ? 'Apply to Host' : 'Reset password'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-[14px]">
            {view === 'signin' 
              ? 'Enter your details to access your dashboard.' 
              : view === 'signup'
              ? 'Join our premium network to scale your business.'
              : "Enter your email and we'll send you a reset link."}
          </DialogDescription>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {view === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">First Name</label>
                <input 
                  type="text" 
                  placeholder="Jane" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Last Name</label>
                <input 
                  type="text" 
                  placeholder="Smith" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Email Address</label>
            <input 
              type="email" 
              placeholder="host@example.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px]"
            />
          </div>
          
          {view !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Password</label>
                {view === 'signin' && (
                  <button type="button" onClick={() => setView('forgot')} className="text-[12px] font-bold text-brand-coral hover:text-rose-500 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-brand-coral focus:ring-4 focus:ring-brand-coral/10 transition-all text-[15px] tracking-widest"
              />
            </div>
          )}

          <Link href={view === 'signup' ? "/vendor/onboarding" : "/vendor/dashboard"} className="block mt-2">
            <button 
              type="button" 
              className="w-full bg-[#222] hover:bg-black text-white py-3.5 rounded-xl font-bold text-[15px] transition-all active:scale-[0.98]"
            >
              {view === 'signin' ? 'Sign In' : view === 'signup' ? 'Start Onboarding' : 'Send reset link'}
            </button>
          </Link>
        </form>

        {view !== 'forgot' && (
          <>
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-[12px] font-medium uppercase tracking-wider">or continue with</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-slate-700 text-[14px]">
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-center text-[14px]">
          {view === 'signin' ? (
            <p className="text-slate-500">
              Don't have an account?{' '}
              <button onClick={() => setView('signup')} className="text-[#222] font-bold hover:underline underline-offset-4 transition-all">
                Sign up
              </button>
            </p>
          ) : view === 'signup' ? (
            <p className="text-slate-500">
              Already have an account?{' '}
              <button onClick={() => setView('signin')} className="text-secondary font-bold hover:text-brand-coral transition-colors underline-offset-4 hover:underline">
                Sign in
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Remember your password?{' '}
              <button onClick={() => setView('signin')} className="text-[#222] font-bold hover:underline underline-offset-4 transition-all">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function LandingNavbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <motion.header
        className={`pointer-events-auto transition-all duration-300 w-full max-w-7xl rounded-full flex items-center justify-between px-4 sm:px-6 border border-slate-200/60 ${
          isScrolled 
            ? "bg-white/95 backdrop-blur-md shadow-md py-3" 
            : "bg-white/80 backdrop-blur-md shadow-sm py-4"
        }`}
      >
        {/* Left: Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image 
            src="/racoonn-logo.png" 
            alt="Racoonn Logo" 
            width={140} 
            height={40} 
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* Middle: Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {["Benefits", "Setup", "Protection", "FAQ"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-sm font-semibold text-[#202D42]/80 hover:text-[#EA6A6E] px-5 py-2.5 rounded-full hover:bg-slate-50 transition-colors"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <AuthModal>
            <Button className="bg-[#EA6A6E] hover:bg-[#d65d60] text-white font-bold rounded-full px-6 shadow-sm shadow-[#EA6A6E]/20">
              Sign in
            </Button>
          </AuthModal>
          <Link href="/vendor/dashboard">
            <Button variant="outline" className="font-bold rounded-full px-6 border-slate-200 text-[#202D42] bg-white hover:bg-slate-50">
              Vendor Portal
            </Button>
          </Link>
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#202D42] hover:text-[#EA6A6E] transition-colors border border-slate-200 hover:bg-slate-50">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-secondary w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </motion.header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-[110%] left-4 right-4 bg-white shadow-xl rounded-3xl border border-slate-100 py-4 px-4 flex flex-col gap-4 lg:hidden pointer-events-auto">
          {["Benefits", "Setup", "Protection", "FAQ"].map((item) => (
            <Link 
              key={item} 
              href={`#${item.toLowerCase()}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-bold text-secondary py-2 border-b border-slate-50"
            >
              {item}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <AuthModal>
              <Button className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                Sign in
              </Button>
            </AuthModal>
            <Link href="/vendor/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-slate-200 text-secondary font-bold rounded-xl bg-white">
                Vendor Portal
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
