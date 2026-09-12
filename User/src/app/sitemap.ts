import { MetadataRoute } from 'next';
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
  } catch {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(SHARED_FILE_PATH, "utf-8"));
      } catch {}
    }
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Get dynamic data
  const properties = await getProperties();
  const rawPackages = await getCMSPackages();
  const packages = rawPackages.filter((p: { status: string }) => p.status === 'published');

  // Define static core routes
  const staticRoutes = [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/search`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/packages`, lastModified: new Date() },
  ];

  // Map dynamic property routes
  const propertyRoutes = properties.map((property) => ({
    url: `${baseUrl}/property/${property.$id}`,
    lastModified: new Date(property.$updatedAt || property.$createdAt || new Date()),
  }));

  // Map dynamic package routes
  const packageRoutes = packages.map((pkg: { id: string }) => ({
    url: `${baseUrl}/packages/${pkg.id}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...propertyRoutes, ...packageRoutes];
}
