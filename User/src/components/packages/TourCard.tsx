'use client';

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
          className="h-full w-full [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-button-next]:scale-50 [&_.swiper-button-prev]:scale-50 [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 group-hover/image:[&_.swiper-button-next]:opacity-100 group-hover/image:[&_.swiper-button-prev]:opacity-100 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white"
        >
          {pkg.images.map((img, i) => (
            <SwiperSlide key={i}>
              <Image
                src={img}
                alt={`${pkg.title} ${i + 1}`}
                fill
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
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-brand-navy text-[17px] mb-1.5">{pkg.title}</h3>
        
        <div className="flex items-center gap-1 text-gray-500 mb-4">
          <MapPin size={14} className="text-brand-coral" />
          <span className="text-xs font-medium">{pkg.location}</span>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} />
            <span className="text-xs font-medium">{pkg.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Utensils size={14} />
            <span className="text-xs font-medium">{pkg.features}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] w-full bg-gray-100 my-4" />

        {/* Bottom Row */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-[10px] text-gray-500 font-medium mb-0.5">Starting from</p>
            <p className="font-bold text-brand-coral text-lg">{pkg.price}</p>
          </div>
          <Link 
            href={`/packages/${pkg.id}`}
            className="bg-brand-coral hover:bg-brand-coral/90 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
          >
            View Details <ArrowRight size={14} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}
