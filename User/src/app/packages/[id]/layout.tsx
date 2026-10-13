import { Metadata } from 'next';
import { databases } from '@/lib/appwrite/config';
import { packages as fallbackPackages } from '@/data/packages';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

async function getPackageData(id: string) {
  try {
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
    const DOC_ID = "cms_packages_v1";

    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOC_ID);
    if (doc?.details) {
      const list = JSON.parse(doc.details);
      if (Array.isArray(list)) {
        const found = list.find((p: any) => String(p.id) === String(id));
        if (found) return found;
      }
    }
  } catch {}

  const fallback = fallbackPackages.find((p: any) => String(p.id) === String(id));
  return fallback || null;
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const pkg = await getPackageData(id);

  if (!pkg) {
    return {
      title: 'Holiday Package Details | Racoonn',
      description: 'Explore curated holiday tour packages across India with Racoonn.',
    };
  }

  const title = `${pkg.title} - Holiday Package in ${pkg.location || 'India'}`;
  const description = (pkg.overview || pkg.description || `Book ${pkg.title} with Racoonn. Duration: ${pkg.duration || 'Flexible'}. Custom departure cities, hotel stays, meals, and sightseeing included.`).substring(0, 160);
  const canonicalUrl = `${siteUrl}/packages/${id}`;
  const imageUrl = (pkg.images && pkg.images.length > 0) ? pkg.images[0] : `${siteUrl}/icon.jpg`;

  return {
    title,
    description,
    keywords: [
      pkg.title,
      `${pkg.location || 'India'} tour package`,
      'holiday packages',
      'group travel package',
      'Racoonn packages',
      'sightseeing tour',
      'vacation booking',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${pkg.title} | Racoonn Holiday Packages`,
      description,
      url: canonicalUrl,
      siteName: 'Racoonn',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: pkg.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pkg.title} | Racoonn`,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PackageDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const pkg = await getPackageData(resolvedParams.id);

  let schemaData = null;
  if (pkg) {
    const rawPrice = pkg.price ? Number(String(pkg.price).replace(/[^\d.]/g, '')) : undefined;
    schemaData = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      name: pkg.title,
      description: pkg.overview || pkg.description || pkg.title,
      touristType: "Traveler",
      image: (pkg.images && pkg.images.length > 0) ? pkg.images : undefined,
      provider: {
        "@type": "TravelAgency",
        name: "Racoonn",
        url: siteUrl,
        logo: `${siteUrl}/icon.jpg`,
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        ...(rawPrice && !isNaN(rawPrice) ? { price: rawPrice } : {}),
        availability: "https://schema.org/InStock",
        url: `${siteUrl}/packages/${resolvedParams.id}`,
      },
      ...(pkg.rating ? {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: pkg.rating,
          reviewCount: pkg.reviews || 1,
          bestRating: "5",
          worstRating: "1",
        }
      } : {}),
      ...(Array.isArray(pkg.itinerary) && pkg.itinerary.length > 0 ? {
        itinerary: pkg.itinerary.map((day: any, idx: number) => ({
          "@type": "Day",
          name: day.title || `Day ${idx + 1}`,
          description: day.description || day.activities || `Day ${idx + 1} of ${pkg.title}`,
        }))
      } : {})
    };
  }

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      {children}
    </>
  );
}
