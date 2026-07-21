"use client";

import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export interface Property {
  id: string;
  images: string[];
  title: string;
  subtitle: string;
  details: string;
  dates: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  isSuperhost?: boolean;
  isGuestFavorite?: boolean;
  freeCancellation?: boolean;
  status?: string;
}

export default function PropertyCard({ property }: { property: Property }) {
  const { profile, toggleSavedHotel } = useAuthStore();
  const savedHotelIds = profile?.savedHotels || [];
  const isLiked = savedHotelIds.includes(property.id);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSavedHotel(property.id);
  };

  return (
    <Link href={`/property/${property.id}`} className="group flex flex-col gap-3">
      {/* Property Image */}
      <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-gray-200">
        <Image 
          src={property.images[0]} 
          alt={property.title} 
          fill 
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.isSuperhost && (
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[12px] font-bold text-gray-900 shadow-sm">
              Superhost
            </span>
          )}
          {property.isGuestFavorite && (
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[12px] font-bold text-brand-coral shadow-sm flex items-center gap-1">
              Guest favourite
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button 
          onClick={toggleLike}
          className="absolute top-3 right-3 text-white hover:scale-110 transition-transform z-10"
        >
          <Heart 
            size={24} 
            className={`transition-colors ${isLiked ? 'fill-brand-coral text-brand-coral' : 'fill-black/30 text-white'}`} 
            strokeWidth={isLiked ? 0 : 2}
          />
        </button>
      </div>

      {/* Details */}
      <div className="flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[15px] text-gray-900 truncate pr-4">{property.title}</h3>
          <div className="flex items-center gap-1 text-[14px] font-medium shrink-0">
            <Star size={13} className="fill-gray-900 text-gray-900" />
            {Number(property.rating) > 0 ? property.rating : 'New'} <span className="text-gray-500 font-normal">({property.reviews})</span>
          </div>
        </div>
        <p className="text-[14px] text-gray-500 truncate mt-0.5">{property.subtitle}</p>
        <p className="text-[14px] text-gray-500 truncate">{property.details}</p>
        <p className="text-[14px] text-gray-500 mt-0.5">{property.dates}</p>
        
        <div className="mt-2 flex items-baseline gap-1">
          {property.originalPrice && (
            <span className="text-[14px] text-gray-500 line-through">₹{property.originalPrice.toLocaleString()}</span>
          )}
          <span className="text-[15px] font-semibold text-gray-900">₹{property.price.toLocaleString()}</span>
          <span className="text-[14px] text-gray-900">for 5 nights</span>
        </div>
        {property.freeCancellation && (
          <p className="text-[13px] text-gray-500 mt-1">Free cancellation</p>
        )}
      </div>
    </Link>
  );
}
