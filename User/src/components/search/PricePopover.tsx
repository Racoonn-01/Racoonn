"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, IndianRupee } from "lucide-react";

interface PricePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice: number;
  maxPrice: number;
  absoluteMin: number;
  absoluteMax: number;
  onApply: (min: number, max: number) => void;
  onClear: () => void;
  matchCount?: number;
}

export default function PricePopover({
  isOpen,
  onClose,
  minPrice: initialMin,
  maxPrice: initialMax,
  absoluteMin,
  absoluteMax,
  onApply,
  onClear,
  matchCount,
}: PricePopoverProps) {
  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);
  const [minInputVal, setMinInputVal] = useState(String(initialMin));
  const [maxInputVal, setMaxInputVal] = useState(String(initialMax));
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync state when popover opens or initial values change
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setMinPrice(initialMin);
        setMaxPrice(initialMax);
        setMinInputVal(String(initialMin));
        setMaxInputVal(String(initialMax));
      }, 0);
    }
  }, [isOpen, initialMin, initialMax]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const getPercent = (value: number) => {
    return Math.round(((value - absoluteMin) / (absoluteMax - absoluteMin)) * 100) || 0;
  };

  const minGap = Math.max(500, Math.floor((absoluteMax - absoluteMin) / 100));

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxPrice - minGap);
    setMinPrice(val);
    setMinInputVal(String(val));
    setActiveThumb("min");
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minPrice + minGap);
    setMaxPrice(val);
    setMaxInputVal(String(val));
    setActiveThumb("max");
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMinInputVal(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num >= absoluteMin && num <= maxPrice - minGap) {
      setMinPrice(num);
    }
  };

  const handleMinInputBlur = () => {
    const num = Number(minInputVal);
    if (isNaN(num) || num < absoluteMin) {
      setMinPrice(absoluteMin);
      setMinInputVal(String(absoluteMin));
    } else if (num > maxPrice - minGap) {
      const clamped = Math.max(absoluteMin, maxPrice - minGap);
      setMinPrice(clamped);
      setMinInputVal(String(clamped));
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valStr = e.target.value;
    setMaxInputVal(valStr);
    const num = Number(valStr);
    if (!isNaN(num) && num >= minPrice + minGap && num <= absoluteMax) {
      setMaxPrice(num);
    }
  };

  const handleMaxInputBlur = () => {
    const num = Number(maxInputVal);
    if (isNaN(num) || num > absoluteMax) {
      setMaxPrice(absoluteMax);
      setMaxInputVal(String(absoluteMax));
    } else if (num < minPrice + minGap) {
      const clamped = Math.min(absoluteMax, minPrice + minGap);
      setMaxPrice(clamped);
      setMaxInputVal(String(clamped));
    }
  };

  const handleApply = () => {
    onApply(minPrice, maxPrice);
    onClose();
  };

  const handleClear = () => {
    setMinPrice(absoluteMin);
    setMaxPrice(absoluteMax);
    setMinInputVal(String(absoluteMin));
    setMaxInputVal(String(absoluteMax));
    onClear();
    onClose();
  };

  // Histogram heights mockup
  const histogramBars = [
    2, 4, 8, 14, 25, 40, 65, 80, 95, 100, 85, 70, 55, 45, 30, 20, 15, 25, 35, 50,
    60, 40, 25, 18, 12, 8, 5, 3, 2, 1
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-150 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Popup Modal */}
          <div className="fixed inset-0 z-160 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="pointer-events-auto w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Price Range</h3>
                  <p className="text-xs text-gray-500">Nightly prices before taxes and fees</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Histogram Bars */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between h-20 gap-1 px-2 pt-2">
                    {histogramBars.map((height, idx) => {
                      const barPercent = (idx / (histogramBars.length - 1)) * 100;
                      const minPct = getPercent(minPrice);
                      const maxPct = getPercent(maxPrice);
                      const inRange = barPercent >= minPct && barPercent <= maxPct;

                      return (
                        <div
                          key={idx}
                          className={`w-full rounded-t transition-all duration-200 ${
                            inRange
                              ? "bg-rose-500 shadow-sm"
                              : "bg-gray-200"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>

                  {/* Dual Range Slider Container */}
                  <div className="relative w-full h-8 flex items-center">
                    {/* Background Track */}
                    <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
                    
                    {/* Highlighted Active Range Track */}
                    <div
                      className="absolute h-1.5 bg-rose-500 rounded-full"
                      style={{
                        left: `${getPercent(minPrice)}%`,
                        right: `${100 - getPercent(maxPrice)}%`,
                      }}
                    />

                    {/* Minimum Thumb Input */}
                    <input
                      type="range"
                      min={absoluteMin}
                      max={absoluteMax}
                      step={minGap}
                      value={minPrice}
                      onChange={handleMinSliderChange}
                      onMouseDown={() => setActiveThumb("min")}
                      onTouchStart={() => setActiveThumb("min")}
                      className={`absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none ${
                        activeThumb === "min" ? "z-30" : "z-20"
                      } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing transition-transform`}
                    />

                    {/* Maximum Thumb Input */}
                    <input
                      type="range"
                      min={absoluteMin}
                      max={absoluteMax}
                      step={minGap}
                      value={maxPrice}
                      onChange={handleMaxSliderChange}
                      onMouseDown={() => setActiveThumb("max")}
                      onTouchStart={() => setActiveThumb("max")}
                      className={`absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none ${
                        activeThumb === "max" ? "z-30" : "z-20"
                      } [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-rose-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing transition-transform`}
                    />
                  </div>
                </div>

                {/* Min & Max Price Editable Display Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-2xl p-3 focus-within:border-gray-900 focus-within:ring-1 focus-within:ring-gray-900 transition-all bg-gray-50/30">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Minimum
                    </label>
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
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      Maximum
                    </label>
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
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900 underline transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-transform active:scale-95"
                >
                  {matchCount !== undefined ? `Show places (${matchCount})` : "Show places"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
