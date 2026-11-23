import { optimizeAppwriteImage } from "@/lib/optimizeImage";
import Image from 'next/image';
import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';

const hotels = [
  {
    id: 1,
    name: 'The Ritz-Carlton, Paris',
    location: 'Paris, France',
    rating: 4.9,
    reviews: 1240,
    price: 450,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop',
    tags: ['Luxury', 'City Center']
  },
  {
    id: 2,
    name: 'Aman Tokyo',
    location: 'Tokyo, Japan',
    rating: 4.8,
    reviews: 890,
    price: 600,
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1925&auto=format&fit=crop',
    tags: ['Spa', 'Views']
  },
  {
    id: 3,
    name: 'Four Seasons Maldives',
    location: 'Baa Atoll, Maldives',
    rating: 5.0,
    reviews: 512,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=2070&auto=format&fit=crop',
    tags: ['Beachfront', 'Villas']
  },
];

export default function FeaturedHotels() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-navy mb-4">Featured Luxury Stays</h2>
          <p className="text-brand-charcoal/70">Handpicked premium accommodations for those who appreciate the finer things in life.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white border border-brand-sky/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={optimizeAppwriteImage(hotel.image)}
                  alt={hotel.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {hotel.tags.map(tag => (
                    <span key={tag} className="bg-white/95 shadow-sm text-brand-navy text-xs font-semibold px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-heading font-bold text-brand-navy">{hotel.name}</h3>
                  <div className="flex items-center gap-1 bg-brand-sand px-2 py-1 rounded-md">
                    <Star className="text-brand-coral fill-brand-coral" size={14} />
                    <span className="text-sm font-semibold text-brand-navy">{hotel.rating}</span>
                  </div>
                </div>

                <div className="flex items-center text-brand-charcoal/60 mb-6">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{hotel.location}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-sky/30">
                  <div>
                    <span className="text-xs text-brand-charcoal/60 uppercase font-semibold">Starting from</span>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-brand-navy">${hotel.price}</span>
                      <span className="text-brand-charcoal/60 mb-1">/night</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/hotel/${hotel.id}`}
                    className="bg-brand-sky/30 hover:bg-brand-coral text-brand-navy hover:text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
