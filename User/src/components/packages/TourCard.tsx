'use client';
import { optimizeAppwriteImage } from "@/lib/optimizeImage";

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, Clock, Utensils, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export interface TourCardPackage {
  id: string | number;
  title: string;
  location: string;
  duration: string;
  features: string;
  price: string;
  badge: string;
  badgeColor: string;
  images: string[];
  departureCityName?: string;
  departureCitiesCount?: number;
}

export default function TourCard({ pkg }: { pkg: TourCardPackage }) {
  return (
    <div 
      className="w-full h-full bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden group/card hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-shadow duration-300 flex flex-col transform-gpu"
    >
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden group/image">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          style={{ '--swiper-theme-color': '#E86A6F' } as React.CSSProperties}
          className="h-full w-full [&_.swiper-button-next]:scale-50 [&_.swiper-button-prev]:scale-50 [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 group-hover/image:[&_.swiper-button-next]:opacity-100 group-hover/image:[&_.swiper-button-prev]:opacity-100 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity"
        >
          {pkg.images.map((img, i) => (
            <SwiperSlide key={i}>
              <Image 
                src={optimizeAppwriteImage(img)}
                alt={`${pkg.title} ${i + 1}`}
                fill
               
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?q=80&w=800&auto=format&fit=crop";
                }}
                sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover group-hover/card:scale-110 transition-transform duration-700 ease-in-out"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Top Left Badge */}
        <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-[11px] font-bold tracking-wide shadow-sm z-10 pointer-events-none">
          <span className={pkg.badgeColor}>{pkg.badge}</span>
        </div>
        
        {/* Top Right Heart */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-coral shadow-sm hover:scale-110 transition-transform transform-gpu z-10">
          <Heart size={16} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col grow">
        <Link href={`/packages/${pkg.id}`} className="hover:text-brand-coral transition-colors">
          <h3 className="font-bold text-brand-navy text-[16px] sm:text-[17px] leading-snug mb-1.5 line-clamp-2">{pkg.title}</h3>
        </Link>
        
        <div className="flex items-center gap-1.5 text-gray-500 mb-3.5 flex-wrap">
          <div className="flex items-center gap-1">
            <MapPin size={14} className="text-brand-coral shrink-0" />
            <span className="text-xs font-medium truncate max-w-[140px] sm:max-w-none">{pkg.location}</span>
          </div>
          {Boolean(pkg.departureCitiesCount && pkg.departureCitiesCount > 0) && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">
              {pkg.departureCitiesCount} Departure{(pkg.departureCitiesCount || 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5 mb-3.5">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} className="shrink-0 text-gray-400" />
            <span className="text-xs font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Utensils size={14} className="shrink-0 text-gray-400" />
            <span className="text-xs font-medium truncate">{pkg.features}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 my-3" />

        {/* Bottom Row */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-medium truncate">
              {pkg.departureCityName ? `Ex-${pkg.departureCityName}` : 'Starting from'}
            </p>
            <p className="font-bold text-brand-coral text-base sm:text-lg whitespace-nowrap">{pkg.price}</p>
          </div>
          <Link 
            href={`/packages/${pkg.id}`}
            className="bg-brand-coral hover:bg-brand-coral/90 text-white px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shrink-0 active:scale-95 shadow-sm"
          >
            View Details <ArrowRight size={13} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
