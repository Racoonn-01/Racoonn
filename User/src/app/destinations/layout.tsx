import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Top Travel Destinations in India | Popular Getaways',
  description: 'Explore the most sought-after holiday destinations in India. Discover scenic hill stations, lakeside escapes, wildlife sanctuaries, and cultural hubs with Racoonn.',
  keywords: [
    'destinations in India',
    'Uttarakhand destinations',
    'Nainital tourism',
    'Mussoorie travel',
    'Jim Corbett',
    'Rishikesh getaways',
    'hill stations India',
    'Racoonn travel destinations',
  ],
  alternates: {
    canonical: `${siteUrl}/destinations`,
  },
  openGraph: {
    title: 'Top Travel Destinations | Racoonn',
    description: 'Discover popular travel destinations and book top-rated stays with Racoonn.',
    url: `${siteUrl}/destinations`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Explore Destinations with Racoonn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Top Travel Destinations | Racoonn',
    description: 'Discover popular travel destinations and book top-rated stays with Racoonn.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function DestinationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
