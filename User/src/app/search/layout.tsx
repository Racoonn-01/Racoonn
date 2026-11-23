import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Search Hotels & Resorts | Find Your Perfect Stay',
  description: 'Search, filter, and compare verified hotels, luxury resorts, boutique villas, and homestays across India by location, price, rating, and amenities on Racoonn.',
  keywords: [
    'hotel search',
    'find resorts India',
    'book hotels online',
    'homestay search',
    'budget hotels',
    'luxury resort search',
    'vacation rentals India',
    'Racoonn search',
  ],
  alternates: {
    canonical: `${siteUrl}/search`,
  },
  openGraph: {
    title: 'Search Hotels & Resorts | Racoonn',
    description: 'Find verified hotels, boutique resorts, and homestays with transparent pricing and instant booking.',
    url: `${siteUrl}/search`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Search Hotels on Racoonn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Hotels & Resorts | Racoonn',
    description: 'Find verified hotels, boutique resorts, and homestays with Racoonn.',
    images: [`${siteUrl}/icon.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
