import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: 'Contact Us | 24/7 Travel & Booking Support',
  description: 'Need help with your hotel booking or tour package? Reach out to Racoonn customer support via phone at +91 8954442144 or email info@racoonn.com.',
  keywords: [
    'contact Racoonn',
    'customer care number',
    'hotel booking help',
    'travel support India',
    'Racoonn phone number',
  ],
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: 'Contact Customer Support | Racoonn',
    description: 'Get in touch with the Racoonn team for booking assistance, partnership queries, and customer care.',
    url: `${siteUrl}/contact`,
    siteName: 'Racoonn',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: 'Contact Racoonn',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Customer Support | Racoonn',
    description: 'Get in touch with the Racoonn team for booking assistance and customer care.',
    images: [`${siteUrl}/icon.jpg`],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
