"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";

const DocUploader = ({ title, desc, docKey, isUploaded, toggleDoc }: { title: string, desc: string, docKey: any, isUploaded: boolean, toggleDoc: (k: any) => void }) => (
  <div className={cn(
    "p-5 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group",
    isUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-[#E86A70]/30"
  )}>
    <div className="flex items-start gap-4">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors",
        isUploaded ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500 group-hover:bg-[#E86A70]/10 group-hover:text-[#E86A70]"
      )}>
        {isUploaded ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
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
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              toggleDoc(docKey);
            }
          }}
        />
        <div className="h-9 px-4 inline-flex items-center justify-center rounded-md text-xs font-bold border border-slate-200 bg-white hover:border-[#E86A70] hover:text-[#E86A70] hover:bg-slate-50 transition-colors shadow-sm">
          Upload
        </div>
      </label>
    )}
  </div>
);

export function Step9KYC({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { profile } = useAuthStore();
  const [docs, setDocs] = useState({ pan: false, aadhaar: false, lease: false });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDocs({
        pan: !!profile.panNumber || !!profile.idProofFront, // Just an indicator for now
        aadhaar: !!profile.aadharNumber || !!profile.idProofBack,
        lease: !!profile.businessProof
      });
    }
  }, [profile]);

  const handleNextClick = async () => {
    if (!profile) {
      onNext();
      return;
    }
    
    setIsLoading(true);
    try {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.vendorCollectionId,
        profile.$id,
        {
          idProofFront: docs.pan ? "uploaded_temp_pan" : "",
          idProofBack: docs.aadhaar ? "uploaded_temp_aadhaar" : "",
          businessProof: docs.lease ? "uploaded_temp_lease" : ""
        }
      );
      onNext();
    } catch(e) {
      console.error(e);
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    onBack();
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const toggleDoc = (key: keyof typeof docs) => {
    const newDocs = { ...docs, [key]: true };
    setDocs(newDocs);
  }

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
          isUploaded={docs.pan}
          toggleDoc={toggleDoc}
        />
        
        <DocUploader 
          title="Aadhaar Card / Passport" 
          desc="Front and back in a single PDF" 
          docKey="aadhaar" 
          isUploaded={docs.aadhaar}
          toggleDoc={toggleDoc}
        />

        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mt-6 pt-4 border-t border-slate-100">Property Verification</h3>
        <DocUploader 
          title="Ownership Proof / Lease" 
          desc="Property tax receipt or registered lease" 
          docKey="lease" 
          isUploaded={docs.lease}
          toggleDoc={toggleDoc}
        />

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={handleBackClick} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button onClick={handleNextClick} className="bg-[#E86A70] hover:bg-[#D55A60] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#E86A70]/20 transition-all">
          Review & Submit <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
