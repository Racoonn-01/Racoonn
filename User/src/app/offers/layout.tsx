import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Exclusive Offers & Discount Coupons | Hotels & Tour Packages',
  description: 'Unlock special discounts, verified coupon codes, and promotional deals on hotel room bookings and holiday tour packages across India with Racoonn.',
  keywords: [
    'hotel discount coupons',
    'package offers',
    'travel promo codes',
    'Racoonn coupons',
    'hotel deals India',
    'holiday package discount',
    'seasonal travel offers',
  ],
  alternates: {
    canonical: `${siteUrl}/offers`,
  },
  openGraph: {
    title: 'Exclusive Travel Offers & Deals | Racoonn',
    description: 'Save on your next hotel stay or holiday package with exclusive promo codes and verified discounts.',
    url: `${siteUrl}/offers`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Racoonn Special Offers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Exclusive Travel Offers & Deals | Racoonn',
    description: 'Save on your next hotel stay or holiday package with exclusive promo codes.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function OffersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
