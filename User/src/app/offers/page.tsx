"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Clock, Loader2 } from 'lucide-react';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Query } from 'appwrite';

interface Offer {
  $id: string;
  name: string;
  description?: string;
  validUntil?: string;
  code: string;
  image?: string;
  discountType: string;
  discountValue: number;
  status: string;
}

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          'promotions',
          [
              Query.orderDesc('$createdAt')
          ]
        );
        const allOffers = res.documents as unknown as Offer[];
        setOffers(allOffers.filter(o => o.status !== 'Draft'));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const getTag = (offer: Offer) => {
      if (offer.discountType === 'percentage') {
          return `${offer.discountValue}% OFF`;
      }
      return `FLAT ₹${offer.discountValue}`;
  };

  const isExpired = (offer: Offer) => {
    if (offer.status !== 'Active') return true;
    if (!offer.validUntil) return false;
    // Check if the current date is strictly greater than the validUntil date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(offer.validUntil);
    return validDate < today;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-brand-navy mb-4">
            Special <span className="text-brand-coral">Offers</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our hand-picked deals and exclusive discounts. Make your next journey unforgettable while saving more.
          </p>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-brand-coral" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No active offers at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {offers.map((offer) => (
              <div key={offer.$id} className="bg-white rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row">
                {/* Image Section */}
                <div className="relative w-full sm:w-2/5 h-64 sm:h-auto overflow-hidden bg-gray-100 shrink-0">
                  {offer.image && (
                    <Image
                      src={offer.image}
                      alt={offer.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${!isExpired(offer) ? 'group-hover:scale-110' : 'grayscale opacity-75'}`}
                      sizes="(max-width: 640px) 100vw, 40vw"
                    />
                  )}
                  {isExpired(offer) && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                      <span className="bg-white/95 text-rose-600 font-black px-6 py-2 rounded-full uppercase tracking-widest text-lg shadow-xl transform -rotate-12 border-[3px] border-rose-500">
                        Expired
                      </span>
                    </div>
                  )}
                  <div className={`absolute top-4 left-4 ${!isExpired(offer) ? 'bg-brand-coral' : 'bg-gray-500'} text-white px-3 py-1 text-sm font-bold rounded-full shadow-md flex items-center gap-1.5 z-20`}>
                    <Tag size={14} />
                    {getTag(offer)}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-8 w-full sm:w-3/5 flex flex-col justify-center">
                  <h3 className="text-2xl font-bold text-brand-navy mb-2 group-hover:text-brand-coral transition-colors line-clamp-2">
                    {offer.name}
                  </h3>
                  <p className="text-gray-600 mb-6 grow line-clamp-3">
                    {offer.description}
                  </p>

                  <div className="flex flex-col gap-4">
                    {offer.validUntil && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <Clock size={16} className="text-brand-coral" />
                        Valid till {offer.validUntil}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Promo Code</span>
                        <span className={`font-mono font-bold px-3 py-1.5 rounded-lg border inline-block w-fit ${!isExpired(offer) ? 'bg-brand-sky/10 text-brand-navy border-brand-sky/20' : 'bg-gray-100 text-gray-400 border-gray-200 line-through'}`}>
                          {offer.code}
                        </span>
                      </div>
                      {!isExpired(offer) ? (
                        <Link href="/search" className="bg-brand-navy hover:bg-brand-coral text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
                          Book Now
                        </Link>
                      ) : (
                        <button disabled className="bg-gray-100 text-gray-400 px-6 py-2.5 rounded-xl font-medium cursor-not-allowed border border-gray-200">
                          Expired
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
