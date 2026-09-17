"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Crown } from 'lucide-react';

interface RoomImageSliderProps {
  images: string[];
  isPopular?: boolean;
}

export default function RoomImageSlider({ images, isPopular = false }: RoomImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const handleImageError = (idx: number) => {
    setFailedImages(prev => new Set(prev).add(idx));
  };

  const validImages = images.map((img, idx) => ({ img, idx })).filter(({ idx }) => !failedImages.has(idx));

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (validImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (validImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };

  const nextLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && validImages.length > 0) {
      const currentValidIdx = validImages.findIndex(v => v.idx === lightboxIndex);
      const nextValidIdx = (currentValidIdx + 1) % validImages.length;
      setLightboxIndex(validImages[nextValidIdx].idx);
    }
  };
  
  const prevLightboxImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null && validImages.length > 0) {
      const currentValidIdx = validImages.findIndex(v => v.idx === lightboxIndex);
      const prevValidIdx = (currentValidIdx - 1 + validImages.length) % validImages.length;
      setLightboxIndex(validImages[prevValidIdx].idx);
    }
  };

  if (validImages.length === 0) {
    return (
      <div className="w-full h-full min-h-55 bg-gray-100 rounded-[16px] flex items-center justify-center text-gray-400 text-sm border border-gray-200">
        No valid images
      </div>
    );
  }

  const currentImgObj = validImages[currentIndex];

  return (
    <>
      <div className="relative w-full h-full min-h-55 rounded-tl-[16px] rounded-bl-[16px] md:rounded-bl-none overflow-hidden group cursor-pointer" onClick={() => openLightbox(currentImgObj.idx)}>
        <div 
          className="flex w-full h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validImages.map(({ img, idx }) => (
            <div key={idx} className="relative w-full h-full shrink-0">
              <Image 
                src={img} 
                alt={`Room image ${idx + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => handleImageError(idx)}
              />
            </div>
          ))}
        </div>
        
        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />


        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-800"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-gray-800"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Pagination Dots & Counter */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
          {validImages.map((_, idx) => (
            <div 
              key={idx} 
              className={`rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/50 border border-white/20'}`}
            />
          ))}
        </div>
        
        <div className="absolute bottom-4 right-4 text-white text-[12px] font-medium bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={closeLightbox}>
          <button 
            className="absolute top-6 right-6 text-white hover:bg-white/20 p-2 rounded-full transition-colors z-50" 
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>
          
          <div className="relative w-full max-w-5xl aspect-video mx-4" onClick={e => e.stopPropagation()}>
            <Image 
              src={validImages.find(v => v.idx === lightboxIndex)?.img || ""} 
              alt="Room Lightbox Image" 
              fill 
              className="object-contain"
            />
            {validImages.length > 1 && (
              <>
                <button 
                  onClick={prevLightboxImage}
                  className="absolute -left-12 md:-left-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronLeft size={32} />
                </button>
                <button 
                  onClick={nextLightboxImage}
                  className="absolute -right-12 md:-right-16 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
