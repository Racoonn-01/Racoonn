"use client";
// Removed Lock since it was unused
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSearchParams } from "next/navigation";
import { getProperty } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";
import { DEFAULT_ADDONS } from "@/components/checkout/AddonSelector";

export function MobileCheckoutBar({ total: serverTotal }: { total: number }) {
  const { currentStep, nextStep, selectedPrice, selectedAddons, appliedCoupon } = useCheckoutStore();
  const searchParams = useSearchParams();
  
  const clientPrice = searchParams.get('price');
  let finalTotal = serverTotal;
  
  const activePrice = selectedPrice || (clientPrice ? Number(clientPrice) : null);
  
  const checkInStr = searchParams.get('checkIn');
  const checkOutStr = searchParams.get('checkOut');
  
  let nights = 3;
  if (checkInStr && checkOutStr) {
    const checkInDate = new Date(checkInStr);
    const checkOutDate = new Date(checkOutStr);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
    if (!isNaN(diff) && diff > 0) {
      nights = diff;
    }
  }

  const roomsStr = searchParams.get('rooms');
  const rooms = roomsStr ? Number(roomsStr) : 1;
  
  const propertyAddons = useCheckoutStore(state => state.propertyAddons);
  const hotelId = searchParams.get('hotelId') || useCheckoutStore.getState().selectedHotelId || 'hotel-123';

  const displayAddons = propertyAddons === null ? [] : (propertyAddons.length > 0 ? propertyAddons : DEFAULT_ADDONS);

  const dynamicAddonsTotal = selectedAddons.reduce((sum, addonId) => {
    const addon = displayAddons.find(a => a.id === addonId);
    return sum + (addon?.price || 0);
  }, 0);

  if (activePrice) {
    const roomTotal = activePrice * nights * rooms;
    let dynamicDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'fixed') {
        dynamicDiscount = appliedCoupon.value;
      } else if (appliedCoupon.type === 'percentage') {
        dynamicDiscount = Math.floor(roomTotal * (appliedCoupon.value / 100));
      }
    }
    const taxes = Math.floor(roomTotal * 0.1);
    finalTotal = roomTotal + taxes + dynamicAddonsTotal - dynamicDiscount;
  }

  if (currentStep === 4) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-sky p-4 lg:hidden z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
          <p className="text-xl font-poppins font-bold text-brand-coral">₹{finalTotal.toLocaleString()}</p>
        </div>
        <button 
          onClick={nextStep}
          className="bg-brand-coral hover:bg-brand-coral text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-brand-coral/30"
        >
          {currentStep === 3 ? "Continue to Payment" : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}
