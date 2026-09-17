'use client';

import { useState, useEffect } from 'react';
import { X, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';
import { useCheckoutStore } from '@/store/checkoutStore';

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

interface RoomSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  propertyId: string;
  propertyName: string;
  propertyImage?: string;
  propertyLocation?: string;
}

export default function RoomSelectionModal({
  isOpen,
  onClose,
  rooms,
  propertyId,
  propertyName,
  propertyImage,
  propertyLocation
}: RoomSelectionModalProps) {
  const router = useRouter();
  const { checkIn, checkOut, rooms: numRooms, adults, children } = usePropertyFilterStore();
  const setRoomDetails = useCheckoutStore((state) => state.setRoomDetails);
  const [overrides, setOverrides] = useState<Record<string, Record<string, { price?: number; available?: number }>>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [render, setRender] = useState(isOpen);
  const [isShowing, setIsShowing] = useState(isOpen);

  if (isOpen && !render) {
    setRender(true);
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // Small delay ensures DOM is fully painted with the initial (hidden) state before transitioning
      timer = setTimeout(() => setIsShowing(true), 10);
    } else {
      setIsShowing(false);
      timer = setTimeout(() => setRender(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadAvailability() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/vendor/availability");
        const json = await res.json();
        if (json.success && json.overrides) {
          setOverrides(json.overrides);
        }
      } catch (err) {
        console.error("Error loading availability overrides:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAvailability();
  }, [isOpen]);

  if (!render) return null;

  const dateKey = checkIn ? checkIn : new Date().toISOString().split('T')[0];

  const handleSelectRoom = (room: Room, price: number) => {
    // Set the room details in the checkout store
    setRoomDetails(propertyId, room.name, price, propertyName, propertyImage, propertyLocation);
    
    const totalGuests = adults + children;
    const maxCap = (room.maximumCapacity as number) || 4;
    const requiredRooms = Math.max(numRooms, Math.ceil(totalGuests / maxCap));
    
    // Build query parameters
    const query = new URLSearchParams();
    query.set('hotelId', propertyId);
    query.set('roomName', room.name);
    query.set('price', price.toString());
    
    if (room.images && room.images.length > 0) {
      query.set('roomImage', room.images[0]);
    }
    
    if (propertyName) query.set('hotelName', propertyName);
    if (propertyLocation) query.set('hotelLocation', propertyLocation);
    if (propertyImage) query.set('hotelImage', propertyImage);
    query.set('checkIn', checkIn);
    query.set('checkOut', checkOut);
    query.set('rooms', requiredRooms.toString());
    query.set('guests', totalGuests.toString());

    // Redirect to checkout page
    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <div 
      className={`fixed inset-0 z-100 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-out ${isShowing ? 'opacity-100' : 'opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-t-[24px] sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden transition-all duration-300 ease-out sm:mx-4 ${isShowing ? 'translate-y-0 sm:scale-100 opacity-100' : 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 sm:hidden"></div>
        <div className="flex items-center justify-between p-6 pt-4 sm:pt-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-navy">Select a Room</h2>
            <p className="text-gray-500 text-sm mt-1">Choose a room for your stay at {propertyName}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-4 border-[#f05b5b] border-t-transparent rounded-full"></div>
            </div>
          ) : rooms && rooms.length > 0 ? (
            <div className="flex flex-col gap-4">
              {rooms.map((room) => {
                const roomOverride = overrides[room.$id]?.[dateKey];
                const baseRoomPrice = room.discountPrice && room.discountPrice > 0 ? room.discountPrice : room.price;
                const effectivePrice = roomOverride?.price !== undefined ? roomOverride.price : baseRoomPrice;
                const isCustomRateApplied = roomOverride?.price !== undefined && roomOverride.price !== baseRoomPrice;

                return (
                  <div key={room.$id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#E86A6F]/50 transition-colors shadow-sm flex flex-col sm:flex-row gap-4 sm:items-center justify-between group">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-brand-navy mb-2">{room.name}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <User size={14} className="text-gray-400" /> Max: {room.occupancy || 2}
                        </span>
                        {room.size && (
                          <span className="bg-gray-50 px-2 py-1 rounded-md">
                            {room.size} sq ft
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-2xl font-extrabold text-brand-navy">
                          ₹{effectivePrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                        {isCustomRateApplied && (
                          <div className="text-[10px] font-bold text-[#E86A6F] mt-1 bg-[#E86A6F]/10 px-2 py-0.5 rounded-sm w-fit sm:ml-auto">
                            Special Rate
                          </div>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleSelectRoom(room, effectivePrice)}
                        className="bg-brand-navy hover:bg-opacity-90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 group-hover:bg-[#E86A6F] shrink-0"
                      >
                        Select <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p>No rooms available right now.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
