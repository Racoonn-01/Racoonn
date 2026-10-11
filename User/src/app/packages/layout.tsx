import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Holiday Tour Packages | Explore Curated Travel Packages',
  description: 'Discover all-inclusive holiday packages with flexible departure cities, group pricing slabs, meals, stays, and transfers across top Indian destinations.',
  keywords: [
    'holiday packages',
    'tour packages India',
    'travel packages',
    'Uttarakhand holiday packages',
    'Nainital tour package',
    'Mussoorie packages',
    'group tour booking',
    'weekend getaway packages',
    'custom travel quotes',
  ],
  alternates: {
    canonical: `${siteUrl}/packages`,
  },
  openGraph: {
    title: 'Holiday Tour Packages | Racoonn',
    description: 'Explore all-inclusive holiday tour packages with custom departure cities, meals, stays, and transfers.',
    url: `${siteUrl}/packages`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Racoonn Holiday Packages',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Holiday Tour Packages | Racoonn',
    description: 'Explore all-inclusive holiday tour packages with custom departure cities, meals, stays, and transfers.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function PackagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
