import React from 'react';
import Link from 'next/link';
import { getProperties } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/config';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to fetch CMS packages securely on the server
async function getCMSPackages() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
  const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
  const DOC_ID = "cms_packages_v1";
  const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/packages_cms.json";

  try {
    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, DOC_ID);
    return doc.details ? JSON.parse(doc.details) : [];
  } catch (err) {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(SHARED_FILE_PATH, "utf-8"));
      } catch (fileErr) {}
    }
    return [];
  }
}

export default async function SitemapPage() {
  const properties = await getProperties();
  const rawPackages = await getCMSPackages();
  // Filter only published packages if needed, or show all
  const packages = rawPackages.filter((p: any) => p.status === 'published');

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Site Map</h1>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Properties ({properties.length})</h2>
          {properties.length === 0 ? (
            <p className="text-gray-500">No properties found.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-brand-coral">
              {properties.map((property) => (
                <li key={property.$id}>
                  <Link href={`/property/${property.$id}`} className="hover:underline">
                    {property.propertyName || property.title || 'Unnamed Property'} - {property.city || property.state ? `${property.city || ''}, ${property.state || ''}` : 'Location unknown'}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Packages ({packages.length})</h2>
          {packages.length === 0 ? (
            <p className="text-gray-500">No packages found.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-2 text-brand-coral">
              {packages.map((pkg: any) => (
                <li key={pkg.id}>
                  <Link href={`/packages/${pkg.id}`} className="hover:underline">
                    {pkg.title || 'Unnamed Package'} - {pkg.destination}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
