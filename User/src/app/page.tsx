import { Metadata } from 'next';
import HeroSection from '@/components/home/HeroSection';
import PopularStays from '@/components/home/PopularStays';
import AnimatedSection from '@/components/shared/AnimatedSection';
import dynamic from 'next/dynamic';

const PopularDestinations = dynamic(() => import('@/components/home/PopularDestinations'), { ssr: true });
const TourPackages = dynamic(() => import('@/components/home/TourPackages'), { ssr: true });
const DynamicPopularStays = dynamic(() => import('@/components/home/DynamicPopularStays'), { ssr: true });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

export const metadata: Metadata = {
  title: "Racoonn - Book Boutique Hotels, Luxury Resorts & Holiday Tour Packages",
  description: "Explore verified stays, handpicked luxury resorts, cozy homestays, and curated all-inclusive holiday tour packages across India with Racoonn. Instant booking & best price guarantee.",
  keywords: [
    "hotel booking India",
    "luxury resorts",
    "Uttarakhand holiday packages",
    "homestays",
    "boutique hotels",
    "Racoonn stays",
    "vacation packages",
    "weekend trip booking",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Racoonn | Book Luxury Hotels, Resorts & Tour Packages",
    description: "Explore verified stays, handpicked luxury resorts, cozy homestays, and curated holiday tour packages across India.",
    url: siteUrl,
    siteName: "Racoonn",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteUrl}/icon.jpg`,
        width: 1200,
        height: 630,
        alt: "Racoonn Stays & Packages",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Racoonn | Book Luxury Hotels, Resorts & Tour Packages",
    description: "Explore verified stays, handpicked luxury resorts, and holiday packages across India.",
    images: [`${siteUrl}/icon.jpg`],
  },
};

const homeSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Racoonn",
      url: siteUrl,
      logo: `${siteUrl}/icon.jpg`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-8954442144",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Racoonn",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/search?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HeroSection />
      
      <AnimatedSection>
        <PopularStays />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <PopularDestinations />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <TourPackages />
      </AnimatedSection>
      
      <AnimatedSection delay={0.1}>
        <DynamicPopularStays />
      </AnimatedSection>
    </>
  );
}
