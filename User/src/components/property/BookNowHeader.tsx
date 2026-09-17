'use client';

import { useState } from 'react';
import RoomSelectionModal from './RoomSelectionModal';

interface Room {
  $id: string;
  name: string;
  occupancy: number;
  size: number;
  price: number;
  discountPrice?: number;
  mealPlan?: string;
  cancellation?: string;
  images?: string[];
  amenities?: string[];
  [key: string]: unknown;
}

interface BookNowHeaderProps {
  rooms: Room[];
  propertyId: string;
  propertyName: string;
  propertyImage?: string;
  propertyLocation?: string;
}

export default function BookNowHeader({
  rooms,
  propertyId,
  propertyName,
  propertyImage,
  propertyLocation
}: BookNowHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-brand-navy mb-1">Rooms available</h2>
          <p className="text-[15px] text-gray-500">{rooms.length} options that meet your criteria</p>
        </div>
        {/* Desktop Button */}
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="hidden sm:block bg-[#E86A6F] hover:bg-[#D95B60] text-white px-8 py-3 rounded-xl font-bold text-[15px] transition-colors shadow-sm"
        >
          Book Now
        </button>
      </div>

      {/* Mobile Fixed Book Now Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-90 sm:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.06)]">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="w-full bg-[#E86A6F] hover:bg-[#D95B60] text-white py-3.5 rounded-xl font-bold text-[16px] transition-colors shadow-sm"
        >
          Book Now
        </button>
      </div>

      <RoomSelectionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rooms={rooms}
        propertyId={propertyId}
        propertyName={propertyName}
        propertyImage={propertyImage}
        propertyLocation={propertyLocation}
      />
    </>
  );
}
