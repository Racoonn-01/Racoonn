'use client';

import { useRef, useState, useEffect } from 'react';
import { PackageCardSkeleton } from '@/components/skeletons/PageSkeletons';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft, 
  LayoutGrid, 
  Mountain, 
  Tent, 
  Palmtree, 
  Globe,
  ArrowRight
} from 'lucide-react';
import TourCard from '@/components/packages/TourCard';

const filters = [
  { id: 'all', label: 'All Packages', icon: LayoutGrid },
  { id: 'uttarakhand', label: 'Uttarakhand', icon: Mountain },
  { id: 'himachal', label: 'Himachal', icon: Tent },
  { id: 'weekend', label: 'Weekend Getaways', icon: Palmtree },
  { id: 'international', label: 'International', icon: Globe },
];

interface MappedPackage {
  id: string | number;
  title: string;
  location: string;
  duration: string;
  features: string;
  price: string;
  badge: string;
  badgeColor: string;
  images: string[];
}

export default function TourPackages() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [packageList, setPackageList] = useState<MappedPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCMSPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cms/packages");
      const json = await res.json();
      if (json.success && Array.isArray(json.packages)) {
        const publishedOnly = json.packages.filter((p: Record<string, unknown>) => p.status === 'published');
        const mapped: MappedPackage[] = publishedOnly.map((cmsPkg: Record<string, unknown>) => {
          const pricing = Array.isArray(cmsPkg.pricing) ? cmsPkg.pricing : [];
          const itinerary = Array.isArray(cmsPkg.itinerary) ? cmsPkg.itinerary : [];
          const images = Array.isArray(cmsPkg.images) ? cmsPkg.images : [];
          const minPrice = pricing[0] && typeof pricing[0] === 'object' && 'pricePerPerson' in pricing[0] 
            ? Number(pricing[0].pricePerPerson) 
            : 0;
            
          return {
            id: String(cmsPkg.id || ''),
            title: String(cmsPkg.title || ''),
            location: String(cmsPkg.metaTitle || 'Uttarakhand'),
            duration: itinerary.length > 0 
              ? `${itinerary.length + 1} Days / ${itinerary.length} Nights` 
              : '5 Days / 4 Nights',
            features: 'Meals | Stay | Transfer',
            price: `₹${minPrice.toLocaleString('en-IN')}`,
            badge: 'Featured',
            badgeColor: 'text-brand-coral',
            images: images.length > 0 
              ? images.map(String) 
              : ["https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80"]
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
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => fetchCMSPackages());

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth + 40 : current.offsetWidth - 40;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="container mx-auto px-4 pt-10 pb-16 relative">
      
      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="flex items-center gap-2 text-brand-coral font-bold text-sm tracking-widest uppercase mb-4">
          <span>CURATED FOR YOU</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-brand-navy font-heading mb-4">
          Best <span className="text-brand-coral">Tour Packages</span>
        </h2>
        <p className="text-brand-charcoal/70 text-lg max-w-2xl">
          Discover handpicked tour packages that promise an unforgettable journey through the mountains.
        </p>
      </div>

      {/* Filter & Navigation Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        
        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar w-full md:w-auto pb-2 md:pb-0">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-brand-coral text-white shadow-md' 
                    : 'bg-white text-brand-navy border border-gray-200 hover:border-brand-coral hover:text-brand-coral'
                }`}
              >
                <Icon size={16} />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Navigation Arrows (Hidden on Mobile) */}
        <div className="hidden md:flex items-center gap-2">
          <button 
            onClick={() => scroll('left')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-brand-coral hover:text-white hover:border-brand-coral transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-navy hover:bg-brand-coral hover:text-white hover:border-brand-coral transition-colors shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="relative group/carousel">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 snap-x snap-mandatory pb-8"
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <PackageCardSkeleton />
              <PackageCardSkeleton />
              <PackageCardSkeleton />
            </div>
          ) : packageList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 w-full text-center border border-dashed border-gray-200 rounded-3xl bg-slate-50/50">
              <p className="text-gray-500 font-medium text-sm">No published tour packages available right now.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {packageList.filter(pkg => {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'uttarakhand') return pkg.location.toLowerCase().includes('uttarakhand');
                if (activeFilter === 'himachal') return pkg.location.toLowerCase().includes('himachal');
                if (activeFilter === 'international') return pkg.location.toLowerCase().includes('international');
                if (activeFilter === 'weekend') return pkg.duration.includes('3 Nights') || pkg.duration.includes('2 Nights');
                return true;
              }).map((pkg) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={pkg.id} 
                  className="w-full min-w-full md:min-w-0 md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-center md:snap-start"
                >
                  <TourCard pkg={pkg} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* View All Button */}
      <div className="mt-6 flex justify-center">
        <Link href="/packages" className="bg-white border-2 border-brand-coral text-brand-coral hover:bg-brand-coral hover:text-white px-8 py-3 rounded-full font-bold transition-colors shadow-sm flex items-center gap-2">
          View all packages <ArrowRight size={18} />
        </Link>
      </div>
      
    </section>
  );
}
