'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, type UserProfile } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import PersonalInformationForm from '@/components/profile/sections/PersonalInformationForm';
import BookingsSection from '@/components/profile/sections/BookingsSection';
import SavedHotelsGrid from '@/components/profile/sections/SavedHotelsGrid';
import PaymentMethods from '@/components/profile/sections/PaymentMethods';

export default function ProfilePage() {
  const { isAuthenticated, isLoading, profile, user, checkAuth } = useAuthStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('personal');
  const [mounted, setMounted] = useState(false);

  const userData = profile || user;

  useEffect(() => {
    checkAuth();
    setTimeout(() => setMounted(true), 0);
  }, [checkAuth]);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  if (!mounted) {
    return null;
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-coral border-t-transparent"></div>
      </div>
    );
  }

  // Render nothing while redirect is in flight
  if (!isAuthenticated) {
    return null;
  }


  return (
    <div className="min-h-screen bg-[#f8f9fa] text-brand-navy selection:bg-brand-coral selection:text-white pb-24 -mt-25 pt-25">
      <main className="container mx-auto px-4 lg:px-8 mt-12 max-w-7xl">
        {/* Mobile Header Card */}
        <div className="lg:hidden mb-8 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center font-bold text-xl">
             {userData?.name?.charAt(0).toUpperCase() || 'U'}
           </div>
           <div>
             <h1 className="font-heading font-bold text-2xl">{userData?.name}</h1>
             <p className="text-gray-500 text-sm">{userData?.email}</p>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* Sidebar / Top Navigation */}
          <aside className="lg:w-1/4 w-full lg:sticky lg:top-32 lg:self-start mb-6 lg:mb-0">
            <nav 
              className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-0 lg:space-y-1 bg-white p-2 lg:p-4 rounded-full lg:rounded-3xl shadow-sm border border-gray-100 snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {['personal', 'bookings', 'saved', 'payments'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`shrink-0 w-auto lg:w-full text-center lg:text-left px-6 py-2.5 lg:py-3.5 rounded-full lg:rounded-2xl font-semibold transition-all capitalize snap-center ${
                    activeSection === section 
                      ? 'bg-brand-coral/10 text-brand-coral' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-brand-navy'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content Area */}
          <section className="flex-1 w-full relative min-h-[60vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'personal' && <PersonalInformationForm profile={userData as unknown as UserProfile | null} />}
                {activeSection === 'bookings' && <BookingsSection />}
                {activeSection === 'saved' && <SavedHotelsGrid />}
                {activeSection === 'payments' && <PaymentMethods />}
              </motion.div>
            </AnimatePresence>
          </section>

        </div>
      </main>
    </div>
  );
}
