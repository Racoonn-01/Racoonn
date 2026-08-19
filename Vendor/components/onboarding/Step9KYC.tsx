"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { ID } from "appwrite";

const DocUploader = ({ title, desc, docKey, isUploaded, isUploading, onFileSelect }: { title: string, desc: string, docKey: any, isUploaded: boolean, isUploading: boolean, onFileSelect: (k: any, file: File) => void }) => (
  <div className={cn(
    "p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
    isUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-[#E86A70]/30"
  )}>
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
        isUploaded ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 group-hover:bg-[#E86A70]/10 group-hover:text-[#E86A70]"
      )}>
        {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
      </div>
      <div>
        <h3 className={cn("font-bold", isUploaded ? "text-emerald-800" : "text-slate-800")}>{title}</h3>
        <p className="text-xs font-medium text-slate-500">{isUploaded ? "Verified successfully" : desc}</p>
      </div>
    </div>
    {!isUploaded && (
      <label className="cursor-pointer">
        <input 
          type="file" 
          className="hidden" 
          accept=".jpg,.jpeg,.png,.pdf"
          disabled={isUploading}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFileSelect(docKey, e.target.files[0]);
            }
          }}
        />
        <div className={cn("h-9 px-4 inline-flex items-center justify-center rounded-md text-xs font-bold border border-slate-200 shadow-sm transition-colors",
          isUploading ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white hover:border-[#E86A70] hover:text-[#E86A70] hover:bg-slate-50")}>
          {isUploading ? "Uploading..." : "Upload"}
        </div>
      </label>
    )}
  </div>
);

interface UploadedDoc {
  fileId: string;
  fileUrl: string;
  fileName: string;
}

export function Step9KYC({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { user, profile } = useAuthStore();
  const [docs, setDocs] = useState<{ pan: UploadedDoc | null, aadhaar: UploadedDoc | null, lease: UploadedDoc | null }>({ pan: null, aadhaar: null, lease: null });
  const [uploadingState, setUploadingState] = useState({ pan: false, aadhaar: false, lease: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDocs({
        pan: profile.idProofFront ? { fileId: profile.idProofFront, fileUrl: "", fileName: "PAN Card" } : null,
        aadhaar: profile.idProofBack ? { fileId: profile.idProofBack, fileUrl: "", fileName: "Aadhaar Card" } : null,
        lease: profile.businessProof ? { fileId: profile.businessProof, fileUrl: "", fileName: "Property Proof" } : null
      });
    }
  }, [profile]);

  const handleFileSelect = async (key: keyof typeof docs, file: File) => {
    setUploadingState(prev => ({ ...prev, [key]: true }));
    try {
      let uploadedFileId: string | null = null;
      let uploadedFileUrl: string | null = null;

      if (appwriteConfig.vendorDocumentsBucketId) {
        const res = await storage.createFile(
          appwriteConfig.vendorDocumentsBucketId,
          ID.unique(),
          file
        );
        uploadedFileId = res.$id;
        try {
          const viewUrl = storage.getFileView(appwriteConfig.vendorDocumentsBucketId, res.$id).toString();
          if (viewUrl) uploadedFileUrl = viewUrl;
        } catch (e) {
          console.warn("Could not get file view URL", e);
        }
      }

      if (!uploadedFileUrl) {
         // Fallback Data URL
         const reader = new FileReader();
         uploadedFileUrl = await new Promise((resolve) => {
           reader.onloadend = () => resolve(reader.result as string);
           reader.readAsDataURL(file);
         });
      }

      setDocs(prev => ({
        ...prev,
        [key]: { fileId: uploadedFileId || "temp_id", fileUrl: uploadedFileUrl || "", fileName: file.name }
      }));

    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploadingState(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleNextClick = async () => {
    if (!profile) {
      onNext();
      return;
    }
    
    setIsLoading(true);
    try {
      // 1. Update Database
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        profile.$id,
        {
          idProofFront: docs.pan?.fileId || "",
          idProofBack: docs.aadhaar?.fileId || "",
          businessProof: docs.lease?.fileId || ""
        }
      );

      // 2. Sync with Global Vendor Documents State (localStorage + Cookie)
      syncGlobalDocumentsState();

      onNext();
    } catch(e) {
      console.error(e);
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const syncGlobalDocumentsState = () => {
    const vendorId = user?.$id || profile?.userId || "vendor_active_session";
    const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    
    try {
      const storageKey = `racoonn_vendor_documents_${vendorId}`;
      const savedDocsStr = localStorage.getItem(storageKey);
      let savedDocs: any[] = [];
      if (savedDocsStr) {
        try { savedDocs = JSON.parse(savedDocsStr); } catch {}
      }

      // Map our keys to the template IDs expected by documents/page.tsx
      const docMappings = [
        { key: "pan" as const, templateId: "pan_card", title: "PAN Card", desc: "Permanent Account Number card of business entity or proprietor." },
        { key: "aadhaar" as const, templateId: "aadhaar_card", title: "Aadhaar Card", desc: "Government identity card of the primary registered owner." },
        { key: "lease" as const, templateId: "property_proof", title: "Property Images & Address Proof", desc: "Property ownership deed, lease agreement, or utility bills." }
      ];

      docMappings.forEach(mapping => {
        const uploadedDoc = docs[mapping.key];
        if (uploadedDoc) {
          const existingIndex = savedDocs.findIndex(d => d.id === mapping.templateId);
          const newDocEntry = {
            id: mapping.templateId,
            title: mapping.title,
            description: mapping.desc,
            status: "Pending",
            fileName: uploadedDoc.fileName,
            fileId: uploadedDoc.fileId,
            fileUrl: uploadedDoc.fileUrl,
            updatedAt: formattedDate
          };

          if (existingIndex >= 0) {
            savedDocs[existingIndex] = newDocEntry;
          } else {
            savedDocs.push(newDocEntry);
          }
        }
      });

      const payload = {
        vendorId,
        vendorName: profile?.businessName || user?.name || "Registered Vendor Partner",
        ownerName: (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user?.name) || "Property Owner",
        email: user?.email || profile?.email || "vendor@racoonn.com",
        phone: profile?.phone || user?.phone || "+91 98765 43210",
        address: [profile?.address, profile?.city, profile?.state].filter(Boolean).join(', ') || "Registered Business Address",
        docs: savedDocs,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(storageKey, JSON.stringify(savedDocs));
      localStorage.setItem(`racoonn_vendor_profile_${vendorId}`, JSON.stringify(payload));
      localStorage.setItem(`racoonn_global_vendor_docs`, JSON.stringify(payload));

      if (typeof document !== 'undefined') {
        document.cookie = `racoonn_vendor_docs_${vendorId}=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch (err) {
      console.warn("Could not write document sync storage:", err);
    }
  };

  const handleBackClick = () => {
    onBack();
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
        <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">KYC Verification</h1>
        <p className="text-slate-500 font-medium">To comply with government regulations, we need to verify the property owner and business details.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-4">
        
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-4 items-start mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 font-medium">Please ensure all uploaded documents are clear and readable. Blurry documents may delay your onboarding process.</p>
        </div>

        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mt-2">Owner Verification</h3>
        <DocUploader 
          title="Owner PAN Card" 
          desc="JPG, PNG or PDF (Max 5MB)" 
          docKey="pan" 
          isUploaded={!!docs.pan}
          isUploading={uploadingState.pan}
          onFileSelect={handleFileSelect}
        />
        
        <DocUploader 
          title="Aadhaar Card / Passport" 
          desc="Front and back in a single PDF" 
          docKey="aadhaar" 
          isUploaded={!!docs.aadhaar}
          isUploading={uploadingState.aadhaar}
          onFileSelect={handleFileSelect}
        />

        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mt-6 pt-4 border-t border-slate-100">Property Verification</h3>
        <DocUploader 
          title="Ownership Proof / Lease" 
          desc="Property tax receipt or registered lease" 
          docKey="lease" 
          isUploaded={!!docs.lease}
          isUploading={uploadingState.lease}
          onFileSelect={handleFileSelect}
        />

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBackClick} variant="ghost" disabled={isLoading} className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNextClick} disabled={isLoading} className="bg-[#E86A70] hover:bg-[#D55A60] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#E86A70]/20 transition-all">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Review & Submit <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
