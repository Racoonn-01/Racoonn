
import Image from 'next/image';
import {
  MapPin,
  Star,
  Wifi,
  Coffee,
  Car,
  Waves,
  ChevronDown,
  Info,
  ShieldCheck,
  BedDouble,
  Sparkles
} from 'lucide-react';
import RoomImageSlider from '@/components/property/RoomImageSlider';
import PropertyDescription from '@/components/property/PropertyDescription';
import PropertyFilterBar from '@/components/property/PropertyFilterBar';
import PropertyPhotoGallery from '@/components/property/PropertyPhotoGallery';
import PropertyReviews from '@/components/property/PropertyReviews';
import PropertyAmenities from '@/components/property/PropertyAmenities';
import PropertyHeaderActions from '@/components/property/PropertyHeaderActions';
import ReserveButton from '@/components/property/ReserveButton';
import RoomListWithAvailability from '@/components/property/RoomListWithAvailability';
import { notFound } from 'next/navigation';
import { allProperties } from '@/data/properties';
import { mockHotels } from '@/data/mockHotels';
import { isActiveProperty, parseLocationGeo } from '@/lib/utils';
import { databases } from '@/lib/appwrite/config';
import { getReviews } from '@/lib/appwrite/api';
import { Query } from 'appwrite';

export default async function PropertyDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || '1';
  
  const propertyFromList = allProperties.find(p => p.id === id) || mockHotels.find(h => h.id === id);
  if (propertyFromList && !isActiveProperty(propertyFromList)) {
    notFound();
  }

  let title = id === '2' ? 'Taj Aravali Resort & Spa' : id === '4' ? 'Soneva Jani, Maldives' : 'The Oberoi Udaivilas';
  let location = id === '2' ? 'Udaipur, Rajasthan, India' : id === '4' ? 'Medhufaru Island, Maldives' : 'Udaipur, Rajasthan, India';
  let images = id === '4'
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
  let description = "Experience luxury like never before...";
  let price = 25000;
  let amenitiesList: string[] = [];
  void price;
  void amenitiesList;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rooms: any[] = [];
  let vendorId = '';
  let reviewCount = 241;
  let averageRating = '4.96';
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';

  // Try to fetch real data from Appwrite
  try {
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const colId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';
    const roomColId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';
    const roomBucketId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20';

    if (dbId && colId) {
      const realProperty = await databases.getDocument(dbId, colId, id);
      if (realProperty) {
        if (!isActiveProperty(realProperty as unknown as { status?: string })) {
          notFound();
        }
        title = realProperty.propertyName || realProperty.title || title;
        location = [realProperty.location, realProperty.city, realProperty.state].filter(Boolean).join(", ") || `${realProperty.city || ''}, ${realProperty.state || ''}`;
        if (realProperty.photos && realProperty.photos.length > 0) {
          images = realProperty.photos;
        }
        if (realProperty.description) {
          description = realProperty.description;
        }
        if (realProperty.price) {
          price = realProperty.price;
        }
        if (realProperty.amenities) {
          amenitiesList = realProperty.amenities;
        }
        if (realProperty.vendorId) {
          vendorId = realProperty.vendorId;
        }
        
        // Fetch rooms for this property
        if (roomColId) {
          const roomsRes = await databases.listDocuments(dbId, roomColId, [
            Query.equal('propertyId', id)
          ]);
          if (roomsRes.documents && roomsRes.documents.length > 0) {
            rooms = roomsRes.documents.map(room => {
              const roomImages = room.photos && room.photos.length > 0 
                ? room.photos.map((fileId: string) => `https://sgp.cloud.appwrite.io/v1/storage/buckets/${roomBucketId}/files/${fileId}/view?project=${project}`)
                : ['https://images.unsplash.com/photo-1542314831-c6a4d14d837e?q=80&w=800&auto=format&fit=crop'];
              
              return {
                ...room,
                images: roomImages
              };
            });
          }
        }

        // Fetch reviews to calculate realtime average
        const reviews = await getReviews(id);
        if (reviews && reviews.length > 0) {
          reviewCount = reviews.length;
          const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
          averageRating = (sum / reviewCount).toFixed(2);
        } else {
          reviewCount = 0;
          averageRating = '0.00';
        }
      }
    }
  } catch (error) {
    // If document is not found or other error, fallback to mock data
    console.error("Appwrite fetch failed or property not found, falling back to mock:", error);
  }

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
                {averageRating} · <a href="#reviews-open" className="underline underline-offset-4 font-semibold text-gray-600 cursor-pointer">{reviewCount} reviews</a>
              </span>
              <span className="hidden md:inline text-gray-300">•</span>
              <span className="flex items-center gap-1 text-gray-600 underline underline-offset-4 cursor-pointer mt-1 md:mt-0 w-full md:w-auto">
                {location}
              </span>
            </div>
            <PropertyHeaderActions propertyId={id} propertyTitle={title} />
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
              <Coffee size={18} /> Amenities
            </a>
            <a href="#about" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Info size={18} /> About the hotel
            </a>
            <a href="#location" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <MapPin size={18} /> Location
            </a>
            <a href="#reviews" className="px-5 py-2.5 rounded-xl font-semibold text-[15px] text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors whitespace-nowrap">
              <Star size={18} /> Rating and reviews <span className="bg-brand-navy text-white text-xs px-2 py-0.5 rounded-full ml-1">{reviewCount}</span>
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
            <PropertyFilterBar />

            {/* Filters Toggle */}
            <button className="text-brand-navy font-semibold text-[14px] flex items-center gap-1 mb-8 hover:underline">
              Show additional filters <ChevronDown size={14} />
            </button>

            {/* Rooms Table with Dynamic Date Rate Availability */}
            <RoomListWithAvailability
              propertyId={id}
              propertyName={title}
              propertyImage={images[0]}
              propertyLocation={location}
              initialRooms={rooms}
            />
          </div>

          {/* Amenities Section */}
          <PropertyAmenities amenities={amenitiesList} />

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

            <PropertyDescription description={description} />
          </div>

          {/* Location / Map Section */}
          <div id="location" className="scroll-mt-24 border-t border-gray-200 pt-12">
            <h2 className="text-[24px] font-semibold text-brand-navy mb-6">Location</h2>
            {(() => {
              const { cleanLocation, lat, lng } = parseLocationGeo(location);
              const mapQuery = (lat && lng) ? `${lat},${lng}` : cleanLocation;
              return (
                <>
                  <p className="text-[16px] text-gray-700 mb-6">{cleanLocation}</p>
                  <div className="w-full h-100 bg-gray-200 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>
                </>
              );
            })()}
          </div>

          {/* Reviews Section */}
          <PropertyReviews propertyId={id} vendorId={vendorId} />

        </div>
      </div>
    </div>
  );
}
