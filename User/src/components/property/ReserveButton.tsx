'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import { useCheckoutStore } from '@/store/checkoutStore';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';
import AuthModal from '@/components/auth/AuthModal';
import { useAuthStore } from '@/store/authStore';

interface ReserveButtonProps {
  hotelId: string;
  roomName: string;
  price: number;
  hotelName?: string;
  hotelImage?: string;
  hotelLocation?: string;
  maxOccupancy?: number;
  roomImage?: string;
  standardCapacity?: number;
  maximumCapacity?: number;
  extraPersonCharge?: number;
  extraBedAvailable?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export default function ReserveButton({ 
  hotelId, roomName, price, hotelName, hotelImage, hotelLocation, maxOccupancy = 2, roomImage,
  standardCapacity = 2, maximumCapacity = 4, extraPersonCharge = 0, extraBedAvailable = false,
  disabled = false, disabledReason
}: ReserveButtonProps) {
  const router = useRouter();
  const setRoomDetails = useCheckoutStore((state) => state.setRoomDetails);
  const { checkIn, checkOut, rooms, adults, children } = usePropertyFilterStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [pendingCheckoutUrl, setPendingCheckoutUrl] = useState<string>('');

  const handleReserve = () => {
    // Set the room details in the checkout store as the primary source of truth
    setRoomDetails(hotelId, roomName, price, hotelName, roomImage || hotelImage, hotelLocation, standardCapacity, maximumCapacity, extraPersonCharge, extraBedAvailable);
    
    // Build query parameters
    const query = new URLSearchParams();
    query.set('hotelId', hotelId);
    query.set('roomName', roomName);
    query.set('price', price.toString());
    query.set('stdCap', standardCapacity.toString());
    query.set('maxCap', maximumCapacity.toString());
    query.set('epc', extraPersonCharge.toString());
    query.set('eba', extraBedAvailable.toString());
    
    if (hotelName) query.set('hotelName', hotelName);
    if (hotelLocation) query.set('hotelLocation', hotelLocation);
    if (roomImage || hotelImage) query.set('hotelImage', roomImage || hotelImage || '');
    query.set('checkIn', checkIn);
    query.set('checkOut', checkOut);
    const totalGuests = adults + children;
    const requiredRooms = Math.max(rooms, Math.ceil(totalGuests / maxOccupancy));

    query.set('rooms', requiredRooms.toString());
    query.set('guests', totalGuests.toString());

    // Construct checkout URL
    const checkoutUrl = `/checkout?${query.toString()}`;

    if (!isAuthenticated) {
      // Store checkoutUrl so it can be passed to AuthModal for Google OAuth
      setPendingCheckoutUrl(checkoutUrl);
      setIsAuthModalOpen(true);
      return;
    }

    // Directly redirect to checkout page
    router.push(checkoutUrl);
  };

  const handleAuthSuccess = () => {
    if (pendingCheckoutUrl) {
      router.push(pendingCheckoutUrl);
    }
  };

  return (
    <>
      <button 
        onClick={handleReserve}
        disabled={disabled}
        className={`w-full py-3.5 rounded-[12px] font-bold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm ${
          disabled 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-[#E86A6F] hover:bg-[#D95B60] text-white'
        }`}
        title={disabledReason}
      >
        {disabled ? 'Unavailable' : 'Reserve Now'} {!disabled && <ArrowRight size={18} />}
      </button>
      {disabled && disabledReason && (
        <p className="text-red-500 text-xs mt-2 text-center font-medium">{disabledReason}</p>
      )}

      {/* Auth Modal for Unauthenticated Users */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialView="signin" 
        onSuccess={handleAuthSuccess}
        successUrl={pendingCheckoutUrl ? `${window.location.origin}${pendingCheckoutUrl}` : undefined}
      />
    </>
  );
}
