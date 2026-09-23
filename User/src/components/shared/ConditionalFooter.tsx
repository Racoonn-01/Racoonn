'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on the profile page and any of its sub-routes or auth pages
  if (pathname?.startsWith('/profile') || pathname === '/reset-password') {
    return null;
  }

  return <Footer />;
}
