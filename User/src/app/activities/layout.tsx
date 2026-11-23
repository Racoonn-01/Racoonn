import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Travel Activities & Guided Adventures | Things To Do',
  description: 'Book unforgettable outdoor activities, nature treks, wildlife safaris, water sports, and guided excursions across top travel destinations in India.',
  keywords: [
    'travel activities India',
    'things to do in Uttarakhand',
    'adventure treks',
    'wildlife safaris',
    'camping experiences',
    'guided tours',
    'Racoonn activities',
  ],
  alternates: {
    canonical: `${siteUrl}/activities`,
  },
  openGraph: {
    title: 'Travel Activities & Experiences | Racoonn',
    description: 'Book outdoor adventures, guided treks, safaris, and local experiences with Racoonn.',
    url: `${siteUrl}/activities`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Racoonn Activities and Adventures',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel Activities & Experiences | Racoonn',
    description: 'Book outdoor adventures, guided treks, safaris, and local experiences with Racoonn.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function ActivitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
