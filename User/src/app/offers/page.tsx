"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Clock, Loader2, Building2, Package, Globe, Copy, Check } from 'lucide-react';
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
  maxDiscountCap?: number;
  minOrderValue?: number;
  applicableTo?: "rooms" | "packages" | "all";
  isPublic?: boolean;
  usageLimitType?: string;
  firstBookingOnly?: boolean;
  status: string;
}

export default function SpecialOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rooms' | 'packages'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await databases.listDocuments(
          appwriteConfig.databaseId,
          'promotions',
          [
            Query.orderDesc('$createdAt'),
            Query.limit(100)
          ]
        );
        const allOffers = res.documents as unknown as Offer[];
        // Filter strictly to active public offers
        setOffers(allOffers.filter(o => o.status === 'Active' && o.isPublic !== false));
      } catch (error) {
        console.error('Error fetching offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getTag = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}% OFF`;
    }
    return `FLAT ₹${offer.discountValue}`;
  };

  const isExpired = (offer: Offer) => {
    if (offer.status !== 'Active') return true;
    if (!offer.validUntil) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDate = new Date(offer.validUntil);
    return validDate < today;
  };

  const filteredOffers = offers.filter(o => {
    if (selectedCategory === 'rooms') return o.applicableTo === 'rooms' || o.applicableTo === 'all' || !o.applicableTo;
    if (selectedCategory === 'packages') return o.applicableTo === 'packages' || o.applicableTo === 'all';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-[32px] md:text-5xl leading-tight font-heading font-bold text-brand-navy mb-3 md:mb-4">
            Special <span className="text-brand-coral">Offers & Deals</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-[15px] md:text-lg px-2">
            Discover verified discount coupons on luxury stays and curated travel packages. Apply at checkout to save more.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Offers' },
              { id: 'rooms', label: 'Hotel & Stay Offers', icon: Building2 },
              { id: 'packages', label: 'Holiday Packages', icon: Package },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id as any)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                    selectedCategory === tab.id
                      ? 'bg-brand-coral text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-brand-coral" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No active promotional offers in this category right now. Please check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {filteredOffers.map((offer) => (
              <div key={offer.$id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col sm:flex-row border border-gray-100">
                {/* Image Section */}
                <div className="relative w-full sm:w-2/5 h-52 sm:h-auto overflow-hidden bg-gray-100 shrink-0">
                  {offer.image ? (
                    <Image
                      src={offer.image}
                      alt={offer.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${!isExpired(offer) ? 'group-hover:scale-110' : 'grayscale opacity-75'}`}
                      sizes="(max-width: 640px) 100vw, 40vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-rose-50 to-orange-100 p-4 text-center">
                      <Tag className="w-12 h-12 text-brand-coral/40" />
                    </div>
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
                <div className="p-5 sm:p-7 w-full sm:w-3/5 flex flex-col justify-between">
                  <div>
                    {/* Scope Badge */}
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      {offer.applicableTo === 'packages' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <Package className="w-3 h-3" /> Holiday Packages
                        </span>
                      ) : offer.applicableTo === 'rooms' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <Building2 className="w-3 h-3" /> Hotel Stays Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Globe className="w-3 h-3" /> Sitewide
                        </span>
                      )}

                      {offer.maxDiscountCap && (
                        <span className="text-[11px] font-semibold text-gray-500">
                          Max Cap: ₹{offer.maxDiscountCap}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg md:text-xl font-bold text-brand-navy mb-1.5 group-hover:text-brand-coral transition-colors line-clamp-2">
                      {offer.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 text-xs md:text-sm">
                      {offer.description || "Special promotional offer for your next booking."}
                    </p>

                    {offer.minOrderValue && offer.minOrderValue > 0 ? (
                      <p className="text-[11px] text-gray-400 font-medium mb-2">
                        Min. booking value: ₹{offer.minOrderValue}
                      </p>
                    ) : null}
                  </div>

                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    {offer.validUntil && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Clock size={14} className="text-brand-coral" />
                        Valid till {offer.validUntil}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => handleCopyCode(offer.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-coral bg-gray-50 hover:bg-rose-50 text-brand-navy font-mono font-bold text-xs transition-colors cursor-pointer"
                        title="Click to copy promo code"
                      >
                        <span className="tracking-wide uppercase">{offer.code}</span>
                        {copiedCode === offer.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>

                      {!isExpired(offer) ? (
                        <Link 
                          href={offer.applicableTo === 'packages' ? '/packages' : '/search'} 
                          className="bg-brand-navy hover:bg-brand-coral text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs"
                        >
                          Book Now
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Expired</span>
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

