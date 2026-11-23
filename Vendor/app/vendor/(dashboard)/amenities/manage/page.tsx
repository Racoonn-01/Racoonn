"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const CATEGORIES = {
  "Property Features": [
    "Free Parking", "Valet Parking", "EV Charging Station", "Swimming Pool", 
    "Fitness Center", "Spa & Wellness Center", "Restaurant", "Bar/Lounge", 
    "Business Center", "Conference Rooms", "24-hour Front Desk", "Concierge Service",
    "Luggage Storage", "Laundry Service", "Dry Cleaning", "Gift Shop", "Garden", "Terrace"
  ],
  "Room Amenities": [
    "Air Conditioning", "Heating", "Free WiFi", "Flat-screen TV", "Satellite Channels", 
    "Mini Bar", "Refrigerator", "Coffee Maker", "Tea Maker", "Microwave", 
    "Desk", "Safe", "Ironing Facilities", "Balcony", "Soundproofing"
  ],
  "Bathroom": [
    "Private Bathroom", "Shower", "Bathtub", "Hairdryer", "Free Toiletries", 
    "Towels", "Bathrobe", "Slippers", "Bidet", "Additional Bathroom"
  ],
  "Safety & Security": [
    "Fire Extinguishers", "CCTV outside property", "CCTV in common areas", 
    "Smoke Alarms", "Security Alarm", "24-hour Security", "Key Card Access", "Safe"
  ],
  "Accessibility": [
    "Wheelchair Accessible", "Elevator", "Lowered Sink", "Raised Toilet", 
    "Toilet with Grab Rails", "Roll-in Shower", "Auditory Guidance", "Visual Aids"
  ],
  "Dining": [
    "Breakfast Included", "Room Service", "Special Diet Menus", "Kid-friendly Buffet", 
    "Vending Machine (drinks)", "Vending Machine (snacks)", "BBQ Facilities"
  ]
};

export default function AmenitiesManagePage() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const getSelectedCountForCategory = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES].filter(a => selectedAmenities.includes(a)).length;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 relative">
      <div className="flex items-center gap-4">
        <Link href="/vendor/amenities">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Manage Amenities</h2>
          <p className="text-slate-500 mt-1">Select all the features and services available at your property.</p>
        </div>
      </div>

      <Tabs defaultValue={Object.keys(CATEGORIES)[0]} className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start bg-slate-100 p-1.5 rounded-2xl gap-1">
          {Object.keys(CATEGORIES).map((category) => {
            const count = getSelectedCountForCategory(category);
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                {category}
                {count > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(CATEGORIES).map(([category, amenities]) => (
          <TabsContent key={category} value={category} className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-secondary">{category}</h3>
                  <p className="text-sm text-slate-500">Select the specific amenities that apply.</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <div 
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all border flex items-center gap-2 ${
                          isSelected 
                            ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Floating Action Bar */}
      {selectedAmenities.length > 0 && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 lg:ml-32 -translate-x-1/2 z-50 flex items-center justify-between gap-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[90%] max-w-2xl"
        >
          <div>
            <p className="font-bold text-secondary">
              {selectedAmenities.length} Amenities Selected
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">Save these settings to your property profile.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="outline" className="rounded-xl h-11 hidden sm:flex" onClick={() => setSelectedAmenities([])}>Clear All</Button>
            <Link href="/vendor/amenities">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 sm:px-8 font-bold">
                Save Amenities
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
