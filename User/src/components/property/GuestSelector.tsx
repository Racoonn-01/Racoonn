'use client';

import { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePropertyFilterStore } from '@/store/propertyFilterStore';

export default function GuestSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    rooms, setRooms, 
    adults, setAdults, 
    children, setChildren, 
    infants, setInfants, 
    pets, setPets 
  } = usePropertyFilterStore();
  
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
        className="w-full h-full p-3 hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer select-none rounded-b-2xl sm:rounded-r-2xl sm:rounded-bl-none"
      >
        <div className="flex items-center gap-3">
          <Users className="text-gray-400 shrink-0 ml-2" size={20} />
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5 cursor-pointer">Guests & Rooms</label>
            <div className="text-[15px] text-brand-navy font-medium">
              {adults + children} guest{adults + children !== 1 ? 's' : ''}
              {infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : ''}
              {pets > 0 ? `, ${pets} pet${pets > 1 ? 's' : ''}` : ''}
            </div>
            <div className="text-[13px] text-gray-500">{rooms} room{rooms > 1 ? 's' : ''}</div>
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
            className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-5 z-50 w-[320px]"
          >
            <div className="space-y-6">
              {/* Adults */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[15px] text-brand-navy">Adults</p>
                  <p className="text-[13px] text-gray-500">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium text-[15px]">{adults}</span>
                  <button 
                    onClick={() => setAdults(adults + 1)}
                    disabled={(adults + children) >= rooms * 4}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[15px] text-brand-navy">Children</p>
                  <p className="text-[13px] text-gray-500">Ages 2–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium text-[15px]">{children}</span>
                  <button 
                    onClick={() => setChildren(children + 1)}
                    disabled={(adults + children) >= rooms * 4}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[15px] text-brand-navy">Infants</p>
                  <p className="text-[13px] text-gray-500">Under 2</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setInfants(Math.max(0, infants - 1))}
                    disabled={infants <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium text-[15px]">{infants}</span>
                  <button 
                    onClick={() => setInfants(infants + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Pets */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[15px] text-brand-navy">Pets</p>
                  <p className="text-[13px] text-gray-500 underline cursor-pointer">Bringing a service animal?</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setPets(Math.max(0, pets - 1))}
                    disabled={pets <= 0}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium text-[15px]">{pets}</span>
                  <button 
                    onClick={() => setPets(pets + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200"></div>

              {/* Rooms */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[15px] text-brand-navy">Rooms</p>
                  <p className="text-[12px] text-gray-500">Max 4 guests per room</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const newRooms = Math.max(1, rooms - 1);
                      setRooms(newRooms);
                      const maxAllowed = newRooms * 4;
                      const currentGuests = adults + children;
                      if (currentGuests > maxAllowed) {
                        let newChildren = children;
                        let newAdults = adults;
                        while (newAdults + newChildren > maxAllowed) {
                          if (newChildren > 0) newChildren--;
                          else newAdults--;
                        }
                        setChildren(newChildren);
                        setAdults(newAdults);
                      }
                    }}
                    disabled={rooms <= 1}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors disabled:opacity-30 disabled:hover:border-gray-300 disabled:cursor-not-allowed"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-4 text-center font-medium text-[15px]">{rooms}</span>
                  <button 
                    onClick={() => setRooms(rooms + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-gray-800 hover:text-gray-800 transition-colors"
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
