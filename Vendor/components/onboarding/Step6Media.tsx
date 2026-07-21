"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, UploadCloud, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import { useAuthStore } from "@/store/authStore";

export function Step6Media({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { profile } = useAuthStore();
  const [photos, setPhotos] = useState<string[]>([]);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    const fetchPropertyImages = async () => {
      if (profile?.currentPropertyId) {
        try {
          const property = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.propertyCollectionId,
            profile.currentPropertyId
          );
          if (property.photos && property.photos.length > 0) {
            setPhotos(property.photos);
          }
        } catch (error) {
          console.error("Failed to fetch property images", error);
        }
      }
    };
    fetchPropertyImages();
  }, [profile?.currentPropertyId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile?.currentPropertyId) {
      console.error("No current property ID found");
      return;
    }
    
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // 1. Show immediate local preview for snappy UX
      const localPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...localPreviews]);
      setUploading(true);
      
      try {
        const newUrls: string[] = [];
        
        for (const file of filesArray) {
          // Force a valid extension to prevent Appwrite 500 errors on extensionless files
          const safeFile = new File([file], `property_image_${Date.now()}.jpg`, {
            type: file.type || "image/jpeg"
          });
          
          const uploadedFile = await storage.createFile(
            appwriteConfig.propertyImagesBucketId,
            ID.unique(),
            safeFile
          );
          const fileUrl = storage.getFileView(
            appwriteConfig.propertyImagesBucketId,
            uploadedFile.$id
          ).toString();
          newUrls.push(fileUrl);
        }
        
        // 2. Replace local previews with permanent server URLs
        setPhotos(prev => {
          const filtered = prev.filter(p => !p.startsWith('blob:'));
          return [...filtered, ...newUrls];
        });
        
        // 3. Update the database
        // We use the state without blob URLs to update the database
        const finalPhotosToSave = [...photos.filter(p => !p.startsWith('blob:')), ...newUrls];
        
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.propertyCollectionId,
          profile.currentPropertyId,
          {
            photos: finalPhotosToSave
          }
        );
        toast.success("Photos saved successfully!");
      } catch (error: any) {
        console.error("Failed to upload property photo:", error);
        toast.error(`Upload failed: ${error.message || "Unknown error"}. Check your Appwrite collection schema and bucket permissions.`);
        // Revert UI if it failed
        setPhotos(prev => prev.filter(p => !p.startsWith('blob:')));
      } finally {
        setUploading(false);
      }
    }
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
        <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">Showcase your property</h1>
        <p className="text-slate-500 font-medium">Great photos are the #1 reason guests book. Upload high-quality images of your rooms, amenities, and exterior.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-6">
        
        {/* Drag and Drop Zone */}
        <div className="border-2 border-dashed border-[#E86A70]/50 bg-[#E86A70]/5 rounded-3xl p-10 text-center hover:bg-[#E86A70]/10 transition-colors cursor-pointer group relative overflow-hidden">
          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E86A70]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="w-20 h-20 bg-white shadow-xl shadow-rose-500/10 text-[#E86A70] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-2 transition-transform duration-300">
            <UploadCloud className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-[#1F2E4A] mb-2">Drag & Drop Photos Here</h3>
          <p className="text-sm font-medium text-slate-500 mb-6">or browse your device</p>
          
          <div className="flex justify-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> High Resolution</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Min 10 Photos</span>
          </div>
        </div>

        {/* Upload Progress/Preview Mock */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-700">Uploaded Photos ({photos.length}/10)</h4>
          <div className="grid grid-cols-4 gap-3">
            {photos.map((photo, idx) => (
              <div key={idx} className="aspect-square bg-slate-100 rounded-xl overflow-hidden relative group">
                {failedImages.has(idx) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-400 p-2 text-center">
                    <AlertCircle className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">Private Bucket<br/>or Broken Link</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={photo} 
                    alt={`Property ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    onError={() => {
                      setFailedImages(prev => new Set(prev).add(idx));
                    }}
                  />
                )}
                {idx === 0 && !failedImages.has(idx) && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Cover</span>
                  </div>
                )}
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 8 - photos.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square bg-slate-50 border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-slate-300">
                <ImageIcon className="w-6 h-6" />
              </div>
            ))}
          </div>
        </div>

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={uploading} className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all">
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <>Amenities & Policies <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
