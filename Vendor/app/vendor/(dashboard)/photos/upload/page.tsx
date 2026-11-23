"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, X, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const CATEGORIES = [
  "Exterior",
  "Interior",
  "Bedroom",
  "Bathroom",
  "Living Room",
  "Dining",
  "View",
  "Amenities",
];

export default function PhotosUploadPage() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
  const [uploads, setUploads] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setUploads(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...newImages]
      }));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setUploads(prev => ({
        ...prev,
        [activeTab]: [...(prev[activeTab] || []), ...newImages]
      }));
    }
  };

  const removeImage = (category: string, indexToRemove: number) => {
    setUploads(prev => ({
      ...prev,
      [category]: prev[category].filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 relative">
      <div className="flex items-center gap-4">
        <Link href="/vendor/photos">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-heading font-bold text-secondary">Upload Photos</h2>
          <p className="text-slate-500 mt-1">Select a category and drop your high-quality images.</p>
        </div>
      </div>

      <Tabs defaultValue={CATEGORIES[0]} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start bg-slate-100 p-1.5 rounded-2xl gap-1">
          {CATEGORIES.map((category) => {
            const uploadCount = uploads[category]?.length || 0;
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                className="rounded-xl px-4 py-2.5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
              >
                {category}
                {uploadCount > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {uploadCount}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category} value={category} className="mt-6 focus-visible:outline-none focus-visible:ring-0">
            <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-8">
                
                {/* Upload Zone */}
                <div 
                  className="w-full border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center py-16 px-8 text-center hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group mb-8"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">Upload {category} Photos</h3>
                  <p className="text-sm text-slate-500 max-w-75">Click or drag & drop files here. Supports JPG, PNG and WebP up to 5MB.</p>
                </div>

                {/* Uploaded Images Grid */}
                {uploads[category] && uploads[category].length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h4 className="font-semibold text-secondary">Uploaded to {category}</h4>
                      <span className="text-sm text-slate-500">{uploads[category].length} items</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <AnimatePresence>
                        {uploads[category].map((img, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={`${img}-${idx}`} 
                            className="relative aspect-4/3 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center group shadow-sm"
                          >
                            <Image 
                              src={img} 
                              alt={`${category} ${idx + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                              fill
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                              <Button 
                                variant="destructive" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(category, idx);
                                }}
                                className="rounded-full w-10 h-10 shadow-md"
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Ready</span>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />
      </Tabs>

      {/* Floating Action Bar */}
      {Object.values(uploads).some(arr => arr.length > 0) && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 lg:ml-32 -translate-x-1/2 z-50 flex items-center justify-between gap-6 bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] w-[90%] max-w-2xl"
        >
          <div>
            <p className="font-bold text-secondary">
              {Object.values(uploads).reduce((acc, curr) => acc + curr.length, 0)} Photos Ready
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">Review your galleries before saving.</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/vendor/photos">
              <Button variant="outline" className="rounded-xl h-11 hidden sm:flex">Cancel</Button>
            </Link>
            <Link href="/vendor/photos">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 sm:px-8 font-bold">
                Save All
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
