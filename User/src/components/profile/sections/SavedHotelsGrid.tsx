import { optimizeAppwriteImage } from "@/lib/optimizeImage";
import { Heart, Star, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Hotel, mockHotels } from '@/data/mockHotels';

type SavedItem = Hotel & { type?: 'property' | 'package' };

import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';
import { useState, useEffect } from 'react';

export default function SavedHotelsGrid() {
  const { profile, toggleSavedHotel, isAuthenticated } = useAuthStore();
  const [properties, setProperties] = useState<SavedItem[]>(mockHotels as SavedItem[]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const [data, pkgsRes] = await Promise.all([
          getProperties(),
          fetch('/api/cms/packages', { cache: 'no-store' }).catch(() => null)
        ]);

        let allItems: SavedItem[] = [];

        if (data && data.length > 0) {
          const mappedProperties: SavedItem[] = data.map((doc: Record<string, unknown>) => ({
            id: doc.$id,
            name: doc.propertyName || doc.title || 'Unknown Property',
            location: doc.location || `${doc.city || ''}, ${doc.state || ''}`,
            rating: doc.rating || 0,
            reviews: doc.reviewsCount || 0,
            price: doc.price || 0,
            image: (doc.photos && doc.photos[0]) ? doc.photos[0] : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
            status: doc.status?.toLowerCase(),
            type: 'property'
          }));
          allItems = [...allItems, ...mappedProperties];
        }

        if (pkgsRes) {
          const pkgsJson = await pkgsRes.json();
          if (pkgsJson.success && Array.isArray(pkgsJson.packages)) {
            const mappedPkgs: SavedItem[] = pkgsJson.packages.map((pkg: Record<string, unknown>) => ({
              id: pkg.id || pkg.$id,
              name: pkg.title || 'Unknown Package',
              location: pkg.location || '',
              rating: pkg.rating || 0,
              reviews: 0,
              price: (pkg.pricing && pkg.pricing[0]) ? pkg.pricing[0].pricePerPerson : 0,
              image: (pkg.images && pkg.images[0]) ? pkg.images[0] : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
              status: pkg.status?.toLowerCase(),
              type: 'package'
            }));
            allItems = [...allItems, ...mappedPkgs];
          }
        }

        setProperties([...(mockHotels as SavedItem[]), ...allItems]);
      } catch (error) {
        console.error("Failed to load saved items:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  }, []);
  
  const savedHotelIds = profile?.savedHotels || [];
  const savedHotelsList = properties
    .filter(isActiveProperty)
    .filter(hotel => savedHotelIds.includes(hotel.id));

  const savedProperties = savedHotelsList.filter((item: SavedItem) => item.type === 'property' || !item.type);
  const savedPackages = savedHotelsList.filter((item: SavedItem) => item.type === 'package');

  const renderGrid = (items: SavedItem[], title: string) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-12 last:mb-0">
        <h3 className="font-heading font-bold text-2xl text-brand-navy mb-6">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((hotel) => (
            <div key={hotel.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="w-full h-56 relative overflow-hidden">
                <Image 
                  src={optimizeAppwriteImage(hotel.image)} 
                  alt={hotel.name} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => toggleSavedHotel(hotel.id)}
                  className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-brand-coral shadow-sm hover:scale-110 transition-transform"
                >
                  <Heart size={20} className="fill-brand-coral text-brand-coral" />
                </button>
              </div>
              
              {/* Details */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-brand-coral mb-2">
                  <Star size={16} className="fill-brand-coral" />
                  <span className="font-bold text-sm">{hotel.rating}</span>
                  <span className="text-gray-400 text-xs">({hotel.reviews})</span>
                </div>
                
                <h3 className="font-heading font-bold text-xl text-brand-navy mb-1 line-clamp-1">
                  {hotel.name}
                </h3>
                
                <div className="text-gray-500 text-sm flex items-start gap-1.5 mb-4">
                  <MapPin size={14} className="shrink-0 mt-0.5" /> 
                  <span className="line-clamp-2">{hotel.location}</span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-50">
                  <Link 
                    // @ts-expect-error type field is added to Hotel
                    href={hotel.type === 'package' ? `/packages/${hotel.id}` : `/property/${hotel.id}`}
                    className="flex items-center justify-center w-full py-3 bg-brand-coral text-white font-bold rounded-xl text-[15px] hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold mb-2">Saved Items</h2>
          <p className="text-gray-500 text-sm sm:text-base">Hotels and packages you have favorited for future trips.</p>
        </div>
        <div className="self-start sm:self-auto">
          <span className="inline-flex items-center justify-center px-4 py-1.5 bg-brand-coral/10 text-brand-coral font-bold rounded-full text-sm whitespace-nowrap">
            {savedHotelsList.length} Saved
          </span>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500">Please sign in to view your saved items.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-coral" />
          <p className="text-gray-500">Loading your saved items...</p>
        </div>
      ) : savedHotelsList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500">You haven&apos;t saved any items yet. Start exploring!</p>
        </div>
      ) : (
        <div>
          {renderGrid(savedProperties, "Saved Properties")}
          {renderGrid(savedPackages, "Saved Packages")}
        </div>
      )}
    </div>
  );
}
