"use client";
import { Plus, Check, Zap, Car, Plane, Coffee, Shield, Clock, Wine, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";

export interface AddonType {
  id?: string;
  $id?: string;
  title?: string;
  name?: string;
  price?: number;
  description?: string;
}

export const DEFAULT_ADDONS: AddonType[] = [
  { id: "airport", title: "Airport Transfer", price: 1200, description: "Hassle-free pickup and drop-off" },
  { id: "breakfast", title: "Breakfast Package", price: 800, description: "Daily buffet breakfast per person" },
  { id: "spa", title: "Spa Access", price: 1500, description: "Unlimited access to wellness center" },
  { id: "insurance", title: "Travel Insurance", price: 450, description: "Comprehensive trip coverage" }
];

interface AddonSelectorProps {
  addons: AddonType[];
  guests?: number;
}

function getIconForTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes('cab') || t.includes('car') || t.includes('taxi') || t.includes('ride') || t.includes('transport')) return Car;
  if (t.includes('airport') || t.includes('flight') || t.includes('plane') || t.includes('transfer')) return Plane;
  if (t.includes('food') || t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('meal')) return Coffee;
  if (t.includes('spa') || t.includes('massage') || t.includes('wellness') || t.includes('relax')) return Zap;
  if (t.includes('insur') || t.includes('protect') || t.includes('shield')) return Shield;
  if (t.includes('early') || t.includes('late') || t.includes('time') || t.includes('check') || t.includes('hour')) return Clock;
  if (t.includes('wine') || t.includes('drink') || t.includes('champagne') || t.includes('bottle')) return Wine;
  return Zap; // Default fallback icon
}

export function AddonSelector({ addons, guests = 1 }: AddonSelectorProps) {
  const selected = useCheckoutStore(state => state.selectedAddons);
  const toggle = useCheckoutStore(state => state.toggleAddon);

  const displayAddons = addons && addons.length > 0 ? addons : DEFAULT_ADDONS;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-poppins font-bold text-brand-navy mb-2">Enhance Your Stay</h2>
      <p className="text-sm text-gray-500 mb-6">Select premium add-ons for a better experience</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        {displayAddons.map((addon, index) => {
          const addonId = addon.id || addon.$id || `addon-${index}`;
          const addonTitle = addon.title || addon.name || "Add-on Service";
          const isSelected = selected.includes(addonId);
          const Icon = getIconForTitle(addonTitle);
          const isPerPerson = addon.description?.toLowerCase().includes('per person');
          const displayPrice = isPerPerson ? (addon.price || 0) * guests : (addon.price || 0);
          
          return (
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              key={addonId}
              onClick={() => toggle(addonId)}
              className={`relative cursor-pointer rounded-xl border-2 p-3 md:p-4 transition-colors flex items-center gap-3 md:gap-4 ${
                isSelected 
                  ? "border-brand-coral bg-brand-soft-coral/30" 
                  : "border-brand-sky hover:border-brand-coral/50 bg-white"
              }`}
            >
              <div className={`p-2.5 rounded-lg shrink-0 ${isSelected ? "bg-brand-coral text-white" : "bg-brand-sand text-brand-navy"}`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="font-bold text-brand-navy text-sm md:text-base leading-tight mb-0.5">{addonTitle}</h3>
                {addon.description && <p className="text-xs md:text-sm text-gray-500 truncate">{addon.description}</p>}
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="font-bold text-brand-coral text-sm md:text-base">
                  ₹{addon.price || 0}
                </div>
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                  isSelected ? "border-brand-coral bg-brand-coral" : "border-gray-300"
                }`}>
                  {isSelected ? <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" /> : <Plus className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
