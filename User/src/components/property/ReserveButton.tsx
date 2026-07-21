'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCheckoutStore } from '@/store/checkoutStore';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';
import AuthModal from '@/components/auth/AuthModal';

interface ReserveButtonProps {
  hotelId: string;
  roomName: string;
  price: number;
  hotelName?: string;
  hotelImage?: string;
  hotelLocation?: string;
}

export default function ReserveButton({ hotelId, roomName, price, hotelName, hotelImage, hotelLocation }: ReserveButtonProps) {
  const router = useRouter();
  const setRoomDetails = useCheckoutStore((state) => state.setRoomDetails);
  const { checkIn, checkOut, rooms, adults, children } = usePropertyFilterStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleReserve = () => {
    // Set the room details in the checkout store as the primary source of truth
    setRoomDetails(hotelId, roomName, price, hotelName, hotelImage, hotelLocation);
    
    // Build query parameters
    const query = new URLSearchParams();
    query.set('hotelId', hotelId);
    query.set('roomName', roomName);
    query.set('price', price.toString());
    if (hotelName) query.set('hotelName', hotelName);
    if (hotelLocation) query.set('hotelLocation', hotelLocation);
    if (hotelImage) query.set('hotelImage', hotelImage);
    query.set('checkIn', checkIn);
    query.set('checkOut', checkOut);
    query.set('rooms', rooms.toString());
    query.set('guests', (adults + children).toString());

    // Directly redirect to checkout page
    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <>
      <button 
        onClick={handleReserve}
        className="w-full py-3 bg-brand-navy text-white rounded-xl font-bold hover:bg-opacity-90 transition-all"
      >
        Reserve
      </button>

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="signin" 
      />
    </>
  );
}
