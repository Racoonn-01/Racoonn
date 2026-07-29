"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, Star } from 'lucide-react';
import { databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';

import { Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const dehradunStays = [
  {
    id: 'd1',
    title: 'The Solitaire',
    location: 'Haridwar Bypass, Dehradun',
    details: 'Premium stay with pool and fine dining',
    price: '₹6,500',
    rating: '4.5',
    reviews: 412,
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'd2',
    title: 'Regenta LP Vilas',
    location: 'Nanda Ki Chowki, Dehradun',
    details: 'Luxury heritage hotel featuring royal architecture',
    price: '₹8,200',
    rating: '4.8',
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'd3',
    title: 'Seyfert Sarovar Premiere',
    location: 'ISBT, Dehradun',
    details: 'Modern upscale stay in the heart of the city',
    price: '₹7,500',
    rating: '4.6',
    reviews: 290,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'd4',
    title: 'Ramada by Wyndham',
    location: 'Chakrata Road, Dehradun',
    details: 'Comfortable stay with stunning city views',
    price: '₹10,200',
    rating: '4.7',
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c0d5e9af?q=80&w=800&auto=format&fit=crop',
    status: 'draft',
  },
  {
    id: 'd5',
    title: 'Vishranti A Doon Valley Retreat',
    location: 'Prem Nagar, Dehradun',
    details: 'Exclusive jungle resort away from the hustle',
    price: '₹14,000',
    rating: '4.9',
    reviews: 150,
    image: 'https://images.unsplash.com/photo-1501117716987-c8c394bb29df?q=80&w=800&auto=format&fit=crop',
  }
];

export default function PopularStaysDehradun() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState(dehradunStays);

  useEffect(() => {
    async function loadProperties() {
      const data = await getProperties();
      if (data && data.length > 0) {
        // Fetch rooms for room price mapping
        const roomsMap: Record<string, number> = {};
        try {
          const roomColId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';
          const roomsRes = await databases.listDocuments(DATABASE_ID, roomColId, [Query.limit(500)]);
          roomsRes.documents.forEach((d: Models.Document) => {
            const room = d as unknown as Record<string, unknown>;
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

        const dehradunProps = data.filter((d: Models.Document) => {
          const doc = d as unknown as Record<string, unknown>;
          const city = String(doc.city || '').toLowerCase();
          const location = String(doc.location || '').toLowerCase();
          return city.includes('dehradun') || city.includes('haldwani') || location.includes('dehradun') || location.includes('haldwani');
        });
        
        if (dehradunProps.length > 0) {
          const mappedProperties = dehradunProps.map((d: Models.Document) => {
            const doc = d as unknown as Record<string, unknown>;
            const rawPrice = Number(doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || roomsMap[String(doc.$id)] || 0);
            const displayPrice = rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : '₹4,500';
            const photos = Array.isArray(doc.photos) ? doc.photos : [];

            return {
              id: String(doc.$id || ''),
              title: String(doc.propertyName || doc.title || 'Unknown Property'),
              location: String(doc.location || `${doc.city || ''}, ${doc.state || ''}`),
              details: String(doc.description || doc.details || ''),
              rating: doc.rating ? String(doc.rating) : 'New',
              reviews: Number(doc.reviewsCount || 0),
              price: displayPrice,
              image: photos[0] ? String(photos[0]) : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
              status: typeof doc.status === 'string' ? doc.status.toLowerCase() : undefined,
            };
          });
          setProperties(mappedProperties);
        }
      }
    }
    loadProperties();
  }, []);

  return (
    <section className="container mx-auto px-4 py-12 relative group">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-brand-navy font-heading">Popular Stays in Dehradun</h2>
          <p className="text-gray-500 mt-1">Experience the best retreats and heritage stays in the Doon Valley.</p>
        </div>
        <Link href="/search" className="text-brand-coral font-medium flex items-center hover:underline whitespace-nowrap">
          View all <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      {/* Cards Container */}
      <div className="relative mb-8 group/carousel">
        <div 
          ref={scrollContainerRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-4"
        >
          {properties.filter(isActiveProperty).slice(0, 4).map((stay) => (
            <Link href={`/property/${stay.id}`} key={stay.id} className="w-full group/card cursor-pointer flex flex-col h-full">
              {/* Image */}
              <div className="relative w-full aspect-4/3 shrink-0 rounded-2xl overflow-hidden mb-3 bg-gray-200">
                <Image
                  src={stay.image}
                  alt={stay.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-3 right-3 text-white hover:scale-110 transition-transform z-10">
                  <Heart 
                    size={24} 
                    className="fill-black/30 text-white" 
                    strokeWidth={2}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start min-w-0">
                  <h3 className="font-semibold text-[15px] text-gray-900 pr-2 line-clamp-1 flex-1 min-w-0">{stay.title}</h3>
                  <div className="flex items-center gap-1 text-[14px] font-medium shrink-0 ml-2">
                    <Star size={13} className="fill-gray-900 text-gray-900" />
                    {Number(stay.rating) > 0 ? stay.rating : 'New'} <span className="text-gray-500 font-normal">({stay.reviews})</span>
                  </div>
                </div>
                <p className="text-[14px] text-gray-500 truncate mt-0.5 w-full">{stay.location}</p>
                <p className="text-[14px] text-gray-500 line-clamp-2 w-full">{stay.details}</p>
                <div className="mt-auto pt-2 flex items-baseline gap-1">
                  <span className="text-[15px] font-semibold text-gray-900">{stay.price}</span>
                  <span className="text-[14px] text-gray-900">per night</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
