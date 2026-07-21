'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import logoImg from '@/assets/Racoon-icon-White.png';

const SocialIcon = ({ type, size = 18 }: { type: string; size?: number }) => {
  switch (type) {
    case 'Facebook':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>;
    case 'Twitter':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>;
    case 'Instagram':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>;
    case 'Linkedin':
      return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>;
    default:
      return null;
  }
};

export default function Footer() {
  const pathname = usePathname();
  const isAuthPage = ['/signin', '/signup', '/forgot-password', '/search'].includes(pathname);
  const isCheckoutPage = pathname.startsWith('/checkout');
  
  if (isAuthPage || isCheckoutPage) return null;

  return (
    <footer className="bg-brand-navy text-white pt-24 pb-12 relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent"></div>
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-brand-coral/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand & Newsletter (Takes up 5 columns) */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-8">
              <Image 
                src={logoImg} 
                alt="Racoonn Logo" 
                height={60}
                className="h-14 w-auto object-contain mix-blend-screen"
                priority
              />
            </Link>
            <p className="text-brand-sky/70 mb-10 leading-relaxed text-lg max-w-md">
              Find your perfect stay effortlessly. We provide premium hotel bookings for modern travelers seeking seamless experiences around the globe.
            </p>
            
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h4 className="text-white font-medium mb-2 relative z-10">Subscribe to our Newsletter</h4>
              <p className="text-brand-sky/60 text-sm mb-4 relative z-10">Get the latest updates and exclusive offers directly in your inbox.</p>
              <form className="flex gap-2 relative z-10">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-coral focus:bg-white/20 transition-all w-full text-sm"
                  suppressHydrationWarning
                />
                <button className="bg-brand-coral hover:bg-[#d95d63] text-white p-3 rounded-xl transition-colors flex-none flex items-center justify-center">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Quick Links (Takes up 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className="text-xl font-heading font-semibold mb-8 text-white relative inline-block">
              Explore
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-brand-coral rounded-full"></span>
            </h4>
            <ul className="space-y-4 mt-2">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Search Hotels', path: '/search' },
                { name: 'Special Offers', path: '/offers' },
                { name: 'Tour Packages', path: '/tours' },
                { name: 'Destinations', path: '/destinations' },
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.path} className="text-brand-sky/70 hover:text-brand-coral transition-colors flex items-center gap-3 group">
                    <span className="w-2 h-2 rounded-full border border-brand-coral/50 group-hover:bg-brand-coral transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info (Takes up 3 columns) */}
          <div className="lg:col-span-3">
            <h4 className="text-xl font-heading font-semibold mb-8 text-white relative inline-block">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-brand-coral rounded-full"></span>
            </h4>
            <ul className="space-y-6 mt-2">
              <li className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-none group-hover:bg-brand-coral/20 group-hover:border-brand-coral/30 transition-all">
                  <MapPin className="text-brand-coral" size={20} />
                </div>
                <div>
                  <h5 className="text-white/90 text-sm font-medium mb-1">Location</h5>
                  <span className="text-brand-sky/60 text-sm">123 Travel Avenue, Suite 400<br />New York, NY 10012</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-none group-hover:bg-brand-coral/20 group-hover:border-brand-coral/30 transition-all">
                  <Phone className="text-brand-coral" size={20} />
                </div>
                <div>
                  <h5 className="text-white/90 text-sm font-medium mb-1">Phone</h5>
                  <span className="text-brand-sky/60 text-sm">+1 (555) 123-4567</span>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-none group-hover:bg-brand-coral/20 group-hover:border-brand-coral/30 transition-all">
                  <Mail className="h-5 w-5 text-primary flex-none" />
                </div>
                <div>
                  <h5 className="text-white/90 text-sm font-medium mb-1">Email</h5>
                  <span className="text-brand-sky/60 text-sm">support@racoonn.com</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-brand-sky/50 text-sm">
              &copy; {new Date().getFullYear()} Racoonn. All rights reserved.
            </p>
            <p className="text-brand-sky/50 text-sm">
              Design and Developed By <a href="https://preettech.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Preet Tech</a>
            </p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/terms" className="text-brand-sky/50 hover:text-white text-sm transition-colors">Terms & Conditions</Link>
            <span className="text-white/20">•</span>
            <Link href="/privacy" className="text-brand-sky/50 hover:text-white text-sm transition-colors">Privacy Policy</Link>
          </div>

          <div className="flex gap-3">
            {['Facebook', 'Twitter', 'Instagram', 'Linkedin'].map((social, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-brand-coral hover:border-brand-coral hover:text-white transition-all flex items-center justify-center text-white/70">
                <SocialIcon type={social} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
