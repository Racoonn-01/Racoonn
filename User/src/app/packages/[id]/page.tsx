'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '@/store/checkoutStore';
import { useAuthStore } from '@/store/authStore';
import { 
  MapPin, 
  Clock, 
  Star, 
  Share, 
  Heart, 
  ChevronLeft,
  Utensils,
  CalendarDays,
  Hotel,
  Activity,
  StarHalf,
  CheckCircle2,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Pencil,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProperties } from '@/lib/appwrite/api';
import { Models } from 'appwrite';
import { format, addDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PackageDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const setRoomDetails = useCheckoutStore((state) => state.setRoomDetails);
  const resolvedParams = use(params);
  const rawPkgId = resolvedParams.id || '1';
  const [pkg, setPkg] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itinerary, setItinerary] = useState<Record<string, any>[]>([]);

  // Available Hotel Options
  const [hotelOptions, setHotelOptions] = useState<Record<string, any>[]>([]);

  // Available Activity Options
  const [activityOptions, setActivityOptions] = useState([
    {
      id: 0,
      title: 'Guided Local Sightseeing',
      description: 'Explore the best landmarks and hidden gems with our expert local guides. Includes photography points and cultural hubs.',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop',
      pricePerPerson: 0,
      priceLabel: 'Included in Package'
    },
    {
      id: 1,
      title: 'Adventure Sports Pass',
      description: 'Get an adrenaline rush with our adventure sports pass. Includes zip-lining, river rafting, and bungee jumping (where applicable).',
      image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop',
      pricePerPerson: 2500,
      priceLabel: '+ ₹2,500 / person'
    }
  ]);

  useEffect(() => {
    async function loadCMSPackage() {
      try {
        const res = await fetch("/api/cms/packages");
        const json = await res.json();
        if (json.success && Array.isArray(json.packages) && json.packages.length > 0) {
          const cmsFound = json.packages.find((p: Record<string, any>) => String(p.id) === String(rawPkgId));
          if (cmsFound) {
            const minPrice = cmsFound.pricing && cmsFound.pricing[0] ? cmsFound.pricing[0].pricePerPerson : 0;
            setPkg({
              ...cmsFound,
              id: cmsFound.id,
              title: cmsFound.title,
              location: cmsFound.location || cmsFound.metaTitle || '',
              duration: cmsFound.duration || (cmsFound.itinerary && cmsFound.itinerary.length > 0 ? `${cmsFound.itinerary.length + 1} Days / ${cmsFound.itinerary.length} Nights` : ''),
              features: cmsFound.features || '',
              price: minPrice ? `₹${minPrice.toLocaleString('en-IN')}` : 'Price on Request',
              basePriceNum: minPrice,
              badge: cmsFound.badge || (cmsFound.status === 'published' ? 'Featured' : 'Draft'),
              badgeColor: 'text-brand-coral',
              images: cmsFound.images && cmsFound.images.length > 0 ? cmsFound.images : ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop']
            });

            if (cmsFound.itinerary && Array.isArray(cmsFound.itinerary) && cmsFound.itinerary.length > 0) {
              setItinerary(cmsFound.itinerary);
            }

            if (cmsFound.hotelOptions && Array.isArray(cmsFound.hotelOptions) && cmsFound.hotelOptions.length > 0) {
              setHotelOptions(cmsFound.hotelOptions);
            }

            if (cmsFound.activityOptions && Array.isArray(cmsFound.activityOptions) && cmsFound.activityOptions.length > 0) {
              setActivityOptions(cmsFound.activityOptions);
            }
          }
        }
      } catch (err) {
        console.error("Error loading live CMS package:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCMSPackage();
  }, [rawPkgId]);
  const [activeTab, setActiveTab] = useState('plan');
  const [openDay, setOpenDay] = useState<number>(1);
  const [selectedHotel, setSelectedHotel] = useState<number>(0);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState<number>(0);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewCategory, setNewReviewCategory] = useState('Experience');
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { profile, toggleSavedHotel, isAuthenticated } = useAuthStore();
  const isSaved = profile?.savedHotels?.includes(rawPkgId) || false;

  // Date selection state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  // Fetch real-time hotel properties from Appwrite DB if not specified in CMS package
  useEffect(() => {
    async function loadLiveProperties() {
      try {
        const docs = await getProperties();
        if (docs && docs.length > 0) {
          const mapped = docs.slice(0, 6).map((d: Models.Document, idx: number) => {
            const doc = d as unknown as Record<string, unknown>;
            const rawPrice = Number(
              doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || 3500
            );
            const photos = Array.isArray(doc.photos) ? doc.photos : [];
            const photoUrl = photos[0] ? String(photos[0]) : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop';
            
            return {
              id: String(doc.$id || idx),
              title: String(doc.propertyName || doc.title || 'Premium Property Stay'),
              description: String(doc.description || 'Handpicked premium property featuring top-notch hospitality and modern comfort.'),
              image: photoUrl,
              tags: doc.city ? [String(doc.city), 'AC Rooms'] : ['AC Rooms', 'Breakfast Included'],
              pricePerNight: rawPrice > 0 ? rawPrice : 3500,
              isDefault: idx === 0,
              priceLabel: idx === 0 ? 'Included in Package' : ''
            };
          });

          setHotelOptions(prev => prev.length > 0 ? prev : mapped);
        }
      } catch (err) {
        console.error('Error loading Appwrite property data:', err);
      }
    }
    loadLiveProperties();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-brand-coral rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h2>
          <p className="text-gray-600 mb-6">The package you are looking for does not exist or has been removed.</p>
          <Link href="/packages" className="px-6 py-3 bg-brand-coral text-white font-bold rounded-xl hover:bg-brand-coral/90 transition-colors">
            Browse Packages
          </Link>
        </div>
      </div>
    );
  }

  // Parse duration nights (e.g. "6 Days / 5 Nights" -> 5)
  const nightsMatch = pkg.duration.match(/(\d+)\s*Nights?/i);
  const nightsCount = nightsMatch ? parseInt(nightsMatch[1], 10) : 1;

  const handleStartDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setStartDate(date);

    // Automatically set end date based on package nights count
    if (!endDate || endDate <= date) {
      const autoEndDate = addDays(date, nightsCount);
      setEndDate(autoEndDate);
    }

    setIsStartOpen(false);
    // Smoothly auto open end date picker
    setTimeout(() => {
      setIsEndOpen(true);
    }, 150);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setEndDate(date);
    setIsEndOpen(false);
  };

  // Parse base price from string like "₹18,999" to number 18999
  const basePriceNum = parseInt(pkg.price.replace(/[^\d]/g, ''), 10) || 0;

  // Accommodation extra cost per person relative to default base option (Hotel 0)
  // Deduct included base hotel price and add selected hotel price
  const baseHotelPrice = hotelOptions[0]?.pricePerNight ?? 0;
  const currentHotelPrice = (hotelOptions[selectedHotel] || hotelOptions[0])?.pricePerNight ?? 0;
  const hotelExtraPerPerson = (currentHotelPrice - baseHotelPrice) * nightsCount;

  // Activities extra cost per person
  const activitiesExtraPerPerson = selectedActivities.reduce((sum, actIndex) => {
    const act = activityOptions[actIndex];
    return sum + (act ? act.pricePerPerson : 0);
  }, 0);

  // Total price per person and grand total
  const effectivePricePerPerson = basePriceNum + hotelExtraPerPerson + activitiesExtraPerPerson;
  const totalPriceNum = effectivePricePerPerson * adultsCount;

  const totalPriceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(totalPriceNum);

  const pricePerPersonFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(effectivePricePerPerson);

  const toggleActivity = (index: number) => {
    setSelectedActivities(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleBookPackage = () => {
    const pkgIdStr = String(pkg.id || rawPkgId);
    const selectedStay = hotelOptions[selectedHotel] || hotelOptions[0];
    const pkgImage = (pkg.images && pkg.images[0]) || (selectedStay?.image) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop';
    const finalAdults = adultsCount > 0 ? adultsCount : 1;
    const finalPackagePrice = adultsCount > 0 ? totalPriceNum : effectivePricePerPerson;

    // Store room / package details in checkout store
    setRoomDetails(
      `pkg-${pkgIdStr}`,
      `Package: ${pkg.title}`,
      finalPackagePrice,
      pkg.title,
      pkgImage,
      pkg.location
    );

    // Build URL search params for checkout page
    const query = new URLSearchParams();
    query.set('hotelId', `pkg-${pkgIdStr}`);
    query.set('roomName', `Package: ${pkg.title}`);
    query.set('price', finalPackagePrice.toString());
    query.set('hotelName', pkg.title);
    query.set('hotelLocation', pkg.location);
    query.set('hotelImage', pkgImage);
    query.set('guests', finalAdults.toString());
    query.set('adults', finalAdults.toString());
    
    if (startDate) {
      query.set('checkIn', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      query.set('checkOut', endDate.toISOString().split('T')[0]);
    }

    router.push(`/checkout?${query.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white text-[#222222]">
      
      {/* Top Bar for Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Share size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-280 mx-auto px-6 pt-6 pb-24">
        
        {/* Header Section */}
        <div className="mb-6 hidden md:block">
          <h1 className="text-[32px] leading-tight font-bold mb-2 font-heading tracking-tight text-brand-navy">
            {pkg.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[15px] font-medium text-gray-800">
              <span className="flex items-center gap-1">
                <Star size={16} className="fill-current text-gray-900" />
                {Number(pkg.rating) > 0 ? pkg.rating : 'New'} · <span onClick={() => setIsAllReviewsModalOpen(true)} className="underline underline-offset-4 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">{pkg.reviews || 0} reviews</span>
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-600">
                <MapPin size={16} /> {pkg.location}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-600">
                <Clock size={16} /> {pkg.duration}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[15px] font-medium">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2000);
                }}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Share size={16} /> <span className="underline underline-offset-4">{isCopied ? 'Copied!' : 'Share'}</span>
              </button>
              <button 
                onClick={() => {
                  if (!isAuthenticated) {
                    // Ideally open auth modal, but for now we rely on the store's behavior
                    router.push('/login');
                  } else {
                    toggleSavedHotel(rawPkgId);
                  }
                }}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Heart size={16} className={isSaved ? "fill-brand-coral text-brand-coral" : ""} /> 
                <span className="underline underline-offset-4">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mb-6 md:hidden">
          <h1 className="text-[26px] font-bold mb-2 font-heading leading-tight">{pkg.title}</h1>
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-[14px] text-gray-600">
             <span className="flex items-center gap-1 font-semibold text-gray-900">
                <Star size={14} className="fill-current" /> {Number(pkg.rating) > 0 ? pkg.rating : 'New'} ({pkg.reviews || 0})
             </span>
             <span className="flex items-center gap-1"><MapPin size={14} /> {pkg.location}</span>
             <span className="flex items-center gap-1"><Clock size={14} /> {pkg.duration}</span>
          </div>
        </div>

        {/* Image Slider (Replaced 3-Image Grid) */}
        <div className="relative h-[30vh] md:h-[50vh] w-full rounded-2xl overflow-hidden mb-8 md:mb-10 group/slider">
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full [&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-button-next]:opacity-0 [&_.swiper-button-prev]:opacity-0 group-hover/slider:[&_.swiper-button-next]:opacity-100 group-hover/slider:[&_.swiper-button-prev]:opacity-100 [&_.swiper-button-next]:transition-opacity [&_.swiper-button-prev]:transition-opacity"
          >
            {pkg.images.map((img: string, i: number) => (
              <SwiperSlide key={i} className="relative w-full h-full">
                <Image 
                  src={img} 
                  alt={`${pkg.title} - Image ${i + 1}`} 
                  fill 
                  className="object-cover" 
                  priority={i === 0} 
                />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        {/* Main Content Area */}
        <div className="w-full relative">
          
          {/* Booking Bar (Horizontal on Desktop, Stacked on Mobile) */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-4 sm:p-5 mb-10 flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full">
              {/* Price */}
              <div className="flex flex-col shrink-0 pl-1">
                <div className="flex items-baseline gap-1 overflow-hidden h-8">
                  <AnimatePresence mode="wait">
                    <motion.span 
                      key={totalPriceFormatted}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.95 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="text-[24px] font-bold text-gray-900 inline-block leading-tight"
                    >
                      {totalPriceFormatted}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-gray-500 text-[14px]">total</span>
                </div>
                <div className="text-[12px] font-medium text-gray-600 flex items-center gap-1.5 min-h-5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={pricePerPersonFormatted}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="inline-block"
                    >
                      {pricePerPersonFormatted} / person
                    </motion.span>
                  </AnimatePresence>
                  <AnimatePresence>
                    {(hotelExtraPerPerson !== 0 || activitiesExtraPerPerson > 0) && (
                      <motion.span 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] text-brand-coral font-bold bg-brand-coral/10 px-2 py-0.5 rounded-full border border-brand-coral/20 shrink-0"
                      >
                        Customized
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Booking Inputs */}
              <div className="flex w-full flex-col sm:flex-row border border-gray-300 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
                <div className="flex w-full sm:w-2/3 divide-x divide-gray-300">
                  {/* Start Date Popover */}
                  <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
                    <PopoverTrigger className="w-1/2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors text-left outline-none group">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-900 group-hover:text-brand-coral transition-colors">Start Date</div>
                      <div className="text-[13px] font-semibold text-gray-800 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'Add date'}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 bg-white z-50" align="start" sideOffset={8}>
                      <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-coral animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                            Select Start Date
                          </span>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        className="p-1"
                      />
                    </PopoverContent>
                  </Popover>

                  {/* End Date Popover */}
                  <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
                    <PopoverTrigger className="w-1/2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors text-left outline-none group">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-900 group-hover:text-brand-coral transition-colors">End Date</div>
                      <div className="text-[13px] font-semibold text-gray-800 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'Add date'}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-gray-100 bg-white z-50" align="start" sideOffset={8}>
                      <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-navy animate-pulse" />
                          <span className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                            Select End Date
                          </span>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        disabled={(date) => (startDate ? date <= startDate : date < new Date(new Date().setHours(0, 0, 0, 0)))}
                        className="p-1"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-full sm:w-1/3 p-2.5 transition-colors flex flex-col justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-900 mb-0.5">Travelers</div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))} 
                      className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-[14px] text-gray-900 font-medium min-w-12.5 text-center">{adultsCount} {adultsCount === 1 ? 'adult' : 'adults'}</span>
                    <button 
                      onClick={() => setAdultsCount(adultsCount + 1)} 
                      className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 hover:text-gray-900 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Button */}
            <div className="w-full md:w-auto shrink-0">
              <button 
                onClick={handleBookPackage} 
                className="w-full md:w-auto bg-brand-coral hover:bg-brand-coral/90 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] whitespace-nowrap cursor-pointer"
              >
                Book Now
              </button>
              <p className="text-center text-gray-500 text-[11px] mt-2 font-medium md:hidden">You won&apos;t be charged yet</p>
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-[22px] font-bold text-gray-900 mb-1">Entire tour package organized by Racoonn</h2>
                <p className="text-[15px] text-gray-600">{pkg.features}</p>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border border-gray-200">
                <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Host" fill className="object-cover" />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center overflow-x-auto hide-scrollbar gap-2 md:gap-4 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <button 
                onClick={() => setActiveTab('plan')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap border ${activeTab === 'plan' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                <CalendarDays size={16} /> Tour Plan
              </button>
              <button 
                onClick={() => setActiveTab('stays')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap border ${activeTab === 'stays' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                <Hotel size={16} /> Stays
              </button>
              <button 
                onClick={() => setActiveTab('activities')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap border ${activeTab === 'activities' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                <Activity size={16} /> Activities
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap border ${activeTab === 'reviews' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                <StarHalf size={16} /> Review Rating
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap border ${activeTab === 'contact' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-900'}`}
              >
                <PhoneCall size={16} /> Contact Us
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-8 min-h-100">
                {/* Tab 1: Tour Plan */}
              {activeTab === 'plan' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-6 font-heading">Tour Flow & Start Location</h3>
                  {itinerary.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
                      <p className="text-gray-500 font-medium text-sm">No detailed itinerary added for this package yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {itinerary.map((day, dIdx) => {
                        const dayNum = day.dayNumber || (dIdx + 1);
                        const isDayOpen = openDay === dayNum;
                        return (
                          <div key={day.id || dIdx} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <button 
                              onClick={() => setOpenDay(isDayOpen ? 0 : dayNum)}
                              className={`w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors ${isDayOpen ? 'border-b border-gray-100' : ''}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                                  <CalendarDays className="text-brand-coral" size={24} />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-bold text-[18px] text-brand-coral">Day {dayNum}</h4>
                                  <p className="text-gray-600 text-[15px] font-medium mt-0.5">{day.title || day.activities || `Day ${dayNum} Overview`}</p>
                                </div>
                              </div>
                              {isDayOpen ? <ChevronUp className="text-brand-coral" size={24} /> : <ChevronDown className="text-brand-coral" size={24} />}
                            </button>
                            
                            <div className={`grid transition-all duration-300 ease-in-out ${isDayOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                              <div className="overflow-hidden">
                                <div className="p-5 pt-0 border-t border-gray-100 bg-white">
                                  <div className="relative pl-8 ml-6 border-l border-brand-coral/30 py-4 flex flex-col gap-6 mt-4">
                                    {(day.points && day.points.length > 0) ? (
                                      day.points.map((pt: Record<string, any>, pIdx: number) => (
                                        <div key={pIdx} className="relative">
                                          <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                          <h5 className="font-bold text-gray-900 text-[15px]">{pt.title}</h5>
                                          <p className="text-gray-600 text-[14px] mt-1">{pt.description}</p>
                                          {(pt.hasHotelActions || pt.title?.toLowerCase().includes('hotel') || pt.title?.toLowerCase().includes('check-in')) && (
                                            <div className="flex gap-3 mt-3">
                                              <button 
                                                onClick={() => setIsHotelModalOpen(true)}
                                                className="flex items-center gap-2 px-3 py-1.5 border border-brand-coral text-brand-coral rounded-lg text-[13px] font-semibold hover:bg-brand-coral hover:text-white transition-colors"
                                              >
                                                <Hotel size={14} /> View Hotel
                                              </button>
                                              <button 
                                                onClick={() => setActiveTab('stays')}
                                                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-[13px] font-semibold hover:bg-gray-50 transition-colors"
                                              >
                                                <Pencil size={14} /> Change Hotel
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      ))
                                    ) : (
                                      <div className="relative">
                                        <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                        <h5 className="font-bold text-gray-900 text-[15px]">{day.activities || day.title || 'Sightseeing & Activities'}</h5>
                                        <p className="text-gray-600 text-[14px] mt-1">Enjoy scheduled activities and sightseeings for Day {dayNum}.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Stays */}
              {activeTab === 'stays' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-heading">Available Accommodations</h3>
                  <p className="text-gray-600 mb-6 text-[15px]">Select your preferred accommodation type for this tour package.</p>
                  
                  {hotelOptions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50 text-center">
                      <p className="text-gray-500 font-medium text-sm">No accommodation options available for this package right now.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {hotelOptions.map((hotel, index) => {
                      const isSelected = selectedHotel === index;
                      return (
                        <motion.div
                          key={hotel.id}
                          whileHover={{ scale: 1.008 }}
                          whileTap={{ scale: 0.995 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedHotel(index)}
                          className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-gray-900 bg-gray-50/90 shadow-md ring-1 ring-gray-900/10' 
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/40'
                          }`}
                        >
                          <div className="w-full sm:w-50 h-35 relative rounded-xl overflow-hidden shrink-0">
                            <Image src={hotel.image} alt={hotel.title} fill className="object-cover transition-transform duration-500 hover:scale-105" />
                          </div>
                          <div className="flex flex-col justify-between grow">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-[18px] text-gray-900">{hotel.title}</h4>
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                    >
                                      <CheckCircle2 className="text-gray-900 w-6 h-6 shrink-0" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">{hotel.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 font-medium">
                                {(hotel.tags || []).map((tag: string, tIdx: number) => (
                                  <span key={tIdx} className="flex items-center gap-1">
                                    {tIdx === 0 ? <Hotel size={14}/> : <Utensils size={14}/>} {tag}
                                  </span>
                                ))}
                              </div>
                              <div className="shrink-0">
                                {hotel.isDefault ? (
                                  <span className="text-[13px] font-bold text-brand-coral bg-brand-coral/10 px-3 py-1 rounded-full border border-brand-coral/20">
                                    Included in Package
                                  </span>
                                ) : (
                                  <span className="text-[14px] font-bold text-gray-900">
                                    {hotel.pricePerNight >= baseHotelPrice ? '+ ' : '- '}
                                    ₹{Math.abs(hotel.pricePerNight - baseHotelPrice).toLocaleString('en-IN')}{' '}
                                    <span className="text-[13px] font-normal text-gray-500">/ night</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Activities */}
              {activeTab === 'activities' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-2 font-heading">Included & Optional Activities</h3>
                  <p className="text-gray-600 mb-6 text-[15px]">Select the activities you want to add to your itinerary.</p>
                  
                  <div className="flex flex-col gap-4">
                    {activityOptions.map((act, index) => {
                      const isSelected = selectedActivities.includes(index);
                      return (
                        <motion.div
                          key={act.id}
                          whileHover={{ scale: 1.008 }}
                          whileTap={{ scale: 0.995 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => toggleActivity(index)}
                          className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-brand-coral bg-brand-coral/5 shadow-sm ring-1 ring-brand-coral/20' 
                              : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/40'
                          }`}
                        >
                          <div className="w-full sm:w-37.5 h-30 relative rounded-xl overflow-hidden shrink-0">
                            <Image src={act.image} alt={act.title} fill className="object-cover transition-transform duration-500 hover:scale-105" />
                          </div>
                          <div className="flex flex-col justify-between grow">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-[18px] text-gray-900">{act.title}</h4>
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                    >
                                      <CheckCircle2 className="text-brand-coral w-6 h-6 shrink-0" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">{act.description}</p>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                              <span className={`text-[13px] font-bold ${act.pricePerPerson === 0 ? "text-brand-coral" : "text-gray-900"}`}>
                                {act.priceLabel}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Review rating */}
              {activeTab === 'reviews' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                    <div className="text-center">
                      <h3 className="text-[48px] font-black text-gray-900 leading-none">{Number(pkg.rating) > 0 ? pkg.rating : 'New'}</h3>
                      <div className="flex items-center justify-center gap-1 mt-1 text-gray-900">
                        <Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><StarHalf size={12} className="fill-current" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[18px] text-gray-900">Guest Favorite</h4>
                      <p className="text-gray-500 text-[14px]">Based on {pkg.reviews || 0} verified reviews</p>
                    </div>
                    <div className="ml-auto">
                      <button 
                        onClick={() => setIsReviewModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-900 text-gray-900 rounded-lg text-[14px] font-bold hover:bg-gray-900 hover:text-white transition-colors"
                      >
                        <Pencil size={16} /> Write Review
                      </button>
                    </div>
                  </div>
                  
                  {Number(pkg.reviews) > 0 ? (
                    <div className="mt-4">
                      <button 
                        onClick={() => setIsAllReviewsModalOpen(true)}
                        className="px-6 py-3 border border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Show all {pkg.reviews} reviews
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-gray-500 font-medium">No reviews yet. Be the first to leave a review!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: Contact Us */}
              {activeTab === 'contact' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-6 font-heading">Get in Touch</h3>
                  <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                    <p className="text-gray-700 mb-6 text-[15px]">Have a special request or need more details about this package? Our travel experts are here to help!</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href="tel:+919876543210" className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md w-full sm:w-auto">
                        <PhoneCall size={18} />
                        Call Us Now
                      </a>
                      <a href="mailto:hello@racoonn.com" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-bold py-3.5 px-6 rounded-xl transition-all shadow-sm w-full sm:w-auto">
                        Email Support
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Hotel Details Modal */}
        {isHotelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsHotelModalOpen(false)}
            />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => setIsHotelModalOpen(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white text-gray-900 rounded-full transition-colors backdrop-blur-sm shadow-sm"
              >
                <X size={18} />
              </button>
              <div className="relative h-64 sm:h-80 w-full group/slider">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
                className="w-full h-full [&_.swiper-pagination-bullet]:bg-white/50 [&_.swiper-pagination-bullet-active]:bg-white"
              >
                {[
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200&auto=format&fit=crop"
                ].map((img, i) => (
                  <SwiperSlide key={i} className="relative w-full h-full">
                    <Image 
                      src={img} 
                      alt={`Premium Hotel - Image ${i + 1}`} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                    <Star size={16} className="fill-current" />
                  </div>
                  <span className="text-[13px] text-gray-500 font-medium">4-Star Property</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-heading">Premium Hotel Stay</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed mb-6">
                  Experience maximum comfort in our handpicked properties. Located in the heart of the city, this hotel features excellent amenities, prime locations, and top-tier hygiene standards. Wake up to beautiful views and enjoy a complimentary lavish breakfast spread each morning.
                </p>
                
                <h4 className="font-bold text-gray-900 mb-3 text-[15px]">Popular Amenities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-[14px] text-gray-600">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Air Conditioning</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Free High-Speed WiFi</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Complimentary Breakfast</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Room Service</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Daily Housekeeping</span>
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-brand-coral" /> Attached Washroom</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All Reviews Modal */}
        {isAllReviewsModalOpen && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
              <button 
                onClick={() => setIsAllReviewsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors shrink-0 text-gray-900"
              >
                <X size={24} />
              </button>
              
              {/* Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                {['All', 'View', 'Hospitality', 'Location', 'Cleanliness', 'Amenities', 'Indoor spaces', 'Comfort', 'Getting around', 'Family', 'Condition', 'Food'].map((filter, idx) => (
                  <button 
                    key={filter}
                    className={`px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-colors ${idx === 0 ? 'bg-brand-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-10 overflow-y-auto grow">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-10 text-brand-navy">
                  <Star size={32} className="fill-current" />
                  <h2 className="text-3xl font-black tracking-tight font-heading">4.96 · 241 reviews</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Review 1 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Sarah" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Sarah</p>
                        <p className="text-[13px] text-gray-500 font-medium">October 2025 • Location</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">Absolutely breathtaking experience. The views are exactly as pictured, and the service was impeccable from start to finish. Highly recommend for a relaxing getaway.</p>
                  </div>

                  {/* Review 2 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" alt="Michael" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Michael</p>
                        <p className="text-[13px] text-gray-500 font-medium">September 2025 • Amenities</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">The attention to detail in this property is unmatched. We loved the private pool and the seamless check-in process. We will definitely be coming back next year.</p>
                  </div>

                  {/* Review 3 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="Emma" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Emma</p>
                        <p className="text-[13px] text-gray-500 font-medium">August 2025 • Cleanliness</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">Spotlessly clean! I am usually very picky, but the room was pristine. The housekeeping staff did an incredible job every single day.</p>
                  </div>

                  {/* Review 4 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" alt="James" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">James</p>
                        <p className="text-[13px] text-gray-500 font-medium">July 2025 • Food</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">The complimentary breakfast was out of this world. Fresh pastries, great coffee, and a wonderful selection of local dishes.</p>
                  </div>

                  {/* Review 5 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&auto=format&fit=crop" alt="Olivia" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Olivia</p>
                        <p className="text-[13px] text-gray-500 font-medium">June 2025 • Hospitality</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">The staff went above and beyond to make our anniversary special. From the welcome drink to the personalized note in our room, 10/10.</p>
                  </div>

                  {/* Review 6 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=200&auto=format&fit=crop" alt="David" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">David</p>
                        <p className="text-[13px] text-gray-500 font-medium">May 2025 • Comfort</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">The bed was so comfortable it was hard to get up in the morning. Really high-quality linens and perfectly plump pillows.</p>
                  </div>

                  {/* Review 7 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop" alt="Sophia" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Sophia</p>
                        <p className="text-[13px] text-gray-500 font-medium">April 2025 • Location</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">Perfectly situated right next to the main attractions, yet completely peaceful once you step inside the gates.</p>
                  </div>

                  {/* Review 8 */}
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative rounded-full overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" alt="Daniel" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-gray-900">Daniel</p>
                        <p className="text-[13px] text-gray-500 font-medium">March 2025 • Cleanliness</p>
                      </div>
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed">Very well maintained property. Everything felt brand new and the bathrooms were spectacular.</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Write Review Modal */}
        <AnimatePresence>
          {isReviewModalOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-white overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center">
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mr-4"
                >
                  <X size={24} />
                </button>
              </div>
  
              <div className="max-w-150 mx-auto px-6 py-10">
                <h2 className="text-[32px] font-bold text-brand-navy mb-10">
                  Write a review
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Your Name</h3>
                    <input 
                      type="text"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none"
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Overall rating</h3>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="transition-transform hover:scale-110 focus:outline-none"
                        >
                          <Star 
                            size={40} 
                            className={`${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                            strokeWidth={1.5}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
  
                  <div>
                    <h3 className="text-[18px] font-semibold text-brand-navy mb-4">What aspect are you reviewing?</h3>
                    <select 
                      value={newReviewCategory}
                      onChange={(e) => setNewReviewCategory(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none bg-white appearance-none"
                    >
                      {['Experience', 'Value', 'Guide', 'Accommodation', 'Food', 'Other'].map(filter => (
                        <option key={filter} value={filter}>{filter}</option>
                      ))}
                    </select>
                  </div>
  
                  <div>
                    <h3 className="text-[18px] font-semibold text-brand-navy mb-4">Your review</h3>
                    <textarea 
                      rows={6}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-4 rounded-xl border border-gray-300 focus:border-brand-navy focus:ring-1 focus:ring-brand-navy outline-none resize-none"
                    />
                  </div>
  
                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-4">
                    <button 
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-6 py-3 font-semibold text-[15px] hover:underline"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        // Submit logic would go here
                        setIsSubmitting(true);
                        setTimeout(() => {
                          setIsSubmitting(false);
                          setIsReviewModalOpen(false);
                          setNewRating(0);
                          setNewReviewName('');
                          setNewReviewText('');
                        }, 1000);
                      }}
                      className={`px-8 py-3 rounded-xl font-semibold text-[15px] transition-colors flex items-center gap-2 ${
                        newRating > 0 && newReviewText.length > 0 && newReviewName.length > 0
                          ? 'bg-brand-coral text-white hover:bg-[#d95d62]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={newRating === 0 || newReviewText.length === 0 || newReviewName.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> : null}
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
