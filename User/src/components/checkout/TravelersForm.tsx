"use client";
import { Users, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";
import { useSearchParams } from "next/navigation";

export function TravelersForm() {
  const [expanded, setExpanded] = useState(false);
  const searchParams = useSearchParams();
  const { additionalTravelers, initTravelers, updateTraveler } = useCheckoutStore();
  
  const guestsStr = searchParams.get('guests');
  const totalGuests = guestsStr ? Number(guestsStr) : 2;
  const extraGuestsCount = Math.max(0, totalGuests - 1);
  
  useEffect(() => {
    initTravelers(extraGuestsCount);
  }, [extraGuestsCount, initTravelers]);
  
  if (extraGuestsCount === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 md:p-8 flex items-center justify-between text-left focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-coral" />
          <div>
            <h2 className="text-xl font-poppins font-bold text-brand-navy">Traveler Information</h2>
            <p className="text-sm text-gray-500 mt-1">Details for {extraGuestsCount} additional guest{extraGuestsCount > 1 ? 's' : ''}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 pt-0 border-t border-brand-sky space-y-8 mt-4">
              {additionalTravelers.map((traveler, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-bold text-brand-navy flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center text-xs">{index + 1}</span>
                    Guest {index + 1}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Full Name</label>
                      <input 
                        type="text" 
                        value={traveler.fullName}
                        onChange={e => updateTraveler(index, { fullName: e.target.value })}
                        placeholder="Full Name" 
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Gender</label>
                      <select 
                        value={traveler.gender}
                        onChange={e => updateTraveler(index, { gender: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <input 
                        type="date" 
                        value={traveler.dateOfBirth}
                        onChange={e => updateTraveler(index, { dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral outline-none text-gray-700" 
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
