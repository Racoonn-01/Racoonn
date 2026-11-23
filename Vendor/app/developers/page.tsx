import { Metadata } from 'next';
import DevelopersPageClient from './DevelopersPageClient';

export const metadata: Metadata = {
  title: 'Partner API Documentation & Channel Manager Integration | Racoonn',
  description: 'Official API documentation for Racoonn Partner Network. Connect your PMS or Channel Manager to sync room availability, push live rates, fetch reservations, and listen to webhooks.',
  alternates: {
    canonical: 'https://partner.racoonn.com/developers',
  },
  openGraph: {
    title: 'Racoonn Partner API Documentation | Channel Manager & PMS Integration',
    description: 'Integrate directly with Racoonn using REST APIs and HMAC webhooks to sync room inventory, rates, and guest bookings in real-time.',
    url: 'https://partner.racoonn.com/developers',
    siteName: 'Racoonn Partner Network',
    locale: 'en_IN',
    type: 'website',
  },
  keywords: [
    'Racoonn API',
    'Hotel PMS API',
    'Channel Manager Integration',
    'Travel API India',
    'Hotel booking API',
    'Availability and Rates API',
    'CIELLE TRAVELS PRIVATE LIMITED'
  ],
};

export default function DevelopersPage() {
  return <DevelopersPageClient />;
}
