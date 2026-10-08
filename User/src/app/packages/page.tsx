"use client"

import { useState, useEffect, useMemo, Suspense } from 'react';
import { packages as defaultPackages } from '@/data/packages';
import TourCard from '@/components/packages/TourCard';
import { SlidersHorizontal, ChevronDown, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import PricePopover from '@/components/search/PricePopover';

function PackagesContent() {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isPricePopoverOpen, setIsPricePopoverOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null);
  const [packageList, setPackageList] = useState<any[]>([]);
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search')?.toLowerCase() || '');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCMSPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cms/packages");
      const contentType = res.headers.get("content-type") || "";
      if (!res.ok || !contentType.includes("application/json")) {
        setPackageList(defaultPackages);
        return;
      }
      const json = await res.json();
      if (json.success && Array.isArray(json.packages)) {
          const publishedOnly = json.packages.filter((p: any) => p.status === 'published');
          const mapped = publishedOnly.map((cmsPkg: any) => {
            const minPrice = cmsPkg.pricing && cmsPkg.pricing[0] ? cmsPkg.pricing[0].pricePerPerson : 0;
            return {
              id: cmsPkg.id,
              title: cmsPkg.title,
              location: cmsPkg.location || cmsPkg.metaTitle || 'Uttarakhand',
              duration: String(cmsPkg.duration || (cmsPkg.itinerary && cmsPkg.itinerary.length > 0 
                ? `${cmsPkg.itinerary.length + 1} Days / ${cmsPkg.itinerary.length} Nights` 
                : '5 Days / 4 Nights')),
            features: String(cmsPkg.features || 'Meals | Stay | Transfer'),
            price: `₹${minPrice.toLocaleString('en-IN')}`,
            badge: String(cmsPkg.badge || 'Featured'),
            badgeColor: 'text-brand-coral',
            images: cmsPkg.images && cmsPkg.images.length > 0 
              ? cmsPkg.images 
              : ["https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80"],
            rawSearchText: JSON.stringify(cmsPkg).toLowerCase()
          };
        });
        setPackageList(mapped);
      } else {
        setPackageList([]);
      }
    } catch (err) {
      console.error("Error fetching live CMS packages:", err);
      setPackageList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCMSPackages();

    const handleUpdate = () => fetchCMSPackages();
    window.addEventListener("cms_packages_updated", handleUpdate);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel("racoonn_cms_channel");
      bc.onmessage = (event) => {
        if (event.data && event.data.type === "PACKAGES_UPDATED") {
          fetchCMSPackages();
        }
      };
    }

    return () => {
      window.removeEventListener("cms_packages_updated", handleUpdate);
      if (bc) bc.close();
    };
  }, []);

  const filters = [
    'Price', 'Uttarakhand', 'Himachal', 'Goa', 'International', 'Bestseller', 'Trending', 'New'
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Calculate absolute min and max prices
  const { absoluteMinPrice, absoluteMaxPrice } = useMemo(() => {
    if (packageList.length === 0) return { absoluteMinPrice: 0, absoluteMaxPrice: 0 };
    
    let min = Infinity;
    let max = -Infinity;
    packageList.forEach(p => {
      const pNum = Number(String(p.price).replace(/[^0-9]/g, ''));
      if (pNum < min) min = pNum;
      if (pNum > max) max = pNum;
    });
    
    if (min === Infinity || max === -Infinity) return { absoluteMinPrice: 0, absoluteMaxPrice: 0 };
    
    min = Math.floor(min / 1000) * 1000;
    max = Math.ceil(max / 1000) * 1000;
    
    if (max <= min) max = min + 1000;
    
    return { absoluteMinPrice: Math.max(0, min), absoluteMaxPrice: max };
  }, [packageList]);

  // Basic filtering logic
  const filteredPackages = packageList.filter(pkg => {
    // 1. Apply search query
    if (searchQuery) {
      const searchStr = pkg.rawSearchText || `${pkg.title} ${pkg.location} ${pkg.features} ${pkg.badge}`.toLowerCase();
      if (!searchStr.includes(searchQuery.toLowerCase())) return false;
    }

    // 2. Apply Price filter
    if (priceRange) {
      const pNum = Number(String(pkg.price).replace(/[^0-9]/g, ''));
      if (pNum < priceRange.min || pNum > priceRange.max) return false;
    }

    // 3. Apply selected pill filters
    if (selectedFilters.length === 0) return true;
    
    // We want it to match ANY of the selected location/badge pills, OR ALL of them?
    // Usually for locations/badges, checking if it matches ALL is too strict (e.g. clicking Goa AND Uttarakhand returns nothing).
    // Let's make it so if there are selected pills, the package must match AT LEAST ONE non-Price pill, 
    // unless Price is the ONLY filter selected.
    const nonPriceFilters = selectedFilters.filter(f => f !== 'Price');
    if (nonPriceFilters.length === 0) return true;

    return nonPriceFilters.some(filter => {
      const f = filter.toLowerCase();
      const locStr = String(pkg.location || '').toLowerCase();
      const titleStr = String(pkg.title || '').toLowerCase();
      const badgeStr = String(pkg.badge || '').toLowerCase();
      return locStr.includes(f) || titleStr.includes(f) || badgeStr.includes(f);
    });
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-19 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3 overflow-x-auto hide-scrollbar">
          <div className="relative shrink-0 w-48 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-full text-[14px] text-gray-700 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition-colors"
            />
          </div>

          <div className="h-8 w-px bg-gray-200 shrink-0 mx-1" />

          <button 
            onClick={() => { if (window.innerWidth < 768) setIsMobileFiltersOpen(true); }}
            className="flex items-center gap-2 border border-gray-300 hover:border-gray-900 rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] text-gray-700"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          
          <div className="h-8 w-px bg-gray-200 shrink-0 mx-1 hidden md:block" />
          
          <div className="hidden md:flex items-center gap-3">
          {filters.map((filter, idx) => {
            const isSelected = selectedFilters.includes(filter) || (filter === 'Price' && priceRange !== null);

            if (filter === 'Price') {
              return (
                <button 
                  key={idx}
                  onClick={() => setIsPricePopoverOpen(true)}
                  className={`flex items-center gap-2 border rounded-full px-4 py-2 transition-colors shrink-0 font-medium text-[14px] ${
                    isSelected ? 'border-gray-900 bg-gray-100 text-gray-900 font-semibold' : 'border-gray-300 hover:border-gray-900 text-gray-700'
                  }`}
                >
                  {filter} <ChevronDown size={14} className={isPricePopoverOpen ? "rotate-180 transition-transform" : "transition-transform"} />
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
      </div>

      {/* Packages Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-coral border-t-transparent"></div>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-32 text-gray-500">
            <h3 className="text-xl font-medium mb-2">No packages found</h3>
            <p>Try adjusting your filters to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="h-full">
                <TourCard pkg={pkg} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Price Popover */}
      <PricePopover
        isOpen={isPricePopoverOpen}
        onClose={() => setIsPricePopoverOpen(false)}
        minPrice={priceRange?.min ?? absoluteMinPrice}
        maxPrice={priceRange?.max ?? absoluteMaxPrice}
        absoluteMin={absoluteMinPrice}
        absoluteMax={absoluteMaxPrice}
        matchCount={filteredPackages.length}
        onApply={(min, max) => {
          setPriceRange({ min, max });
          if (!selectedFilters.includes('Price')) {
            setSelectedFilters((prev) => [...prev, 'Price']);
          }
        }}
        onClear={() => {
          setPriceRange(null);
          setSelectedFilters((prev) => prev.filter((f) => f !== 'Price'));
        }}
      />

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-100 bg-white md:hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Categories & Locations</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.filter(f => f !== 'Price').map((filter, idx) => {
                    const isSelected = selectedFilters.includes(filter);
                    return (
                      <button 
                        key={idx}
                        onClick={() => toggleFilter(filter)}
                        className={`border rounded-full px-4 py-2 transition-colors font-medium text-[14px] ${
                          isSelected ? 'border-gray-900 bg-gray-100 text-gray-900' : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {filter}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Budget</h3>
                <button 
                  onClick={() => setIsPricePopoverOpen(true)}
                  className="w-full flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 font-medium text-[14px] text-gray-700 active:bg-gray-50"
                >
                  <span>Select Price Range</span>
                  <div className="flex items-center gap-2">
                    {priceRange ? <span className="text-brand-coral font-bold text-xs bg-brand-coral/10 px-2 py-1 rounded">₹{priceRange.min.toLocaleString('en-IN')} - ₹{priceRange.max.toLocaleString('en-IN')}</span> : null}
                    <ChevronDown size={16} />
                  </div>
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 pb-8">
              <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full bg-brand-coral text-white font-bold rounded-xl py-3.5 shadow-md active:scale-[0.98] transition-transform">
                Show {filteredPackages.length} Packages
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading packages...</div>}>
      <PackagesContent />
    </Suspense>
  );
}
