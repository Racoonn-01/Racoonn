'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
// Logo loaded from public folder
import SearchBar from './SearchBar';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/authStore';

const navLinks = [
  { name: 'Stays', href: '/search' },
  { name: 'Packages', href: '/packages' },
  { name: 'Offers', href: '/search?type=offers' },
  { name: 'Activities', href: '/activities' },
  { name: 'Help', href: '/help' },
];

export default function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'signin' | 'signup'>('signin');
  const pathname = usePathname();
  
  const { isAuthenticated, checkAuth, profile, logout } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const isAuthPage = ['/signin', '/signup', '/forgot-password'].includes(pathname);
  const isCheckoutPage = pathname.startsWith('/checkout');
  if (isAuthPage || isCheckoutPage) return null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full pt-4 px-4 bg-transparent pointer-events-none">
        <div className="container mx-auto px-6 lg:px-8 h-19 flex items-center justify-between bg-white lg:bg-white/70 lg:backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full pointer-events-auto transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/Racoonn%20Horizontal%20Logo-White%20BG.png" alt="Racoonn Logo" width={180} height={45} className="h-9 w-auto" />
          </Link>

          {/* Desktop Navigation / SearchBar */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <SearchBar />
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="http://localhost:3001"
              className="text-[15px] font-bold text-brand-navy hover:text-brand-coral transition-colors"
            >
              List your property
            </Link>
            {isAuthenticated ? (
              <Link
                href="/profile"
                title={profile?.name ? `Profile: ${profile.name}` : 'Profile'}
                className="w-10.5 h-10.5 flex items-center justify-center rounded-full bg-brand-navy hover:bg-brand-coral text-white transition-all shadow-md hover:-translate-y-0.5 hover:shadow-lg"
              >
                {profile?.name ? (
                  <span className="font-bold text-[15px]">{profile.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={20} />
                )}
              </Link>
            ) : (
              <button
                onClick={() => { setAuthModalView('signin'); setIsAuthModalOpen(true); }}
                className="bg-brand-coral hover:bg-opacity-90 text-white px-7 py-2.5 rounded-full font-bold transition-all shadow-md shadow-brand-coral/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-coral/30"
              >
                Sign in
              </button>
            )}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 hover:border-brand-coral hover:bg-brand-coral/5 text-brand-navy hover:text-brand-coral transition-all ml-2 shadow-sm hover:shadow-md"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-brand-navy hover:bg-brand-coral/10 hover:text-brand-coral rounded-full transition-colors pointer-events-auto"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Hardware Accelerated Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* High Performance Backdrop (No blur to fix lag) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-brand-navy/60 z-100"
            />
            
            {/* Premium Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'circOut', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-95 max-w-[85vw] bg-white z-101 shadow-2xl flex flex-col will-change-transform transform-gpu"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-8 pb-4">
                <Image src="/Racoonn%20Horizontal%20Logo-White%20BG.png" alt="Racoonn Logo" width={140} height={35} className="h-7 w-auto opacity-80" />
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-brand-coral hover:text-white text-brand-charcoal transition-all shadow-sm hover:shadow-md hover:rotate-90 transform-gpu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-1">
                <Link 
                  href="/" 
                  onClick={() => setIsSidebarOpen(false)}
                  className="group flex items-center gap-4 py-4 border-b border-gray-50"
                >
                  <span className="text-2xl font-semibold text-brand-navy group-hover:text-brand-coral group-hover:translate-x-2 transition-all duration-300">
                    Home
                  </span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className="group flex items-center gap-4 py-4 border-b border-gray-50"
                  >
                    <span className="text-2xl font-semibold text-brand-navy group-hover:text-brand-coral group-hover:translate-x-2 transition-all duration-300">
                      {link.name}
                    </span>
                  </Link>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="p-8 bg-gray-50/50 space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Partner with us</p>
                <Link
                  href="http://localhost:3001"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block w-full text-center text-[15px] font-bold text-brand-navy hover:text-brand-coral border-2 border-brand-navy/10 hover:border-brand-coral rounded-xl transition-all py-3.5"
                >
                  List your property
                </Link>
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsSidebarOpen(false);
                    }}
                    className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-brand-navy px-7 py-4 rounded-xl font-bold transition-all shadow-sm"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setAuthModalView('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="block w-full text-center bg-brand-navy hover:bg-brand-coral text-white px-7 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform-gpu"
                  >
                    Sign in to your account
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView={authModalView} 
      />
    </>
  );
}
