'use client';

import { useState, useEffect } from 'react';
import { Wifi, Coffee, ShieldCheck, Info } from 'lucide-react';
import RoomImageSlider from './RoomImageSlider';
import ReserveButton from './ReserveButton';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';

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
  [key: string]: unknown;
}

interface RoomListProps {
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  propertyLocation: string;
  initialRooms: Room[];
}

export default function RoomListWithAvailability({
  propertyId,
  propertyName,
  propertyImage,
  propertyLocation,
  initialRooms
}: RoomListProps) {
  const { checkIn } = usePropertyFilterStore();
  const [overrides, setOverrides] = useState<Record<string, Record<string, { price?: number; available?: number }>>>({});

  // Fetch live availability overrides
  useEffect(() => {
    async function loadAvailability() {
      try {
        const res = await fetch("/api/vendor/availability");
        const json = await res.json();
        if (json.success && json.overrides) {
          setOverrides(json.overrides);
        }
      } catch (err) {
        console.error("Error loading availability overrides:", err);
      }
    }

    loadAvailability();

    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setOverrides(detail);
    };

    window.addEventListener("racoonn_availability_updated", handleCustomEvent);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("racoonn_availability_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "AVAILABILITY_UPDATED") {
          setOverrides(event.data.overrides || {});
        }
      };
    }

    return () => {
      window.removeEventListener("racoonn_availability_updated", handleCustomEvent);
      if (bc) bc.close();
    };
  }, []);

  // Format checkIn date to YYYY-MM-DD
  const dateKey = checkIn ? checkIn : new Date().toISOString().split('T')[0];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      {/* Table Header */}
      <div className="hidden md:flex bg-gray-50 border-b border-gray-200 p-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
        <div className="w-[40%]">Room type</div>
        <div className="w-[30%]">Meal plan and conditions</div>
        <div className="w-[30%]">Price per night</div>
      </div>

      {initialRooms && initialRooms.length > 0 ? (
        initialRooms.map((room, index) => {
          const roomOverride = overrides[room.$id]?.[dateKey];
          const baseRoomPrice = room.discountPrice && room.discountPrice > 0 ? room.discountPrice : room.price;
          const effectivePrice = roomOverride?.price !== undefined ? roomOverride.price : baseRoomPrice;
          const isCustomRateApplied = roomOverride?.price !== undefined && roomOverride.price !== baseRoomPrice;

          return (
            <div key={room.$id || index} className="flex flex-col md:flex-row border-b border-gray-200 last:border-b-0">
              {/* Room Column 1: Info & Slider */}
              <div className="w-full md:w-[40%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[18px] font-bold text-brand-navy hover:underline cursor-pointer">{room.name}</h3>
                  {isCustomRateApplied && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-coral/10 text-brand-coral border border-brand-coral/20">
                      Date Special
                    </span>
                  )}
                </div>
                <p className="text-[14px] text-gray-600 mb-4">Max Occupancy: {room.occupancy || 2} • Size: {room.size || 350} sq ft</p>
                <div className="flex gap-2 text-brand-coral font-medium text-[13px] mb-3">
                  <span className="flex items-center gap-1"><Wifi size={14} /> Free WiFi</span>
                </div>
                {room.images && room.images.length > 0 ? (
                  <RoomImageSlider images={room.images} />
                ) : (
                  <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    No images
                  </div>
                )}
              </div>

              {/* Room Column 2: Meal Plan & Conditions */}
              <div className="w-full md:w-[30%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                <div className="space-y-3">
                  {room.mealPlan && room.mealPlan !== 'Room Only' ? (
                    <div className="flex items-start gap-2">
                      <Coffee size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">{room.mealPlan}</span>
                      </div>
                    </div>
                  ) : room.mealPlan === 'Room Only' ? (
                    <div className="flex items-start gap-2">
                      <Coffee size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-gray-700">{room.mealPlan}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Coffee size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">Breakfast included</span>
                      </div>
                    </div>
                  )}
                  
                  {room.cancellation ? (
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className={`text-[14px] font-semibold ${room.cancellation === 'Non-refundable' ? 'text-red-600' : 'text-green-700'}`}>
                          {room.cancellation}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">Free cancellation</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Column 3: Pricing & Reserve */}
              <div className="w-full md:w-[30%] p-6 flex flex-col justify-center bg-gray-50/30">
                <div className="flex flex-col mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[26px] font-extrabold text-brand-navy">₹{effectivePrice?.toLocaleString('en-IN')}</span>
                    <Info size={14} className="text-gray-400" />
                  </div>
                  {isCustomRateApplied && (
                    <span className="text-[12px] font-medium text-brand-coral mt-0.5">
                      Rate for {dateKey}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-gray-500 mb-6">per night<br />Includes taxes</p>
                <ReserveButton 
                  hotelId={propertyId}
                  roomName={room.name} 
                  price={effectivePrice} 
                  hotelName={propertyName}
                  hotelImage={propertyImage}
                  hotelLocation={propertyLocation}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p>No rooms available for this property yet.</p>
        </div>
      )}
    </div>
  );
}
