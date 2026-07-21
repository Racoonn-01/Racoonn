"use client";
import { useState } from "react";
import { Star, MapPin, Calendar, Users, BedDouble, Tag, X } from "lucide-react";
import Image from "next/image";
import { useCheckoutStore } from "@/store/checkoutStore";

export function BookingSummary({ 
  roomName = "Deluxe Ocean View Suite",
  pricePerNight = 8000,
  hotelName = "Grand Ocean Resort",
  hotelImage = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
  hotelLocation = "Dubai Marina, UAE",
  nights = 3,
  rooms = 1,
  guests = "2",
  checkIn = "12 Aug 2026",
  checkOut = "15 Aug 2026",
  taxes = 2400,
  addons = 1500,
  discount = 0 
}: {
  roomName?: string;
  pricePerNight?: number;
  hotelName?: string;
  hotelImage?: string;
  hotelLocation?: string;
  nights?: number;
  rooms?: number;
  guests?: string;
  checkIn?: string;
  checkOut?: string;
  taxes?: number;
  addons?: number;
  discount?: number;
}) {
  const roomPrice = pricePerNight * nights * rooms;
  const total = roomPrice + taxes + addons - discount;
  
  const { appliedCoupon, applyCoupon, removeCoupon } = useCheckoutStore();
  const [couponInput, setCouponInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput.trim());
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setErrorMsg("");
      setCouponInput("");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky overflow-hidden">
      <div className="p-6 pb-4 border-b border-brand-sky">
        <h2 className="text-xl font-poppins font-bold text-brand-navy mb-4">Booking Summary</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden relative shrink-0 bg-gray-100">
            <Image 
              src={hotelImage} 
              alt={hotelName}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-brand-coral text-brand-coral" />
              ))}
            </div>
            <h3 className="font-bold text-brand-navy text-lg leading-tight mb-1">{hotelName}</h3>
            <div className="flex items-start text-sm text-gray-500 gap-1">
              <MapPin className="w-4 h-4 shrink-0 text-brand-coral mt-0.5" />
              <span>{hotelLocation}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 py-4 space-y-4 border-b border-brand-sky text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-coral" /> Check-In</p>
            <p className="font-medium text-brand-navy">{checkIn}</p>
            <p className="text-xs text-gray-500">From 14:00</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4 text-brand-coral" /> Check-Out</p>
            <p className="font-medium text-brand-navy">{checkOut}</p>
            <p className="text-xs text-gray-500">Until 12:00</p>
          </div>
        </div>
      </div>

      <div className="p-6 py-4 space-y-3 text-sm border-b border-brand-sky">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4 text-brand-coral" /> Guests</span>
          <span className="font-medium text-brand-navy">{guests} Guests</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 flex items-center gap-2"><BedDouble className="w-4 h-4 text-brand-coral" /> Room</span>
          <span className="font-medium text-brand-navy text-right">{rooms} × {roomName}</span>
        </div>
      </div>

      {/* Coupon Field */}
      <div className="p-6 pb-4 bg-brand-sand border-b border-brand-sky/50">
        {appliedCoupon ? (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-green-700">
              <Tag className="w-4 h-4" />
              <span className="font-bold text-sm">{appliedCoupon.code}</span>
              <span className="text-xs opacity-80">(Applied)</span>
            </div>
            <button 
              onClick={removeCoupon}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Remove coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="Enter coupon code" 
                className="flex-1 bg-white border border-brand-sky rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-all uppercase"
              />
              <button 
                onClick={handleApplyCoupon}
                className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-transform active:scale-[0.98] shadow-sm"
              >
                Apply
              </button>
            </div>
            {errorMsg && <p className="text-xs text-red-500 mt-2 font-medium ml-1">{errorMsg}</p>}
          </div>
        )}
      </div>

      {/* Price Summary embedded or separate. For the prompt, I will put it here for simplicity. */}
      <div className="p-6 py-4 bg-brand-sand">
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Room Price (₹{pricePerNight.toLocaleString()} × {nights} Nights)</span>
            <span className="font-medium text-brand-navy">₹{roomPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="font-medium text-brand-navy">₹{taxes.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Add-On Services</span>
            <span className="font-medium text-brand-navy">₹{addons.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span className="font-medium">-₹{discount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-brand-sky flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total Amount</p>
            <p className="text-2xl font-poppins font-bold text-brand-coral">₹{total.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
