"use client";
import { Users, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSearchParams } from "next/navigation";

export function TravelersForm() {
  const searchParams = useSearchParams();
  const hotelId = searchParams.get('hotelId') || useCheckoutStore.getState().selectedHotelId || '';
  const isPackage = hotelId.startsWith('pkg-');

  const { additionalTravelers, initTravelers, updateTraveler } = useCheckoutStore();
  
  const guestsStr = searchParams.get('guests');
  const totalGuests = guestsStr ? Number(guestsStr) : 2;
  const extraGuestsCount = Math.max(0, totalGuests - 1);

  // If it's a package or travelers are empty, keep open so user sees required fields
  const [expanded, setExpanded] = useState(isPackage || extraGuestsCount > 0);
  
  useEffect(() => {
    initTravelers(extraGuestsCount);
  }, [extraGuestsCount, initTravelers]);
  
  if (extraGuestsCount === 0) return null;

  const allCompleted = additionalTravelers.length > 0 && additionalTravelers.every(t => 
    t.fullName.trim() !== '' && t.gender.trim() !== '' && t.dateOfBirth.trim() !== ''
  );
  
  return (
    <div id="travelers-section" className="bg-white rounded-xl shadow-xs border border-brand-sky overflow-hidden">
      <button 
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 sm:p-6 md:p-8 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-soft-coral/40 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-brand-coral" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-poppins font-bold text-brand-navy">Traveler Information</h2>
              {isPackage && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${allCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                  {allCompleted ? '✓ Completed' : 'Required for Package'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Details for {extraGuestsCount} additional guest{extraGuestsCount > 1 ? 's' : ''}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 sm:p-6 md:p-8 pt-0 border-t border-brand-sky space-y-6 mt-2">
              {additionalTravelers.map((traveler, index) => (
                <div key={index} className="space-y-3 bg-gray-50/50 p-3 sm:p-4 rounded-xl border border-gray-100">
                  <h3 className="font-bold text-brand-navy flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center text-xs font-semibold">{index + 1}</span>
                    Guest {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Full Name *</label>
                      <input 
                        type="text" 
                        value={traveler.fullName}
                        onChange={e => updateTraveler(index, { fullName: e.target.value })}
                        placeholder="As on Government ID" 
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none text-base md:text-sm bg-white" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Gender *</label>
                      <select 
                        value={traveler.gender}
                        onChange={e => updateTraveler(index, { gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none text-base md:text-sm bg-white" 
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700">Date of Birth *</label>
                      <input 
                        type="date" 
                        value={traveler.dateOfBirth}
                        onChange={e => updateTraveler(index, { dateOfBirth: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none text-base md:text-sm bg-white text-gray-700" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
