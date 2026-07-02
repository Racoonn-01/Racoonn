"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard, { Property } from '@/components/search/PropertyCard';
import MapMockup from '@/components/search/MapMockup';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import FilterModal, { FilterState } from '@/components/search/FilterModal';

const mockProperties: Property[] = [
  {
    id: 's1',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1529393614?q=80&w=800&auto=format&fit=crop',
    ],
    title: 'Hotel in Gurugram',
    subtitle: 'Charming Studio | Kitchenette & Balcony',
    details: '1 bedroom · 1 king bed · 1 bathroom',
    dates: '3–8 Jun',
    price: 11497,
    rating: 4.52,
    reviews: 463,
    isSuperhost: true,
    freeCancellation: true,
  },
  {
    id: 's2',
    images: [
      'https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800&auto=format&fit=crop',
    ],
    title: 'Flat in Gurugram',
    subtitle: 'Stylish Luxury 1BHK w/ Balcony | Prime DLF Phase 3',
    details: '1 bedroom · 1 bed · 1 bathroom',
    dates: '4–9 Jun',
    price: 18369,
    rating: 4.71,
    reviews: 414,
    freeCancellation: true,
  },
  {
    id: 's3',
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    ],
    title: 'Guest House in Noida',
    subtitle: 'Modern Room near Metro | Free Parking & Wi-Fi',
    details: '1 bedroom · 1 king bed · 1 bathroom',
    dates: '3–8 Jun',
    price: 1299,
    rating: 4.6,
    reviews: 312,
    isSuperhost: true,
    freeCancellation: true,
  },
  {
    id: 's4',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop',
    ],
    title: 'Apartment in Faridabad',
    subtitle: 'Cozy 2BHK | Fully Furnished | Near Bata Chowk',
    details: '2 bedrooms · 2 beds · 2 bathrooms',
    dates: '3–8 Jun',
    price: 2199,
    rating: 4.9,
    reviews: 218,
    isGuestFavorite: true,
  },
];

const filters = [
  'Price', 'Type of place', 'Washing machine', 'WiFi', 'Allows pets', 'Instant Book', 'Air conditioning', 'Free parking', 'TV', 'Kitchen'
];

function SearchContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || 'Delhi NCR';
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState | null>(null);

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const filteredProperties = mockProperties.filter(property => {
    const searchString = `${property.title} ${property.subtitle} ${property.details}`.toLowerCase();

    // 1. Check quick filters
    if (selectedFilters.length > 0) {
      const quickMatch = selectedFilters.every(filter => {
        const f = filter.toLowerCase();
        if (f === 'wifi') return searchString.includes('wi-fi') || searchString.includes('wifi');
        if (f === 'free parking') return searchString.includes('parking');
        if (f === 'kitchen') return searchString.includes('kitchen');
        return true; 
      });
      if (!quickMatch) return false;
    }

    // 2. Check advanced filters from modal
    if (advancedFilters) {
      // Price
      if (property.price < advancedFilters.minPrice || property.price > advancedFilters.maxPrice) {
        return false;
      }

      // Rooms and beds (parse from `property.details`)
      const extractNumber = (keyword: string) => {
        const regex = new RegExp(`(\\d+)\\s+${keyword}`);
        const match = property.details.match(regex);
        return match ? parseInt(match[1], 10) : 0;
      };

      if (advancedFilters.bedrooms !== 'Any') {
        const bedrooms = extractNumber('bedroom');
        if (bedrooms < advancedFilters.bedrooms) return false;
      }

      if (advancedFilters.beds !== 'Any') {
        const beds = extractNumber('bed');
        if (beds < advancedFilters.beds) return false;
      }

      if (advancedFilters.bathrooms !== 'Any') {
        const bathrooms = extractNumber('bathroom');
        if (bathrooms < advancedFilters.bathrooms) return false;
      }

      // Property Types (check title/subtitle)
      if (advancedFilters.selectedPropertyTypes.length > 0) {
        const hasType = advancedFilters.selectedPropertyTypes.some(type => 
          property.title.toLowerCase().includes(type.toLowerCase()) || 
          property.subtitle.toLowerCase().includes(type.toLowerCase())
        );
        if (!hasType) return false;
      }

      // Amenities (best effort text match)
      if (advancedFilters.selectedAmenities.length > 0) {
        const hasAmenities = advancedFilters.selectedAmenities.every(amenity => {
          const a = amenity.toLowerCase();
          if (a === 'wifi') return searchString.includes('wi-fi') || searchString.includes('wifi');
          if (a === 'kitchen') return searchString.includes('kitchen');
          // For other amenities not in mock data strings, we'll gracefully ignore or we could strict match and return false.
          // Since our mock data is small, strict matching would return 0 results. 
          // But a true filter should be strict. Let's do a loose match if they aren't common keywords.
          if (['wifi', 'kitchen', 'parking'].some(k => a.includes(k))) {
             return searchString.includes(a);
          }
          return true;
        });
        if (!hasAmenities) return false;
      }

      // Booking Options
      if (advancedFilters.selectedBookingOptions.length > 0) {
        const hasBookingOptions = advancedFilters.selectedBookingOptions.every(option => {
           if (option === 'Instant Book' && !property.isSuperhost) return false; // mockup logic
           if (option === 'Allows pets' && !searchString.includes('pet')) return true; // allow since no data
           return true;
        });
        if (!hasBookingOptions) return false;
      }
    }

    return true;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-92px)] overflow-hidden">
      {/* Top Filter Bar */}
      <div className="relative shrink-0">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <button 
            className="flex items-center gap-2 border border-gray-300 hover:border-gray-900 rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] text-gray-700"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          
          <div className="h-8 w-px bg-gray-200 shrink-0 mx-1" />
          
          {filters.map((filter, idx) => {
            const isDropdown = idx < 2; // Price, Type of place
            const isSelected = selectedFilters.includes(filter);

            if (isDropdown) {
              return (
                <button 
                  key={idx}
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`flex items-center gap-2 border rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] ${
                    isSelected ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-300 hover:border-gray-900 text-gray-700'
                  }`}
                >
                  {filter} <ChevronDown size={14} />
                </button>
              );
            }

            return (
              <button 
                key={idx}
                onClick={() => toggleFilter(filter)}
                className={`border rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] ${
                  isSelected ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-300 hover:border-gray-900 text-gray-700'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden relative flex flex-col lg:flex-row w-full lg:px-6 lg:pb-6 lg:pt-4 lg:gap-6">
        
        {/* Right Panel: Map */}
        <div className="w-full h-[50vh] relative z-0 shrink-0 lg:h-full lg:relative lg:w-[45%] xl:w-[40%] lg:rounded-2xl overflow-hidden shadow-sm lg:border border-gray-200 order-1 lg:order-2">
          <MapMockup />
        </div>

        {/* Left Panel: Property List */}
        <div className="min-h-screen flex flex-col bg-slate-50 relative pb-20 lg:pb-0 rounded-t-[32px] -mt-8 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:min-h-0 lg:h-full lg:mt-0 lg:pt-0 lg:shadow-[0_4px_24px_rgba(0,0,0,0.06)] lg:rounded-2xl lg:border border-gray-200 lg:w-[55%] xl:w-[60%] lg:flex lg:overflow-y-auto order-2 lg:order-1">
          {/* Pull Bar Indicator for Mobile */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 lg:hidden shrink-0" />

          <div className="px-4 pb-4 lg:p-6 lg:pt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
              <div>
                <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900">Over 1,000 homes</h1>
                <p className="text-[14px] lg:text-[15px] text-gray-600 mt-1">Stays in {location}</p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 text-center py-12 text-gray-500">
                  No properties found matching your filters.
                </div>
              )}
            </div>
            
            <div className="mt-12 mb-8 flex justify-center">
              <button className="bg-gray-900 text-white font-bold text-[15px] px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Load more homes
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Filter Modal */}
      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        initialFilters={advancedFilters || undefined}
        onApply={(filters) => setAdvancedFilters(filters)}
        matchCount={filteredProperties.length}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}
