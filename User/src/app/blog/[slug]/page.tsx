import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Calendar, Clock, ArrowLeft, Share2, Eye } from 'lucide-react';
import { notFound } from 'next/navigation';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import ViewTracker from './ViewTracker';

export const metadata = {
  title: 'Blog Post | Racoonn',
};

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "blogs";

async function getBlogPostBySlug(slug: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal("slug", slug),
        Query.equal("status", "Published"),
        Query.limit(1)
      ]
    );
    return response.documents.length > 0 ? response.documents[0] : null;
  } catch (error) {
    console.error("Failed to fetch blog post", error);
    return null;
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white font-inter text-slate-800 pb-20">
      <ViewTracker documentId={post.$id} currentViews={post.views || 0} />
      
      {/* Hero Section */}
      <div className="relative min-h-[450px] h-auto flex flex-col justify-end bg-slate-800 pt-24 pb-8 md:pt-0 md:pb-0 md:h-[450px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src={(post.images && post.images.length > 0) ? post.images[0] : (post.imageId || "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=1200")} 
            alt={post.title}
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        
        {/* Breadcrumb - Absolute Top */}
        <div className="absolute top-6 md:top-10 w-full z-20 px-6">
          <div className="max-w-[800px] mx-auto flex items-center gap-2 text-xs md:text-sm font-medium text-white/90 flex-wrap">
            <Link href="/" className="hover:text-white shrink-0">Home</Link>
            <ChevronRight size={14} className="opacity-70 shrink-0" />
            <Link href="/blog" className="hover:text-white shrink-0">Blog</Link>
            <ChevronRight size={14} className="opacity-70 shrink-0" />
            <span className="text-white opacity-70 truncate max-w-[120px] md:max-w-[200px]">{post.category}</span>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-[800px] mx-auto px-6 md:pb-12 text-white">
          <div className="bg-[#F07B75] text-white px-3 py-1 rounded text-[10px] md:text-xs font-bold tracking-wide inline-block mb-4 md:mb-6 uppercase">
            {post.category}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-white shadow-sm drop-shadow-sm">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-xs md:text-sm text-white/90 font-medium">
            <span className="flex items-center gap-1.5 md:gap-2"><Calendar size={14} className="md:w-4 md:h-4" /> {post.date}</span>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="flex items-center gap-1.5 md:gap-2"><Eye size={14} className="md:w-4 md:h-4" /> {post.views || 0} views</span>
            <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-white/50"></span>
            <span className="flex items-center gap-1.5 md:gap-2"><Clock size={14} className="md:w-4 md:h-4" /> {post.readTime || '5 min read'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10 pb-10 border-b border-slate-100">
          <Link href="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#F07B75] transition-colors font-medium">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-2">
              <Share2 size={16} /> Share
            </span>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#F07B75] hover:text-white flex items-center justify-center transition-all text-xs font-bold text-slate-500 hover:text-white">FB</a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#F07B75] hover:text-white flex items-center justify-center transition-all text-xs font-bold text-slate-500 hover:text-white">TW</a>
            <a href="#" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-[#F07B75] hover:text-white flex items-center justify-center transition-all text-xs font-bold text-slate-500 hover:text-white">IN</a>
          </div>
        </div>

        <article className="prose prose-lg prose-slate prose-headings:text-[#1F2937] prose-headings:font-bold max-w-none break-words">
          {post.excerpt && (
            <p className="lead text-xl text-slate-600 font-medium mb-8">
              {post.excerpt}
            </p>
          )}
          
          {post.content ? (
             <div className="quill-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
             <p className="italic text-slate-400">This blog post has no content yet.</p>
          )}

          <style dangerouslySetInnerHTML={{__html: `
            .quill-content .ql-align-center { text-align: center; }
            .quill-content .ql-align-right { text-align: right; }
            .quill-content .ql-align-justify { text-align: justify; }
            .quill-content img { display: inline-block; }
            .quill-content img.ql-align-center { display: block; margin: 0 auto; }
            .quill-content img.ql-align-right { float: right; margin-left: 1rem; }
            .quill-content img.ql-align-left { float: left; margin-right: 1rem; }
            .quill-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; font-weight: 500; }
            .quill-content a:hover { color: #1d4ed8; text-decoration-thickness: 2px; }
          `}} />
        </article>

        {post.images && post.images.length > 1 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-[#1F2937] mb-6">Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.images.slice(1).map((url: string, index: number) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-sm">
                  <Image 
                    src={url}
                    alt={`${post.title} gallery image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
