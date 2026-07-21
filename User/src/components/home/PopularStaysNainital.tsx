"use client";

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronRight, Star } from 'lucide-react';
import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';

const nainitalStays = [
  {
    id: 'n1',
    title: 'The Naini Retreat',
    location: 'Ayarpatta, Nainital',
    details: 'Heritage hotel near Naini Lake • 1 Bed',
    price: '₹12,500',
    rating: '4.8',
    reviews: 320,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n2',
    title: 'Shervani Hilltop',
    location: 'Mallital, Nainital',
    details: 'Boutique resort surrounded by nature',
    price: '₹9,800',
    rating: '4.7',
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
    status: 'pending',
  },
  {
    id: 'n3',
    title: 'Manu Maharani',
    location: 'Mallital, Nainital',
    details: 'Luxury stay with panoramic valley views',
    price: '₹15,000',
    rating: '4.9',
    reviews: 450,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n4',
    title: 'Lake View Villa',
    location: 'Tallital, Nainital',
    details: 'Cozy stay right by the iconic lake',
    price: '₹6,500',
    rating: '4.5',
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n5',
    title: 'Ayar Jungle Resort',
    location: 'Ayarpatta, Nainital',
    details: 'Eco-friendly wooden cottages in the forest',
    price: '₹5,200',
    rating: '4.6',
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=800&auto=format&fit=crop',
  }
];

export default function PopularStaysNainital() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState(nainitalStays);

  useEffect(() => {
    async function loadProperties() {
      const data = await getProperties();
      if (data && data.length > 0) {
        // Filter by location/city 'Nainital'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nainitalProps = data.filter((doc: any) => 
          (doc.city && doc.city.toLowerCase().includes('nainital')) || 
          (doc.location && doc.location.toLowerCase().includes('nainital'))
        );
        
        if (nainitalProps.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedProperties = nainitalProps.map((doc: any) => ({
            id: doc.$id,
            title: doc.propertyName || doc.title || 'Unknown Property',
            location: doc.location || `${doc.city || ''}, ${doc.state || ''}`,
            details: doc.description || doc.details || '',
            rating: doc.rating || 'New',
            reviews: doc.reviewsCount || 0,
            price: `₹${doc.price || 0}`,
            image: (doc.photos && doc.photos[0]) ? doc.photos[0] : 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop',
            status: doc.status?.toLowerCase(),
          }));
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
              <div className="flex flex-col flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-[15px] text-gray-900 pr-2 line-clamp-2">{stay.title}</h3>
                  <div className="flex items-center gap-1 text-[14px] font-medium shrink-0 ml-2">
                    <Star size={13} className="fill-gray-900 text-gray-900" />
                    {Number(stay.rating) > 0 ? stay.rating : 'New'} <span className="text-gray-500 font-normal">({stay.reviews})</span>
                  </div>
                </div>
                <p className="text-[14px] text-gray-500 truncate mt-0.5">{stay.location}</p>
                <p className="text-[14px] text-gray-500 line-clamp-2">{stay.details}</p>
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
