'use client';
import { optimizeAppwriteImage } from "@/lib/optimizeImage";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Grid, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface PropertyPhotoGalleryProps {
  images: string[];
}

const CATEGORIES = ['All', 'Exterior', 'Rooms', 'Amenities'];

export default function PropertyPhotoGallery({ images }: PropertyPhotoGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Assign mock categories to the 5 images since we don't have real categorized data
  const categorizedImages = images.map((img, index) => {
    let category = 'Exterior';
    if (index === 1 || index === 3) category = 'Rooms';
    if (index === 2) category = 'Amenities';
    return { id: index, src: img, category };
  });

  const filteredImages = categorizedImages.filter(img => 
    activeFilter === 'All' ? true : img.category === activeFilter
  );

  const handleNext = () => {
    if (selectedImageId === null) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImageId(filteredImages[nextIndex].id);
    setZoomScale(1);
  };

  const handlePrev = () => {
    if (selectedImageId === null) return;
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImageId);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImageId(filteredImages[prevIndex].id);
    setZoomScale(1);
  };

  return (
    <>
      {/* 5-Image Bento Grid */}
      <div className="relative h-[35vh] md:h-[55vh] min-h-[300px] md:min-h-[400px] max-h-[500px] w-full rounded-2xl overflow-hidden mb-6 md:mb-10 flex gap-2">
        {/* Main Large Image */}
        <div className="relative w-full md:w-1/2 h-full group cursor-pointer overflow-hidden" onClick={() => setIsModalOpen(true)}>
          <Image src={optimizeAppwriteImage(images[0])} alt="Property Main" fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>

        {/* 4 Small Images Grid */}
        <div className="hidden md:grid w-1/2 h-full grid-cols-2 grid-rows-2 gap-2">
          {images.slice(1, 5).map((img, i) => (
            <div key={i} className="relative w-full h-full group cursor-pointer overflow-hidden" onClick={() => setIsModalOpen(true)}>
              <Image src={optimizeAppwriteImage(img)} alt={`Property ${i + 1}`} fill className="object-cover transition-transform duration-500 group-hover:scale-105" priority />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-6 bg-white border border-[#222] px-4 py-1.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
        >
          <Grid size={16} />
          Show all photos
        </button>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-white overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>

              {/* Filters */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      activeFilter === category 
                        ? 'bg-brand-navy text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="w-10 h-10" /> {/* Spacer for centering */}
            </div>

            {/* Modal Gallery Grid */}
            <div className="max-w-[1200px] mx-auto px-6 py-8">
              <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredImages.map((img) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={img.id}
                      className="relative w-full h-auto break-inside-avoid overflow-hidden rounded-xl bg-gray-100 cursor-pointer group"
                      onClick={() => setSelectedImageId(img.id)}
                    >
                      <Image 
                        src={optimizeAppwriteImage(img.src)} 
                        alt={`Gallery Image ${img.id}`} 
                        width={800} 
                        height={600} 
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Image Fullscreen View */}
      <AnimatePresence>
        {selectedImageId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 flex flex-col"
          >
            <div className="p-4 flex justify-between items-center relative z-10">
              {/* Zoom Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setZoomScale(Math.min(zoomScale + 0.5, 3))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={() => setZoomScale(Math.max(zoomScale - 0.5, 0.5))}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <ZoomOut size={20} />
                </button>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedImageId(null);
                  setZoomScale(1);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 p-4 md:p-12 flex items-center justify-center relative overflow-hidden">
              {/* Left Arrow */}
              {filteredImages.length > 1 && (
                <button 
                  onClick={handlePrev}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                >
                  <ChevronLeft size={32} />
                </button>
              )}

              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: zoomScale }}
                exit={{ scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full h-full"
              >
                <Image 
                  src={optimizeAppwriteImage(filteredImages.find(img => img.id === selectedImageId)?.src || '')} 
                  alt="Selected Image" 
                  fill 
                  className="object-contain" 
                  sizes="100vw"
                />
              </motion.div>

              {/* Right Arrow */}
              {filteredImages.length > 1 && (
                <button 
                  onClick={handleNext}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10 backdrop-blur-sm"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
