"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, UploadCloud, Building2, User, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { databases, storage, appwriteConfig } from "@/lib/appwrite/client";
import { ID } from "appwrite";

export function Step3Business({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
  const { user, profile, checkAuth } = useAuthStore();
  
  const [bizType, setBizType] = useState<"individual" | "company">((profile?.bizType as "individual" | "company") || "company");
  const [idType, setIdType] = useState<"pan" | "aadhar">((profile?.idType as "pan" | "aadhar") || "pan");
  
  const [legalName, setLegalName] = useState(profile?.businessName || "");
  const [panNumber, setPanNumber] = useState(profile?.panNumber || "");
  const [gstNumber, setGstNumber] = useState(profile?.gstNumber || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [fullName, setFullName] = useState((profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}` : "") || "");
  const [aadharNumber, setAadharNumber] = useState(profile?.aadharNumber || "");
  
  const [idProofFront, setIdProofFront] = useState(profile?.idProofFront || "");
  const [idProofBack, setIdProofBack] = useState(profile?.idProofBack || "");
  const [businessProof, setBusinessProof] = useState(profile?.businessProof || "");

  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [uploadingBusiness, setUploadingBusiness] = useState(false);
  
  const [localPreviews, setLocalPreviews] = useState<{front?: string, back?: string, business?: string}>({});

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const businessInputRef = useRef<HTMLInputElement>(null);
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back" | "business"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    if (!appwriteConfig.vendorDocumentsBucketId) {
      setError("Storage bucket is not configured. Please add NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID to your .env.local file.");
      return;
    }

    try {
      setError("");
      
      const objectUrl = URL.createObjectURL(file);

      if (type === "front") {
        setUploadingFront(true);
        setLocalPreviews(prev => ({...prev, front: objectUrl}));
      }
      if (type === "back") {
        setUploadingBack(true);
        setLocalPreviews(prev => ({...prev, back: objectUrl}));
      }
      if (type === "business") {
        setUploadingBusiness(true);
        setLocalPreviews(prev => ({...prev, business: objectUrl}));
      }

      const response = await storage.createFile(
        appwriteConfig.vendorDocumentsBucketId,
        ID.unique(),
        file
      );

      if (type === "front") setIdProofFront(response.$id);
      if (type === "back") setIdProofBack(response.$id);
      if (type === "business") setBusinessProof(response.$id);

    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      if (type === "front") setUploadingFront(false);
      if (type === "back") setUploadingBack(false);
      if (type === "business") setUploadingBusiness(false);
    }
  };

  const getPreviewUrl = (fileId: string) => {
    if (!fileId) return null;
    try {
      return storage.getFilePreview(appwriteConfig.vendorDocumentsBucketId, fileId).toString();
    } catch {
      return null;
    }
  };

  const handleNext = async () => {
    setError("");
    
    // Validation
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    if (bizType === "company") {
      if (!legalName.trim() || !panNumber.trim() || !address.trim() || !businessProof) {
        setError("Please fill in all required fields and upload Business Proof.");
        return;
      }
      if (!panRegex.test(panNumber.trim().toUpperCase())) {
        setError("Please enter a valid 10-character PAN number (e.g. ABCDE1234F).");
        return;
      }
    } else {
      if (!fullName.trim() || !panNumber.trim() || !aadharNumber.trim() || !address.trim() || !idProofFront || !idProofBack) {
        setError("Please fill in all required fields and upload both sides of ID Proof.");
        return;
      }
      if (!panRegex.test(panNumber.trim().toUpperCase())) {
        setError("Please enter a valid 10-character PAN number (e.g. ABCDE1234F).");
        return;
      }
      
      const cleanAadhar = aadharNumber.replace(/\s+/g, "");
      if (!/^\d{12}$/.test(cleanAadhar)) {
        setError("Please enter a valid 12-digit Aadhar number.");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (user) {
        const updateData: any = {
          bizType,
          idType: bizType === "individual" ? idType : null,
          panNumber,
          address,
          onboardingStep: 3,
          idProofFront: bizType === "individual" ? idProofFront : null,
          idProofBack: bizType === "individual" ? idProofBack : null,
          businessProof: bizType === "company" ? businessProof : null
        };

        if (bizType === "company") {
          updateData.businessName = legalName;
          updateData.gstNumber = gstNumber || null;
        } else {
          updateData.aadharNumber = aadharNumber;
          // Try to split full name back into first and last
          const nameParts = fullName.split(" ");
          updateData.firstName = nameParts[0];
          updateData.lastName = nameParts.slice(1).join(" ") || null;
        }

        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.vendorCollectionId,
          user.$id,
          updateData
        );
        
        await checkAuth(); // Refresh profile in store
      }
      
      onNext();
    } catch (err: any) {
      setError(err.message || "Failed to save business details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const slideUp: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const isPanValid = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());
  const isAadharValid = (aadhar: string) => /^\d{12}$/.test(aadhar.replace(/\s+/g, ""));

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      exit="hidden" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="flex flex-col h-full max-w-xl mx-auto w-full pt-8"
    >
      <motion.div variants={slideUp} className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#1F2E4A] mb-3 font-['Poppins',sans-serif]">Tell us about your business</h1>
        <p className="text-slate-500 font-medium">This information helps us verify your identity and ensures smooth payouts.</p>
      </motion.div>

      <motion.div variants={slideUp} className="space-y-6">
        
        {/* Business Type Selector */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setBizType("individual")}
            className={cn(
              "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
              bizType === "individual" ? "border-[#E86A70] bg-[#E86A70]/5" : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bizType === "individual" ? "bg-[#E86A70] text-white" : "bg-slate-100 text-slate-500")}>
              <User className="w-6 h-6" />
            </div>
            <span className={cn("font-bold", bizType === "individual" ? "text-[#1F2E4A]" : "text-slate-500")}>Individual / Sole Proprietor</span>
          </button>
          
          <button 
            onClick={() => setBizType("company")}
            className={cn(
              "p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all",
              bizType === "company" ? "border-[#E86A70] bg-[#E86A70]/5" : "border-slate-200 bg-white hover:border-slate-300"
            )}
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bizType === "company" ? "bg-[#E86A70] text-white" : "bg-slate-100 text-slate-500")}>
              <Building2 className="w-6 h-6" />
            </div>
            <span className={cn("font-bold text-center", bizType === "company" ? "text-[#1F2E4A]" : "text-slate-500")}>Registered Company / Property</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-500 font-medium text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {bizType === "company" ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Legal Business Name</label>
              <Input 
                value={legalName} 
                onChange={(e) => setLegalName(e.target.value)} 
                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium" 
                placeholder="Racoonn Hospitality Pvt Ltd" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Company / Property  PAN Number</label>
                <Input 
                  value={panNumber} 
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())} 
                  className={cn(
                    "h-12 rounded-xl bg-white focus:ring-2 transition-all font-medium uppercase",
                    panNumber.length > 0 
                      ? isPanValid(panNumber) 
                        ? "border-green-400 focus:ring-green-400/20 focus:border-green-400" 
                        : "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : "border-slate-200 focus:ring-[#E86A70]/20 focus:border-[#E86A70]"
                  )} 
                  placeholder="ABCDE1234F" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">GST Number (Optional)</label>
                <Input 
                  value={gstNumber} 
                  onChange={(e) => setGstNumber(e.target.value.toUpperCase())} 
                  className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium uppercase" 
                  placeholder="22AAAAA0000A1Z5" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Registered Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium resize-none min-h-25 outline-none" 
                placeholder="123 Business Park, Sector 4..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload Business Proof</label>
              <div 
                onClick={() => businessInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group relative overflow-hidden",
                  businessProof ? "border-green-300 bg-green-50" : "border-slate-300 hover:bg-slate-50"
                )}
              >
                <input type="file" className="hidden" ref={businessInputRef} onChange={(e) => handleFileUpload(e, "business")} accept=".pdf,.jpg,.png" />
                
                {businessProof && !uploadingBusiness ? (
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={localPreviews.business || getPreviewUrl(businessProof) || ""} alt="Business Proof" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="w-10 h-10 text-green-600 mb-2 drop-shadow-md" />
                      <span className="text-green-700 text-sm font-bold bg-white/90 px-3 py-1 rounded-full shadow-sm">Change Document</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform relative z-10",
                      "bg-blue-50 text-blue-500 group-hover:scale-110"
                    )}>
                      {uploadingBusiness ? <Loader2 className="w-7 h-7 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1 relative z-10">
                      {uploadingBusiness ? "Uploading..." : "Click or drag file to this area to upload"}
                    </p>
                    {!uploadingBusiness && <p className="text-xs text-slate-500 relative z-10">Supports PDF, JPG, PNG (Max 5MB)</p>}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name (As per PAN/Aadhar)</label>
              <Input 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium" 
                placeholder="Jane Doe" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">PAN Number</label>
                <Input 
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  className={cn(
                    "h-12 rounded-xl bg-white focus:ring-2 transition-all font-medium uppercase",
                    panNumber.length > 0 
                      ? isPanValid(panNumber) 
                        ? "border-green-400 focus:ring-green-400/20 focus:border-green-400" 
                        : "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : "border-slate-200 focus:ring-[#E86A70]/20 focus:border-[#E86A70]"
                  )} 
                  placeholder="ABCDE1234F" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Aadhar Number</label>
                <Input 
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  className={cn(
                    "h-12 rounded-xl bg-white focus:ring-2 transition-all font-medium uppercase",
                    aadharNumber.length > 0 
                      ? isAadharValid(aadharNumber) 
                        ? "border-green-400 focus:ring-green-400/20 focus:border-green-400" 
                        : "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                      : "border-slate-200 focus:ring-[#E86A70]/20 focus:border-[#E86A70]"
                  )} 
                  placeholder="1234 5678 9012" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Residential Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-[#E86A70]/20 focus:border-[#E86A70] transition-all font-medium resize-none min-h-25 outline-none" 
                placeholder="House No 123, Street Name..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Upload ID Proof</label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() => setIdType("pan")}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                      idType === "pan" ? "bg-white text-[#1F2E4A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    PAN Card
                  </button>
                  <button
                    onClick={() => setIdType("aadhar")}
                    className={cn(
                      "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                      idType === "aadhar" ? "bg-white text-[#1F2E4A] shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Aadhar Card
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => frontInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group relative overflow-hidden h-32 flex flex-col justify-center",
                    idProofFront ? "border-green-300 bg-green-50" : "border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <input type="file" className="hidden" ref={frontInputRef} onChange={(e) => handleFileUpload(e, "front")} accept=".pdf,.jpg,.png" />
                  
                  {idProofFront && !uploadingFront ? (
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={localPreviews.front || getPreviewUrl(idProofFront) || ""} alt="Front Side" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mb-2 drop-shadow-md" />
                        <span className="text-green-700 text-xs font-bold bg-white/90 px-3 py-1 rounded-full shadow-sm">Change</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform relative z-10",
                        "bg-blue-50 text-blue-500 group-hover:scale-110"
                      )}>
                        {uploadingFront ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-slate-700 mb-1 relative z-10">
                        {uploadingFront ? "Uploading..." : "Front Side"}
                      </p>
                      {!uploadingFront && <p className="text-[10px] text-slate-500 relative z-10">Max 5MB</p>}
                    </>
                  )}
                </div>
                
                <div 
                  onClick={() => backInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group relative overflow-hidden h-32 flex flex-col justify-center",
                    idProofBack ? "border-green-300 bg-green-50" : "border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <input type="file" className="hidden" ref={backInputRef} onChange={(e) => handleFileUpload(e, "back")} accept=".pdf,.jpg,.png" />
                  
                  {idProofBack && !uploadingBack ? (
                    <div className="absolute inset-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={localPreviews.back || getPreviewUrl(idProofBack) || ""} alt="Back Side" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <CheckCircle2 className="w-8 h-8 text-green-600 mb-2 drop-shadow-md" />
                        <span className="text-green-700 text-xs font-bold bg-white/90 px-3 py-1 rounded-full shadow-sm">Change</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform relative z-10",
                        "bg-blue-50 text-blue-500 group-hover:scale-110"
                      )}>
                        {uploadingBack ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                      </div>
                      <p className="text-xs font-bold text-slate-700 mb-1 relative z-10">
                        {uploadingBack ? "Uploading..." : "Back Side"}
                      </p>
                      {!uploadingBack && <p className="text-[10px] text-slate-500 relative z-10">Max 5MB</p>}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </motion.div>

      <motion.div variants={slideUp} className="mt-10 flex items-center justify-between">
        <Button onClick={onBack} variant="ghost" className="text-slate-500 font-bold hover:bg-slate-100 rounded-full px-6">
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={isLoading}
          className="bg-[#1F2E4A] hover:bg-[#151E2D] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-[#1F2E4A]/20 transition-all disabled:opacity-70"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <>Continue to Property <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
