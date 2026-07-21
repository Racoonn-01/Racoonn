"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Hotel } from '@/data/mockHotels';
import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';
import { useState, useEffect } from 'react';

export default function PopularStays() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [properties, setProperties] = useState<Hotel[]>([]);

  useEffect(() => {
    async function loadProperties() {
      const data = await getProperties();
      if (data && data.length > 0) {
        const mappedProperties: Hotel[] = data.map((doc: { $id: string; propertyName?: string; title?: string; location?: string; city?: string; state?: string; rating?: number; reviewsCount?: number; price?: number; photos?: string[]; status?: string }) => ({
          id: doc.$id,
          name: doc.propertyName || doc.title || 'Unknown Property',
          location: doc.location || `${doc.city || ''}, ${doc.state || ''}`,
          rating: doc.rating || 0,
          reviews: doc.reviewsCount || 0,
          price: doc.price || 0,
          image: (doc.photos && doc.photos[0]) ? doc.photos[0] : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
          status: doc.status?.toLowerCase(),
        }));
        setProperties(mappedProperties);
      }
    }
    loadProperties();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -300 : 300;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-4 py-12 relative group">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-brand-navy font-heading">Explore popular stays</h2>
        <Link href="/search" className="text-brand-coral font-medium flex items-center hover:underline">
          View all <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      {/* Cards Container */}
      <div className="relative mb-8 group/carousel">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {properties.filter(isActiveProperty).map((stay) => {
            const isSaved = savedHotelIds.includes(stay.id);
            return (
              <Link href={`/property/${stay.id}`} key={stay.id} className="w-full min-w-full md:w-auto md:min-w-72 shrink-0 bg-white rounded-2xl p-3 shadow-[0_2px_15px_rgb(0,0,0,0.05)] border border-brand-sky/30 group/card cursor-pointer transition-transform hover:-translate-y-1 snap-center md:snap-start flex flex-col h-full">
                {/* Image */}
                <div className="relative w-full h-48 shrink-0 rounded-xl overflow-hidden mb-4">
                  <Image
                    src={stay.image}
                    alt={stay.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSavedHotel(stay.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-brand-charcoal hover:text-brand-coral transition-colors"
                  >
                    <Heart size={16} className={isSaved ? "fill-brand-coral text-brand-coral" : ""} />
                  </button>
                </div>

                {/* Info */}
                <div className="px-1 pb-1 flex flex-col flex-1">
                  <h3 className="font-bold text-brand-navy mb-1 line-clamp-1">{stay.name}</h3>
                  <div className="flex justify-between items-center mt-auto pt-1 gap-2">
                    <p className="text-sm text-brand-charcoal/60 truncate" title={stay.location}>{stay.location}</p>
                    <div className="flex items-center text-sm font-bold text-brand-coral shrink-0 ml-2">
                      <span className="mr-1">★</span> {stay.rating > 0 ? stay.rating : 'New'}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-[40%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/30 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-[40%] translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/30 opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
