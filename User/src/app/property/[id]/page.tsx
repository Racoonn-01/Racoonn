
import Image from 'next/image';
import {
  MapPin,
  Star,
  Share,
  Heart,
  Wifi,
  Coffee,
  Car,
  Waves,
  ChevronDown,
  Info,
  Calendar,
  Users,
  ShieldCheck,
  RefreshCw,
  BedDouble,
  Sparkles
} from 'lucide-react';
import RoomImageSlider from '@/components/property/RoomImageSlider';
import PropertyPhotoGallery from '@/components/property/PropertyPhotoGallery';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import ReserveButton from '@/components/property/ReserveButton';
import GuestSelector from '@/components/property/GuestSelector';

export default async function PropertyDetails({ params }: { params: { id: string } }) {
  const id = params?.id || '1';

  const title = id === '2' ? 'Taj Aravali Resort & Spa' : id === '4' ? 'Soneva Jani, Maldives' : 'The Oberoi Udaivilas';
  const location = id === '2' ? 'Udaipur, Rajasthan, India' : id === '4' ? 'Medhufaru Island, Maldives' : 'Udaipur, Rajasthan, India';

  const images = id === '4'
    ? [
      'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop'
    ]
    : [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800&auto=format&fit=crop'
    ];

  return (
    <div className="min-h-screen bg-white text-[#222222]">

      {/* Container */}
      <div className="max-w-280 mx-auto px-6 pt-8 pb-24">

        {/* Top Header Section */}
        <div className="mb-6">
          <h1 className="text-[28px] md:text-[32px] leading-tight font-semibold mb-2 font-heading tracking-tight text-brand-navy">
            {title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[14px] md:text-[15px] font-medium text-gray-800">
              <span className="flex items-center gap-1">
                <Star size={16} className="fill-current" />
                4.96 · <span className="underline underline-offset-4 font-semibold text-gray-600 cursor-pointer">241 reviews</span>
              </span>
              <span className="hidden md:inline text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-600 underline underline-offset-4 cursor-pointer mt-1 md:mt-0 w-full md:w-auto">
                {location}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[14px] md:text-[15px] font-medium">
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                <Share size={16} /> <span className="underline underline-offset-4">Share</span>
              </button>
              <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                <Heart size={16} /> <span className="underline underline-offset-4">Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5-Image Bento Grid & Modal */}
        <PropertyPhotoGallery images={images} />

        {/* Sticky Horizontal Tab Navigation */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 mb-8 py-2">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <a href="#rooms" className="px-5 py-2.5 bg-gray-100 rounded-xl font-bold text-[15px] text-brand-navy flex items-center gap-2 transition-colors whitespace-nowrap">
              <BedDouble size={18} /> Rooms and prices
            </a>
            <a href="#amenities" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Sparkles size={18} /> Amenities
            </a>
            <a href="#about" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Info size={18} /> About the hotel
            </a>
            <a href="#location" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <MapPin size={18} /> Location
            </a>
            <a href="#reviews" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Star size={18} /> Rating and reviews <span className="bg-brand-navy text-white text-xs px-2 py-0.5 rounded-full ml-1">241</span>
            </a>
          </div>
        </div>

        {/* Full Width Layout */}
        <div className="flex flex-col gap-12">

          {/* Rooms Available Section (Horizontal Filter) */}
          <div id="rooms" className="scroll-mt-24">
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-brand-navy mb-1">Rooms available</h2>
              <p className="text-[15px] text-gray-500">12 options that meet your criteria</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col xl:flex-row gap-4 mb-8">
              <div className="flex-1 flex flex-col sm:flex-row border border-gray-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#222] transition-shadow">
                <div className="flex-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 relative cursor-pointer">
                  <Calendar className="text-gray-400 shrink-0 ml-2" size={20} />
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Check-in date</label>
                    <input type="date" className="text-[15px] text-brand-navy font-medium bg-transparent outline-none w-full cursor-pointer" defaultValue="2024-05-21" />
                  </div>
                </div>
                <div className="flex-1 p-3 border-b sm:border-b-0 sm:border-r border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 relative cursor-pointer">
                  <Calendar className="text-gray-400 shrink-0 ml-2" size={20} />
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Check-out date</label>
                    <input type="date" className="text-[15px] text-brand-navy font-medium bg-transparent outline-none w-full cursor-pointer" defaultValue="2024-05-26" />
                  </div>
                </div>
                <GuestSelector />
              </div>
              <button className="w-full xl:w-16 h-14 xl:h-auto rounded-2xl bg-brand-navy/5 text-brand-navy flex items-center justify-center hover:bg-brand-navy hover:text-white transition-all font-semibold xl:font-normal">
                <RefreshCw size={22} className="mr-2 xl:mr-0 hidden xl:block" />
                <span className="xl:hidden">Update Search</span>
              </button>
            </div>

            {/* Filters Toggle */}
            <button className="text-brand-navy font-semibold text-[14px] flex items-center gap-1 mb-8 hover:underline">
              Show additional filters <ChevronDown size={14} />
            </button>

            {/* Rooms Table */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:flex bg-gray-50 border-b border-gray-200 p-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                <div className="w-[40%]">Room type</div>
                <div className="w-[30%]">Meal plan and conditions</div>
                <div className="w-[30%]">Price per night</div>
              </div>

              {/* Room Row 1 */}
              <div className="flex flex-col md:flex-row border-b border-gray-200 last:border-b-0">
                <div className="w-full md:w-[40%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-[18px] font-bold text-brand-navy mb-2 hover:underline cursor-pointer">Luxury Suite with Lake View</h3>
                  <p className="text-[14px] text-gray-600 mb-4">1 extra-large double bed</p>
                  <div className="flex gap-2 text-brand-coral font-medium text-[13px]">
                    <span className="flex items-center gap-1"><Wifi size={14} /> Free WiFi</span>
                  </div>
                  <RoomImageSlider images={images.slice(0, 4)} />
                </div>
                <div className="w-full md:w-[30%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Coffee size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">Breakfast included</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">Free cancellation</span>
                        <p className="text-[12px] text-gray-500">before 19 May 2024</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-[30%] p-6 flex flex-col justify-center">
                  <div className="flex flex-col mb-2">
                    <span className="text-[14px] text-gray-500 line-through font-medium">₹40,000</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-bold text-brand-navy">₹32,000</span>
                      <Info size={14} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-6">per night<br />Includes taxes</p>
                  <ReserveButton roomName="Luxury Suite with Lake View" price={32000} />
                </div>
              </div>

              {/* Room Row 2 */}
              <div className="flex flex-col md:flex-row border-b border-gray-200 last:border-b-0">
                <div className="w-full md:w-[40%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <h3 className="text-[18px] font-bold text-brand-navy mb-2 hover:underline cursor-pointer">Premium Garden Villa</h3>
                  <p className="text-[14px] text-gray-600 mb-4">1 extra-large double bed + 1 sofa bed</p>
                  <div className="flex gap-2 text-brand-coral font-medium text-[13px]">
                    <span className="flex items-center gap-1"><Wifi size={14} /> Free WiFi</span>
                    <span className="flex items-center gap-1"><Waves size={14} /> Private pool</span>
                  </div>
                  <RoomImageSlider images={images.slice(1, 5)} />
                </div>
                <div className="w-full md:w-[30%] p-6 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Coffee size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-green-700">Breakfast & Dinner included</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldCheck size={18} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[14px] font-semibold text-gray-700">Non-refundable</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-[30%] p-6 flex flex-col justify-center">
                  <div className="flex flex-col mb-2">
                    <span className="text-[14px] text-gray-500 line-through font-medium">₹55,000</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[24px] font-bold text-brand-navy">₹42,000</span>
                      <Info size={14} className="text-gray-400" />
                    </div>
                  </div>
                  <p className="text-[13px] text-gray-500 mb-6">per night<br />Includes taxes</p>
                  <ReserveButton roomName="Premium Garden Villa" price={42000} />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <PropertyAmenities />

          {/* About This Hotel Section */}
          <div id="about" className="scroll-mt-24 border-t border-gray-200 pt-12">
            <div className="flex justify-between items-center pb-6">
              <div>
                <h2 className="text-[24px] font-semibold text-brand-navy mb-2">About the hotel</h2>
                <div className="flex flex-wrap gap-4 text-[14px] font-medium text-gray-600">
                  <span className="flex items-center gap-1"><Wifi size={16} /> Free Wifi</span>
                  <span className="flex items-center gap-1"><Waves size={16} /> Swimming Pool</span>
                  <span className="flex items-center gap-1"><Car size={16} /> Free parking</span>
                </div>
              </div>
              <div className="hidden lg:block w-16 h-16 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                <Image src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=100&auto=format&fit=crop" alt="Host" fill className="object-cover" />
              </div>
            </div>

            <div className="max-w-200">
              <p className="text-[16px] text-gray-700 leading-[1.7] font-light mb-4">
                Experience unparalleled luxury at our flagship property. Nestled in the heart of the city&apos;s most prestigious district, this resort offers panoramic views, bespoke furnishings, and world-class amenities.
              </p>
              <p className="text-[16px] text-gray-700 leading-[1.7] font-light">
                Every detail has been curated to provide a sophisticated and serene sanctuary. Enjoy 24/7 butler service, private dining experiences, and exclusive access to the spa and infinity pool.
              </p>
              <button className="flex items-center gap-1 font-semibold text-brand-coral text-[15px] mt-4 hover:underline">
                Read full description
              </button>
            </div>
          </div>

          {/* Location / Map Section */}
          <div id="location" className="scroll-mt-24 border-t border-gray-200 pt-12">
            <h2 className="text-[24px] font-semibold text-brand-navy mb-6">Location</h2>
            <p className="text-[16px] text-gray-700 mb-6">{location}</p>
            <div className="w-full h-100 bg-gray-200 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200">
              <iframe
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>

          {/* Reviews Section */}
          <PropertyReviews />

        </div>
      </div>
    </div>
  );
}
