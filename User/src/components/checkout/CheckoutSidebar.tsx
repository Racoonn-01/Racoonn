"use client";
import React, { useEffect } from "react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { BookingSummary } from "@/components/checkout/BookingSummary";
import { CancellationPolicy } from "@/components/checkout/CancellationPolicy";

import { useSearchParams } from "next/navigation";

import { DEFAULT_ADDONS } from "@/components/checkout/AddonSelector";

import { calculateRoomGst } from "@/lib/gst";
import { calculateRoomPricing } from "@/lib/pricing";

export function CheckoutSidebar({
  nights = 3,
  rooms = 1
}: {
  roomName?: string;
  price?: number;
  nights?: number;
  rooms?: number;
}) {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const selectedRoomName = useCheckoutStore((state) => state.selectedRoomName);
  const selectedPrice = useCheckoutStore((state) => state.selectedPrice);
  const selectedAddons = useCheckoutStore((state) => state.selectedAddons);
  const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
  
  const propertyAddons = useCheckoutStore(state => state.propertyAddons);

  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId') || useCheckoutStore.getState().selectedHotelId || 'hotel-123';

  const checkFirstBooking = useCheckoutStore(state => state.checkFirstBooking);
  const isFirstBooking = useCheckoutStore(state => state.isFirstBooking);

  useEffect(() => {
    checkFirstBooking();
  }, [checkFirstBooking]);

  const displayAddons = propertyAddons === null ? [] : (propertyAddons.length > 0 ? propertyAddons : DEFAULT_ADDONS);

  const numGuests = Number(searchParams.get('guests')) || 2;
  const dynamicAddonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = displayAddons.find(a => (a.id === addonId || a.$id === addonId));
    const basePrice = addon?.price || 0;
    const isPerPerson = typeof addon?.description === 'string' && addon.description.toLowerCase().includes('per person');
    const finalPrice = isPerPerson ? basePrice * numGuests : basePrice;
    return sum + finalPrice;
  }, 0);
  const clientRoomName = searchParams.get('roomName');
  const clientPrice = searchParams.get('price');
  const clientHotelName = searchParams.get('hotelName');
  const clientHotelImage = searchParams.get('hotelImage');
  const clientHotelLocation = searchParams.get('hotelLocation');
  const clientRoomImage = searchParams.get('roomImage');
  
  const hotelName = useCheckoutStore((state) => state.hotelName) || clientHotelName || "Grand Ocean Resort";
  const hotelImage = useCheckoutStore((state) => state.hotelImage) || clientHotelImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80";
  const hotelLocation = useCheckoutStore((state) => state.hotelLocation) || clientHotelLocation || "Dubai Marina, UAE";
  
  // Note: we don't store roomImage in the checkoutStore currently, so we just use the client value
  const roomImage = clientRoomImage || undefined;
  
  const finalRoomName = selectedRoomName || clientRoomName || "Deluxe Ocean View Suite";
  const finalPrice = selectedPrice || (clientPrice ? Number(clientPrice) : 8000);
  
  const formatUrlDate = (dateStr?: string | null) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const clientCheckIn = formatUrlDate(searchParams.get('checkIn'));
  const clientCheckOut = formatUrlDate(searchParams.get('checkOut'));
  const clientGuests = `${numGuests} Guest${numGuests > 1 ? 's' : ''}`;

  const isPackage = finalRoomName.startsWith('Package:') || finalRoomName.toLowerCase().includes('package') || hotelId.startsWith('pkg-');
  
  const stdCap = Number(searchParams.get('stdCap')) || 2;
  const maxCap = Number(searchParams.get('maxCap')) || 4;
  const epc = Number(searchParams.get('epc')) || 0;

  let totalBaseRoomAmount = finalPrice;
  let totalExtraGuestAmount = 0;

  if (!isPackage) {
    const guestsPerRoom = Math.ceil(numGuests / rooms);
    const pricing = calculateRoomPricing({
      basePrice: finalPrice,
      standardCapacity: stdCap,
      maximumCapacity: maxCap,
      extraPersonCharge: epc,
      totalGuests: guestsPerRoom,
      numberOfNights: nights
    });
    totalBaseRoomAmount = pricing.baseRoomAmount * rooms;
    totalExtraGuestAmount = pricing.extraGuestAmount * rooms;
  }

  const roomTotal = totalBaseRoomAmount + totalExtraGuestAmount;
  const effectivePerNightPrice = isPackage ? finalPrice : roomTotal / (nights * rooms);
  
  let dynamicDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed') {
      dynamicDiscount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percentage') {
      dynamicDiscount = Math.floor(roomTotal * (appliedCoupon.value / 100));
    }
  }

  let welcomeDiscount = 0;
  if (isFirstBooking) {
    welcomeDiscount = Math.floor(roomTotal * 0.10);
  }

  const calcNights = isPackage ? 1 : nights;
  const calcRooms = isPackage ? 1 : rooms;
  const gstResult = calculateRoomGst(effectivePerNightPrice, calcNights, calcRooms, dynamicAddonsTotal, isPackage);
  const finalTaxes = gstResult.gstAmount;
  const currentGstRate = gstResult.gstRate;

  if (currentStep === 4) return null;

  return (
    <div className="w-full lg:w-100 shrink-0">
      <div className="sticky top-28 space-y-6 transition-all duration-300">
        <BookingSummary 
          roomName={finalRoomName}
          pricePerNight={finalPrice}
          hotelName={hotelName}
          hotelImage={hotelImage}
          hotelLocation={hotelLocation}
          roomImage={roomImage}
          nights={nights}
          rooms={rooms}
          guests={clientGuests}
          checkIn={clientCheckIn}
          checkOut={clientCheckOut}
          gstRate={currentGstRate}
          taxes={finalTaxes}
          addons={dynamicAddonsTotal}
          discount={dynamicDiscount}
          welcomeDiscount={welcomeDiscount}
          baseRoomAmount={totalBaseRoomAmount}
          extraGuestAmount={totalExtraGuestAmount}
        />
        <CancellationPolicy />
      </div>
    </div>
  );
}
