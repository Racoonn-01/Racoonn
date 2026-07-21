import { Heart, Star, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Hotel, mockHotels } from '@/data/mockHotels';
import { isActiveProperty } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';
import { useState, useEffect } from 'react';

export default function SavedHotelsGrid() {
  const { profile, toggleSavedHotel, isAuthenticated } = useAuthStore();
  const [properties, setProperties] = useState<Hotel[]>(mockHotels);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties();
        if (data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedProperties: Hotel[] = data.map((doc: any) => ({
            id: doc.$id,
            name: doc.propertyName || doc.title || 'Unknown Property',
            location: doc.location || `${doc.city || ''}, ${doc.state || ''}`,
            rating: doc.rating || 0,
            reviews: doc.reviewsCount || 0,
            price: doc.price || 0,
            image: (doc.photos && doc.photos[0]) ? doc.photos[0] : 'https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop',
            status: doc.status?.toLowerCase(),
          }));
          setProperties([...mockHotels, ...mappedProperties]);
        }
      } catch (error) {
        console.error("Failed to load saved properties:", error);
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-3xl font-bold mb-2">Saved Hotels</h2>
          <p className="text-gray-500">Hotels you have favorited for future trips.</p>
        </div>
        <span className="px-4 py-1.5 bg-brand-coral/10 text-brand-coral font-bold rounded-full text-sm">
          {savedHotelsList.length} Saved
        </span>
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500">Please sign in to view your saved hotels.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-coral" />
          <p className="text-gray-500">Loading your saved hotels...</p>
        </div>
      ) : savedHotelsList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500">You haven&apos;t saved any hotels yet. Start exploring!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {savedHotelsList.map((hotel) => (
            <div key={hotel.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
              {/* Image */}
              <div className="w-full h-56 relative overflow-hidden">
                <Image 
                  src={hotel.image} 
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
                
                <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                  <MapPin size={14} /> {hotel.location}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Starting from</p>
                    <p className="font-bold text-lg text-brand-navy">${hotel.price}<span className="text-sm text-gray-400 font-medium">/night</span></p>
                  </div>
                  <button className="px-5 py-2.5 bg-brand-coral text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
