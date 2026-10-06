'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, MapPin } from 'lucide-react';
import logoImg from '@/assets/Racoon-icon-White.png';
import WhyBookWithUs from './WhyBookWithUs';

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
    <>
      {pathname === '/' && <WhyBookWithUs />}
      
      {/* App Download Section */}
      <section className="bg-white pt-12 pb-6 md:pb-10">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="relative bg-[#F2F4F7] border border-gray-200 rounded-3xl p-6 md:p-10 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 md:gap-8 shadow-sm">
            
            {/* Left Content: Text & Icon */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6">

              {/* Text */}
              <div className="pt-1 sm:pt-2">
                <h2 className="text-[26px] sm:text-3xl md:text-[40px] leading-tight font-bold text-[#2D3748] mb-2 sm:mb-3 tracking-tight">
                  Download App Now!
                </h2>
                <p className="text-gray-600 text-[15px] md:text-[17px] max-w-sm mx-auto sm:mx-0">
                  Use code <span className="font-bold text-gray-800">WELCOMERACOONN</span> and get <span className="font-bold text-gray-800">FLAT 10% OFF*</span> on your first Hotel booking
                </p>
              </div>
            </div>
            
            {/* Right Content: Badges */}
            <div className="relative z-10 flex flex-row flex-wrap items-center justify-center gap-3 shrink-0 mt-2 md:mt-0">
              {/* App Store Official Badge */}
              <Link href="#" className="hover:opacity-80 transition-transform transform hover:-translate-y-1 duration-300">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  width={140}
                  height={40}
                  className="h-9.5 w-auto sm:h-12 md:h-14"
                />
              </Link>
              
              {/* Google Play Official Badge */}
              <Link href="#" className="hover:opacity-80 transition-transform transform hover:-translate-y-1 duration-300">
                <Image 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  width={140}
                  height={40}
                  className="h-9.5 w-auto sm:h-12 md:h-14"
                />
              </Link>
            </div>
            
          </div>
        </div>
      </section>
      <footer className="bg-brand-navy text-white pt-20 pb-10 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-brand-coral/30 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-coral/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          


          {/* Main Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Info (4 cols) */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <Image 
                  src={logoImg} 
                  alt="Racoonn Logo" 
                  height={50}
                  className="h-10 w-auto object-contain mix-blend-screen opacity-90 hover:opacity-100 transition-opacity"
                  priority
                />
              </Link>
              <p className="text-brand-sky/70 leading-relaxed mb-8 max-w-sm">
                Your trusted partner for finding the perfect stay. Experience premium hotel bookings with seamless reservations around the globe.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-coral/20 group-hover:text-brand-coral transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-sky/50 mb-0.5">Need help booking?</p>
                    <p className="font-bold text-white">+91 8954442144</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-coral/20 group-hover:text-brand-coral transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-brand-sky/50 mb-0.5">Headquarters</p>
                    <p className="font-bold text-white text-sm leading-relaxed">
                      Corp. Off.-205 PSA Plaza 2nd Floor 19 Kalyani View,<br />
                      <span className="font-normal text-white/80">Nainital Road Rudrapur 263153 U.S. Nagar (UK)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Empty space for spacing */}
            <div className="hidden lg:block lg:col-span-2"></div>

            {/* Explore (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold mb-6 text-white tracking-wide">Explore</h4>
              <ul className="space-y-4 text-brand-sky/70">
                <li><Link href="/search" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Search Hotels</Link></li>
                <li><Link href="/offers" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Special Offers</Link></li>
                <li><Link href="/packages" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Tour Packages</Link></li>
                <li><Link href="/activities" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Activities</Link></li>
                <li><Link href="/blog" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Travel Blog</Link></li>
              </ul>
            </div>

            {/* Company (3 cols) */}
            <div className="lg:col-span-3">
              <h4 className="text-lg font-bold mb-6 text-white tracking-wide">Company</h4>
              <ul className="space-y-4 text-brand-sky/70">
                <li><Link href="/about" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">About Us</Link></li>
                <li><Link href="/help" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Help Center / FAQs</Link></li>
                <li><Link href="/terms" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">Privacy Policy</Link></li>
                <li><a href={process.env.NODE_ENV === 'production' ? 'https://partner.racoonn.com/developers' : 'http://localhost:3000/developers'} className="hover:text-brand-coral hover:translate-x-1 inline-block transition-transform">API Documentation</a></li>
              </ul>
            </div>
            
          </div>



          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start gap-1 text-sm text-brand-sky/50 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2">
                <span>&copy; {new Date().getFullYear()} Racoonn. All rights reserved.</span>
              </div>
              <span>Design and Developed By <a href="https://preettech.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-coral transition-colors font-medium">Preet Tech</a></span>
            </div>
            
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-3">
                {[
                  { type: 'Facebook', url: 'https://www.facebook.com/profile.php?id=61594396886289' },
                  { type: 'Twitter', url: 'https://x.com/RACOONN06' },
                  { type: 'Instagram', url: 'https://www.instagram.com/racoonnofficial' },
                  { type: 'Linkedin', url: '#' }
                ].map((social, i) => (
                  <a key={i} href={social.url} target={social.url !== '#' ? "_blank" : undefined} rel={social.url !== '#' ? "noopener noreferrer" : undefined} aria-label={social.type} className="w-10 h-10 rounded-full bg-white/5 hover:bg-brand-coral text-white/70 hover:text-white transition-all flex items-center justify-center shadow-lg">
                    <SocialIcon type={social.type} />
                  </a>
                ))}
              </div>
              <span className="text-white/80 font-medium text-sm flex items-center gap-2">
                <span className="hidden md:inline"></span> Managed by CIELLE TRAVELS PRIVATE LIMITED
              </span>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}
