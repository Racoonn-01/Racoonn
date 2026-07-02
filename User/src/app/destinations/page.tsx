import Image from 'next/image';
import Link from 'next/link';
import { MapPin } from 'lucide-react';

const allDestinations = [
  { id: 1, name: 'Nainital', subtitle: 'The lake district surrounded by hills.', price: '₹2,499', image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop' },
  { id: 2, name: 'Kedarnath', subtitle: 'A sacred journey to the Himalayas.', price: '₹3,999', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop' },
  { id: 3, name: 'Rishikesh', subtitle: 'Yoga, adventure and spiritual vibes.', price: '₹1,899', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=800&auto=format&fit=crop' },
  { id: 4, name: 'Auli', subtitle: 'Skiing slopes and scenic views.', price: '₹2,799', image: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?q=80&w=800&auto=format&fit=crop' },
  { id: 5, name: 'Haridwar', subtitle: 'Where spirituality meets serenity.', price: '₹1,499', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop' },
  { id: 6, name: 'Mussoorie', subtitle: 'Queen of the Hills.', price: '₹2,999', image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=800&auto=format&fit=crop' },
  { id: 7, name: 'Dehradun', subtitle: 'Gateway to Garhwal Himalayas.', price: '₹1,999', image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?q=80&w=800&auto=format&fit=crop' },
  { id: 8, name: 'Jim Corbett', subtitle: 'Wilderness and adventure.', price: '₹4,499', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop' },
];

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Destinations Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {allDestinations.map((dest) => (
            <Link href={`/search?destination=${dest.name}`} key={dest.id} className="block group">
              <div className="relative w-full h-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/90" />

                {/* Location Tag */}
                <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                  <MapPin size={14} className="text-brand-coral" fill="currentColor" />
                  <span className="text-sm font-bold text-brand-navy">{dest.name}</span>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 w-full p-6 text-white flex flex-col gap-4">
                  <p className="text-white/90 font-medium text-[16px] leading-snug">{dest.subtitle}</p>
                  <div className="bg-white/95 px-5 py-2 rounded-full self-start text-brand-navy font-bold text-sm shadow-lg transform-gpu">
                    Stays from {dest.price}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
