import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'About Us | Transforming Hospitality & Travel Across India',
  description: 'Learn about Racoonn’s mission to connect travelers with handpicked boutique hotels, verified luxury stays, and curated holiday packages with genuine transparency.',
  keywords: [
    'about Racoonn',
    'hospitality company India',
    'hotel booking platform',
    'curated travel experience',
    'Racoonn mission',
  ],
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: 'About Us | Racoonn',
    description: 'Learn about Racoonn’s mission to simplify travel and hotel booking across India with transparency, trust, and curated luxury.',
    url: `${siteUrl}/about`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'About Racoonn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us | Racoonn',
    description: 'Learn about Racoonn’s mission to simplify travel and hotel booking across India.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
