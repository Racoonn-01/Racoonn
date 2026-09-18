'use client';

import { useState, useEffect } from 'react';
import { Wifi, Coffee, ShieldCheck, Info, User, Maximize2, Bed, Snowflake, Monitor, Bath, Utensils, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import RoomImageSlider from './RoomImageSlider';
import ReserveButton from './ReserveButton';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';
import { calculateRoomPricing } from '@/lib/pricing';

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
  standardCapacity?: number;
  maximumCapacity?: number;
  extraPersonCharge?: number;
  extraBedAvailable?: boolean;
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
  const { checkIn, checkOut, adults, children, rooms } = usePropertyFilterStore();
  const totalGuests = adults + children;
  const guestsPerRoom = Math.ceil(totalGuests / rooms);
  const [overrides, setOverrides] = useState<Record<string, Record<string, { price?: number; available?: number }>>>({});
  const [occupiedRooms, setOccupiedRooms] = useState<Record<string, number>>({});
  const [selectedRoomForModal, setSelectedRoomForModal] = useState<Room | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Fetch live availability overrides and occupied rooms
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

    async function loadOccupiedRooms() {
      try {
        const dCheckIn = checkIn || new Date().toISOString().split('T')[0];
        const msPerDay = 1000 * 60 * 60 * 24;
        const defaultCheckOut = new Date(new Date(dCheckIn).getTime() + msPerDay).toISOString().split('T')[0];
        const dCheckOut = checkOut || defaultCheckOut;

        const timestamp = new Date().getTime();
        const res = await fetch(`/api/rooms/availability?hotelId=${propertyId}&checkIn=${dCheckIn}&checkOut=${dCheckOut}&_t=${timestamp}`, { cache: 'no-store' });
        const json = await res.json();
        console.log("CLIENT FETCH API RESPONSE:", json);
        if (json.success && json.occupied) {
          setOccupiedRooms(json.occupied);
        }
      } catch (err) {
        console.error("Error loading real-time availability:", err);
      }
    }

    loadAvailability();
    loadOccupiedRooms();

    const handleFocus = () => {
      loadOccupiedRooms();
    };

    window.addEventListener('focus', handleFocus);

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
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener("racoonn_availability_updated", handleCustomEvent);
      if (bc) bc.close();
    };
  }, [propertyId, checkIn, checkOut]);

  // Format checkIn date to YYYY-MM-DD
  const dateKey = checkIn ? checkIn : new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-6">
      {initialRooms && initialRooms.length > 0 ? (
        initialRooms.map((room, index) => {
          const roomOverride = overrides[room.$id]?.[dateKey];
          const baseRoomPrice = room.discountPrice && room.discountPrice > 0 ? room.discountPrice : room.price;
          const effectivePrice = roomOverride?.price !== undefined ? roomOverride.price : baseRoomPrice;
          const isCustomRateApplied = roomOverride?.price !== undefined && roomOverride.price !== baseRoomPrice;
          
          const stdCap = room.standardCapacity || room.occupancy || 2;
          const maxCap = room.maximumCapacity || 4;
          const epc = room.extraPersonCharge || 0;
          const eba = room.extraBedAvailable || false;
          
          const roomNameKey = room.name ? room.name.trim() : "";
          const roomOccupiedCount = occupiedRooms[roomNameKey] || occupiedRooms[room.$id] || 0;
          const roomTotalRooms = Number(room.totalRooms) || 1;
          const availableRooms = Math.max(0, roomTotalRooms - roomOccupiedCount);
          
          const autoRooms = Math.ceil(totalGuests / (maxCap as number));
          const requiredRooms = Math.max(rooms, autoRooms);
          const calculatedGuestsPerRoom = Math.ceil(totalGuests / requiredRooms);
          
          const isCapacityExceeded = calculatedGuestsPerRoom > maxCap;
          const isNotEnoughRooms = requiredRooms > availableRooms;
          const isUnavailable = isCapacityExceeded || isNotEnoughRooms;
          
          let unavailableReason = "";
          if (isNotEnoughRooms) {
            unavailableReason = `Only ${availableRooms} room(s) available, but ${requiredRooms} are needed.`;
          }
          if (isCapacityExceeded) {
            unavailableReason = "Room capacity exceeded for the selected number of guests.";
          }
          
          const safeGuestsPerRoom = isCapacityExceeded ? maxCap as number : calculatedGuestsPerRoom;
          
          const pricing = calculateRoomPricing({
            basePrice: effectivePrice,
            standardCapacity: stdCap as number,
            maximumCapacity: maxCap as number,
            extraPersonCharge: epc as number,
            totalGuests: safeGuestsPerRoom,
            numberOfNights: 1 // for per-night display
          });
          
          const displayPrice = pricing.roomSubtotal * requiredRooms;
          
          const isPopular = index === 0; // First room is most popular for now

          return (
            <div key={room.$id || index} className="flex flex-col lg:flex-row bg-white border border-gray-100 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow overflow-hidden">
              {/* Left: Image Carousel */}
              <div className="w-full lg:w-[35%] h-64 lg:h-auto shrink-0 relative">
                {room.images && room.images.length > 0 ? (
                  <RoomImageSlider images={room.images} isPopular={isPopular} />
                ) : (
                  <div className="w-full h-full min-h-55 bg-gray-100 flex flex-col items-center justify-center text-gray-400 text-sm">
                    No images available
                  </div>
                )}
              </div>

              {/* Middle: Room Details */}
              <div className="w-full lg:w-[40%] p-6 md:p-8 flex flex-col justify-start border-b lg:border-b-0 lg:border-r border-gray-100">
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Room Type</div>
                  <h3 className="text-[24px] font-extrabold text-brand-navy mb-4 tracking-tight">{room.name}</h3>
                  
                  <div className="flex flex-wrap items-center gap-3 text-[14px] font-semibold text-gray-600 mb-4">
                    <span className="flex items-center gap-1.5"><User size={16} className="text-gray-400 shrink-0" /> Up to {maxCap} guests</span>
                    <span className="text-gray-300">|</span>
                    <span className="flex items-center gap-1.5"><Maximize2 size={16} className="text-gray-400 shrink-0" /> Size: {room.size || 350} sq ft</span>
                    <span className="text-gray-300 hidden sm:inline">|</span>
                    <span className={`flex flex-col gap-1 ${availableRooms > 0 ? 'text-[#10b981]' : 'text-red-500'}`}>
                      <span className="flex items-center gap-1.5"><Bed size={16} className="shrink-0" /> {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} left</span>
                      <span className="text-xs text-gray-400">DB Total: {roomTotalRooms} | Occupied: {roomOccupiedCount}</span>
                    </span>
                  </div>



                  {Boolean(room.description) && typeof room.description === 'string' && (
                    <div className="mb-4">
                      <p className="text-[14px] text-gray-500 font-medium leading-relaxed line-clamp-2">
                        {room.description as string}
                      </p>
                    </div>
                  )}

                  {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-auto mb-3">
                      {room.amenities.slice(0, 3).map((amenity, i) => {
                        let Icon = CheckCircle;
                        const lower = amenity.toLowerCase();
                        if (lower.includes('wifi') || lower.includes('internet')) Icon = Wifi;
                        else if (lower.includes('air cond') || lower.includes('ac')) Icon = Snowflake;
                        else if (lower.includes('mini bar') || lower.includes('coffee') || lower.includes('room service')) Icon = Coffee;
                        else if (lower.includes('tv') || lower.includes('screen')) Icon = Monitor;
                        else if (lower.includes('bath') || lower.includes('pool') || lower.includes('ocean')) Icon = Bath;
                        else if (lower.includes('bed')) Icon = Bed;

                        return (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-gray-600 border border-gray-100">
                            <Icon size={14} className="text-gray-400 shrink-0" />
                            <span className="truncate">{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      setSelectedRoomForModal(room);
                      setModalImageIndex(0);
                    }}
                    className="text-[14px] font-bold text-brand-navy hover:text-brand-coral transition-colors underline underline-offset-4 mt-1 self-start"
                  >
                    View room details
                  </button>
                </div>
              </div>

              {/* Right: Price & Reservation */}
              <div className="w-full lg:w-[25%] p-6 md:p-8 flex flex-col justify-between bg-white relative">

                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Price Per Night</div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-[32px] font-extrabold text-brand-navy leading-none tracking-tight">₹{displayPrice.toLocaleString('en-IN')}</span>
                    <Info size={16} className="text-gray-400 mb-1.5" />
                  </div>
                  <div className="text-[13px] text-gray-500 font-medium leading-relaxed mb-6">
                    per night<br />
                    {requiredRooms > 1 && (
                      <span className="text-brand-navy font-semibold">For {requiredRooms} rooms<br /></span>
                    )}
                    {pricing.extraGuests > 0 && (
                      <span className="text-brand-coral font-semibold">Includes ₹{(pricing.extraGuestAmount * requiredRooms).toLocaleString('en-IN')} extra Bed charge<br /></span>
                    )}
                    Includes taxes
                  </div>
                  
                  {isCustomRateApplied && (
                    <div className="text-[12px] font-bold px-3 py-1.5 rounded-lg bg-brand-coral/10 text-brand-coral mb-4 w-fit border border-brand-coral/20">
                      Special Rate for {dateKey}
                    </div>
                  )}

                  <ReserveButton 
                    hotelId={propertyId}
                    roomName={room.name} 
                    price={effectivePrice} 
                    hotelName={propertyName}
                    hotelImage={propertyImage}
                    hotelLocation={propertyLocation}
                    maxOccupancy={maxCap as number}
                    roomImage={room.images && room.images.length > 0 ? room.images[0] : undefined}
                    standardCapacity={stdCap as number}
                    maximumCapacity={maxCap as number}
                    extraPersonCharge={epc as number}
                    extraBedAvailable={eba as boolean}
                    disabled={isUnavailable}
                    disabledReason={unavailableReason}
                  />
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-lg font-medium">No rooms available for this property yet.</p>
        </div>
      )}

      {/* Room Details Modal */}
      {selectedRoomForModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative ring-1 ring-white/10">
            <button 
              onClick={() => setSelectedRoomForModal(null)}
              className="absolute top-4 right-4 z-10 p-2.5 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all shadow-sm border border-white/10"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
            
            <div className="w-full h-56 sm:h-72 relative bg-gray-900 shrink-0 group">
              {selectedRoomForModal.images && selectedRoomForModal.images.length > 0 ? (
                <>
                  <img 
                    src={selectedRoomForModal.images[modalImageIndex]} 
                    alt={selectedRoomForModal.name}
                    className="w-full h-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  
                  {selectedRoomForModal.images.length > 1 && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImageIndex((prev) => (prev - 1 + selectedRoomForModal.images!.length) % selectedRoomForModal.images!.length);
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                      >
                        <ChevronLeft size={24} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalImageIndex((prev) => (prev + 1) % selectedRoomForModal.images!.length);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10"
                      >
                        <ChevronRight size={24} strokeWidth={2.5} />
                      </button>
                      
                      <div className="absolute top-6 left-6 text-white/90 text-[12px] font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 z-10 pointer-events-none">
                        {modalImageIndex + 1} / {selectedRoomForModal.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 pointer-events-none">No images available</div>
              )}
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-[0.2em] mb-2 drop-shadow-md">Room Details</div>
                <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">{selectedRoomForModal.name}</h3>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto bg-white">
              
              <div className="flex flex-wrap items-center gap-6 text-[14px] font-semibold text-gray-700 mb-8 pb-6 border-b border-gray-100">
                <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full"><User size={18} className="text-brand-coral shrink-0" /> Up to {selectedRoomForModal.maximumCapacity || selectedRoomForModal.occupancy || 4} guests</span>
                <span className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full"><Maximize2 size={18} className="text-brand-coral shrink-0" /> Size: {selectedRoomForModal.size || 350} sq ft</span>
              </div>

              <div className="mb-10">
                <h4 className="text-[18px] font-extrabold text-brand-navy mb-4 flex items-center gap-2">
                  About this space
                </h4>
                <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
                  {typeof selectedRoomForModal.description === 'string' ? selectedRoomForModal.description : 'No description available.'}
                </p>
              </div>

              {selectedRoomForModal.amenities && Array.isArray(selectedRoomForModal.amenities) && selectedRoomForModal.amenities.length > 0 && (
                <div>
                  <h4 className="text-[18px] font-extrabold text-brand-navy mb-5 flex items-center gap-2">
                    What this room offers
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRoomForModal.amenities.map((amenity, i) => {
                      let Icon = CheckCircle;
                      const lower = amenity.toLowerCase();
                      if (lower.includes('wifi') || lower.includes('internet')) Icon = Wifi;
                      else if (lower.includes('air cond') || lower.includes('ac')) Icon = Snowflake;
                      else if (lower.includes('mini bar') || lower.includes('coffee') || lower.includes('room service')) Icon = Coffee;
                      else if (lower.includes('tv') || lower.includes('screen')) Icon = Monitor;
                      else if (lower.includes('bath') || lower.includes('pool') || lower.includes('ocean')) Icon = Bath;
                      else if (lower.includes('bed')) Icon = Bed;

                      return (
                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-2xl text-[14px] font-bold text-brand-navy border border-gray-100 shadow-sm hover:border-brand-coral/30 hover:shadow-md transition-all group">
                          <div className="p-2 bg-brand-coral/10 rounded-xl group-hover:bg-brand-coral group-hover:text-white transition-colors text-brand-coral">
                            <Icon size={18} className="shrink-0" />
                          </div>
                          <span className="truncate">{amenity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
