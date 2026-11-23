import { Metadata } from 'next';
import DevelopersPageClient from './DevelopersPageClient';

export const metadata: Metadata = {
  title: 'Partner API Documentation & Channel Manager Integration | Racoonn Admin',
  description: 'Official API documentation for Racoonn Partner Network. Connect your PMS or Channel Manager to sync room availability, push live rates, fetch reservations, and listen to webhooks.',
  robots: {
    index: false, // Internal admin docs should not be indexed by search engines
    follow: false,
  },
};

export default function DevelopersPage() {
  return <DevelopersPageClient />;
}
