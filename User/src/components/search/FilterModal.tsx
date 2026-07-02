"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Minus, Plus, Wifi, Utensils, Zap, Key, PawPrint, ChevronDown, Home, Building2, Warehouse } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  bedrooms: number | 'Any';
  beds: number | 'Any';
  bathrooms: number | 'Any';
  minPrice: number;
  maxPrice: number;
  selectedAmenities: string[];
  selectedPropertyTypes: string[];
  selectedBookingOptions: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  initialFilters?: FilterState;
  matchCount?: number;
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters, matchCount = 0 }: FilterModalProps) {
  const [typeOfPlace, setTypeOfPlace] = useState('Any type');
  const [bedrooms, setBedrooms] = useState<number | 'Any'>(initialFilters?.bedrooms ?? 'Any');
  const [beds, setBeds] = useState<number | 'Any'>(initialFilters?.beds ?? 'Any');
  const [bathrooms, setBathrooms] = useState<number | 'Any'>(initialFilters?.bathrooms ?? 'Any');
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice ?? 4800);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice ?? 58000);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters?.selectedAmenities ?? []);
  const [showPropertyType, setShowPropertyType] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(initialFilters?.selectedPropertyTypes ?? []);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showHostLanguage, setShowHostLanguage] = useState(false);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState<string[]>(initialFilters?.selectedBookingOptions ?? []);

  // Update internal state if initialFilters changes
  React.useEffect(() => {
    if (initialFilters) {
      setBedrooms(initialFilters.bedrooms);
      setBeds(initialFilters.beds);
      setBathrooms(initialFilters.bathrooms);
      setMinPrice(initialFilters.minPrice);
      setMaxPrice(initialFilters.maxPrice);
      setSelectedAmenities(initialFilters.selectedAmenities);
      setSelectedPropertyTypes(initialFilters.selectedPropertyTypes);
      setSelectedBookingOptions(initialFilters.selectedBookingOptions);
    }
  }, [initialFilters]);

  const handleApply = () => {
    if (onApply) {
      onApply({
        bedrooms,
        beds,
        bathrooms,
        minPrice,
        maxPrice,
        selectedAmenities,
        selectedPropertyTypes,
        selectedBookingOptions
      });
    }
    onClose();
  };

  const handleClearAll = () => {
    setBedrooms('Any');
    setBeds('Any');
    setBathrooms('Any');
    setMinPrice(4800);
    setMaxPrice(58000);
    setSelectedAmenities([]);
    setSelectedPropertyTypes([]);
    setSelectedBookingOptions([]);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const togglePropertyType = (type: string) => {
    setSelectedPropertyTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleBookingOption = (option: string) => {
    setSelectedBookingOptions(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const minAllowed = 1000;
  const maxAllowed = 100000;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(value);
  };

  const getPercent = (value: number) => {
    return Math.round(((value - minAllowed) / (maxAllowed - minAllowed)) * 100);
  };

  const increment = (state: number | 'Any', setter: (v: number | 'Any') => void) => {
    if (state === 'Any') setter(1);
    else setter(state + 1);
  };

  const decrement = (state: number | 'Any', setter: (v: number | 'Any') => void) => {
    if (state === 'Any') return;
    if (state === 1) setter('Any');
    else setter(state - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl h-[90vh] md:h-[85vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-gray-200 shrink-0">
          <DialogTitle className="text-center font-bold text-[16px]">Filters</DialogTitle>
        </DialogHeader>

          {/* Scrollable Content Area */}
        <div className="overflow-y-auto p-6 flex-1 text-gray-900">
          
          {/* Price range */}
          <section className="mb-8 mt-2">
            <h3 className="text-[22px] font-semibold mb-2">Price range</h3>
            <p className="text-[15px] text-gray-800 mb-8">Trip price, includes all fees</p>

            {/* Histogram Mockup */}
            <div className="flex items-end justify-start h-16 gap-0.5 w-full max-w-2xl px-8">
              {[0, 0, 0, 0, 2, 4, 1, 0, 0, 0, 2, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0].map((height, i) => (
                <div 
                  key={i} 
                  className="w-full rounded-t-sm transition-colors bg-[#E31C5F]"
                  style={{ height: height === 0 ? '0%' : `${height * 15}%` }}
                />
              ))}
            </div>
            
            {/* Range Slider Functional */}
            <div className="relative w-full max-w-2xl h-10 mb-8 -mt-3 px-8 group">
              <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-gray-200 -translate-y-1/2 rounded-full" />
              <div 
                className="absolute top-1/2 h-0.5 bg-[#E31C5F] -translate-y-1/2 rounded-full" 
                style={{ left: `calc(2rem + ${getPercent(minPrice)}%)`, right: `calc(2rem + ${100 - getPercent(maxPrice)}%)` }}
              />
              
              <input
                type="range"
                min={minAllowed}
                max={maxAllowed}
                step={500}
                value={minPrice}
                onChange={handleMinChange}
                className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.15)] z-10"
              />
              <input
                type="range"
                min={minAllowed}
                max={maxAllowed}
                step={500}
                value={maxPrice}
                onChange={handleMaxChange}
                className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-0 appearance-none pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-200 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_2px_6px_rgba(0,0,0,0.15)] z-20"
              />
            </div>

            {/* Min / Max Inputs */}
            <div className="flex items-center justify-between gap-6 w-full max-w-2xl px-4 mt-8">
              <div className="flex flex-col items-center w-35">
                <label className="text-[14px] text-gray-500 font-medium mb-3">Minimum</label>
                <div className="border border-gray-300 rounded-full py-3.5 px-4 w-full flex justify-center focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <span className="text-gray-900 text-[15px]">₹</span>
                  <input 
                    type="number" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(Number(e.target.value) || minAllowed)} 
                    className="w-16 outline-none bg-transparent text-center text-[15px] text-gray-900" 
                  />
                </div>
              </div>
              <div className="flex flex-col items-center w-35">
                <label className="text-[14px] text-gray-500 font-medium mb-3">Maximum</label>
                <div className="border border-gray-300 rounded-full py-3.5 px-4 w-full flex justify-center focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <span className="text-gray-900 text-[15px]">₹</span>
                  <input 
                    type="text" 
                    value={maxPrice === maxAllowed ? `${maxPrice}+` : maxPrice} 
                    onChange={(e) => setMaxPrice(parseInt(e.target.value.replace(/\D/g, '')) || maxAllowed)} 
                    className="w-20 outline-none bg-transparent text-center text-[15px] text-gray-900" 
                  />
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 mb-8 max-w-2xl" />

          {/* Rooms and beds */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Rooms and beds</h3>
            
            <div className="flex flex-col gap-6 max-w-2xl">
              {/* Bedrooms */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-normal text-gray-800">Bedrooms</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => decrement(bedrooms, setBedrooms)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      bedrooms === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                    }`}
                    disabled={bedrooms === 'Any'}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-normal text-[15px]">{bedrooms}</span>
                  <button 
                    onClick={() => increment(bedrooms, setBedrooms)}
                    className="w-8 h-8 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Beds */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-normal text-gray-800">Beds</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => decrement(beds, setBeds)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      beds === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                    }`}
                    disabled={beds === 'Any'}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-normal text-[15px]">{beds}</span>
                  <button 
                    onClick={() => increment(beds, setBeds)}
                    className="w-8 h-8 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Bathrooms */}
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-normal text-gray-800">Bathrooms</span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => decrement(bathrooms, setBathrooms)}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                      bathrooms === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                    }`}
                    disabled={bathrooms === 'Any'}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-normal text-[15px]">{bathrooms}</span>
                  <button 
                    onClick={() => increment(bathrooms, setBathrooms)}
                    className="w-8 h-8 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-200 mb-8 max-w-2xl" />

          {/* Amenities */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Amenities</h3>
            <div className="flex flex-wrap gap-3 max-w-2xl">
              {[
                { id: 'Wifi', icon: <Wifi size={18} className="text-gray-700" />, label: 'Wifi' },
                { id: 'Kitchen', icon: <Utensils size={18} className="text-gray-700" />, label: 'Kitchen' },
                { id: 'Washing machine', icon: <span className="text-[18px]">🧺</span>, label: 'Washing machine' },
                { id: 'Tumble dryer', icon: <span className="text-[18px]">🌀</span>, label: 'Tumble dryer' },
                { id: 'Air conditioning', icon: <span className="text-[18px]">❄️</span>, label: 'Air conditioning' },
                { id: 'Heating', icon: <span className="text-[18px]">🌡️</span>, label: 'Heating' },
              ].map((amenity) => (
                <button 
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors ${
                    selectedAmenities.includes(amenity.id) 
                      ? 'border-2 border-gray-900 bg-gray-50' 
                      : 'border border-gray-300 hover:border-gray-900'
                  }`}
                >
                  {amenity.icon}
                  <span className="text-[14px] font-normal">{amenity.label}</span>
                </button>
              ))}
            </div>
              
            <AnimatePresence>
              {showAllAmenities && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex flex-wrap gap-3 max-w-2xl overflow-hidden"
                >
                  {[
                    { id: 'Pool', icon: <span className="text-[18px]">🏊</span>, label: 'Pool' },
                    { id: 'Hot tub', icon: <span className="text-[18px]">♨️</span>, label: 'Hot tub' },
                    { id: 'Patio', icon: <span className="text-[18px]">🪑</span>, label: 'Patio' },
                    { id: 'BBQ grill', icon: <span className="text-[18px]">🥩</span>, label: 'BBQ grill' },
                    { id: 'Fire pit', icon: <span className="text-[18px]">🔥</span>, label: 'Fire pit' },
                    { id: 'Pool table', icon: <span className="text-[18px]">🎱</span>, label: 'Pool table' },
                    { id: 'Indoor fireplace', icon: <span className="text-[18px]">🪵</span>, label: 'Indoor fireplace' },
                    { id: 'Dedicated workspace', icon: <span className="text-[18px]">💻</span>, label: 'Dedicated workspace' },
                  ].map((amenity) => (
                    <button 
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors ${
                        selectedAmenities.includes(amenity.id) 
                          ? 'border-2 border-gray-900 bg-gray-50' 
                          : 'border border-gray-300 hover:border-gray-900'
                      }`}
                    >
                      {amenity.icon}
                      <span className="text-[14px] font-normal">{amenity.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setShowAllAmenities(!showAllAmenities)}
              className="mt-4 font-medium underline text-[15px] flex items-center gap-1 hover:text-gray-600"
            >
              {showAllAmenities ? 'Show less' : 'Show more'} 
              <ChevronDown size={16} className={showAllAmenities ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
          </section>

          <hr className="border-gray-200 mb-8 max-w-2xl" />

          {/* Booking options */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-6">Booking options</h3>
            <div className="flex flex-wrap gap-3 max-w-2xl">
              {[
                { id: 'Instant Book', icon: <Zap size={18} className="text-gray-700" />, label: 'Instant Book' },
                { id: 'Self check-in', icon: <Key size={18} className="text-gray-700" />, label: 'Self check-in' },
                { id: 'Allows pets', icon: <PawPrint size={18} className="text-gray-700" />, label: 'Allows pets' },
              ].map((option) => (
                <button 
                  key={option.id}
                  onClick={() => toggleBookingOption(option.id)}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-colors ${
                    selectedBookingOptions.includes(option.id)
                      ? 'border-2 border-gray-900 bg-gray-50' 
                      : 'border border-gray-300 hover:border-gray-900'
                  }`}
                >
                  {option.icon}
                  <span className="text-[14px] font-normal">{option.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Accordion List */}
          <div className="max-w-2xl flex flex-col">
            <button 
              onClick={() => setShowPropertyType(!showPropertyType)}
              className="py-6 flex items-center justify-between w-full hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold">Property type</span>
              <ChevronDown size={20} className={`text-gray-500 transition-transform ${showPropertyType ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showPropertyType && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-3 pb-6">
                    {[
                      { id: 'House', icon: <Home size={20} className="text-gray-800" />, label: 'House' },
                      { id: 'Guest house', icon: <Warehouse size={20} className="text-gray-800" />, label: 'Guest house' },
                      { id: 'Hotel', icon: <Building2 size={20} className="text-gray-800" />, label: 'Hotel' },
                    ].map((type) => (
                      <button 
                        key={type.id}
                        onClick={() => togglePropertyType(type.id)}
                        className={`flex items-center gap-3 rounded-full px-5 py-3 transition-colors ${
                          selectedPropertyTypes.includes(type.id) 
                            ? 'border-2 border-gray-900 bg-gray-50' 
                            : 'border border-gray-300 hover:border-gray-900'
                        }`}
                      >
                        {type.icon}
                        <span className="text-[15px] font-normal">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <hr className="border-gray-200" />
            <button 
              onClick={() => setShowAccessibility(!showAccessibility)}
              className="py-6 flex items-center justify-between w-full hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold">Accessibility features</span>
              <ChevronDown size={20} className={`text-gray-500 transition-transform ${showAccessibility ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showAccessibility && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-8 pb-8 pt-2">
                    {/* Guest entrance and parking */}
                    <div>
                      <h4 className="font-semibold text-[15px] mb-4">Guest entrance and parking</h4>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Step-free access</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Disabled parking spot</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Guest entrance wider than 32 inches (81 centimetres)</span>
                        </label>
                      </div>
                    </div>

                    {/* Bedroom */}
                    <div>
                      <h4 className="font-semibold text-[15px] mb-4">Bedroom</h4>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Step-free bedroom access</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Bedroom entrance wider than 32 inches (81 centimetres)</span>
                        </label>
                      </div>
                    </div>

                    {/* Bathroom */}
                    <div>
                      <h4 className="font-semibold text-[15px] mb-4">Bathroom</h4>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Step-free bathroom access</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Bathroom entrance wider than 32 inches (81 centimetres)</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Toilet grab bar</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Shower grab bar</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Step-free shower</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Shower or bath chair</span>
                        </label>
                      </div>
                    </div>

                    {/* Adaptive equipment */}
                    <div>
                      <h4 className="font-semibold text-[15px] mb-4">Adaptive equipment</h4>
                      <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                          <span className="text-[15px] font-normal">Ceiling or mobile hoist</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <hr className="border-gray-200" />
            <button 
              onClick={() => setShowHostLanguage(!showHostLanguage)}
              className="py-6 flex items-center justify-between w-full hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg font-semibold">Host language</span>
              <ChevronDown size={20} className={`text-gray-500 transition-transform ${showHostLanguage ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showHostLanguage && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 pb-8 pt-2">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                      <span className="text-[15px] font-normal">English</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input type="checkbox" className="w-5.5 h-5.5 rounded border-gray-300 accent-black cursor-pointer" />
                      <span className="text-[15px] font-normal">Hindi</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 px-6 flex items-center justify-between bg-white shrink-0">
          <button 
            onClick={handleClearAll}
            className="font-semibold text-[15px] text-[#b0b0b0] hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
          <button 
            className="bg-[#222222] text-white font-semibold py-3.5 px-6 rounded-lg hover:bg-black transition-colors"
            onClick={handleApply}
          >
            Show {matchCount} places
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
