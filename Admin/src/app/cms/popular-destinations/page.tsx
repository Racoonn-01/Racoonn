"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PopularDestination {
  id: string | number;
  city: string;
  description: string;
  price: string;
  image: string;
}

const STORAGE_KEY = "racoonn_cms_popular_destinations_v1";

export default function PopularDestinationsPage() {
  const [destinations, setDestinations] = useState<PopularDestination[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [newCity, setNewCity] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newImage, setNewImage] = useState("");

  // Load destinations from DB / API
  useEffect(() => {
    async function loadDestinations() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/cms/popular-destinations");
        const json = await res.json();
        if (json.success && Array.isArray(json.destinations)) {
          setDestinations(json.destinations);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(json.destinations));
        }
      } catch (err) {
        console.error("Failed to load CMS destinations:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDestinations();
  }, []);

  // Save destinations to DB & Broadcast
  const saveDestinations = async (newDestinations: PopularDestination[]) => {
    setDestinations(newDestinations);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDestinations));
      window.dispatchEvent(new Event("cms_popular_destinations_updated"));

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("racoonn_cms_channel");
        bc.postMessage({ type: "POPULAR_DESTINATIONS_UPDATED", data: newDestinations });
        bc.close();
      }

      await fetch("/api/cms/popular-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinations: newDestinations }),
      });
    } catch (err) {
      console.error("Failed to save CMS destinations:", err);
    }
  };

  const getValidImageSrc = (urlStr: string) => {
    if (!urlStr || typeof urlStr !== "string") {
      return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80";
    }
    const trimmed = urlStr.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
      return trimmed;
    }
    return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80";
  };

  const handleAddDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim() || !newDesc.trim() || !newPrice.trim() || !newImage.trim()) return;

    const newDest: PopularDestination = {
      id: `dest-${Date.now()}`,
      city: newCity.trim(),
      description: newDesc.trim(),
      price: newPrice.trim(),
      image: getValidImageSrc(newImage),
    };

    const updated = [newDest, ...destinations];
    saveDestinations(updated);

    setNewCity("");
    setNewDesc("");
    setNewPrice("");
    setNewImage("");
    setIsAddDialogOpen(false);
  };

  const handleRemove = (id: string | number) => {
    const updated = destinations.filter((d) => d.id !== id);
    saveDestinations(updated);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Popular Destinations</h2>
          <p className="text-muted-foreground mt-1">Manage the popular destinations displayed on the frontend.</p>
        </div>

        <Button className="gap-2 rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white font-semibold" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Add Destination Modal */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
          <form onSubmit={handleAddDestination}>
            <div className="flex flex-col md:flex-row">
              {/* Left Column: Text Inputs */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center bg-white">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-[#1F2E4A]">Add Destination</DialogTitle>
                  <DialogDescription>
                    Fill in the details to add a new popular destination to the frontend.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-xs font-semibold uppercase text-gray-500">Destination Name / City *</Label>
                    <Input 
                      id="city" 
                      placeholder="e.g. Kedarnath or Nainital" 
                      value={newCity} 
                      onChange={(e) => setNewCity(e.target.value)} 
                      required 
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc" className="text-xs font-semibold uppercase text-gray-500">Description *</Label>
                    <Input 
                      id="desc" 
                      placeholder="e.g. A sacred journey to the Himalayas." 
                      value={newDesc} 
                      onChange={(e) => setNewDesc(e.target.value)} 
                      required 
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-semibold uppercase text-gray-500">Starting Price (₹) *</Label>
                    <Input 
                      id="price" 
                      placeholder="e.g. 3,999" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      required 
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-xs font-semibold uppercase text-gray-500">Image URL *</Label>
                    <Input 
                      id="image" 
                      placeholder="https://images.unsplash.com/..." 
                      value={newImage} 
                      onChange={(e) => setNewImage(e.target.value)} 
                      required 
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-8 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold px-6">
                    Add Destination
                  </Button>
                </DialogFooter>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="w-full md:w-80 bg-slate-900 p-6 md:p-8 flex flex-col justify-center items-center text-white border-t md:border-t-0 md:border-l border-slate-800">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Live Preview</p>
                <div className="relative w-full h-[320px] rounded-3xl overflow-hidden shadow-xl border border-slate-700/50 group">
                  <Image 
                    src={getValidImageSrc(newImage)} 
                    alt="Preview" 
                    fill 
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                  
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900">{newCity || "Destination"}</span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 space-y-3">
                    <p className="text-white text-base font-semibold leading-tight line-clamp-2">
                      {newDesc || "Destination description will appear here..."}
                    </p>
                    <div className="inline-block bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-slate-900 text-xs font-bold shadow">
                      Stays from ₹{newPrice || "3,999"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Destinations List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="relative h-[380px] rounded-3xl overflow-hidden group shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <Image 
              src={getValidImageSrc(dest.image)} 
              alt={dest.city} 
              fill 
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

            {/* Remove Button Overlay */}
            <button 
              onClick={() => handleRemove(dest.id)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md transition-colors opacity-90 group-hover:opacity-100 z-10"
              title="Remove Destination"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            {/* City Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-gray-900">{dest.city}</span>
            </div>

            {/* Content */}
            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <h3 className="text-white text-lg font-bold leading-tight line-clamp-2">
                {dest.description}
              </h3>
              <div className="inline-block bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-gray-900 text-xs font-bold shadow">
                Stays from ₹{dest.price}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && destinations.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-700">No Popular Destinations Uploaded</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Click "Add Destination" above to upload custom destinations for your website frontend.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow">
            Add Destination
          </Button>
        </div>
      )}
    </div>
  );
}
