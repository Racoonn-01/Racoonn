"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, X, Loader2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { Query, ID } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AVAILABLE_AMENITIES = [
  "Free WiFi", "Air Conditioning", "Mini Bar", "Flat-screen TV", 
  "Room Service", "Balcony", "Ocean View", "Private Pool", 
  "Coffee Machine", "Safe", "Bathtub", "Desk"
];

interface RoomFormProps {
  roomId?: string;
}

export function RoomForm({ roomId }: RoomFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultFormData = {
    propertyId: "",
    name: "",
    type: "Standard",
    beds: "",
    occupancy: "",
    size: "",
    price: "",
    discountPrice: "",
    mealPlan: "Room Only",
    cancellation: "Non-refundable",
    description: "",
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const propsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          [Query.equal("vendorId", user.$id)]
        );
        setProperties(propsRes.documents);
        
        if (roomId) {
          // Fetch existing room
          const roomRes = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.roomCollectionId,
            roomId
          );
          setFormData({
            propertyId: roomRes.propertyId || "",
            name: roomRes.name || "",
            type: roomRes.type || "Standard",
            beds: roomRes.beds || "",
            occupancy: roomRes.occupancy?.toString() || "",
            size: roomRes.size?.toString() || "",
            price: roomRes.price?.toString() || "",
            discountPrice: "", 
            mealPlan: "Room Only", 
            cancellation: "Non-refundable", 
            description: roomRes.description || "",
          });
          setSelectedImages(roomRes.photos || []);
          setSelectedAmenities(roomRes.amenities || []);
        } else if (propsRes.documents.length > 0) {
          setFormData(prev => ({ ...prev, propertyId: propsRes.documents[0].$id }));
        }
      } catch (err: any) {
        toast.error("Failed to fetch data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, roomId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newImageUrls]);
      setSelectedImageFiles(prev => [...prev, ...files]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      const newImageUrls = files.map(file => URL.createObjectURL(file));
      setSelectedImages(prev => [...prev, ...newImageUrls]);
      setSelectedImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formData.name || !formData.price || !formData.propertyId) {
      toast.error("Please fill in all required fields (Name, Price, Property).");
      return;
    }

    setIsSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of selectedImageFiles) {
        const uploadedFile = await storage.createFile(appwriteConfig.roomImagesBucketId, ID.unique(), file);
        uploadedUrls.push(uploadedFile.$id);
      }

      const existingPhotos = selectedImages.filter(img => !img.startsWith('blob:'));
      const finalPhotos = [...existingPhotos, ...uploadedUrls];

      const roomData = {
        vendorId: user.$id,
        propertyId: formData.propertyId,
        name: formData.name,
        occupancy: parseInt(formData.occupancy) || 2,
        size: parseInt(formData.size) || 0,
        price: parseFloat(formData.price) || 0,
        photos: finalPhotos,
      };

      if (roomId) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          roomId,
          roomData
        );
        toast.success("Room updated successfully!");
      } else {
        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          ID.unique(),
          roomData
        );
        toast.success("Room created successfully!");
      }

      router.push("/vendor/rooms");
    } catch (err: any) {
      toast.error("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getImgSrc = (photo: string) => {
    if (!photo) return "";
    return photo.startsWith("http") || photo.startsWith("blob:") 
      ? photo 
      : storage.getFileView(appwriteConfig.roomImagesBucketId, photo).toString();
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/vendor/rooms">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-500">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-heading font-black text-secondary tracking-tight">
            {roomId ? "Edit Room" : "Add New Room"}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Enter the room details and upload a high-quality cover photo.
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100 p-6 sm:p-10 space-y-8">
        {/* Property Selection */}
        <div className="space-y-1.5 max-w-lg">
          <Label htmlFor="property" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Assign to Property *</Label>
          <select 
            id="property" 
            value={formData.propertyId}
            onChange={(e) => setFormData({...formData, propertyId: e.target.value})}
            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
          >
            <option value="" disabled>Select a property</option>
            {properties.map(p => (
              <option key={p.$id} value={p.$id}>{p.propertyName || p.title || "Unnamed Property"}</option>
            ))}
          </select>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 max-w-2xl">
          <div className="space-y-1.5">
            <Label htmlFor="room-name" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Room Name *</Label>
            <Input 
              id="room-name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Luxury Suite with Lake View" 
              className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="room-type" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Room Type</Label>
              <select 
                id="room-type" 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Villa">Villa</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bed-type" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Bed Configuration</Label>
              <Input 
                id="bed-type" 
                value={formData.beds}
                onChange={(e) => setFormData({...formData, beds: e.target.value})}
                placeholder="e.g. 1 extra-large double bed" 
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="capacity" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Capacity (Guests)</Label>
              <Input 
                id="capacity" 
                type="number" 
                value={formData.occupancy}
                onChange={(e) => setFormData({...formData, occupancy: e.target.value})}
                placeholder="e.g. 2" min={1} 
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Size (sqft)</Label>
              <Input 
                id="size" 
                type="number" 
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                placeholder="e.g. 300" min={1} 
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Price per Night (₹) *</Label>
              <Input 
                id="price" 
                type="number" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                placeholder="e.g. 32000" min={0} 
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="original-price" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Original Price (₹)</Label>
              <Input 
                id="original-price" 
                type="number" 
                value={formData.discountPrice}
                onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                placeholder="e.g. 40000" min={0} 
                className="h-12 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20" 
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="meal-plan" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Meal Plan</Label>
              <select 
                id="meal-plan" 
                value={formData.mealPlan}
                onChange={(e) => setFormData({...formData, mealPlan: e.target.value})}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
              >
                <option value="Room Only">Room Only</option>
                <option value="Breakfast included">Breakfast included</option>
                <option value="Breakfast & Dinner">Breakfast & Dinner</option>
                <option value="All Inclusive">All Inclusive</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cancellation" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Cancellation Policy</Label>
              <select 
                id="cancellation" 
                value={formData.cancellation}
                onChange={(e) => setFormData({...formData, cancellation: e.target.value})}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none"
              >
                <option value="Non-refundable">Non-refundable</option>
                <option value="Free cancellation">Free cancellation</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <Label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Room Amenities</Label>
              <span className="text-xs text-slate-500 font-medium">{selectedAmenities.length} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <div 
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all border ${
                      isSelected 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {amenity}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Description</Label>
            <textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="flex min-h-30 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-y"
              placeholder="Brief description of the room and its features..."
            ></textarea>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <Label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Room Photos</Label>
            <span className="text-xs text-slate-500 font-medium">{selectedImages.length} uploaded</span>
          </div>
          <div className="min-h-64">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative w-full aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner group">
                  <Image 
                    src={getImgSrc(img)} 
                    alt={`Room Preview ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    fill
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removeImage(idx)}
                      className="rounded-full w-8 h-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {idx === 0 && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                      Cover
                    </div>
                  )}
                </div>
              ))}
              <div 
                className="relative w-full aspect-4/3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center text-center hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors mb-2" />
                <span className="text-xs font-semibold text-slate-500 group-hover:text-primary transition-colors">Add Photos</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
          </div>
        </div>
        
        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <Button 
            className="bg-primary hover:bg-primary/90 text-white h-12 px-10 rounded-xl font-bold" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
            {isSaving ? "Saving..." : "Save Room"}
          </Button>
          <Link href="/vendor/rooms">
            <Button variant="outline" className="h-12 px-8 rounded-xl font-bold border-slate-200 text-slate-600">
              Cancel
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
