'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <Users className="text-gray-400 shrink-0 ml-2" size={20} />
          <div>
            <div className="text-[15px] text-brand-navy font-medium">{rooms} room{rooms > 1 ? 's' : ''}</div>
            <div className="text-[13px] text-gray-500">
              {adults} adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''}
            </div>
          </div>
        </div>
        <ChevronDown className={`text-gray-400 mr-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50 w-72"
          >
            <div className="space-y-5">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-navy">Adults</p>
                  <p className="text-sm text-gray-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:hover:border-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium">{adults}</span>
                  <button 
                    onClick={() => setAdults(adults + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-navy">Children</p>
                  <p className="text-sm text-gray-500">Ages 0-12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:hover:border-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium">{children}</span>
                  <button 
                    onClick={() => setChildren(children + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Rooms */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-brand-navy">Rooms</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setRooms(Math.max(1, rooms - 1))}
                    disabled={rooms <= 1}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-30 disabled:hover:border-gray-200"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium">{rooms}</span>
                  <button 
                    onClick={() => setRooms(rooms + 1)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
