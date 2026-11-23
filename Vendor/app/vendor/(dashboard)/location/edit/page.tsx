"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Building, Globe2, Navigation, Crosshair } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LocationEditPage() {
  const [street, setStreet] = useState("dewalchaurh kham");
  const [city, setCity] = useState("Haldwani");
  const [state, setState] = useState("Uttarakhand");
  const [country, setCountry] = useState("India");
  const [zip, setZip] = useState("263139");

  const isDirty = street !== "" || city !== "" || state !== "" || country !== "" || zip !== "";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 relative">
      <div className="flex items-center gap-4">
        <Link href="/vendor/location">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Set Location</h2>
          <p className="text-slate-500 mt-1">Provide your exact address and pin your property on the map.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 mt-8">
        
        {/* Address Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-3xl bg-white overflow-hidden h-full">
            <CardContent className="p-8 space-y-6">
              
              <div>
                <h3 className="text-xl font-bold text-secondary mb-1">Property Address</h3>
                <p className="text-sm text-slate-500 mb-6">Enter your official street address.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Label htmlFor="street" className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Street Address</Label>
                </div>
                <Input 
                  id="street" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 123 Ocean Drive" 
                  className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-primary" />
                    <Label htmlFor="city" className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">City</Label>
                  </div>
                  <Input 
                    id="city" 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Miami" 
                    className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <Label htmlFor="state" className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">State / Province</Label>
                  </div>
                  <Input 
                    id="state" 
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Florida" 
                    className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="w-4 h-4 text-primary" />
                    <Label htmlFor="country" className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Country</Label>
                  </div>
                  <Input 
                    id="country" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. United States" 
                    className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base" 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <Label htmlFor="zip" className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Postal Code</Label>
                  </div>
                  <Input 
                    id="zip" 
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="e.g. 33139" 
                    className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-base" 
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Interactive Map Area */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-3xl bg-white overflow-hidden h-full min-h-125 flex flex-col relative">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0 z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-secondary">Interactive Map</h3>
                <p className="text-xs text-slate-500">Drag the pin to set your exact GPS coordinates.</p>
              </div>
              <Button variant="outline" className="bg-white gap-2 text-primary hover:text-primary hover:bg-primary/5 rounded-xl border-primary/20 h-11">
                <Crosshair className="w-4 h-4" />
                Find My Location
              </Button>
            </div>
            
            {/* Map Placeholder -> Real Map */}
            <div className="flex-1 relative overflow-hidden mt-25 sm:mt-22">
              
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d111099.64654942948!2d79.4447477!3d29.2193514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39a09abd922c22dd%3A0xc6a8ce904b77f975!2sHaldwani%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1716405391629!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale contrast-125 opacity-80 mix-blend-multiply"
              ></iframe>
              
              <div className="absolute inset-0 flex items-center justify-center pb-12 pointer-events-none">
                <motion.div 
                  initial={{ y: -20 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-20 flex flex-col items-center drop-shadow-xl"
                >
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white mb-1 shadow-lg shadow-primary/30">
                    <MapPin className="w-7 h-7 fill-primary/20" />
                  </div>
                  <div className="w-5 h-5 bg-primary/20 rounded-full animate-ping absolute -bottom-2"></div>
                  <div className="w-2.5 h-2.5 bg-primary rounded-full absolute -bottom-1"></div>
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-slate-200 shadow-lg pointer-events-none">
                <p className="text-sm font-semibold text-secondary flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  Coordinates selected
                </p>
                <p className="text-xs text-slate-500 mt-1 font-mono tracking-widest">29.2183° N, 79.5130° E</p>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Floating Action Bar */}
      {isDirty && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 lg:ml-32 -translate-x-1/2 z-50 flex items-center justify-between gap-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[90%] max-w-2xl"
        >
          <div>
            <p className="font-bold text-secondary">
              Unsaved Location
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">You have modified your property's address or coordinates.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/vendor/location">
              <Button variant="outline" className="rounded-xl h-11 hidden sm:flex">Discard</Button>
            </Link>
            <Link href="/vendor/location">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 sm:px-8 font-bold">
                Save Location
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
