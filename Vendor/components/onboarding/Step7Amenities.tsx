"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Wifi, Dumbbell, Car, Coffee, Wind, Tv, Snowflake, UtensilsCrossed, PawPrint, Wine, Clock, Zap, Plane, Shirt, Sun, Users, Accessibility } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";

function CustomTimePicker({ value, onChange, label, isOpen, setIsOpen, onConfirm }: { value: string, onChange: (v: string) => void, label: string, isOpen: boolean, setIsOpen: (v: boolean) => void, onConfirm?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const getParts = () => {
    let h = "02", m = "00", ampm = "PM";
    if (value) {
      const match = value.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        h = match[1].padStart(2, '0');
        m = match[2].padStart(2, '0');
        ampm = match[3].toUpperCase();
      }
    }
    return { h, m, ampm };
  };

  const { h, m, ampm } = getParts();

  const handleUpdate = (newH: string, newM: string, newAmpm: string) => {
    onChange(`${newH}:${newM} ${newAmpm}`);
  };

  return (
    <div className="relative space-y-2" ref={containerRef}>
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <div 
        className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 flex items-center justify-between cursor-pointer focus:border-brand-coral focus:ring-2 focus:ring-brand-coral/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value || "Select Time"}</span>
        <Clock className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-2">
          <div className="flex gap-2 h-56">
            <div className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth snap-y border-r border-slate-100 pr-1">
              <div className="text-[10px] font-bold text-slate-400 text-center mb-2 sticky top-0 bg-white py-1">HR</div>
              {Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i).toString().padStart(2, '0')).map(hour => (
                <div 
                  key={hour}
                  onClick={() => handleUpdate(hour, m, ampm)}
                  className={`py-2 text-center text-base font-bold rounded-lg cursor-pointer snap-center mb-1 transition-colors ${h === hour ? 'bg-brand-coral text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {hour}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar scroll-smooth snap-y border-r border-slate-100 pr-1">
              <div className="text-[10px] font-bold text-slate-400 text-center mb-2 sticky top-0 bg-white py-1">MIN</div>
              {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(minute => (
                <div 
                  key={minute}
                  onClick={() => handleUpdate(h, minute, ampm)}
                  className={`py-2 text-center text-base font-bold rounded-lg cursor-pointer snap-center mb-1 transition-colors ${m === minute ? 'bg-brand-coral text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {minute}
                </div>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto hide-scrollbar">
              <div className="text-[10px] font-bold text-slate-400 text-center mb-2 sticky top-0 bg-white py-1">AM/PM</div>
              {["AM", "PM"].map(period => (
                <div 
                  key={period}
                  onClick={() => handleUpdate(h, m, period)}
                  className={`py-2 text-center text-base font-bold rounded-lg cursor-pointer mb-1 transition-colors ${ampm === period ? 'bg-brand-coral text-white' : 'hover:bg-slate-100 text-slate-700'}`}
                >
                  {period}
                </div>
              ))}
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); if (onConfirm) onConfirm(); }} 
            className="w-full bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-lg"
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}

const AMENITIES = [
  { id: "wifi", name: "Free WiFi", icon: Wifi },
  { id: "pool", name: "Swimming Pool", icon: Wind },
  { id: "gym", name: "Fitness Center", icon: Dumbbell },
  { id: "parking", name: "Free Parking", icon: Car },
  { id: "restaurant", name: "Restaurant", icon: Coffee },
  { id: "tv", name: "Smart TV", icon: Tv },
  { id: "ac", name: "Air Conditioning", icon: Snowflake },
  { id: "room_service", name: "Room Service", icon: UtensilsCrossed },
  { id: "pets", name: "Pet Friendly", icon: PawPrint },
  { id: "bar", name: "Bar / Lounge", icon: Wine },
  { id: "front_desk", name: "24/7 Front Desk", icon: Clock },
  { id: "spa", name: "Spa & Wellness", icon: Zap },
  { id: "shuttle", name: "Airport Shuttle", icon: Plane },
  { id: "laundry", name: "Laundry Service", icon: Shirt },
  { id: "balcony", name: "Balcony / Terrace", icon: Sun },
  { id: "ev", name: "EV Charging", icon: Zap },
  { id: "conference", name: "Conference Room", icon: Users },
  { id: "accessible", name: "Wheelchair Accessible", icon: Accessibility },
];

export function Step7Amenities({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { profile } = useAuthStore();
  const [selected, setSelected] = useState<string[]>(["wifi", "parking"]);
  const [checkIn, setCheckIn] = useState("02:00 PM");
  const [checkOut, setCheckOut] = useState("11:00 AM");
  const [isLoading, setIsLoading] = useState(false);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (profile?.currentPropertyId) {
        try {
          const prop = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.propertyCollectionId,
            profile.currentPropertyId
          );
          if (prop.amenities && prop.amenities.length > 0) setSelected(prop.amenities);
          if (prop.checkInTime) setCheckIn(prop.checkInTime);
          if (prop.checkOutTime) setCheckOut(prop.checkOutTime);
        } catch { }
      }
    };
    fetchProperty();
  }, [profile]);

  const handleNextClick = async () => {
    if (!profile?.currentPropertyId) {
      onNext();
      return;
    }
    setIsLoading(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.propertyCollectionId,
        profile.currentPropertyId,
        {
          amenities: selected,
          checkInTime: checkIn,
          checkOutTime: checkOut
        }
      );
      onNext();
    } catch (e) {
      console.error(e);
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    onBack();
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
    else setSelected([...selected, id]);
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-brand-navy mb-3 font-['Poppins',sans-serif]">What amenities do you offer?</h1>
        <p className="text-slate-500 font-medium">Select the amenities available at your property and define your house rules.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-8">
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Popular Amenities</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {AMENITIES.map((amenity) => {
              const isSelected = selected.includes(amenity.id);
              return (
                <button
                  key={amenity.id}
                  onClick={() => toggle(amenity.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 gap-2",
                    isSelected 
                      ? "border-brand-coral bg-brand-coral/5 shadow-sm" 
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <amenity.icon className={cn("w-6 h-6", isSelected ? "text-brand-coral" : "text-slate-400")} />
                  <span className={cn("text-xs font-bold text-center", isSelected ? "text-brand-navy" : "text-slate-500")}>
                    {amenity.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-100 pt-8">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Basic Policies</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <CustomTimePicker 
              label="Check-in Time"
              value={checkIn}
              onChange={setCheckIn}
              isOpen={checkInOpen}
              setIsOpen={setCheckInOpen}
              onConfirm={() => setCheckOutOpen(true)}
            />
            <CustomTimePicker 
              label="Check-out Time"
              value={checkOut}
              onChange={setCheckOut}
              isOpen={checkOutOpen}
              setIsOpen={setCheckOutOpen}
            />
          </div>
        </div>

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBackClick} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button disabled={isLoading} onClick={handleNextClick} className="bg-brand-navy hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-brand-navy/20 transition-all">
          {isLoading ? "Saving..." : <>Bank Details <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </motion.div>
    </motion.div>
  );
}
