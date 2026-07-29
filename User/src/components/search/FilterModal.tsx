"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Wifi, Utensils, Zap, Key, PawPrint, ChevronDown, Home, Building2, Warehouse, X, IndianRupee } from 'lucide-react';
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

const MIN_ALLOWED = 1000;
const MAX_ALLOWED = 100000;

export default function FilterModal({ isOpen, onClose, onApply, initialFilters, matchCount = 0 }: FilterModalProps) {
  const [bedrooms, setBedrooms] = useState<number | 'Any'>(initialFilters?.bedrooms ?? 'Any');
  const [beds, setBeds] = useState<number | 'Any'>(initialFilters?.beds ?? 'Any');
  const [bathrooms, setBathrooms] = useState<number | 'Any'>(initialFilters?.bathrooms ?? 'Any');
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice ?? 1000);
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice ?? 100000);
  const [minInputVal, setMinInputVal] = useState<string>(String(initialFilters?.minPrice ?? 1000));
  const [maxInputVal, setMaxInputVal] = useState<string>(String(initialFilters?.maxPrice ?? 100000));
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters?.selectedAmenities ?? []);
  const [showPropertyType, setShowPropertyType] = useState(false);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(initialFilters?.selectedPropertyTypes ?? []);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showHostLanguage, setShowHostLanguage] = useState(false);
  const [selectedBookingOptions, setSelectedBookingOptions] = useState<string[]>(initialFilters?.selectedBookingOptions ?? []);

  const modalRef = useRef<HTMLDivElement>(null);

  // Sync internal state when modal opens or initialFilters changes
  useEffect(() => {
    if (isOpen) {
      setBedrooms(initialFilters?.bedrooms ?? 'Any');
      setBeds(initialFilters?.beds ?? 'Any');
      setBathrooms(initialFilters?.bathrooms ?? 'Any');
      const minP = initialFilters?.minPrice ?? 1000;
      const maxP = initialFilters?.maxPrice ?? 100000;
      setMinPrice(minP);
      setMaxPrice(maxP);
      setMinInputVal(String(minP));
      setMaxInputVal(String(maxP));
      setSelectedAmenities(initialFilters?.selectedAmenities ?? []);
      setSelectedPropertyTypes(initialFilters?.selectedPropertyTypes ?? []);
      setSelectedBookingOptions(initialFilters?.selectedBookingOptions ?? []);
    }
  }, [isOpen, initialFilters]);

  // Click outside to dismiss
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

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
    const defaultState: FilterState = {
      bedrooms: 'Any',
      beds: 'Any',
      bathrooms: 'Any',
      minPrice: 1000,
      maxPrice: 100000,
      selectedAmenities: [],
      selectedPropertyTypes: [],
      selectedBookingOptions: [],
    };
    setBedrooms(defaultState.bedrooms);
    setBeds(defaultState.beds);
    setBathrooms(defaultState.bathrooms);
    setMinPrice(defaultState.minPrice);
    setMaxPrice(defaultState.maxPrice);
    setMinInputVal(String(defaultState.minPrice));
    setMaxInputVal(String(defaultState.maxPrice));
    setSelectedAmenities(defaultState.selectedAmenities);
    setSelectedPropertyTypes(defaultState.selectedPropertyTypes);
    setSelectedBookingOptions(defaultState.selectedBookingOptions);
    if (onApply) {
      onApply(defaultState);
    }
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

  const getPercent = (value: number) => {
    return Math.round(((value - MIN_ALLOWED) / (MAX_ALLOWED - MIN_ALLOWED)) * 100);
  };

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - 1000);
    setMinPrice(val);
    setMinInputVal(String(val));
    setActiveThumb("min");
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + 1000);
    setMaxPrice(val);
    setMaxInputVal(String(val));
    setActiveThumb("max");
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMinInputVal(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num >= MIN_ALLOWED && num <= maxPrice - 500) {
      setMinPrice(num);
    }
  };

  const handleMinInputBlur = () => {
    const num = Number(minInputVal);
    if (isNaN(num) || num < MIN_ALLOWED) {
      setMinPrice(MIN_ALLOWED);
      setMinInputVal(String(MIN_ALLOWED));
    } else if (num > maxPrice - 500) {
      const clamped = Math.max(MIN_ALLOWED, maxPrice - 500);
      setMinPrice(clamped);
      setMinInputVal(String(clamped));
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMaxInputVal(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num >= minPrice + 500 && num <= MAX_ALLOWED) {
      setMaxPrice(num);
    }
  };

  const handleMaxInputBlur = () => {
    const num = Number(maxInputVal);
    if (isNaN(num) || num > MAX_ALLOWED) {
      setMaxPrice(MAX_ALLOWED);
      setMaxInputVal(String(MAX_ALLOWED));
    } else if (num < minPrice + 500) {
      const clamped = Math.min(MAX_ALLOWED, minPrice + 500);
      setMaxPrice(clamped);
      setMaxInputVal(String(clamped));
    }
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

  const histogramBars = [
    2, 4, 8, 14, 25, 40, 65, 80, 95, 100, 85, 70, 55, 45, 30, 20, 15, 25, 35, 50,
    60, 40, 25, 18, 12, 8, 5, 3, 2, 1
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Smooth Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Smooth Popup Modal Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="pointer-events-auto max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[85vh] max-h-[850px]"
            >
              {/* Header */}
              <div className="p-4 px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
                <h2 className="text-lg font-bold text-gray-900 mx-auto">Filters</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-6 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="overflow-y-auto p-6 md:p-8 flex-1 text-gray-900 space-y-8">
                
                {/* Price range */}
                <section className="mt-2">
                  <h3 className="text-xl font-bold mb-1 text-gray-900">Price range</h3>
                  <p className="text-sm text-gray-500 mb-6">Trip price, includes all fees</p>

                  {/* Histogram Mockup */}
                  <div className="flex items-end justify-between h-20 gap-1 w-full max-w-2xl px-4">
                    {histogramBars.map((height, idx) => {
                      const barPercent = (idx / (histogramBars.length - 1)) * 100;
                      const minPct = getPercent(minPrice);
                      const maxPct = getPercent(maxPrice);
                      const inRange = barPercent >= minPct && barPercent <= maxPct;

                      return (
                        <div 
                          key={idx} 
                          className={`w-full rounded-t transition-all duration-200 ${
                            inRange ? "bg-rose-500 shadow-sm" : "bg-gray-200"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Range Slider Container */}
                  <div className="relative w-full max-w-2xl h-8 flex items-center mb-6">
                    <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
                    <div 
                      className="absolute h-1.5 bg-rose-500 rounded-full" 
                      style={{ left: `${getPercent(minPrice)}%`, right: `${100 - getPercent(maxPrice)}%` }}
                    />
                    
                    <input
                      type="range"
                      min={MIN_ALLOWED}
                      max={MAX_ALLOWED}
                      step={500}
                      value={minPrice}
                      onChange={handleMinSliderChange}
                      onMouseDown={() => setActiveThumb("min")}
                      onTouchStart={() => setActiveThumb("min")}
                      className={`absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none ${
                        activeThumb === "min" ? "z-30" : "z-20"
                      } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing transition-transform`}
                    />
                    <input
                      type="range"
                      min={MIN_ALLOWED}
                      max={MAX_ALLOWED}
                      step={500}
                      value={maxPrice}
                      onChange={handleMaxSliderChange}
                      onMouseDown={() => setActiveThumb("max")}
                      onTouchStart={() => setActiveThumb("max")}
                      className={`absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none ${
                        activeThumb === "max" ? "z-30" : "z-20"
                      } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing transition-transform`}
                    />
                  </div>

                  {/* Min / Max Editable Inputs */}
                  <div className="grid grid-cols-2 gap-4 max-w-2xl">
                    <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all bg-gray-50/30">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Minimum</label>
                      <div className="flex items-center gap-1 font-semibold text-gray-900 text-base">
                        <IndianRupee size={15} className="text-gray-500 shrink-0" />
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={minInputVal} 
                          onChange={handleMinInputChange} 
                          onBlur={handleMinInputBlur}
                          className="w-full bg-transparent outline-none font-bold text-gray-900 text-base" 
                        />
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all bg-gray-50/30">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">Maximum</label>
                      <div className="flex items-center gap-1 font-semibold text-gray-900 text-base">
                        <IndianRupee size={15} className="text-gray-500 shrink-0" />
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={maxInputVal} 
                          onChange={handleMaxInputChange} 
                          onBlur={handleMaxInputBlur}
                          className="w-full bg-transparent outline-none font-bold text-gray-900 text-base" 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100 max-w-2xl" />

                {/* Rooms and beds */}
                <section className="space-y-6 max-w-2xl">
                  <h3 className="text-xl font-bold text-gray-900">Rooms and beds</h3>
                  <div className="space-y-5">
                    {/* Bedrooms */}
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-800">Bedrooms</span>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => decrement(bedrooms, setBedrooms)}
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                            bedrooms === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                          }`}
                          disabled={bedrooms === 'Any'}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-[15px] text-gray-900">{bedrooms}</span>
                        <button 
                          type="button"
                          onClick={() => increment(bedrooms, setBedrooms)}
                          className="w-9 h-9 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Beds */}
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-800">Beds</span>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => decrement(beds, setBeds)}
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                            beds === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                          }`}
                          disabled={beds === 'Any'}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-[15px] text-gray-900">{beds}</span>
                        <button 
                          type="button"
                          onClick={() => increment(beds, setBeds)}
                          className="w-9 h-9 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Bathrooms */}
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-medium text-gray-800">Bathrooms</span>
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => decrement(bathrooms, setBathrooms)}
                          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
                            bathrooms === 'Any' ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-gray-400 text-gray-600 hover:border-gray-900 hover:text-gray-900'
                          }`}
                          disabled={bathrooms === 'Any'}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-bold text-[15px] text-gray-900">{bathrooms}</span>
                        <button 
                          type="button"
                          onClick={() => increment(bathrooms, setBathrooms)}
                          className="w-9 h-9 rounded-full border border-gray-400 text-gray-600 flex items-center justify-center transition-colors hover:border-gray-900 hover:text-gray-900"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100 max-w-2xl" />

                {/* Amenities */}
                <section className="max-w-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Amenities</h3>
                  <div className="flex flex-wrap gap-2.5">
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
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all text-sm font-medium ${
                          selectedAmenities.includes(amenity.id) 
                            ? 'border-2 border-gray-900 bg-gray-900 text-white' 
                            : 'border border-gray-300 hover:border-gray-900 text-gray-800'
                        }`}
                      >
                        {amenity.icon}
                        <span>{amenity.label}</span>
                      </button>
                    ))}
                  </div>
                    
                  <AnimatePresence>
                    {showAllAmenities && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="flex flex-wrap gap-2.5 overflow-hidden"
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
                            type="button"
                            onClick={() => toggleAmenity(amenity.id)}
                            className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all text-sm font-medium ${
                              selectedAmenities.includes(amenity.id) 
                                ? 'border-2 border-gray-900 bg-gray-900 text-white' 
                                : 'border border-gray-300 hover:border-gray-900 text-gray-800'
                            }`}
                          >
                            {amenity.icon}
                            <span>{amenity.label}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="button"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 font-semibold text-sm underline flex items-center gap-1 hover:text-gray-600 transition-colors"
                  >
                    {showAllAmenities ? 'Show less' : 'Show more'} 
                    <ChevronDown size={16} className={showAllAmenities ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </button>
                </section>

                <hr className="border-gray-100 max-w-2xl" />

                {/* Booking options */}
                <section className="max-w-2xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Booking options</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { id: 'Instant Book', icon: <Zap size={18} className="text-gray-700" />, label: 'Instant Book' },
                      { id: 'Self check-in', icon: <Key size={18} className="text-gray-700" />, label: 'Self check-in' },
                      { id: 'Allows pets', icon: <PawPrint size={18} className="text-gray-700" />, label: 'Allows pets' },
                    ].map((option) => (
                      <button 
                        key={option.id}
                        type="button"
                        onClick={() => toggleBookingOption(option.id)}
                        className={`flex items-center gap-2 rounded-full px-5 py-2.5 transition-all text-sm font-medium ${
                          selectedBookingOptions.includes(option.id)
                            ? 'border-2 border-gray-900 bg-gray-900 text-white' 
                            : 'border border-gray-300 hover:border-gray-900 text-gray-800'
                        }`}
                      >
                        {option.icon}
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Accordion List */}
                <div className="max-w-2xl flex flex-col pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowPropertyType(!showPropertyType)}
                    className="py-4 flex items-center justify-between w-full hover:bg-gray-50 transition-colors rounded-xl px-2"
                  >
                    <span className="text-lg font-bold text-gray-900">Property type</span>
                    <ChevronDown size={20} className={`text-gray-500 transition-transform ${showPropertyType ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showPropertyType && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-2.5 pb-4 pt-1 px-2">
                          {[
                            { id: 'House', icon: <Home size={18} />, label: 'House' },
                            { id: 'Guest house', icon: <Warehouse size={18} />, label: 'Guest house' },
                            { id: 'Hotel', icon: <Building2 size={18} />, label: 'Hotel' },
                          ].map((type) => (
                            <button 
                              key={type.id}
                              type="button"
                              onClick={() => togglePropertyType(type.id)}
                              className={`flex items-center gap-2.5 rounded-full px-5 py-2.5 transition-all text-sm font-medium ${
                                selectedPropertyTypes.includes(type.id) 
                                  ? 'border-2 border-gray-900 bg-gray-900 text-white' 
                                  : 'border border-gray-300 hover:border-gray-900 text-gray-800'
                              }`}
                            >
                              {type.icon}
                              <span>{type.label}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <hr className="border-gray-100 my-2" />

                  <button 
                    type="button"
                    onClick={() => setShowAccessibility(!showAccessibility)}
                    className="py-4 flex items-center justify-between w-full hover:bg-gray-50 transition-colors rounded-xl px-2"
                  >
                    <span className="text-lg font-bold text-gray-900">Accessibility features</span>
                    <ChevronDown size={20} className={`text-gray-500 transition-transform ${showAccessibility ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showAccessibility && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-3 pb-4 pt-1 px-4">
                          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-800">
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 accent-gray-900 cursor-pointer" />
                            <span>Step-free guest entrance</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-800">
                            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 accent-gray-900 cursor-pointer" />
                            <span>Guest entrance wider than 32 inches</span>
                          </label>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 p-4 px-6 flex items-center justify-between bg-gray-50/50 shrink-0">
                <button 
                  type="button"
                  onClick={handleClearAll}
                  className="font-semibold text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                >
                  Clear all
                </button>
                <button 
                  type="button"
                  onClick={handleApply}
                  className="bg-gray-900 hover:bg-black text-white font-bold text-sm py-3 px-7 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  Show {matchCount} places
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
