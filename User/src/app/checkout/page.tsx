import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Headphones } from "lucide-react";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";

import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { CheckoutSidebar } from "@/components/checkout/CheckoutSidebar";
import { MobileCheckoutBar } from "@/components/checkout/MobileCheckoutBar";
import logo from "@/assets/Racoonn-Logo-02.png";

export const metadata = {
  title: "Checkout | Racoonn Hotel Booking",
  description: "Complete your hotel booking securely on Racoonn.",
};

export default function CheckoutPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const roomName = typeof searchParams.roomName === 'string' ? searchParams.roomName : undefined;
  const price = typeof searchParams.price === 'string' ? Number(searchParams.price) : 8000;
  
  // Hardcoded constants for the UI flow (could be dynamic in real app)
  const nights = 3;
  const taxes = Math.floor(price * nights * 0.1); // 10% tax
  const addons = 1500;
  const discount = 2000;
  
  const roomPrice = price * nights;
  const totalAmount = roomPrice + taxes + addons - discount;

  return (
    <div className="min-h-screen bg-brand-sand pb-24 md:pb-12 text-brand-charcoal font-inter">
      {/* Checkout Progress */}
      <div className="bg-white/80 backdrop-blur-md border-b border-brand-sky sticky top-0 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex w-full md:w-auto items-center justify-between shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image src={logo} alt="Racoonn Logo" width={150} height={38} className="h-6 md:h-8 w-auto" />
            </Link>
            
            {/* Mobile Customer Care Button */}
            <div className="lg:hidden flex items-center">
              <button className="flex items-center gap-1.5 text-xs font-medium text-brand-navy hover:text-brand-coral bg-brand-sand px-3 py-1.5 rounded-full">
                <Headphones className="w-3.5 h-3.5" />
                <span>Support</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-3xl mx-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
            <CheckoutProgress />
          </div>

          {/* Desktop Customer Care Button */}
          <div className="shrink-0 hidden lg:flex justify-end min-w-37.5">
            <button className="flex items-center gap-2 text-sm font-medium text-brand-navy hover:text-brand-coral transition-colors bg-brand-sand hover:bg-brand-coral/10 px-4 py-2 rounded-full">
              <Headphones className="w-4 h-4" />
              <span className="whitespace-nowrap">Customer Care</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Section (70%) */}
          <Suspense fallback={<div className="flex-1 animate-pulse bg-gray-100 rounded-xl h-96"></div>}>
            <CheckoutFlow />
          </Suspense>

          {/* Right Sticky Booking Summary (30%) */}
          <CheckoutSidebar
            roomName={roomName}
            price={price}
            nights={nights}
            taxes={taxes}
            addons={addons}
            discount={discount}
          />
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="lg:hidden block">
        <MobileCheckoutBar total={totalAmount} />
      </div>
    </div>
  );
}
