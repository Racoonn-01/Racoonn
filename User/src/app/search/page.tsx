"use client";

import React, { useState, Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyCard, { Property } from '@/components/search/PropertyCard';
import MapMockup from '@/components/search/MapMockup';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import FilterModal, { FilterState } from '@/components/search/FilterModal';
import PricePopover from '@/components/search/PricePopover';
import { isActiveProperty, parseLocationGeo } from '@/lib/utils';
import { getProperties } from '@/lib/appwrite/api';
import { databases } from '@/lib/appwrite/config';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const filters = [
  'Price', 'Washing machine', 'WiFi', 'Allows pets', 'Instant Book', 'Air conditioning', 'Free parking', 'TV', 'Kitchen'
];

interface AppwriteDoc {
  $id: string;
  propertyName?: string;
  title?: string;
  description?: string;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  location?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewsCount?: number;
  price?: number;
  startingPrice?: number;
  minPrice?: number;
  basePrice?: number;
  pricePerNight?: number;
  photos?: string[];
  status?: string;
  propertyId?: string;
  roomPrice?: number;
  amenities?: string[] | string;
  amenityList?: string[] | string;
}

function checkPropertyAmenity(property: Property, filterKey: string, searchString: string): boolean {
  const f = filterKey.toLowerCase().trim();
  const propertyAmenities = property.amenities || [];

  const hasVendorAmenity = (...keys: string[]) => {
    return propertyAmenities.some((a) =>
      keys.some((k) => a === k || a.includes(k))
    );
  };

  if (f.includes('wifi') || f === 'wifi') {
    if (hasVendorAmenity('wifi', 'internet')) return true;
    return searchString.includes('wifi') || searchString.includes('wi-fi') || searchString.includes('internet');
  }

  if (f.includes('parking') || f.includes('free parking')) {
    if (hasVendorAmenity('parking', 'ev', 'garage')) return true;
    return searchString.includes('park') || searchString.includes('garage');
  }

  if (f.includes('kitchen')) {
    if (hasVendorAmenity('kitchen', 'restaurant', 'room_service')) return true;
    return searchString.includes('kitchen') || searchString.includes('cook');
  }

  if (f.includes('wash') || f.includes('machine') || f.includes('laundry')) {
    if (hasVendorAmenity('laundry', 'washer', 'dryer')) return true;
    return searchString.includes('wash') || searchString.includes('machine') || searchString.includes('laundry');
  }

  if (f.includes('air') || f.includes('conditioning') || f === 'ac') {
    if (hasVendorAmenity('ac', 'air', 'conditioning')) return true;
    return searchString.includes('air') || searchString.includes('ac') || searchString.includes('cool') || searchString.includes('condition');
  }

  if (f.includes('pet') || f.includes('allows pets')) {
    if (hasVendorAmenity('pets', 'pet')) return true;
    return searchString.includes('pet') || searchString.includes('dog') || searchString.includes('cat') || searchString.includes('allow');
  }

  if (f.includes('instant') || f.includes('instant book')) {
    return Boolean(property.isSuperhost || searchString.includes('instant'));
  }

  if (f === 'tv' || f.includes('tv')) {
    if (hasVendorAmenity('tv', 'smart_tv', 'television')) return true;
    return searchString.includes('tv') || searchString.includes('television');
  }

  if (f.includes('pool')) {
    if (hasVendorAmenity('pool', 'swimming')) return true;
    return searchString.includes('pool') || searchString.includes('swim');
  }

  if (f.includes('gym') || f.includes('fitness')) {
    if (hasVendorAmenity('gym', 'fitness')) return true;
    return searchString.includes('gym') || searchString.includes('fitness');
  }

  if (f.includes('spa')) {
    if (hasVendorAmenity('spa')) return true;
    return searchString.includes('spa') || searchString.includes('massage');
  }

  if (f.includes('balcony') || f.includes('patio')) {
    if (hasVendorAmenity('balcony', 'patio', 'terrace')) return true;
    return searchString.includes('balcony') || searchString.includes('patio') || searchString.includes('terrace');
  }

  if (f.includes('bar')) {
    if (hasVendorAmenity('bar')) return true;
    return searchString.includes('bar') || searchString.includes('lounge');
  }

  if (propertyAmenities.length > 0) {
    if (propertyAmenities.some((a) => a.includes(f) || f.includes(a))) return true;
  }

  return searchString.includes(f);
}

function SearchContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || searchParams.get('destination') || 'anywhere';
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState | null>(null);
  // Mobile bottom-sheet drag state
  const [isListExpanded, setIsListExpanded] = useState(false);
  const dragStartY = useRef(0);

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      const data = await getProperties();
      
      // Fetch rooms to calculate accurate min starting price for properties without a valid price
      const roomsMap: Record<string, number> = {};
      try {
        const roomsRes = await databases.listDocuments(
          DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || '6791e8430032e5ce6c98'
        );
        roomsRes.documents.forEach((room: Record<string, string | number | null | undefined>) => {
          const roomPrice = Number(room.price || 0);
          if (room.propertyId && roomPrice > 0) {
            if (!roomsMap[room.propertyId] || roomPrice < roomsMap[room.propertyId]) {
              roomsMap[room.propertyId] = roomPrice;
            }
          }
        });
      } catch (err) {
        console.warn('Failed to load rooms for price mapping:', err);
      }

      if (data) {
        const mappedProperties: Property[] = data.map((doc: AppwriteDoc) => {
          const rawPrice = Number(doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || roomsMap[doc.$id] || 0);
          const { cleanLocation, lat: geoLat, lng: geoLng } = parseLocationGeo(doc.location || "");
          const numBedrooms = Number(doc.bedrooms || 1);
          const numBeds = Number(doc.beds || numBedrooms || 1);
          const numBathrooms = Number(doc.bathrooms || 1);

          const rawAmenities = doc.amenities || doc.amenityList || [];
          const amenitiesArr: string[] = Array.isArray(rawAmenities)
            ? rawAmenities.map((a: unknown) => String(a).toLowerCase())
            : typeof rawAmenities === 'string'
            ? rawAmenities.split(',').map((a: string) => a.trim().toLowerCase())
            : [];

          return {
            id: doc.$id,
            title: doc.propertyName || doc.title || 'Unknown Property',
            subtitle: doc.description || '',
            details: `${numBedrooms} bedrooms · ${numBeds} beds · ${numBathrooms} bathrooms`,
            location: [cleanLocation, doc.city, doc.state].filter(Boolean).join(", ") || `${doc.city || ''}, ${doc.state || ''}`,
            city: doc.city || '',
            state: doc.state || '',
            lat: doc.lat || geoLat,
            lng: doc.lng || geoLng,
            rating: doc.rating || 0,
            reviews: doc.reviewsCount || 0,
            price: rawPrice > 0 ? rawPrice : 3500,
            images: (doc.photos && doc.photos.length > 0) ? doc.photos : ['https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop'],
            status: doc.status?.toLowerCase() || 'active',
            bedrooms: numBedrooms,
            beds: numBeds,
            bathrooms: numBathrooms,
            propertyType: doc.title || doc.description || '',
            amenities: amenitiesArr,
          };
        });
        setProperties(mappedProperties);
      }
      setLoading(false);
    }
    loadProperties();
  }, []);

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter(f => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const filteredProperties = properties.filter(property => {
    if (!isActiveProperty(property)) return false;

    const urlLocation = searchParams.get('location') || searchParams.get('destination');
    if (urlLocation && urlLocation.trim() !== '' && urlLocation.toLowerCase() !== 'anywhere') {
      const propLocStr = `${property.location} ${property.title} ${property.subtitle}`.toLowerCase();
      if (!propLocStr.includes(urlLocation.toLowerCase())) {
        return false;
      }
    }

    const aiQuery = searchParams.get('ai');
    if (aiQuery && aiQuery.trim() !== '') {
      const aiSearchString = `${property.title} ${property.subtitle} ${property.details} ${property.location}`.toLowerCase();
      const words = aiQuery.toLowerCase().split(' ').filter(w => w.length > 2);
      const matchesAi = words.some(w => aiSearchString.includes(w));
      if (!matchesAi && words.length > 0) return false;
    }

    const searchString = `${property.title} ${property.subtitle} ${property.details} ${property.location} ${property.city} ${property.state}`.toLowerCase();

    // 1. Check quick filters (pill buttons)
    if (selectedFilters.length > 0) {
      const quickMatch = selectedFilters.every(filter => {
        if (filter === 'Price') return true;
        return checkPropertyAmenity(property, filter, searchString);
      });
      if (!quickMatch) return false;
    }

    // 2. Check advanced filters from popup modal & price popover
    if (advancedFilters) {
      // Price Range
      if (property.price < advancedFilters.minPrice || property.price > advancedFilters.maxPrice) {
        return false;
      }

      // Bedrooms
      if (advancedFilters.bedrooms !== 'Any') {
        const reqBedrooms = Number(advancedFilters.bedrooms);
        const propBedrooms = property.bedrooms || 1;
        if (propBedrooms < reqBedrooms) return false;
      }

      // Beds
      if (advancedFilters.beds !== 'Any') {
        const reqBeds = Number(advancedFilters.beds);
        const propBeds = property.beds || property.bedrooms || 1;
        if (propBeds < reqBeds) return false;
      }

      // Bathrooms
      if (advancedFilters.bathrooms !== 'Any') {
        const reqBathrooms = Number(advancedFilters.bathrooms);
        const propBathrooms = property.bathrooms || 1;
        if (propBathrooms < reqBathrooms) return false;
      }

      // Property Types (House, Guest house, Hotel, Villa, etc.)
      if (advancedFilters.selectedPropertyTypes && advancedFilters.selectedPropertyTypes.length > 0) {
        const hasType = advancedFilters.selectedPropertyTypes.some(type => {
          const t = type.toLowerCase();
          return (
            property.title.toLowerCase().includes(t) || 
            property.subtitle.toLowerCase().includes(t) ||
            (property.propertyType && property.propertyType.toLowerCase().includes(t))
          );
        });
        if (!hasType) return false;
      }

      // Amenities
      if (advancedFilters.selectedAmenities && advancedFilters.selectedAmenities.length > 0) {
        const hasAmenities = advancedFilters.selectedAmenities.every(amenity => {
          return checkPropertyAmenity(property, amenity, searchString);
        });
        if (!hasAmenities) return false;
      }

      // Booking Options
      if (advancedFilters.selectedBookingOptions && advancedFilters.selectedBookingOptions.length > 0) {
        const hasBookingOptions = advancedFilters.selectedBookingOptions.every(option => {
          if (option === 'Instant Book') return property.isSuperhost || searchString.includes('instant');
          if (option === 'Allows pets') return searchString.includes('pet') || searchString.includes('dog') || searchString.includes('allow');
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
            const isDropdown = filter === 'Price';
            const isSelected = selectedFilters.includes(filter);

            if (isDropdown) {
              return (
                <button 
                  key={idx}
                  onClick={() => setIsPricePopoverOpen(true)}
                  className={`flex items-center gap-2 border rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] ${
                    isSelected || (advancedFilters && (advancedFilters.minPrice > 1000 || advancedFilters.maxPrice < 100000))
                      ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold' 
                      : 'border-gray-300 hover:border-gray-900 text-gray-700'
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
      <div className="flex-1 overflow-hidden lg:overflow-visible relative flex flex-col lg:flex-row w-full lg:px-6 lg:pb-6 lg:pt-4 lg:gap-6">
        
        {/* Map Panel — fills full area on mobile (behind sheet), flex item on desktop */}
        <div
          className="absolute inset-0 overflow-hidden
            lg:static lg:shrink-0 lg:h-full lg:w-[45%] xl:w-[40%]
            lg:rounded-2xl shadow-sm lg:border border-gray-200 lg:order-2"
        >
          <MapMockup 
            properties={filteredProperties} 
            selectedPropertyId={selectedPropertyId} 
            onSelectProperty={(id) => setSelectedPropertyId(id)} 
          />
        </div>

        {/* Property List — absolute bottom sheet on mobile, flex item on desktop */}
        <div
          className="absolute left-0 right-0 flex flex-col bg-slate-50 rounded-t-[32px]
            lg:static lg:h-full lg:w-[55%] xl:w-[60%]
            lg:rounded-2xl lg:border border-gray-200 lg:order-1
            lg:shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
          style={{
            // Mobile: top slides between 50% (peek) and 0 (full screen)
            top: isListExpanded ? '0' : '50%',
            bottom: 0,
            boxShadow: '0 -8px 30px rgba(0,0,0,0.14)',
            transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1)',
            zIndex: 10,
          }}
        >
          {/* ── Pull bar / drag handle (mobile only) ── */}
          <div
            className="lg:hidden shrink-0 flex flex-col items-center py-3 cursor-pointer select-none"
            onClick={() => setIsListExpanded(v => !v)}
            onTouchStart={(e) => {
              dragStartY.current = e.touches[0].clientY;
            }}
            onTouchEnd={(e) => {
              const delta = dragStartY.current - e.changedTouches[0].clientY;
              if (delta > 30) setIsListExpanded(true);
              else if (delta < -30) setIsListExpanded(false);
            }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            {isListExpanded && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsListExpanded(false); }}
                className="mt-3 flex items-center gap-1.5 bg-gray-900 text-white text-[12px] font-bold px-4 py-1.5 rounded-full shadow-lg cursor-pointer"
              >
                🗺️ Show Map
              </button>
            )}
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto px-4 pb-20 lg:px-6 lg:pb-6 lg:pt-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
              <div>
                <h1 className="text-[24px] lg:text-[28px] font-bold text-gray-900">
                  {filteredProperties.length === 0 
                    ? 'No homes found' 
                    : filteredProperties.length === 1 
                      ? '1 stay found' 
                      : `${filteredProperties.length} homes available`}
                </h1>
                <p className="text-[14px] lg:text-[15px] text-gray-600 mt-1">Stays in {location}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-10">
              {loading ? (
                [1, 2, 3, 4].map((n) => (
                  <div key={n} className="animate-pulse flex flex-col gap-3">
                    <div className="w-full h-64 bg-gray-200 rounded-2xl" />
                    <div className="w-3/4 h-5 bg-gray-200 rounded-md" />
                    <div className="w-1/2 h-4 bg-gray-200 rounded-md" />
                    <div className="w-1/3 h-5 bg-gray-200 rounded-md mt-2" />
                  </div>
                ))
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    property={property} 
                    isSelected={selectedPropertyId === property.id}
                    onSelect={(id) => setSelectedPropertyId(id)}
                  />
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

      {/* Price Popover */}
      <PricePopover
        isOpen={isPricePopoverOpen}
        onClose={() => setIsPricePopoverOpen(false)}
        minPrice={advancedFilters?.minPrice ?? 1000}
        maxPrice={advancedFilters?.maxPrice ?? 100000}
        matchCount={filteredProperties.length}
        onApply={(min, max) => {
          setAdvancedFilters((prev) => ({
            bedrooms: prev?.bedrooms ?? 'Any',
            beds: prev?.beds ?? 'Any',
            bathrooms: prev?.bathrooms ?? 'Any',
            selectedAmenities: prev?.selectedAmenities ?? [],
            selectedPropertyTypes: prev?.selectedPropertyTypes ?? [],
            selectedBookingOptions: prev?.selectedBookingOptions ?? [],
            minPrice: min,
            maxPrice: max,
          }));
          if (!selectedFilters.includes('Price')) {
            setSelectedFilters((prev) => [...prev, 'Price']);
          }
        }}
        onClear={() => {
          setAdvancedFilters((prev) => (prev ? { ...prev, minPrice: 1000, maxPrice: 100000 } : null));
          setSelectedFilters((prev) => prev.filter((f) => f !== 'Price'));
        }}
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
