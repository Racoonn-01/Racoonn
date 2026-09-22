"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Loader2, Search } from 'lucide-react';

export interface DestinationItem {
  id: string | number;
  city: string;
  description: string;
  price: string;
  image: string;
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadDestinations = async () => {
    try {
      const res = await fetch("/api/cms/popular-destinations");
      const json = await res.json();
      if (json.success && Array.isArray(json.destinations)) {
        setDestinations(json.destinations);
      }
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDestinations();
  }, []);

  const filteredDestinations = destinations.filter(dest => 
    dest.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Destinations Grid */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-heading font-bold text-4xl text-brand-navy mb-3">All Destinations</h1>
            <p className="text-gray-500 text-lg">Explore all our curated destinations and start planning your next journey.</p>
          </div>
          
          <div className="relative w-full md:w-80 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-coral/20 focus:border-brand-coral outline-none transition-all text-gray-800 placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin text-brand-coral mb-4" />
            <p>Loading destinations...</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-gray-50 rounded-3xl">
            <p className="text-lg font-medium">No destinations found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredDestinations.map((dest) => (
              <Link href={`/search?destination=${dest.city}`} key={dest.id} className="block group">
                <div className="relative w-full h-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <Image
                    src={dest.image}
                    alt={dest.city}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/90" />

                  {/* Location Tag */}
                  <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                    <MapPin size={14} className="text-brand-coral" fill="currentColor" />
                    <span className="text-sm font-bold text-brand-navy">{dest.city}</span>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-4">
                    <p className="text-white/90 font-medium text-[16px] leading-snug">{dest.description}</p>
                    <div className="bg-white/95 px-5 py-2 rounded-full self-start text-brand-navy font-bold text-sm shadow-lg transform-gpu">
                      Stays from {dest.price}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
