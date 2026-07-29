"use client";
import React from "react";
import { useCheckoutStore } from "@/store/checkoutStore";
import { BookingSummary } from "@/components/checkout/BookingSummary";
import { TrustBadges } from "@/components/checkout/TrustBadges";
import { CancellationPolicy } from "@/components/checkout/CancellationPolicy";

import { useSearchParams } from "next/navigation";
import { getProperty } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { DEFAULT_ADDONS } from "@/components/checkout/AddonSelector";

import { calculateRoomGst } from "@/lib/gst";

export function CheckoutSidebar({
  nights = 3,
  rooms = 1,
  discount = 2000
}: {
  roomName?: string;
  price?: number;
  nights?: number;
  rooms?: number;
  discount?: number;
}) {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const selectedRoomName = useCheckoutStore((state) => state.selectedRoomName);
  const selectedPrice = useCheckoutStore((state) => state.selectedPrice);
  const selectedAddons = useCheckoutStore((state) => state.selectedAddons);
  const appliedCoupon = useCheckoutStore((state) => state.appliedCoupon);
  
  const propertyAddons = useCheckoutStore(state => state.propertyAddons);

  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId') || useCheckoutStore.getState().selectedHotelId || 'hotel-123';

  const displayAddons = propertyAddons === null ? [] : (propertyAddons.length > 0 ? propertyAddons : DEFAULT_ADDONS);

  const dynamicAddonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = displayAddons.find(a => (a.id === addonId || a.$id === addonId));
    return sum + (addon?.price || 0);
  }, 0);
  const clientRoomName = searchParams.get('roomName');
  const clientPrice = searchParams.get('price');
  const clientHotelName = searchParams.get('hotelName');
  
  const hotelName = useCheckoutStore((state) => state.hotelName) || clientHotelName || "Grand Ocean Resort";
  const hotelImage = useCheckoutStore((state) => state.hotelImage) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80";
  const hotelLocation = useCheckoutStore((state) => state.hotelLocation) || "Dubai Marina, UAE";
  
  const finalRoomName = selectedRoomName || clientRoomName || "Deluxe Ocean View Suite";
  const finalPrice = selectedPrice || (clientPrice ? Number(clientPrice) : 8000);
  
  const formatUrlDate = (dateStr?: string | null) => {
    if (!dateStr) return undefined;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return undefined;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const clientCheckIn = formatUrlDate(searchParams.get('checkIn')) || "12 Aug 2026";
  const clientCheckOut = formatUrlDate(searchParams.get('checkOut')) || "15 Aug 2026";
  const clientGuests = searchParams.get('guests') || "2";

  // Calculate statutory GST based on price per night
  const isPackage = finalRoomName.startsWith('Package:') || finalRoomName.toLowerCase().includes('package') || hotelId.startsWith('pkg-');
  const roomTotal = isPackage ? finalPrice : finalPrice * nights * rooms;
  
  let dynamicDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'fixed') {
      dynamicDiscount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'percentage') {
      dynamicDiscount = Math.floor(roomTotal * (appliedCoupon.value / 100));
    }
  }

  const gstResult = calculateRoomGst(finalPrice, nights, rooms, dynamicAddonsTotal);
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
          nights={nights}
          rooms={rooms}
          guests={clientGuests}
          checkIn={clientCheckIn}
          checkOut={clientCheckOut}
          gstRate={currentGstRate}
          taxes={finalTaxes}
          addons={dynamicAddonsTotal}
          discount={dynamicDiscount}
        />
        <TrustBadges />
        <CancellationPolicy />
      </div>
    </div>
  );
}
