"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

export interface DestinationItem {
  id: string | number;
  city: string;
  description: string;
  price: string;
  image: string;
}

export default function PopularDestinations() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadDestinations = async () => {
    try {
      const res = await fetch("/api/cms/popular-destinations");
      const json = await res.json();
      if (json.success && Array.isArray(json.destinations)) {
        setDestinations(json.destinations);
      }
    } catch (err) {
      console.error("Failed to fetch popular destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();

    window.addEventListener("cms_popular_destinations_updated", loadDestinations);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "racoonn_cms_popular_destinations_v1") {
        loadDestinations();
      }
    };
    window.addEventListener("storage", handleStorage);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("racoonn_cms_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "POPULAR_DESTINATIONS_UPDATED") {
          if (Array.isArray(event.data.data)) {
            setDestinations(event.data.data);
          } else {
            loadDestinations();
          }
        }
      };
    }

    return () => {
      window.removeEventListener("cms_popular_destinations_updated", loadDestinations);
      window.removeEventListener("storage", handleStorage);
      if (bc) bc.close();
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -350 : 350;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && destinations.length === 0) {
    return null; // Return null if Admin has not uploaded any destinations in CMS
  }

  return (
    <section className="container mx-auto px-4 pt-4 pb-4 relative">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mb-12">
        <div className="flex items-center gap-2 text-brand-coral font-bold text-sm tracking-widest uppercase mb-4">
          <span>EXPLORE UTTARAKHAND</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-navy font-heading mb-4">
          Popular Destinations in <span className="text-brand-coral">Uttarakhand</span>
        </h2>
        <p className="text-brand-charcoal/70 text-lg max-w-2xl">
          From serene mountains to spiritual towns, explore the best stays and packages in Devbhoomi.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative mb-4 group/carousel">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {destinations.map((dest) => {
            const rawPrice = dest.price ? String(dest.price).replace(/[^0-9,]/g, "") : "3,999";
            return (
              <Link
                href={`/search?location=${encodeURIComponent(dest.city)}`}
                key={dest.id}
                className="w-full min-w-full md:min-w-0 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 group/card relative rounded-[24px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 snap-center md:snap-start h-[450px]"
              >
                <Image
                  src={dest.image || "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop"}
                  alt={dest.city}
                  fill
                  unoptimized
                  className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/90" />

                {/* Location Tag (Top Left) */}
                <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <MapPin size={14} className="text-brand-coral" fill="currentColor" />
                  <span className="text-sm font-bold text-brand-navy">{dest.city}</span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-4">
                  <p className="text-white/90 font-medium text-[16px] leading-snug line-clamp-2">
                    {dest.description}
                  </p>
                  <div className="bg-white/95 px-5 py-2 rounded-full self-start text-brand-navy font-bold text-sm shadow-lg transform-gpu">
                    Stays from ₹{rawPrice}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        {destinations.length > 4 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-[50%] -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full hidden lg:flex items-center justify-center shadow-[0_4px_25px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/20 transition-transform hover:scale-105 opacity-0 group-hover/carousel:opacity-100 duration-300"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-[50%] translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full hidden lg:flex items-center justify-center shadow-[0_4px_25px_rgb(0,0,0,0.15)] text-brand-charcoal hover:text-brand-coral z-10 border border-brand-sky/20 transition-transform hover:scale-105 opacity-0 group-hover/carousel:opacity-100 duration-300"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* View All Button */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/search"
          className="bg-white border-2 border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-white px-8 py-3 rounded-full font-bold transition-colors shadow-sm flex items-center gap-2"
        >
          View all destinations <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
