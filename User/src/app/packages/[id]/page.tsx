'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MapPin, 
  Clock, 
  Star, 
  Share, 
  Heart, 
  ChevronLeft,
  Tent,
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
import { packages } from '@/data/packages';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function PackageDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const pkgId = parseInt(resolvedParams.id || '1');
  const pkg = packages.find(p => p.id === pkgId) || packages[0];
  const [activeTab, setActiveTab] = useState('plan');
  const [openDay, setOpenDay] = useState<number>(1);
  const [selectedHotel, setSelectedHotel] = useState<number>(0);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAllReviewsModalOpen, setIsAllReviewsModalOpen] = useState(false);

  // Parse base price from string like "₹18,999" to number 18999
  const basePriceNum = parseInt(pkg.price.replace(/[^\d]/g, ''), 10) || 0;
  const totalPriceFormatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(basePriceNum * adultsCount);

  const toggleActivity = (index: number) => {
    setSelectedActivities(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
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
                4.8 · <span onClick={() => setIsAllReviewsModalOpen(true)} className="underline underline-offset-4 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">128 reviews</span>
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
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                <Share size={16} /> <span className="underline underline-offset-4">Share</span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                <Heart size={16} /> <span className="underline underline-offset-4">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="mb-6 md:hidden">
          <h1 className="text-[26px] font-bold mb-2 font-heading leading-tight">{pkg.title}</h1>
          <div className="flex flex-wrap gap-y-2 gap-x-4 text-[14px] text-gray-600">
             <span className="flex items-center gap-1 font-semibold text-gray-900">
                <Star size={14} className="fill-current" /> 4.8 (128)
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
            {pkg.images.map((img, i) => (
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
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-bold text-gray-900">{totalPriceFormatted}</span>
                  <span className="text-gray-500 text-[14px]">total</span>
                </div>
                <div className="text-[12px] text-gray-500">{pkg.price} / person</div>
              </div>

              {/* Booking Inputs */}
              <div className="flex w-full flex-col sm:flex-row border border-gray-300 rounded-xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
                <div className="flex w-full sm:w-2/3 divide-x divide-gray-300">
                  <div className="w-1/2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-900">Start Date</div>
                    <div className="text-[13px] text-gray-600 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Add date</div>
                  </div>
                  <div className="w-1/2 p-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-900">End Date</div>
                    <div className="text-[13px] text-gray-600 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">Add date</div>
                  </div>
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
              <button className="w-full md:w-auto bg-brand-coral hover:bg-brand-coral/90 text-white font-bold text-[15px] px-8 py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] whitespace-nowrap">
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
                  <div className="flex flex-col gap-4">
                    
                    {/* Day 1 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setOpenDay(openDay === 1 ? 0 : 1)}
                        className={`w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors ${openDay === 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="text-brand-coral" size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[18px] text-brand-coral">Day 1</h4>
                            <p className="text-gray-600 text-[15px] font-medium mt-0.5">Arrival & Hotel Check-in</p>
                          </div>
                        </div>
                        {openDay === 1 ? <ChevronUp className="text-brand-coral" size={24} /> : <ChevronDown className="text-brand-coral" size={24} />}
                      </button>
                      
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${openDay === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 pt-0 border-t border-gray-100 bg-white">
                            <div className="relative pl-8 ml-6 border-l border-brand-coral/30 py-4 flex flex-col gap-8 mt-4">
                              
                              {/* Point 1 */}
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Pickup from Airport / Railway Station</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Our representative will greet you and assist with your transfer.</p>
                              </div>
                              
                              {/* Point 2 */}
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Transfer to Hotel</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Enjoy a comfortable drive to your premium hotel.</p>
                              </div>
                              
                              {/* Point 3 */}
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Check-in at Hotel</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Complete check-in formalities and relax in your room.</p>
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
                              </div>
                              
                              {/* Point 4 */}
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Evening at Leisure</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Unwind and enjoy the hotel amenities or take a stroll nearby.</p>
                              </div>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day 2 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setOpenDay(openDay === 2 ? 0 : 2)}
                        className={`w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors ${openDay === 2 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="text-brand-coral" size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[18px] text-brand-coral">Day 2</h4>
                            <p className="text-gray-600 text-[15px] font-medium mt-0.5">Local Sightseeing & Activities</p>
                          </div>
                        </div>
                        {openDay === 2 ? <ChevronUp className="text-brand-coral" size={24} /> : <ChevronDown className="text-brand-coral" size={24} />}
                      </button>
                      
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${openDay === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 pt-0 bg-white">
                            <div className="relative pl-8 ml-6 border-l border-brand-coral/30 py-4 flex flex-col gap-8 mt-4">
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Guided Tour</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Explore major landmarks, scenic viewpoints, and cultural hubs.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day 3 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setOpenDay(openDay === 3 ? 0 : 3)}
                        className={`w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors ${openDay === 3 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="text-brand-coral" size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[18px] text-brand-coral">Day 3</h4>
                            <p className="text-gray-600 text-[15px] font-medium mt-0.5">Adventure & Exploration</p>
                          </div>
                        </div>
                        {openDay === 3 ? <ChevronUp className="text-brand-coral" size={24} /> : <ChevronDown className="text-brand-coral" size={24} />}
                      </button>
                      
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${openDay === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 pt-0 bg-white">
                            <div className="relative pl-8 ml-6 border-l border-brand-coral/30 py-4 flex flex-col gap-8 mt-4">
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Experiential Day Trip</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Head out for an experiential day trip including optional adventure sports.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day 4 */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                      <button 
                        onClick={() => setOpenDay(openDay === 4 ? 0 : 4)}
                        className={`w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-colors ${openDay === 4 ? 'border-b border-gray-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-brand-coral/10 flex items-center justify-center shrink-0">
                            <CalendarDays className="text-brand-coral" size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-[18px] text-brand-coral">Day 4</h4>
                            <p className="text-gray-600 text-[15px] font-medium mt-0.5">End Location & Departure</p>
                          </div>
                        </div>
                        {openDay === 4 ? <ChevronUp className="text-brand-coral" size={24} /> : <ChevronDown className="text-brand-coral" size={24} />}
                      </button>
                      
                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${openDay === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="p-5 pt-0 bg-white">
                            <div className="relative pl-8 ml-6 border-l border-brand-coral/30 py-4 flex flex-col gap-8 mt-4">
                              <div className="relative">
                                <div className="absolute -left-9.5 top-1.5 w-3 h-3 rounded-full bg-brand-coral ring-4 ring-white" />
                                <h5 className="font-bold text-gray-900 text-[15px]">Drop off at Airport</h5>
                                <p className="text-gray-600 text-[14px] mt-1">Check out from the hotel and drop off at the {pkg.location} airport or station.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Stays */}
              {activeTab === 'stays' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-6 font-heading">Available Accommodations</h3>
                  <p className="text-gray-600 mb-6">Select your preferred accommodation type for this tour package.</p>
                  
                  <div className="flex flex-col gap-4">
                    {/* Hotel Option 1 */}
                    <div 
                      onClick={() => setSelectedHotel(0)}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedHotel === 0 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full sm:w-50 h-35 relative rounded-xl overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop" alt="Premium Hotel" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[18px] text-gray-900">Premium Hotel Stay</h4>
                            {selectedHotel === 0 && <CheckCircle2 className="text-gray-900 w-6 h-6" />}
                          </div>
                          <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">Experience maximum comfort in our handpicked 3 or 4-star properties. Features excellent amenities, prime locations, and top-tier hygiene standards.</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><Hotel size={14}/> AC Rooms</span>
                            <span className="flex items-center gap-1"><Utensils size={14}/> Breakfast Included</span>
                          </div>
                          <div className="text-[16px] font-bold text-gray-900 shrink-0">₹3,500 <span className="text-[13px] font-normal text-gray-500">/ night</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Hotel Option 2 */}
                    <div 
                      onClick={() => setSelectedHotel(1)}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedHotel === 1 ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full sm:w-50 h-35 relative rounded-xl overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=600&auto=format&fit=crop" alt="Luxury Camp" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[18px] text-gray-900">Experiential Swiss Camps</h4>
                            {selectedHotel === 1 && <CheckCircle2 className="text-gray-900 w-6 h-6" />}
                          </div>
                          <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">For applicable locations, enjoy a night under the stars in our luxury swiss tents. Includes bonfire, stargazing, and attached modern washrooms.</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-500 font-medium">
                            <span className="flex items-center gap-1"><Tent size={14}/> Luxury Tents</span>
                            <span className="flex items-center gap-1"><Utensils size={14}/> All Meals</span>
                          </div>
                          <div className="text-[16px] font-bold text-gray-900 shrink-0">₹4,200 <span className="text-[13px] font-normal text-gray-500">/ night</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Activities */}
              {activeTab === 'activities' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-[20px] font-bold text-gray-900 mb-6 font-heading">Included & Optional Activities</h3>
                  <p className="text-gray-600 mb-6">Select the activities you want to add to your itinerary.</p>
                  
                  <div className="flex flex-col gap-4">
                    {/* Activity Option 1 */}
                    <div 
                      onClick={() => toggleActivity(0)}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedActivities.includes(0) ? 'border-brand-coral bg-brand-coral/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full sm:w-37.5 h-30 relative rounded-xl overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" alt="Local Sightseeing" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[18px] text-gray-900">Guided Local Sightseeing</h4>
                            {selectedActivities.includes(0) && <CheckCircle2 className="text-brand-coral w-6 h-6" />}
                          </div>
                          <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">Explore the best landmarks and hidden gems with our expert local guides. Includes photography points and cultural hubs.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-[13px] text-brand-coral font-bold">
                          Included in Package
                        </div>
                      </div>
                    </div>

                    {/* Activity Option 2 */}
                    <div 
                      onClick={() => toggleActivity(1)}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedActivities.includes(1) ? 'border-brand-coral bg-brand-coral/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-full sm:w-37.5 h-30 relative rounded-xl overflow-hidden shrink-0">
                        <Image src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=600&auto=format&fit=crop" alt="Adventure Sports" fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-between grow">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[18px] text-gray-900">Adventure Sports Pass</h4>
                            {selectedActivities.includes(1) && <CheckCircle2 className="text-brand-coral w-6 h-6" />}
                          </div>
                          <p className="text-[14px] text-gray-600 mt-2 line-clamp-2">Get an adrenaline rush with our adventure sports pass. Includes zip-lining, river rafting, and bungee jumping (where applicable).</p>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-[13px] text-gray-900 font-bold">
                          + ₹2,500 / person
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Review rating */}
              {activeTab === 'reviews' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200">
                    <div className="text-center">
                      <h3 className="text-[48px] font-black text-gray-900 leading-none">4.8</h3>
                      <div className="flex items-center justify-center gap-1 mt-1 text-gray-900">
                        <Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><Star size={12} className="fill-current" /><StarHalf size={12} className="fill-current" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[18px] text-gray-900">Guest Favorite</h4>
                      <p className="text-gray-500 text-[14px]">Based on 128 verified reviews</p>
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div>
                          <p className="font-bold text-[14px]">Rahul S.</p>
                          <p className="text-[12px] text-gray-500">October 2025</p>
                        </div>
                      </div>
                      <p className="text-[14px] text-gray-700">&quot;Amazing experience! The tour flow was perfect and the stays were top-notch.&quot;</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div>
                          <p className="font-bold text-[14px]">Priya M.</p>
                          <p className="text-[12px] text-gray-500">September 2025</p>
                        </div>
                      </div>
                      <p className="text-[14px] text-gray-700">&quot;Everything was taken care of. The activities included were totally worth it!&quot;</p>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button 
                      onClick={() => setIsAllReviewsModalOpen(true)}
                      className="px-6 py-3 border border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Show all 241 reviews
                    </button>
                  </div>
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
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsReviewModalOpen(false)}
            />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 font-heading">Write a Review</h3>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
                        <Star size={32} className="fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label htmlFor="reviewText" className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                  <textarea 
                    id="reviewText" 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-coral/50 focus:border-brand-coral resize-none"
                    placeholder="Tell us about your experience..."
                  ></textarea>
                </div>
                <button 
                  className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
                  onClick={() => setIsReviewModalOpen(false)}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
