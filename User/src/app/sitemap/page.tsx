import { generatePropertySlug } from "@/lib/utils";
import React from 'react';
import Link from 'next/link';
import { getProperties } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import path from 'path';
import { 
  Home, 
  Building, 
  Package, 
  MapPin, 
  Compass, 
  Tag, 
  BookOpen, 
  Info, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Phone, 
  Heart, 
  User, 
  ExternalLink 
} from 'lucide-react';
import fs from 'fs';

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
  } catch (err) {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(SHARED_FILE_PATH, "utf-8"));
      } catch (fileErr) {}
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
      Query.limit(50)
    ]);
    return res.documents;
  } catch {
    return [];
  }
}

export default async function SitemapPage() {
  const properties = await getProperties();
  const rawPackages = await getCMSPackages();
  const blogs = await getPublishedBlogs();
  const cmsPublished = Array.isArray(rawPackages) ? rawPackages.filter((p: any) => p.status === 'published') : [];
  const packages = cmsPublished.length > 0 ? cmsPublished : fallbackPackages;

  const coreRoutes = [
    { title: "Home", href: "/", icon: Home, desc: "Racoonn official hotel and holiday booking homepage" },
    { title: "Search Hotels & Stays", href: "/search", icon: Building, desc: "Browse verified resorts, luxury stays, and villas" },
    { title: "Holiday Tour Packages", href: "/packages", icon: Package, desc: "Curated tour itineraries with custom quotes" },
    { title: "Popular Destinations", href: "/destinations", icon: MapPin, desc: "Top travel spots across Uttarakhand and India" },
    { title: "Activities & Tours", href: "/activities", icon: Compass, desc: "Adventure sports, sightseeing, and local experiences" },
    { title: "Special Offers & Deals", href: "/offers", icon: Tag, desc: "Exclusive discounts, coupons, and seasonal promos" },
    { title: "Travel Blog", href: "/blog", icon: BookOpen, desc: "Travel guides, itineraries, and expert packing tips" },
  ];

  const companyRoutes = [
    { title: "About Us", href: "/about", icon: Info, desc: "Our story, mission, and travel hospitality standards" },
    { title: "Contact Us", href: "/contact", icon: Phone, desc: "Get in touch with customer support and reservations" },
    { title: "Help Center & FAQs", href: "/help", icon: HelpCircle, desc: "Answers to common booking and cancellation questions" },
    { title: "Terms of Service", href: "/terms", icon: FileText, desc: "Platform terms, booking conditions, and policies" },
    { title: "Privacy Policy", href: "/privacy", icon: ShieldCheck, desc: "How we protect your personal and payment data" },
  ];

  const userRoutes = [
    { title: "Saved Stays (Wishlist)", href: "/wishlist", icon: Heart, desc: "View your saved properties and favorite hotels" },
    { title: "User Profile & Bookings", href: "/profile", icon: User, desc: "Manage account details, trips, and reservations" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-28 md:pt-36 pb-24 font-inter text-slate-800">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200/80 shadow-xs mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-coral bg-brand-coral/10 px-3 py-1 rounded-full inline-block mb-3">
            Navigation Index
          </span>
          <h1 className="text-3xl sm:text-4xl font-poppins font-bold text-brand-navy tracking-tight">
            Racoonn Site Map
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed max-w-2xl">
            Quick directory of all pages, verified hotels, curated holiday packages, travel guides, and platform resources.
          </p>
        </div>

        {/* Section 1: Main Platform Routes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mb-8">
          <h2 className="text-xl sm:text-2xl font-poppins font-bold text-brand-navy mb-5 flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-coral" /> Discovery & Core Pages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreRoutes.map((route, idx) => {
              const Icon = route.icon;
              return (
                <Link 
                  key={idx} 
                  href={route.href}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-coral/10 text-brand-coral flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-brand-navy group-hover:text-brand-coral transition-colors text-sm sm:text-base">
                      {route.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{route.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Company & Legal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-poppins font-bold text-brand-navy mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-coral" /> Company & Information
              </h2>
              <div className="space-y-3">
                {companyRoutes.map((route, idx) => {
                  const Icon = route.icon;
                  return (
                    <Link 
                      key={idx} 
                      href={route.href}
                      className="p-3 rounded-xl border border-gray-100 hover:border-brand-coral/30 hover:bg-brand-coral/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-coral transition-colors" />
                        <span className="font-semibold text-sm text-gray-800 group-hover:text-brand-coral transition-colors">
                          {route.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-poppins font-bold text-brand-navy mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-coral" /> Member & Account Pages
              </h2>
              <div className="space-y-3">
                {userRoutes.map((route, idx) => {
                  const Icon = route.icon;
                  return (
                    <Link 
                      key={idx} 
                      href={route.href}
                      className="p-3 rounded-xl border border-gray-100 hover:border-brand-coral/30 hover:bg-brand-coral/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-brand-coral transition-colors" />
                        <span className="font-semibold text-sm text-gray-800 group-hover:text-brand-coral transition-colors">
                          {route.title}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-coral opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Partner with us? <a href="https://partner.racoonn.com" target="_blank" rel="noopener noreferrer" className="text-brand-coral font-bold hover:underline">List your property on Vendor Portal &rarr;</a>
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Holiday Packages */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-poppins font-bold text-brand-navy flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-coral" /> Holiday Tour Packages ({packages.length})
            </h2>
            <Link href="/packages" className="text-xs font-bold text-brand-coral hover:underline">
              View All Packages &rarr;
            </Link>
          </div>
          {packages.length === 0 ? (
            <p className="text-gray-500 text-sm">No packages available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {packages.map((pkg: any) => (
                <Link
                  key={pkg.id}
                  href={`/packages/${pkg.id}`}
                  className="p-3 rounded-xl border border-gray-100 hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all group block text-left"
                >
                  <p className="font-bold text-sm text-gray-800 group-hover:text-brand-coral transition-colors truncate">
                    {pkg.title || 'Holiday Package'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {pkg.location || pkg.destination || 'India'} {pkg.duration ? `• ${pkg.duration}` : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Verified Hotels & Properties */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs mb-8">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
            <h2 className="text-xl sm:text-2xl font-poppins font-bold text-brand-navy flex items-center gap-2">
              <Building className="w-6 h-6 text-brand-coral" /> Verified Stays & Resorts ({properties.length})
            </h2>
            <Link href="/search" className="text-xs font-bold text-brand-coral hover:underline">
              Browse Search Map &rarr;
            </Link>
          </div>
          {properties.length === 0 ? (
            <p className="text-gray-500 text-sm">No properties available at this time.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {properties.map((property) => (
                <Link
                  key={property.$id}
                  href={`/property/${generatePropertySlug(property.$id, property.title || property.propertyName || "")}`}
                  className="p-3 rounded-xl border border-gray-100 hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all group block text-left"
                >
                  <p className="font-bold text-sm text-gray-800 group-hover:text-brand-coral transition-colors truncate">
                    {property.propertyName || property.title || 'Resort Stay'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {property.city || property.state ? `${property.city || ''}, ${property.state || ''}` : 'Uttarakhand, India'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Travel Blog Articles */}
        {blogs.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <h2 className="text-xl sm:text-2xl font-poppins font-bold text-brand-navy flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-brand-coral" /> Travel Guides & Blog Stories ({blogs.length})
              </h2>
              <Link href="/blog" className="text-xs font-bold text-brand-coral hover:underline">
                Visit Blog &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {blogs.map((blog: any) => (
                <Link
                  key={blog.$id}
                  href={`/blog/${blog.slug || blog.$id}`}
                  className="p-3 rounded-xl border border-gray-100 hover:border-brand-coral/40 hover:bg-brand-coral/5 transition-all group block text-left"
                >
                  <p className="font-bold text-sm text-gray-800 group-hover:text-brand-coral transition-colors truncate">
                    {blog.title || 'Travel Guide'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {blog.category || 'Travel Tips'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
