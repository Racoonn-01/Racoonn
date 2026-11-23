import { generatePropertySlug } from "@/lib/utils";
import { MetadataRoute } from 'next';
import { getProperties } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/config';
import { packages as fallbackPackages } from '@/data/packages';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper to fetch CMS packages securely on the server
async function getCMSPackages() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
  const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
  const DOC_ID = "cms_packages_v1";
  const SHARED_FILE_PATH = path.join(process.cwd(), "packages_cms.json");

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

// Helper to fetch published blog articles
async function getPublishedBlogs() {
  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
  try {
    const res = await databases.listDocuments(DATABASE_ID, "blogs", [
      Query.equal("status", "Published"),
      Query.limit(100)
    ]);
    return res.documents;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://racoonn.com';

  // Get dynamic data
  const properties = await getProperties();
  const rawPackages = await getCMSPackages();
  const blogs = await getPublishedBlogs();
  
  // Combine CMS published packages with default packages
  const cmsPublished = Array.isArray(rawPackages) ? rawPackages.filter((p: any) => p.status === 'published') : [];
  const packagesList = cmsPublished.length > 0 ? cmsPublished : fallbackPackages;

  // Define static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/destinations`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/activities`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/offers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/help`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/sitemap`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  // Map dynamic property routes
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/property/${generatePropertySlug(property.$id, property.title || property.propertyName || "")}`,
    lastModified: new Date(property.$updatedAt || property.$createdAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Map dynamic package routes
  const packageRoutes: MetadataRoute.Sitemap = packagesList.map((pkg: any) => ({
    url: `${baseUrl}/packages/${pkg.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Map dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = blogs.map((blog: any) => ({
    url: `${baseUrl}/blog/${blog.slug || blog.$id}`,
    lastModified: new Date(blog.$updatedAt || blog.$createdAt || new Date()),
    changeFrequency: 'weekly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...propertyRoutes, ...packageRoutes, ...blogRoutes];
}
