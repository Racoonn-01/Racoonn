"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { PopularStaySection } from "@/lib/cms/popularStaysStore";
import { getProperties } from "@/lib/appwrite/api";
import { isActiveProperty } from "@/lib/utils";

import { Models } from "appwrite";

interface Property {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  location: string;
  city: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  status?: string;
}

export default function DynamicPopularStays() {
  const [sections, setSections] = useState<PopularStaySection[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sections live from server API / Appwrite DB
    const loadCMSSections = async () => {
      try {
        const res = await fetch("/api/cms/popular-stays");
        const json = await res.json();
        if (json.success && Array.isArray(json.sections)) {
          setSections(json.sections);
        }
      } catch (err) {
        console.error("Failed to load CMS popular stays:", err);
      }
    };

    loadCMSSections();

    // 1. Local window event listener
    window.addEventListener("cms_popular_stays_updated", loadCMSSections);

    // 2. BroadcastChannel listener across windows/ports
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("racoonn_cms_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "POPULAR_STAYS_UPDATED") {
          if (Array.isArray(event.data.data)) {
            setSections(event.data.data);
          } else {
            loadCMSSections();
          }
        }
      };
    }

    async function loadData() {
      setLoading(true);
      const docs = await getProperties();
      if (docs) {
        const mapped: Property[] = docs.map((d: Models.Document) => {
          const doc = d as unknown as Record<string, unknown>;
          const rawPrice = Number(
            doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || 3500
          );
          const photos = Array.isArray(doc.photos) ? doc.photos : [];
          return {
            id: String(doc.$id || ""),
            title: String(doc.propertyName || doc.title || "Luxury Stay"),
            subtitle: String(doc.description || ""),
            details: String(doc.description || "Beautiful view · Heritage stay"),
            location: [doc.location, doc.city].filter(Boolean).map(String).join(", ") || String(doc.city || "Uttarakhand"),
            city: String(doc.city || ""),
            rating: Number(doc.rating || 4.8),
            reviews: Number(doc.reviewsCount || 120),
            price: rawPrice > 0 ? rawPrice : 3500,
            image: photos[0]
              ? String(photos[0])
              : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800&auto=format&fit=crop",
            status: typeof doc.status === "string" ? doc.status.toLowerCase() : undefined,
          };
        });
        setAllProperties(mapped.filter(isActiveProperty));
      }
      setLoading(false);
    }

    loadData();

    return () => {
      window.removeEventListener("cms_popular_stays_updated", loadCMSSections);
      if (bc) bc.close();
    };
  }, []);

  // Filter sections that are marked active by CMS Admin
  const activeSections = sections.filter((s) => s.isActive);

  if (!loading && activeSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {activeSections.map((sec, secIndex) => {
        let matchedProps: Property[] = [];

        // 1. If Admin selected specific property IDs in CMS modal
        if (sec.propertyIds && sec.propertyIds.length > 0) {
          matchedProps = allProperties.filter((p) => sec.propertyIds?.includes(p.id));
        } else {
          // 2. Strict location matching (e.g. Haldwani, Nainital, Dehradun)
          const targetLoc = (sec.location && sec.location.toLowerCase() !== "all")
            ? sec.location.trim().toLowerCase()
            : sec.title.toLowerCase().includes(" in ")
            ? sec.title.split(/ in /i)[1]?.trim().toLowerCase() || ""
            : "";

          if (targetLoc && targetLoc !== "all") {
            matchedProps = allProperties.filter(
              (p) =>
                p.location.toLowerCase().includes(targetLoc) ||
                p.city.toLowerCase().includes(targetLoc) ||
                p.title.toLowerCase().includes(targetLoc)
            );
          } else {
            matchedProps = allProperties;
          }
        }

        // Do not render section if no matching properties exist
        if (matchedProps.length === 0) return null;

        const displayProperties = matchedProps.slice(0, 4);

        const targetLocation = (sec.location && sec.location.toLowerCase() !== "all") 
          ? sec.location.trim() 
          : sec.title.toLowerCase().includes(" in ") 
          ? sec.title.split(/ in /i)[1]?.trim() || "" 
          : "";

        return (
          <motion.section 
            key={sec.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: secIndex * 0.1, ease: "easeOut" }}
            className="container mx-auto px-4 py-6 relative group"
          >
            {/* Section Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight font-heading">
                  {sec.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{sec.subtitle}</p>
              </div>
              <Link
                href={targetLocation ? `/search?location=${encodeURIComponent(targetLocation)}` : "/search"}
                className="text-rose-600 font-semibold flex items-center hover:underline text-sm whitespace-nowrap group/link"
              >
                View all <ChevronRight size={16} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProperties.map((stay, index) => (
                <motion.div
                  key={stay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                >
                  <Link
                    href={`/property/${stay.id}`}
                    className="w-full group/card cursor-pointer flex flex-col h-full"
                  >
                    {/* Image Card */}
                    <div className="relative w-full aspect-4/3 shrink-0 rounded-2xl overflow-hidden mb-3 bg-gray-100 shadow-xs">
                      <Image
                        src={stay.image}
                        alt={stay.title}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="absolute top-3 right-3 text-white hover:scale-110 active:scale-95 transition-transform z-10 p-1"
                      >
                        <Heart
                          size={22}
                          className="fill-black/30 text-white"
                          strokeWidth={2}
                        />
                      </button>
                    </div>

                    {/* Info Block */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 min-w-0">
                        <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1 group-hover/card:text-rose-600 transition-colors flex-1 min-w-0">
                          {stay.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[13px] font-semibold shrink-0">
                          <Star size={13} className="fill-gray-900 text-gray-900" />
                          {Number(stay.rating) > 0 ? stay.rating : "4.8"}{" "}
                          <span className="text-gray-400 font-normal">({stay.reviews})</span>
                        </div>
                      </div>
                      <p className="text-[13px] text-gray-500 truncate mt-0.5 w-full">{stay.location}</p>
                      <p className="text-[13px] text-gray-500 line-clamp-1 mt-0.5 w-full">{stay.subtitle || stay.details}</p>
                      <div className="mt-2 text-[15px] font-bold text-gray-900">
                        ₹{stay.price.toLocaleString("en-IN")}{" "}
                        <span className="font-normal text-xs text-gray-500">per night</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
