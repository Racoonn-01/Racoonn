"use client";
import { useState } from "react";
import { MessageSquare, ChevronDown, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";

export function AdditionalRequestsForm() {
  const [expanded, setExpanded] = useState(false);
  const { guestDetails, updateGuestDetails } = useCheckoutStore();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky overflow-hidden">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 md:p-8 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-brand-coral" />
          <div>
            <h2 className="text-xl font-poppins font-bold text-brand-navy">Additional Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Arrival time, smoking preference, and special requests</p>
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
            <div className="p-6 md:p-8 pt-0 border-t border-brand-sky mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" /> Arrival Time
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all bg-white">
                    <option>I don&apos;t know yet</option>
                    <option>12:00 PM - 02:00 PM</option>
                    <option>02:00 PM - 04:00 PM</option>
                    <option>04:00 PM - 06:00 PM</option>
                    <option>After 06:00 PM</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Smoking Preference</label>
                  <div className="flex gap-4 h-[42px] items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="smoking" className="w-4 h-4 text-brand-coral focus:ring-brand-coral" defaultChecked />
                      <span className="text-sm text-gray-700">Non-smoking</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="smoking" className="w-4 h-4 text-brand-coral focus:ring-brand-coral" />
                      <span className="text-sm text-gray-700">Smoking</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Special Requests (Optional)</label>
                  <textarea 
                    value={guestDetails.specialRequests} 
                    onChange={e => updateGuestDetails({ specialRequests: e.target.value })} 
                    placeholder="e.g. Quiet room, high floor, anniversary celebration..." 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-coral focus:border-brand-coral outline-none transition-all min-h-[100px] resize-y"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer p-4 rounded-lg border border-brand-sky bg-brand-sand/50 hover:bg-brand-sky/30 transition-colors">
                    <input type="checkbox" className="w-5 h-5 mt-0.5 rounded text-brand-coral focus:ring-brand-coral" />
                    <div>
                      <span className="block font-medium text-brand-navy">Airport Pickup Required</span>
                      <span className="block text-sm text-gray-500 mt-0.5">We will contact you to arrange the details. Additional charges may apply.</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
