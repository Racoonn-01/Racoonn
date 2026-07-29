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

interface NainitalProperty {
  id: string;
  title: string;
  location: string;
  details: string;
  price: string;
  rating: string;
  reviews: number;
  image: string;
  status?: string;
}

const nainitalStays: NainitalProperty[] = [
  {
    id: 'n1',
    title: 'The Naini Retreat',
    location: 'Ayarpatta, Nainital',
    details: 'Heritage hotel with panoramic lake views',
    price: '₹9,500',
    rating: '4.7',
    reviews: 530,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    status: 'active',
  },
  {
    id: 'n2',
    title: 'Manu Maharani Resort',
    location: 'Mallital, Nainital',
    details: 'Luxury stay close to the Naini Lake',
    price: '₹11,000',
    rating: '4.8',
    reviews: 410,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800&auto=format&fit=crop',
    status: 'active',
  },
  {
    id: 'n3',
    title: 'Shervani Hilltop',
    location: 'Mallital, Nainital',
    details: 'Boutique resort surrounded by lush flora',
    price: '₹8,400',
    rating: '4.6',
    reviews: 380,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
    status: 'active',
  },
  {
    id: 'n4',
    title: 'Balrampur House',
    location: 'Mallital, Nainital',
    details: 'Royal summer palace experience',
    price: '₹7,800',
    rating: '4.5',
    reviews: 260,
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop',
    status: 'active',
  }
];

export default function PopularStaysNainital() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<NainitalProperty[]>(nainitalStays);

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

        const nainitalProps = data.filter((d: Models.Document) => {
          const doc = d as unknown as Record<string, unknown>;
          const city = String(doc.city || '').toLowerCase();
          const location = String(doc.location || '').toLowerCase();
          return city.includes('nainital') || location.includes('nainital');
        });
        
        if (nainitalProps.length > 0) {
          const mappedProperties = nainitalProps.map((d: Models.Document) => {
            const doc = d as unknown as Record<string, unknown>;
            const rawPrice = Number(doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || roomsMap[String(doc.$id)] || 0);
            const displayPrice = rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : '₹5,500';
            const photos = Array.isArray(doc.photos) ? doc.photos : [];

            return {
              id: String(doc.$id || ''),
              title: String(doc.propertyName || doc.title || 'Unknown Property'),
              location: String(doc.location || `${doc.city || ''}, ${doc.state || ''}`),
              details: String(doc.description || doc.details || ''),
              rating: doc.rating ? String(doc.rating) : 'New',
              reviews: Number(doc.reviewsCount || 0),
              price: displayPrice,
              image: photos[0] ? String(photos[0]) : 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop',
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
          <h2 className="text-2xl font-bold text-brand-navy font-heading">Popular Stays in Nainital</h2>
          <p className="text-gray-500 mt-1">Discover highly rated properties with beautiful views.</p>
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
