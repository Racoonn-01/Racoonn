"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Edit2, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { storage } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";

export interface PopularDestination {
  id: string | number;
  city: string;
  description: string;
  price: string;
  image: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

const STORAGE_KEY = "racoonn_cms_popular_destinations_v1";

export default function PopularDestinationsPage() {
  const [destinations, setDestinations] = useState<PopularDestination[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<PopularDestination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  // Form state
  const [city, setCity] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Load destinations from DB / API
  useEffect(() => {
    async function loadDestinations() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/cms/popular-destinations?t=${Date.now()}`, { cache: 'no-store' });
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

  const openAddDialog = () => {
    setEditingDestination(null);
    setCity("");
    setDesc("");
    setPrice("");
    setImage("");
    setMetaTitle("");
    setMetaDescription("");
    setMetaKeywords("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (dest: PopularDestination) => {
    setEditingDestination(dest);
    setCity(dest.city);
    setDesc(dest.description);
    setPrice(dest.price);
    setImage(dest.image);
    setMetaTitle(dest.metaTitle || "");
    setMetaDescription(dest.metaDescription || "");
    setMetaKeywords(dest.metaKeywords || "");
    setIsDialogOpen(true);
  };

  // Save destinations to DB & Broadcast
  const saveDestinations = async (newDestinations: PopularDestination[]) => {
    const previousDestinations = destinations;
    setDestinations(newDestinations);
    try {
      const res = await fetch("/api/cms/popular-destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinations: newDestinations }),
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save to database");
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newDestinations));
      window.dispatchEvent(new Event("cms_popular_destinations_updated"));

      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("racoonn_cms_channel");
        bc.postMessage({ type: "POPULAR_DESTINATIONS_UPDATED", data: newDestinations });
        bc.close();
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to save CMS destinations:", error);
      alert("Failed to save destinations: " + (error.message || "Unknown error"));
      setDestinations(previousDestinations); // Rollback
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    setIsUploading(true);
    try {
      const BUCKET_ID = "6a3e398000280b2b3d20";
      const PROJECT_ID = "6a3bce6900381359c3ce";
      const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
      const url = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/preview?project=${PROJECT_ID}&output=webp`;
      setImage(url);
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !desc.trim() || !price.trim() || !image.trim()) return;

    if (editingDestination) {
      const updated = destinations.map((d) =>
        d.id === editingDestination.id
          ? {
              ...d,
              city: city.trim(),
              description: desc.trim(),
              price: price.trim(),
              image: getValidImageSrc(image),
              metaTitle: metaTitle.trim(),
              metaDescription: metaDescription.trim(),
              metaKeywords: metaKeywords.trim(),
            }
          : d
      );
      saveDestinations(updated);
    } else {
      const newDest: PopularDestination = {
        id: `dest-${Date.now()}`,
        city: city.trim(),
        description: desc.trim(),
        price: price.trim(),
        image: getValidImageSrc(image),
        metaTitle: metaTitle.trim(),
        metaDescription: metaDescription.trim(),
        metaKeywords: metaKeywords.trim(),
      };
      saveDestinations([newDest, ...destinations]);
    }

    setIsDialogOpen(false);
  };

  const handleRemove = (id: string | number) => {
    setDeleteConfirmId(id);
  };

  const confirmRemove = () => {
    if (deleteConfirmId !== null) {
      const updated = destinations.filter((d) => d.id !== deleteConfirmId);
      saveDestinations(updated);
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Popular Destinations</h2>
          <p className="text-muted-foreground mt-1">Manage popular destinations and configure custom SEO tags (Meta Title, Description, Keywords) for each.</p>
        </div>

        <Button className="gap-2 rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white font-semibold" onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Destination
        </Button>
      </div>

      {/* Add / Edit Destination Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl p-6 sm:p-8 border-0 shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSaveDestination} className="space-y-6">
            <div>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {editingDestination ? "Edit Destination" : "Add Destination"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-1">
                  Enter destination information and optional SEO meta tags.
                </DialogDescription>
              </DialogHeader>
            </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-xs font-semibold uppercase text-gray-500">Destination Name / City *</Label>
                  <Input 
                    id="city" 
                    placeholder="e.g. Nainital or Kedarnath" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    required 
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desc" className="text-xs font-semibold uppercase text-gray-500">Short Description / Subtitle *</Label>
                  <Input 
                    id="desc" 
                    placeholder="e.g. City of lakes surrounded by lush green hills." 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    required 
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-xs font-semibold uppercase text-gray-500">Starting Price (₹) *</Label>
                  <Input 
                    id="price" 
                    placeholder="e.g. 3,999" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    className="rounded-xl border-gray-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-xs font-semibold uppercase text-gray-500">Destination Cover Image *</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      required={!image}
                      className="rounded-xl border-gray-200 file:bg-rose-50 file:text-rose-600 file:border-0 file:mr-4 file:py-1 file:px-3 file:rounded-full file:text-xs file:font-semibold hover:file:bg-rose-100 transition-all cursor-pointer h-10"
                    />
                    {isUploading && <Loader2 className="w-5 h-5 animate-spin text-rose-600 shrink-0" />}
                  </div>
                  {image && !isUploading && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">Image selected successfully!</p>
                  )}
                </div>
              </div>

              {/* SEO Custom Fields Section */}
              <div className="pt-2 border-t border-gray-100 space-y-4">
                <div className="text-xs font-semibold text-gray-700">
                  SEO & Meta Tags <span className="text-gray-400 font-normal">(Optional)</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="metaTitle" className="text-xs font-medium text-gray-600">Meta Title</Label>
                    <Input 
                      id="metaTitle" 
                      placeholder={`e.g. Hotels & Resorts in ${city || 'Nainital'}`}
                      value={metaTitle} 
                      onChange={(e) => setMetaTitle(e.target.value)} 
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="metaDescription" className="text-xs font-medium text-gray-600">Meta Description</Label>
                    <Input 
                      id="metaDescription" 
                      placeholder={`e.g. Discover hotels and packages in ${city || 'Nainital'}`}
                      value={metaDescription} 
                      onChange={(e) => setMetaDescription(e.target.value)} 
                      className="rounded-xl border-gray-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="metaKeywords" className="text-xs font-medium text-gray-600">Meta Keywords</Label>
                    <Input 
                      id="metaKeywords" 
                      placeholder="e.g. hotels, resorts, travel packages"
                      value={metaKeywords} 
                      onChange={(e) => setMetaKeywords(e.target.value)} 
                      className="rounded-xl border-gray-200"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold px-6">
                  {editingDestination ? "Update Destination" : "Save Destination"}
                </Button>
              </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Destinations List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {destinations.map((dest) => (
          <div key={dest.id} className="relative h-95 rounded-3xl overflow-hidden group shadow-lg transition-transform duration-300 hover:-translate-y-1">
            <Image 
              src={getValidImageSrc(dest.image)} 
              alt={dest.city} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/30" />

            {/* Action Buttons Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button 
                onClick={() => openEditDialog(dest)}
                className="p-2 rounded-full bg-black/40 hover:bg-slate-800 text-white backdrop-blur-md transition-colors opacity-90 group-hover:opacity-100"
                title="Edit Destination & SEO"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleRemove(dest.id)}
                className="p-2 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md transition-colors opacity-90 group-hover:opacity-100"
                title="Remove Destination"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* City Badge & SEO Status */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-gray-900">{dest.city}</span>
              </div>
              {Boolean(dest.metaTitle || dest.metaDescription) && (
                <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/20">
                  Custom SEO
                </span>
              )}
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
            Click &quot;Add Destination&quot; above to upload custom destinations and configure their SEO for your website.
          </p>
          <Button onClick={openAddDialog} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow">
            Add Destination
          </Button>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmRemove}
        title="Remove Destination"
        description="Are you sure you want to remove this popular destination? This action cannot be undone."
      />
    </div>
  );
}
