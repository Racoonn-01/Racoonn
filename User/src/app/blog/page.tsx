import React from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Calendar, Clock, Map, TrendingUp, Compass, Newspaper, Mail, Eye } from 'lucide-react';
import Image from 'next/image';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import RealtimeViews from './RealtimeViews';

export const metadata = {
  title: 'Blog | Racoonn',
  description: 'Travel tips, destination guides, and hospitality insights from Racoonn.',
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "blogs";

async function getPublishedBlogs() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("status", "Published"),
        Query.orderDesc("$createdAt")
      ]
    );
    return response.documents;
  } catch (error) {
    console.error("Failed to fetch blogs from Appwrite", error);
    return [];
  }
}

const BASE_CATEGORIES = [
  { name: 'Travel Guide', icon: Map },
  { name: 'Destinations', icon: Map },
  { name: 'Hotel Trends', icon: TrendingUp },
  { name: 'Travel Tips', icon: Compass },
  { name: 'Racoonn News', icon: Newspaper },
];

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();
  
  // Calculate dynamic category counts
  const categoryCounts: Record<string, number> = {};
  blogs.forEach(blog => {
    if (blog.category) {
      categoryCounts[blog.category] = (categoryCounts[blog.category] || 0) + 1;
    }
  });

  // Combine base categories with their counts, and add any new ones
  const dynamicCategories = BASE_CATEGORIES.map(cat => ({
    ...cat,
    count: categoryCounts[cat.name] || 0
  }));

  // Add any categories from DB that aren't in BASE_CATEGORIES
  Object.keys(categoryCounts).forEach(catName => {
    if (!BASE_CATEGORIES.some(c => c.name === catName)) {
      dynamicCategories.push({
        name: catName,
        count: categoryCounts[catName],
        icon: Newspaper // Default icon for unknown categories
      });
    }
  });
  
  // Sort categories by count (descending)
  dynamicCategories.sort((a, b) => b.count - a.count);

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const regularPosts = blogs.length > 1 ? blogs.slice(1) : [];
  
  // For the popular posts widget, just show the first 4 for now
  const popularPosts = blogs.slice(0, 4);

  return (
    <div className="min-h-screen bg-white font-inter text-slate-800">
      
      {/* Hero Section with Background Image */}
      <div className="relative h-[400px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=2000" 
            alt="Cabin by the lake"
            fill
            className="object-cover brightness-[0.65]"
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-white pt-10">
          <div className="flex items-center justify-center gap-2 text-sm font-medium mb-6 text-white">
            <span>Home</span>
            <ChevronRight size={14} className="opacity-70 text-white" />
            <span className="text-white/70">Blog</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Racoonn Blog</h1>
          <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">
            Travel tips, destination guides, hotel trends, and everything you need for the perfect stay.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-12 pr-4 py-3.5 rounded-lg text-slate-800 placeholder:text-slate-400 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#F07B75]"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column - Articles */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937]">Latest Articles</h2>
            <select className="border border-slate-200 rounded-md px-3 py-1.5 text-sm text-slate-600 bg-white outline-none focus:border-[#F07B75]">
              <option>Most Recent</option>
              <option>Popular</option>
            </select>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p>No blog posts published yet.</p>
            </div>
          ) : (
            <>
              {/* Featured Post Card */}
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`} className="block mb-8 group">
                  <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col md:flex-row h-auto md:h-[300px] transition-transform duration-300 group-hover:-translate-y-1">
                    <div className="md:w-1/2 relative h-[250px] md:h-full bg-slate-100">
                      <Image 
                        src={(featuredPost.images && featuredPost.images.length > 0) ? featuredPost.images[0] : (featuredPost.imageId || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200")} 
                        alt={featuredPost.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-[#F07B75] text-white px-3 py-1 rounded text-xs font-bold tracking-wide">
                        FEATURED
                      </div>
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <span className="text-[#F07B75] text-xs font-bold tracking-wider mb-3">{featuredPost.category}</span>
                      <h3 className="text-2xl font-bold text-[#1F2937] mb-4 leading-snug group-hover:text-[#F07B75] transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-6 text-xs text-slate-400 font-medium mt-auto">
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {featuredPost.date}</span>
                        <div className="flex flex-col gap-1.5">
                          <RealtimeViews documentId={featuredPost.$id} initialViews={featuredPost.views || 0} iconSize={14} />
                          <span className="flex items-center gap-1.5"><Clock size={14} /> {featuredPost.readTime || '5 min read'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid of smaller posts */}
              {regularPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post: any) => (
                    <Link href={`/blog/${post.slug}`} key={post.$id} className="group block">
                      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-hidden border border-slate-100 flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1">
                        <div className="h-[180px] relative overflow-hidden bg-slate-100">
                          <Image 
                            src={(post.images && post.images.length > 0) ? post.images[0] : (post.imageId || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800")} 
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <span className="text-[#F07B75] text-[10px] font-bold tracking-wider mb-2 uppercase">{post.category}</span>
                          <h4 className="text-[17px] font-bold text-[#1F2937] mb-2 leading-snug line-clamp-2 group-hover:text-[#F07B75] transition-colors">
                            {post.title}
                          </h4>
                          <p className="text-slate-500 text-xs leading-relaxed mb-6 line-clamp-3">
                            {post.excerpt}
                          </p>
                          <div className="mt-auto flex flex-col gap-1.5 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                            <RealtimeViews documentId={post.$id} initialViews={post.views || 0} iconSize={12} />
                            <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime || '5 min read'}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-10 text-center">
                <button className="border border-[#F07B75] text-[#F07B75] hover:bg-[#F07B75] hover:text-white transition-colors px-8 py-2.5 rounded text-sm font-semibold">
                  Load More Articles
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-8 mt-12 lg:mt-0">
          
          {/* Categories Widget */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-6">
            <h3 className="text-[19px] font-bold text-[#1F2937] mb-6">Categories</h3>
            <ul className="space-y-4">
              {dynamicCategories.map((cat, i) => (
                <li key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <cat.icon size={18} className="text-[#F07B75] opacity-80" />
                    {cat.name}
                  </div>
                  <span className="bg-[#F07B75]/10 text-[#F07B75] text-xs font-bold px-2 py-0.5 rounded-md">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Posts Widget */}
          <div className="bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100 p-6">
            <h3 className="text-[19px] font-bold text-[#1F2937] mb-6">Popular Posts</h3>
            <div className="space-y-5">
              {popularPosts.length > 0 ? popularPosts.map((post: any) => (
                <Link href={`/blog/${post.slug}`} key={post.$id} className="flex gap-4 items-center group">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                    <Image 
                      src={(post.images && post.images.length > 0) ? post.images[0] : (post.imageId || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200")} 
                      alt={post.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-[#1F2937] leading-snug line-clamp-2 mb-1 group-hover:text-[#F07B75] transition-colors">
                      {post.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">{post.date}</span>
                  </div>
                </Link>
              )) : (
                <p className="text-sm text-slate-500">No popular posts yet.</p>
              )}
            </div>
          </div>

          {/* Newsletter Widget */}
          <div className="bg-[#F07B75] rounded-xl p-8 text-white text-center">
            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center mx-auto mb-4">
              <Mail size={22} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Stay Updated!</h3>
            <p className="text-white/90 text-sm mb-6 leading-relaxed px-2">
              Subscribe to our newsletter and get the latest travel tips and exclusive offers straight to your inbox.
            </p>
            <form className="space-y-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-3 rounded bg-white text-slate-800 placeholder:text-slate-400 outline-none text-sm"
              />
              <button 
                type="button" 
                className="w-full bg-[#1F2937] hover:bg-slate-900 text-white font-bold py-3 rounded text-sm transition-colors"
              >
                Subscribe Now
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
