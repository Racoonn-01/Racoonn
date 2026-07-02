"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChevronLeft, ChevronRight,
  Wifi, Car, Coffee, Tv, Wind, Check, UploadCloud, 
  Plus, Trash2, Loader2, Dumbbell, Utensils, GlassWater, Dog, Plane, Waves
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { ID, Query } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Basic Details" },
  { id: 2, title: "Amenities" },
  { id: 3, title: "Media & Photos" },
  { id: 4, title: "Rooms & Pricing" },
];

const AMENITIES_LIST = [
  { id: "wifi", name: "Fast Wifi", icon: Wifi },
  { id: "pool", name: "Private Pool", icon: Waves },
  { id: "ac", name: "Air Conditioning", icon: Wind },
  { id: "parking", name: "Free Parking", icon: Car },
  { id: "coffee", name: "Espresso Machine", icon: Coffee },
  { id: "tv", name: "75\" HDTV", icon: Tv },
  { id: "gym", name: "Fitness Center", icon: Dumbbell },
  { id: "restaurant", name: "Restaurant", icon: Utensils },
  { id: "bar", name: "Lounge & Bar", icon: GlassWater },
  { id: "pets", name: "Pet Friendly", icon: Dog },
  { id: "shuttle", name: "Airport Shuttle", icon: Plane },
];

interface PropertyWizardProps {
  propertyId?: string;
}

export function PropertyWizard({ propertyId }: PropertyWizardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  const [loading, setLoading] = useState(!!propertyId);
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [internalPropId, setInternalPropId] = useState<string | null>(propertyId || null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Hotel",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    amenities: [] as string[],
    photos: [] as string[],
    rooms: [] as any[]
  });

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      try {
        const prop = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          propertyId
        );
        
        const address = prop.location || "";
        
        const roomsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.equal("propertyId", propertyId)]
        );
        
        setFormData({
          name: prop.propertyName || prop.title || "",
          type: prop.propertyType || "Hotel",
          description: prop.description || "",
          address: address,
          city: prop.city || "",
          state: prop.state || "",
          country: "",
          zip: "",
          amenities: prop.amenities || [],
          photos: prop.photos || [],
          rooms: roomsRes.documents.map(r => ({
            id: r.$id,
            isExisting: true,
            name: r.name || "",
            beds: r.type || "", 
            price: r.price?.toString() || "",
            occupancy: r.occupancy?.toString() || "2",
            size: r.size?.toString() || "",
            photos: r.photos || [],
            photoFiles: [],
            discountPrice: "",
            mealPlan: "Room only",
            cancellation: "Free cancellation"
          }))
        });
      } catch (err: any) {
        toast.error("Failed to load property: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [propertyId]);

  const saveStep1 = async () => {
    if (!user) return false;
    setSaving(true);
    try {
      const data = {
        vendorId: user.$id,
        propertyName: formData.name,
        title: formData.name,
        propertyType: formData.type,
        description: formData.description,
        city: formData.city,
        state: formData.state,
        location: formData.address,
        status: "Draft",
        price: 0
      };

      if (internalPropId) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          internalPropId,
          data
        );
      } else {
        const res = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          ID.unique(),
          data
        );
        setInternalPropId(res.$id);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveStep2 = async () => {
    if (!internalPropId) return false;
    setSaving(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.propertyCollectionId,
        internalPropId,
        { amenities: formData.amenities }
      );
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const success = await saveStep1();
      if (!success) return;
    } else if (currentStep === 2) {
      const success = await saveStep2();
      if (!success) return;
    }
    
    if (currentStep < 4) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleAmenityToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(id)
        ? prev.amenities.filter(a => a !== id)
        : [...prev.amenities, id]
    }));
  };

  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [...prev.rooms, { id: Date.now(), isExisting: false, name: "", beds: "", price: "", occupancy: "2", size: "", photos: [], photoFiles: [], discountPrice: "", mealPlan: "Room only", cancellation: "Non-refundable" }]
    }));
  };

  const removeRoom = async (room: any) => {
    if (room.isExisting) {
      if (!confirm("Are you sure you want to delete this room?")) return;
      try {
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.roomCollectionId, room.id);
        toast.success("Room deleted");
      } catch (err: any) {
        toast.error("Failed to delete room: " + err.message);
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter(r => r.id !== room.id)
    }));
  };

  const updateRoom = (id: any, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.map(r => r.id === id ? { ...r, [field]: value } : r)
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!internalPropId) return;
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const localPreviews = filesArray.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, photos: [...prev.photos, ...localPreviews] }));
      setUploadingPhotos(true);
      
      try {
        const newUrls: string[] = [];
        for (const file of filesArray) {
          const uploadedFile = await storage.createFile(appwriteConfig.propertyImagesBucketId, ID.unique(), file);
          const fileUrl = storage.getFileView(appwriteConfig.propertyImagesBucketId, uploadedFile.$id).toString();
          newUrls.push(fileUrl);
        }
        
        const finalPhotos = [...formData.photos.filter(p => !p.startsWith('blob:')), ...newUrls];
        setFormData(prev => ({ ...prev, photos: finalPhotos }));
        
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          internalPropId,
          { photos: finalPhotos }
        );
        toast.success("Photos saved successfully!");
      } catch (error: any) {
        toast.error("Upload failed: " + error.message);
        setFormData(prev => ({ ...prev, photos: prev.photos.filter(p => !p.startsWith('blob:')) }));
      } finally {
        setUploadingPhotos(false);
      }
    }
  };

  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, roomId: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = filesArray.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => room.id === roomId ? {
          ...room,
          photos: [...(room.photos || []), ...newPhotos],
          photoFiles: [...(room.photoFiles || []), ...filesArray]
        } : room)
      }));
    }
  };

  const handlePublish = async () => {
    if (!internalPropId) return;
    setSaving(true);
    try {
      // Save rooms
      for (const room of formData.rooms) {
        const uploadedUrls: string[] = [];
        if (room.photoFiles && room.photoFiles.length > 0) {
          for (const file of room.photoFiles) {
            try {
              const uploadedFile = await storage.createFile(appwriteConfig.roomImagesBucketId, ID.unique(), file);
              uploadedUrls.push(uploadedFile.$id);
            } catch (err: any) {
              console.error("Room photo upload failed", err);
            }
          }
        }
        
        const finalPhotos = [...(room.photos || []).filter((p: string) => !p.startsWith('blob:')), ...uploadedUrls];

        const roomData = {
          propertyId: internalPropId,
          vendorId: user?.$id,
          name: room.name,
          price: parseFloat(room.price) || 0,
          occupancy: parseInt(room.occupancy) || 2,
          size: parseInt(room.size) || 0,
          photos: finalPhotos
        };
        if (room.isExisting) {
          await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.roomCollectionId, room.id, roomData);
        } else {
          await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.roomCollectionId, ID.unique(), roomData);
        }
      }
      
      // Update property status
      await databases.updateDocument(appwriteConfig.databaseId, appwriteConfig.propertyCollectionId, internalPropId, {
        status: "Active"
      });
      
      toast.success("Property published successfully!");
      router.push("/vendor/properties");
    } catch (err: any) {
      toast.error("Publish failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/vendor/properties">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-heading font-black text-secondary tracking-tight">{propertyId ? "Edit Property" : "Add New Property"}</h2>
            <p className="text-sm font-medium text-slate-500">
              Step {currentStep} of 4: {steps[currentStep - 1].title}
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep >= step.id ? "bg-primary text-white shadow-sm" : "bg-slate-100 text-slate-400"
              }`}>
                {step.id}
              </div>
              {step.id !== 4 && <div className={`w-8 h-0.5 mx-1 transition-colors ${currentStep > step.id ? "bg-primary" : "bg-slate-100"}`} />}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-3xl bg-white overflow-hidden ring-1 ring-slate-100">
        <CardContent className="p-0 relative min-h-125">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="p-6 sm:p-10 absolute inset-0 overflow-y-auto"
            >
              
              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="space-y-6">
                    <h3 className="text-xl font-heading font-bold text-secondary">Property Details</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Property Name</label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="The Oberoi Udaivilas" className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-[15px]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Property Type</label>
                        <select className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] appearance-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                          <option>Hotel</option>
                          <option>Resort</option>
                          <option>Villa</option>
                          <option>Boutique</option>
                        </select>
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">About the property (Description)</label>
                        <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Experience unparalleled luxury..." className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-[15px] resize-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xl font-heading font-bold text-secondary">Location</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Address / Location</label>
                        <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="123 Luxury Lane" className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-[15px]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">City</label>
                        <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} placeholder="Udaipur" className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-[15px]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">State/Region</label>
                        <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} placeholder="Rajasthan" className="h-14 rounded-xl bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 text-[15px]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <h3 className="text-xl font-heading font-bold text-secondary">What this place offers</h3>
                    <p className="text-sm text-slate-500">Select the amenities available at your property.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {AMENITIES_LIST.map((amenity) => {
                      const isSelected = formData.amenities.includes(amenity.id);
                      return (
                        <div key={amenity.id} onClick={() => handleAmenityToggle(amenity.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${isSelected ? "border-primary bg-primary/5" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                            <amenity.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 font-semibold text-secondary text-[15px]">{amenity.name}</div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-primary text-white" : "bg-slate-100 text-transparent"}`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <div className="space-y-2">
                    <h3 className="text-xl font-heading font-bold text-secondary">Property Photos</h3>
                    <p className="text-sm text-slate-500">Upload high-quality images to attract more guests.</p>
                  </div>

                  <div className="relative w-full h-64 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center cursor-pointer group overflow-hidden">
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    {uploadingPhotos ? (
                      <div className="flex flex-col items-center text-primary">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <span className="font-bold">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-2 transition-transform duration-300">
                          <UploadCloud className="w-8 h-8 text-primary" />
                        </div>
                        <p className="font-bold text-secondary text-[15px]">Drag & Drop Photos Here</p>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    {formData.photos.map((photo, idx) => (
                      <div key={idx} className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt={`Property ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {currentStep === 4 && (
                <div className="space-y-8 max-w-3xl mx-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-heading font-bold text-secondary">Rooms & Options</h3>
                      <p className="text-sm text-slate-500">Add the different types of rooms available.</p>
                    </div>
                    <Button onClick={addRoom} className="bg-secondary hover:bg-secondary/90 text-white rounded-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Room
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {formData.rooms.map((room) => (
                      <div key={room.id} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/30 relative group">
                        <button onClick={() => removeRoom(room)} className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="grid sm:grid-cols-12 gap-6">
                          <div className="sm:col-span-12 space-y-4">
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Room Name</label>
                                <Input value={room.name} onChange={(e) => updateRoom(room.id, "name", e.target.value)} placeholder="e.g. Luxury Suite" className="h-12 rounded-xl bg-white border-slate-200 text-[14px]" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Bed Type</label>
                                <Input value={room.beds} onChange={(e) => updateRoom(room.id, "beds", e.target.value)} placeholder="1 double bed" className="h-12 rounded-xl bg-white border-slate-200 text-[14px]" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Max Guests</label>
                                <Input type="number" value={room.occupancy} onChange={(e) => updateRoom(room.id, "occupancy", e.target.value)} placeholder="2" className="h-12 rounded-xl bg-white border-slate-200 text-[14px]" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Size (sqft)</label>
                                <Input type="number" value={room.size} onChange={(e) => updateRoom(room.id, "size", e.target.value)} placeholder="300" className="h-12 rounded-xl bg-white border-slate-200 text-[14px]" />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide">Price / night (₹)</label>
                                <Input type="number" value={room.price} onChange={(e) => updateRoom(room.id, "price", e.target.value)} placeholder="40000" className="h-12 rounded-xl bg-white border-slate-200 text-[14px]" />
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100">
                              <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-3 block">Room Photos</label>
                              <div className="flex gap-3 overflow-x-auto pb-2">
                                {(room.photos || []).map((photo: string, idx: number) => {
                                  const imgSrc = (photo.startsWith("http") || photo.startsWith("blob:"))
                                    ? photo
                                    : storage.getFileView(appwriteConfig.roomImagesBucketId, photo).toString();
                                  return (
                                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={imgSrc} alt="Room" className="w-full h-full object-cover" />
                                    </div>
                                  );
                                })}
                                <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer shrink-0 group">
                                  <input type="file" multiple accept="image/*" onChange={(e) => handleRoomPhotoUpload(e, room.id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.rooms.length === 0 && (
                       <div className="text-center p-8 text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-3xl">
                         No rooms added yet. Click 'Add Room' to start.
                       </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || saving} className="h-12 px-6 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
          Back
        </Button>
        {currentStep < 4 ? (
          <Button onClick={nextStep} disabled={saving} className="h-12 px-8 rounded-xl font-bold bg-secondary hover:bg-secondary/90 text-white min-w-37.5">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <>{steps[currentStep]?.title || "Next"} <ChevronRight className="w-4 h-4 ml-2" /></>}
          </Button>
        ) : (
          <Button onClick={handlePublish} disabled={saving} className="h-12 px-10 rounded-xl font-bold bg-primary hover:bg-rose-500 text-white shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all min-w-37.5">
            {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <>Publish Property <Check className="w-5 h-5 ml-2" /></>}
          </Button>
        )}
      </div>
    </div>
  );
}
