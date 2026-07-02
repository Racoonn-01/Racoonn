"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useCheckoutStore } from "@/store/checkoutStore";
import { GuestDetailsForm } from "@/components/checkout/GuestDetailsForm";
import { TravelersForm } from "@/components/checkout/TravelersForm";
import { AddonSelector } from "@/components/checkout/AddonSelector";
import { CheckCircle, Loader2 } from "lucide-react";

export function CheckoutFlow() {
  const currentStep = useCheckoutStore((state) => state.currentStep);
  const submitBooking = useCheckoutStore((state) => state.submitBooking);
  const isSubmitting = useCheckoutStore((state) => state.isSubmitting);
  const bookingError = useCheckoutStore((state) => state.bookingError);
  
  const searchParams = useSearchParams();
  const price = Number(searchParams.get('price')) || 32000;
  const nights = 3; // hardcoded for now, would be calculated from dates
  const checkIn = '2024-05-21';
  const checkOut = '2024-05-24';

  const handleCompleteBooking = async () => {
    await submitBooking({
      hotelName: 'The Oberoi Udaivilas', // Hardcoded for demo, normally from URL/context
      price,
      nights,
      checkIn,
      checkOut
    });
  };

  return (
    <div className="flex-1 space-y-8 min-w-0">
      {currentStep === 3 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {bookingError && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm">
              {bookingError}
            </div>
          )}
          <GuestDetailsForm />
          <TravelersForm />
          <AddonSelector />
          <div className="hidden md:flex justify-end">
            <button 
              onClick={handleCompleteBooking}
              disabled={isSubmitting}
              className="bg-brand-coral hover:bg-[#d65f64] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-brand-coral/30 transition-transform active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Booking"}
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-xl shadow-sm border border-brand-sky p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-poppins font-bold text-brand-navy mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your booking at Grand Ocean Resort has been successfully confirmed. A confirmation email has been sent to your inbox.
            </p>
            <div className="p-6 bg-brand-sand rounded-xl inline-block text-left mb-8">
              <p className="text-sm text-gray-500 mb-1">Booking Reference ID</p>
              <p className="text-xl font-bold text-brand-navy">RCN-8849-2A</p>
            </div>
            <div>
              <button 
                onClick={() => window.location.href = "/"}
                className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-[0.98]"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
