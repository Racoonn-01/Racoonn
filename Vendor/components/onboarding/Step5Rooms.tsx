"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, Plus, Users, Maximize, Edit2, Trash2, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { ID, Query, Permission, Role } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

interface Room {
  id: number;
  name: string;
  price: string;
  occupancy: string;
  size: string;
  photos: string[];
  photoFiles?: File[];
}

export function Step5Rooms({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const [rooms, setRooms] = useState<Room[]>([{ id: 1, name: "Deluxe King Room", price: "2500", occupancy: "2", size: "350", photos: [] }]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, profile, checkAuth } = useAuthStore();

  useEffect(() => {
    const fetchRooms = async () => {
      if (!profile?.currentPropertyId) return;
      try {
        const existingRooms = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.equal("propertyId", profile.currentPropertyId)]
        );
        if (existingRooms.documents.length > 0) {
          setRooms(existingRooms.documents.map((doc, idx) => ({
            id: idx + 1,
            name: doc.name,
            price: doc.price.toString(),
            occupancy: doc.occupancy.toString(),
            size: doc.size.toString(),
            photos: doc.photos || []
          })));
        }
      } catch (e) {
        console.error("Failed to load rooms", e);
      }
    };
    fetchRooms();
  }, [profile]);

  const updateRoom = (id: number, field: keyof Room, value: string) => {
    setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
  };

  const handleBack = () => {
    onBack();
  };

  const handleNext = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      let currentUser = user;
      if (!currentUser) {
        await checkAuth();
        currentUser = useAuthStore.getState().user;
        if (!currentUser) throw new Error("You must be logged in.");
      }

      let currentProfile = profile;
      if (!currentProfile?.currentPropertyId) {
        await checkAuth();
        currentProfile = useAuthStore.getState().profile;
      }
      
      const propertyId = currentProfile?.currentPropertyId;
      if (!propertyId) {
        throw new Error("Property ID not found. Please go back to Step 4 and save your property again.");
      }

      // Fetch existing rooms for this property and delete them first
      const existingRooms = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.roomCollectionId,
        [Query.equal("propertyId", propertyId)]
      );
      
      for (const existing of existingRooms.documents) {
        await databases.deleteDocument(appwriteConfig.databaseId, appwriteConfig.roomCollectionId, existing.$id);
      }

      // Save each room to the database
      for (const room of rooms) {
        const uploadedPhotoUrls: string[] = [];

        if (room.photoFiles && room.photoFiles.length > 0) {
          for (const file of room.photoFiles) {
            try {
              const uploadedFile = await storage.createFile(
                appwriteConfig.roomImagesBucketId,
                ID.unique(),
                file
              );
              const fileUrl = storage.getFileView(
                appwriteConfig.roomImagesBucketId,
                uploadedFile.$id
              ).toString();
              uploadedPhotoUrls.push(fileUrl);
            } catch (uploadError) {
              console.error("Failed to upload photo:", uploadError);
            }
          }
        }

        await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          ID.unique(),
          {
            vendorId: currentUser.$id,
            propertyId: propertyId,
            name: room.name,
            price: parseInt(room.price) || 0,
            occupancy: parseInt(room.occupancy) || 1,
            size: parseInt(room.size) || 0,
            photos: uploadedPhotoUrls
          },
          [
            Permission.read(Role.user(currentUser.$id)),
            Permission.write(Role.user(currentUser.$id)),
            Permission.update(Role.user(currentUser.$id)),
            Permission.delete(Role.user(currentUser.$id))
          ]
        );
      }

      // Update onboarding step
      if (profile) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.vendorCollectionId,
          profile.$id,
          { onboardingStep: 5 }
        );
        await checkAuth();
      }
      
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save rooms.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const addRoom = () => {
    setRooms([...rooms, { id: Date.now(), name: "Standard Room", price: "1500", occupancy: "2", size: "250", photos: [] }]);
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, roomId: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newPhotos = filesArray.map(file => URL.createObjectURL(file));
      setRooms(rooms.map(room => room.id === roomId ? { 
        ...room, 
        photos: [...(room.photos || []), ...newPhotos],
        photoFiles: [...(room.photoFiles || []), ...filesArray]
      } : room));
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">Add your rooms</h1>
          <p className="text-slate-500 font-medium">Create room categories, set base prices, and define occupancy.</p>
        </div>
        <Button onClick={addRoom} variant="outline" className="font-bold rounded-full border-[#E86A70] text-[#E86A70] hover:bg-[#E86A70]/10">
          <Plus className="w-4 h-4 mr-2" /> Add Room
        </Button>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-500 font-medium text-sm text-center border border-red-100">
            {error}
          </div>
        )}
        {rooms.map((room) => (
          <div key={room.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500"><Edit2 className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-500"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Name</label>
                <Input value={room.name} onChange={(e) => updateRoom(room.id, "name", e.target.value)} className="h-10 border-transparent bg-slate-50 focus:bg-white text-lg font-bold text-slate-800 focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] rounded-xl" />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Base Price / Night</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input value={room.price} onChange={(e) => updateRoom(room.id, "price", e.target.value)} className="h-10 pl-7 border-slate-200 bg-white font-bold rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" /> Max Guests</label>
                  <Input value={room.occupancy} onChange={(e) => updateRoom(room.id, "occupancy", e.target.value)} type="number" className="h-10 border-slate-200 bg-white font-bold rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Maximize className="w-3 h-3" /> Size (sqft)</label>
                  <Input value={room.size} onChange={(e) => updateRoom(room.id, "size", e.target.value)} type="number" className="h-10 border-slate-200 bg-white font-bold rounded-xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Room Photos</label>
                {room.photos && room.photos.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {room.photos.map((photo, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo} alt="Room" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-[#E86A70]/50 transition-colors cursor-pointer shrink-0 group/upload">
                      <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, room.id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <Plus className="w-6 h-6 text-slate-400 group-hover/upload:text-[#E86A70] transition-colors" />
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-[#E86A70]/50 transition-colors cursor-pointer relative group/upload">
                    <input type="file" multiple accept="image/*" onChange={(e) => handlePhotoUpload(e, room.id)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover/upload:bg-[#E86A70]/10 flex items-center justify-center mb-3 transition-colors">
                      <UploadCloud className="w-5 h-5 text-slate-400 group-hover/upload:text-[#E86A70] transition-colors" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Upload Photos</span>
                    <span className="text-xs text-slate-400 mt-1">Drag & drop or click to browse</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBack} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6" disabled={isLoading}>
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNext} disabled={isLoading} className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all">
          {isLoading ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</> : <>Upload Photos <ArrowRight className="ml-2 w-4 h-4" /></>}
        </Button>
      </motion.div>
    </motion.div>
  );
}
