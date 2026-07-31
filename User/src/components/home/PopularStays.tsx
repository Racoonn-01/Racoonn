"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Hotel } from '@/data/mockHotels';
import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/config';
import { Query, Models } from 'appwrite';

import { PropertyCardSkeleton } from '@/components/skeletons/PageSkeletons';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963';

export default function PopularStays() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const [properties, setProperties] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      const data = await getProperties();
      if (data && data.length > 0) {
        // Fetch rooms for room price mapping
        const roomsMap: Record<string, number> = {};
        try {
          const roomColId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';
          const roomsRes = await databases.listDocuments(DATABASE_ID, roomColId, [Query.limit(500)]);
          roomsRes.documents.forEach((room: Models.Document & Record<string, unknown>) => {
            const pId = room.propertyId as string;
            const p = Number(room.price || room.roomPrice || room.basePrice || 0);
            if (pId && p > 0) {
              if (!roomsMap[pId] || p < roomsMap[pId]) {
                roomsMap[pId] = p;
              }
            }
          });
        } catch (e) {
          console.error("Could not fetch rooms for price mapping:", e);
        }

        const mappedProperties: Hotel[] = data.map((d: Models.Document) => {
          const doc = d as unknown as Record<string, unknown>;
          const rawPrice = Number(doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || roomsMap[String(doc.$id)] || 0);
          const photos = Array.isArray(doc.photos) ? doc.photos : [];
          return {
            id: String(doc.$id || ''),
            name: String(doc.propertyName || doc.title || 'Unknown Property'),
            location: String(doc.location || `${doc.city || ''}, ${doc.state || ''}`),
            rating: Number(doc.rating || 0),
            reviews: Number(doc.reviewsCount || 0),
            price: rawPrice > 0 ? rawPrice : 3500,
            image: photos[0] ? String(photos[0]) : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
            status: typeof doc.status === 'string' ? doc.status.toLowerCase() : undefined,
          };
        });
        setProperties(mappedProperties);
      } else {
        setProperties([]);
      }
      setLoading(false);
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

  const activeStays = properties.filter(isActiveProperty);

  return (
    <section className="container mx-auto px-4 py-12 relative group">
      {/* Header with Smooth Animation */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center mb-8"
      >
        <h2 className="text-2xl font-bold text-brand-navy font-heading">Explore popular stays</h2>
        <Link href="/search" className="text-brand-coral font-medium flex items-center hover:underline group/link">
          View all <ChevronRight size={16} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
        </Link>
      </motion.div>

      {/* Cards Container */}
      <div className="relative mb-8 group/carousel">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="w-72 sm:w-80 min-w-72 sm:min-w-80 max-w-72 sm:max-w-80 shrink-0">
                <PropertyCardSkeleton />
              </div>
            ))
          ) : (
            activeStays.map((stay, index) => {
              const isSaved = savedHotelIds.includes(stay.id);
              return (
                <motion.div
                  key={stay.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                  className="w-72 sm:w-80 min-w-72 sm:min-w-80 max-w-72 sm:max-w-80 shrink-0"
                >
                  <Link 
                    href={`/property/${stay.id}`} 
                    className="bg-white rounded-2xl p-3 shadow-[0_2px_15px_rgb(0,0,0,0.05)] border border-brand-sky/30 group/card cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg snap-center md:snap-start flex flex-col h-full overflow-hidden w-full"
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 shrink-0 rounded-xl overflow-hidden mb-4 bg-gray-100">
                      <Image
                        src={stay.image}
                        alt={stay.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSavedHotel(stay.id);
                        }}
                        className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center shadow-md text-brand-charcoal hover:scale-110 active:scale-95 transition-all z-10"
                      >
                        <Heart size={16} className={isSaved ? "fill-brand-coral text-brand-coral" : ""} />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="px-1 pb-1 flex flex-col flex-1 min-w-0">
                      <h3 className="font-bold text-brand-navy mb-1 line-clamp-1 group-hover/card:text-brand-coral transition-colors" title={stay.name}>
                        {stay.name}
                      </h3>
                      <div className="flex justify-between items-center mt-auto pt-1 gap-2 min-w-0">
                        <p className="text-sm text-brand-charcoal/60 truncate flex-1 min-w-0" title={stay.location}>{stay.location}</p>
                        <div className="flex items-center text-sm font-bold text-brand-coral shrink-0 ml-2">
                          <span className="mr-1">★</span> {stay.rating > 0 ? stay.rating : 'New'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Navigation Buttons */}
        <button 
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-[40%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-[40%] translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full hidden md:flex items-center justify-center shadow-[0_4px_20px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/30 opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
