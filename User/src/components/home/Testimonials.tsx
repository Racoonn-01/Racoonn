import { optimizeAppwriteImage } from "@/lib/optimizeImage";
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Travel Enthusiast',
    content: 'Racoonn made booking our family vacation to Paris an absolute breeze. The hotel exceeded our expectations and the support team was fantastic!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Business Traveler',
    content: 'As someone who travels for work constantly, I rely on Racoonn for seamless bookings. Their curated luxury stays never disappoint.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Emily Davis',
    role: 'Honeymooner',
    content: 'Found the perfect beachfront villa in the Maldives through Racoonn. The best price guarantee actually saved us a lot of money!',
    rating: 4,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop'
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-brand-sand">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-navy mb-4">What Our Guests Say</h2>
          <p className="text-brand-charcoal/70">Real reviews from real travelers who chose Racoonn for their journeys.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl p-8 shadow-sm relative">
              <Quote size={40} className="text-brand-coral/20 absolute top-6 right-6" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < review.rating ? "text-brand-coral fill-brand-coral" : "text-brand-sky/60"} 
                  />
                ))}
              </div>
              
              <p className="text-brand-charcoal/80 mb-8 italic">&quot;{review.content}&quot;</p>
              
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image 
                    src={optimizeAppwriteImage(review.avatar)} 
                    alt={review.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-brand-navy">{review.name}</h4>
                  <p className="text-sm text-brand-charcoal/60">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
