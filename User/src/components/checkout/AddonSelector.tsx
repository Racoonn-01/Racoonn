"use client";
import { Plus, Check, Sparkles, Car, Plane, Coffee, Shield, Clock, Wine, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { useCheckoutStore } from "@/store/checkoutStore";

export const DEFAULT_ADDONS = [
  { id: "airport", title: "Airport Transfer", price: 1200, description: "Hassle-free pickup and drop-off" },
  { id: "breakfast", title: "Breakfast Package", price: 800, description: "Daily buffet breakfast per person" },
  { id: "spa", title: "Spa Access", price: 1500, description: "Unlimited access to wellness center" },
  { id: "insurance", title: "Travel Insurance", price: 450, description: "Comprehensive trip coverage" }
];

interface AddonType {
  id: string;
  title: string;
  price: number;
  description: string;
}

interface AddonSelectorProps {
  addons: AddonType[];
}

function getIconForTitle(title: string) {
  const t = title.toLowerCase();
  if (t.includes('cab') || t.includes('car') || t.includes('taxi') || t.includes('ride') || t.includes('transport')) return Car;
  if (t.includes('airport') || t.includes('flight') || t.includes('plane') || t.includes('transfer')) return Plane;
  if (t.includes('food') || t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('meal')) return Coffee;
  if (t.includes('spa') || t.includes('massage') || t.includes('wellness') || t.includes('relax')) return Sparkles;
  if (t.includes('insur') || t.includes('protect') || t.includes('shield')) return Shield;
  if (t.includes('early') || t.includes('late') || t.includes('time') || t.includes('check') || t.includes('hour')) return Clock;
  if (t.includes('wine') || t.includes('drink') || t.includes('champagne') || t.includes('bottle')) return Wine;
  return Sparkles; // Default fallback icon
}

export function AddonSelector({ addons }: AddonSelectorProps) {
  const selected = useCheckoutStore(state => state.selectedAddons);
  const toggle = useCheckoutStore(state => state.toggleAddon);

  const displayAddons = addons && addons.length > 0 ? addons : DEFAULT_ADDONS;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-brand-sky p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-poppins font-bold text-brand-navy mb-2">Enhance Your Stay</h2>
      <p className="text-sm text-gray-500 mb-6">Select premium add-ons for a better experience</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayAddons.map((addon) => {
          const isSelected = selected.includes(addon.id);
          const Icon = getIconForTitle(addon.title);
          
          return (
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              key={addon.id}
              onClick={() => toggle(addon.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-4 transition-colors flex flex-col h-full ${
                isSelected 
                  ? "border-brand-coral bg-brand-soft-coral/30" 
                  : "border-brand-sky hover:border-brand-coral/50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${isSelected ? "bg-brand-coral text-white" : "bg-brand-sand text-brand-navy"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "border-brand-coral bg-brand-coral" : "border-gray-300"
                }`}>
                  {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-gray-400" />}
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="font-bold text-brand-navy text-sm mb-1">{addon.title}</h3>
                <p className="text-xs text-gray-500 mb-3">{addon.description}</p>
                <div className="font-medium text-brand-coral">₹{addon.price}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
