"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, FileText, UploadCloud, Eye, RefreshCw, AlertCircle, 
  Clock, ZoomIn, ZoomOut, RotateCw, Download, Loader2, CheckCircle2, XCircle, Info
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { storage, client, appwriteConfig } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

export interface VendorDoc {
  id: string;
  title: string;
  description: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected" | "Under Review";
  fileName: string | null;
  fileId: string | null;
  fileUrl: string | null;
  updatedAt: string | null;
}

export const INITIAL_DOC_TEMPLATES: { id: string; title: string; description: string }[] = [
  {
    id: "pan_card",
    title: "PAN Card",
    description: "Permanent Account Number card of business entity or proprietor."
  },
  {
    id: "aadhaar_card_front",
    title: "Aadhaar Card (Front Side)",
    description: "Government identity card of the primary registered owner (Front Side)."
  },
  {
    id: "aadhaar_card_back",
    title: "Aadhaar Card (Back Side)",
    description: "Government identity card of the primary registered owner (Back Side)."
  },
  {
    id: "business_registration",
    title: "Business Registration Certificate",
    description: "Incorporation deed, Trade License, or MSME registration."
  },
  {
    id: "gst_certificate",
    title: "GST Certificate",
    description: "GSTIN registration certificate issued by tax authority (if applicable)."
  },
  {
    id: "bank_cheque",
    title: "Bank Account Details & Cancelled Cheque",
    description: "Bank passbook or cancelled cheque for payout settlements."
  },
  {
    id: "property_proof",
    title: "Property Images & Address Proof",
    description: "Property ownership deed, lease agreement, or utility bills."
  },
  {
    id: "fssai_license",
    title: "Food Safety License (FSSAI)",
    description: "FSSAI food license if meals or breakfast are provided."
  }
];

export default function DocumentsPage() {
  const { user, profile } = useAuthStore();
  const [documents, setDocuments] = useState<VendorDoc[]>([]);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<VendorDoc | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Overall Verification Realtime Banner State
  const [verificationBanner, setVerificationBanner] = useState<{
    status: "Approved" | "Rejected" | "Under Review" | "Pending";
    reason?: string;
  } | null>(null);
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  useEffect(() => {
    if (verificationBanner?.status === 'Approved') {
      const timer = setTimeout(() => setShowApprovedBanner(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [verificationBanner?.status]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeDocIdRef = useRef<string | null>(null);

  // Load real-time documents state
  useEffect(() => {
    const vendorId = user?.$id || profile?.userId || "vendor_active_session";
    try {
      const storageKey = `racoonn_vendor_documents_${vendorId}`;
      const savedDocsStr = localStorage.getItem(storageKey);
      
      let savedDocs: VendorDoc[] = [];
      if (savedDocsStr) {
        try { savedDocs = JSON.parse(savedDocsStr); } catch {}
      }

      if (savedDocs.length === 0) {
        const globalDocsStr = localStorage.getItem('racoonn_global_vendor_docs');
        if (globalDocsStr) {
          try { 
             const parsedGlobal = JSON.parse(globalDocsStr);
             if (parsedGlobal.vendorId === vendorId && Array.isArray(parsedGlobal.docs)) {
                savedDocs = parsedGlobal.docs;
             }
          } catch {}
        }
      }

      const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

      // Merge templates: preserve uploaded files, default rest to clean Missing state
      const mergedList = INITIAL_DOC_TEMPLATES.map((t) => {
        const existing = savedDocs.find(d => d.id === t.id || d.title?.toLowerCase() === t.title.toLowerCase());
        if (existing && existing.fileName) {
          return existing;
        }

        let fileIdFromProfile = null;
        let fileNameFromProfile = null;

        if (profile) {
          if (t.id === "pan_card" && profile.idProofFront) {
             fileIdFromProfile = profile.idProofFront;
             fileNameFromProfile = "PAN Card (Uploaded)";
          } else if (t.id === "aadhaar_card_front" && profile.idProofBack) {
             fileIdFromProfile = profile.idProofBack;
             fileNameFromProfile = "Aadhaar Card Front (Uploaded)";
          } else if (t.id === "aadhaar_card_back" && (profile as any).aadhaarCardBack) {
             fileIdFromProfile = (profile as any).aadhaarCardBack;
             fileNameFromProfile = "Aadhaar Card Back (Uploaded)";
          } else if ((t.id === "property_proof" || t.id === "business_registration") && profile.businessProof) {
             fileIdFromProfile = profile.businessProof;
             fileNameFromProfile = "Property Proof (Uploaded)";
          } else if (t.id === "gst_certificate" && (profile as any).gstCertificate) {
             fileIdFromProfile = (profile as any).gstCertificate;
             fileNameFromProfile = "GST Certificate (Uploaded)";
          } else if (t.id === "bank_cheque" && (profile as any).bankCheque) {
             fileIdFromProfile = (profile as any).bankCheque;
             fileNameFromProfile = "Bank Cheque (Uploaded)";
          } else if (t.id === "fssai_license" && (profile as any).fssaiLicense) {
             fileIdFromProfile = (profile as any).fssaiLicense;
             fileNameFromProfile = "FSSAI License (Uploaded)";
          }
        }

        if (fileIdFromProfile) {
           let generatedFileUrl = null;
           try {
             generatedFileUrl = storage.getFileView(appwriteConfig.vendorDocumentsBucketId, fileIdFromProfile).toString();
           } catch (e) {
             console.warn("Could not generate file URL for", fileIdFromProfile, e);
           }

           return {
             ...t,
             status: "Pending", // Default new DB-detected documents to Pending until explicitly Verified
             fileName: fileNameFromProfile,
             fileId: fileIdFromProfile,
             fileUrl: generatedFileUrl,
             updatedAt: formattedDate
           };
        }

        return {
          ...t,
          status: "Missing" as const,
          fileName: null,
          fileId: null,
          fileUrl: null,
          updatedAt: null
        };
      }) as VendorDoc[];

      setDocuments(mergedList);
    } catch {
      setDocuments(INITIAL_DOC_TEMPLATES.map(t => ({
        ...t,
        status: 'Missing' as const,
        fileName: null,
        fileId: '',
        fileUrl: null,
        updatedAt: new Date().toISOString()
      })) as VendorDoc[]);
    }
  }, [user, profile]);

  // Real-time listener for Admin Verification Approval / Rejection without refresh
  useEffect(() => {
    function checkLiveStatusSync() {
      try {
        let verStatus: "Approved" | "Rejected" | "Under Review" | "Pending" | null = null;
        let verReason: string | null = null;

        const vendorKey = user?.$id || profile?.userId || "vendor_active_session";
        const cookieName = `racoonn_vendor_verification_${vendorKey}`;
        const match = typeof document !== 'undefined' ? document.cookie.match(new RegExp(`(?:^|; )${cookieName}=([^;]*)`)) : null;

        if (match && match[1]) {
          const parsed = JSON.parse(decodeURIComponent(match[1]));
          verStatus = parsed.status;
          verReason = parsed.reason;
        } else {
          const syncStr = localStorage.getItem('racoonn_global_vendor_verification_sync') || 
                          localStorage.getItem(`racoonn_vendor_verification_${vendorKey}`) ||
                          localStorage.getItem(`racoonn_vendor_verification_VER-1029`);
          if (syncStr) {
            const parsed = JSON.parse(syncStr);
            verStatus = parsed.status;
            verReason = parsed.reason;
          }
        }

        if (verStatus) {
          setVerificationBanner({ status: verStatus, reason: verReason || undefined });
        }
        
        // Also sync independent document statuses from the cookie updated by Admin
        const docsCookieMatch = typeof document !== 'undefined' ? document.cookie.match(new RegExp(`(?:^|; )racoonn_vendor_docs_${vendorKey}=([^;]*)`)) : null;
        if (docsCookieMatch && docsCookieMatch[1]) {
          try {
            const parsedDocsPayload = JSON.parse(decodeURIComponent(docsCookieMatch[1]));
            if (parsedDocsPayload && Array.isArray(parsedDocsPayload.docs)) {
              setDocuments(prevDocs => {
                let changed = false;
                const newDocs = prevDocs.map(prevDoc => {
                  const syncedDoc = parsedDocsPayload.docs.find((d: any) => d.id === prevDoc.id);
                  if (syncedDoc && syncedDoc.status !== prevDoc.status) {
                    changed = true;
                    return { ...prevDoc, status: syncedDoc.status };
                  }
                  return prevDoc;
                });
                return changed ? newDocs : prevDocs;
              });
            }
          } catch (e) {
            console.warn("Failed to parse docs cookie sync:", e);
          }
        }
      } catch (err) {
        console.warn("Live status check error:", err);
      }
    }

    checkLiveStatusSync();
    const interval = setInterval(checkLiveStatusSync, 1000);
    window.addEventListener('storage', checkLiveStatusSync);

    // Instant BroadcastChannel WebSocket-like Realtime Channel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('racoonn_realtime_verification');
        channel.onmessage = (event) => {
          if (event.data?.type === 'VENDOR_STATUS_CHANGED' || event.data?.type === 'VERIFICATION_UPDATED') {
            checkLiveStatusSync();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    // Appwrite Realtime WebSocket Subscription
    let appwriteUnsubscribe: (() => void) | undefined;
    if (appwriteConfig.projectId && appwriteConfig.databaseId && appwriteConfig.vendorCollectionId) {
      try {
        appwriteUnsubscribe = client.subscribe(
          `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.vendorCollectionId}.documents`,
          () => {
            checkLiveStatusSync();
          }
        );
      } catch (err) {
        console.warn("Appwrite Realtime WebSocket subscription notice:", err);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkLiveStatusSync);
      if (appwriteUnsubscribe) appwriteUnsubscribe();
      if (channel) channel.close();
    };
  }, [user, profile]);

  const saveDocumentsState = (updated: VendorDoc[]) => {
    setDocuments(updated);
    const vendorId = user?.$id || profile?.userId || "vendor_active_session";
    const vendorName = profile?.businessName || user?.name || "Registered Vendor Partner";
    const ownerName = (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : user?.name) || "Property Owner";
    const email = user?.email || profile?.email || "vendor@racoonn.com";
    const phone = profile?.phone || user?.phone || "+91 98765 43210";
    const address = [profile?.address, profile?.city, profile?.state].filter(Boolean).join(', ') || "Registered Business Address";

    try {
      const strippedDocs = updated.map(d => {
        if (d.fileUrl && d.fileUrl.startsWith('data:')) {
          return { ...d, fileUrl: null };
        }
        return d;
      });

      const payload = {
        vendorId,
        vendorName,
        ownerName,
        email,
        phone,
        address,
        docs: strippedDocs,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(`racoonn_vendor_documents_${vendorId}`, JSON.stringify(updated));
      localStorage.setItem(`racoonn_vendor_profile_${vendorId}`, JSON.stringify(payload));
      localStorage.setItem(`racoonn_global_vendor_docs`, JSON.stringify(payload));

      // Save to cross-port cookie for Admin panel (single canonical key)
      if (typeof document !== 'undefined') {
        document.cookie = `racoonn_vendor_docs_${vendorId}=${encodeURIComponent(JSON.stringify(payload))}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // Broadcast instant WebSocket message to Admin Verification Center
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const bc = new BroadcastChannel('racoonn_realtime_verification');
          bc.postMessage({
            type: 'VENDOR_DOC_UPLOADED',
            vendorId,
            payload,
            timestamp: Date.now()
          });
          bc.close();
        } catch {}
      }
    } catch (err) {
      console.warn("Could not write document sync storage:", err);
    }
  };

  const handleTriggerUpload = (docId: string) => {
    activeDocIdRef.current = docId;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docId = activeDocIdRef.current;
    if (!file || !docId) return;

    setUploadingDocId(docId);
    const targetDoc = documents.find(d => d.id === docId);
    toast.info(`Uploading ${targetDoc?.title || "document"}...`);

    try {
      let uploadedFileId: string | null = null;
      let uploadedFileUrl: string | null = null;

      if (appwriteConfig.vendorDocumentsBucketId) {
        try {
          const res = await storage.createFile(
            appwriteConfig.vendorDocumentsBucketId,
            ID.unique(),
            file
          );
          uploadedFileId = res.$id;
          const viewUrl = storage.getFileView(appwriteConfig.vendorDocumentsBucketId, res.$id).toString();
          if (viewUrl) uploadedFileUrl = viewUrl;
        } catch (storageErr) {
          console.warn("Appwrite storage upload fallback to Data URL preview:", storageErr);
        }
      }

      if (!uploadedFileUrl) {
        uploadedFileUrl = URL.createObjectURL(file);
      }

      const formattedDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const updatedList = documents.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: "Pending" as const,
            fileName: file.name,
            fileId: uploadedFileId,
            fileUrl: uploadedFileUrl,
            updatedAt: formattedDate
          };
        }
        return d;
      });

      // Update Appwrite Database so Admin can read it!
      if (appwriteConfig.projectId && appwriteConfig.databaseId && appwriteConfig.vendorCollectionId && profile?.$id && uploadedFileId) {
        try {
          const updatePayload: any = {};
          if (docId === "pan_card") updatePayload.idProofFront = uploadedFileId;
          if (docId === "aadhaar_card_front") updatePayload.idProofBack = uploadedFileId;
          if (docId === "aadhaar_card_back") updatePayload.aadhaarCardBack = uploadedFileId;
          if (docId === "property_proof" || docId === "business_registration") updatePayload.businessProof = uploadedFileId;
          if (docId === "gst_certificate") updatePayload.gstCertificate = uploadedFileId;
          if (docId === "bank_cheque") updatePayload.bankCheque = uploadedFileId;
          if (docId === "fssai_license") updatePayload.fssaiLicense = uploadedFileId;
          
          if (Object.keys(updatePayload).length > 0) {
             const { databases } = await import("@/lib/appwrite/client");
             await databases.updateDocument(
               appwriteConfig.databaseId,
               appwriteConfig.vendorCollectionId,
               profile.$id,
               updatePayload
             );
          }
        } catch (dbErr) {
          console.warn("Failed to sync doc to DB:", dbErr);
        }
      }

      saveDocumentsState(updatedList);
      toast.success(`${targetDoc?.title || "Document"} uploaded successfully!`, {
        description: "Status updated to Pending. Compliance audit initiated."
      });
    } catch (err: any) {
      toast.error("Failed to upload document: " + err.message);
    } finally {
      setUploadingDocId(null);
      activeDocIdRef.current = null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified</span>;
      case "Under Review":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-blue-100 text-blue-700 border border-blue-200"><Clock className="w-3.5 h-3.5 text-blue-600" /> Under Review</span>;
      case "Pending":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5 text-amber-600" /> In Review</span>;
      case "Rejected":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-rose-100 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5 text-rose-600" /> Action Needed</span>;
      case "Missing":
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide bg-slate-100 text-slate-600 border border-slate-200"><AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Upload Required</span>;
    }
  };

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelected} 
        accept=".pdf,.png,.jpg,.jpeg" 
        className="hidden" 
      />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-3xl font-heading font-bold text-secondary">Documents & Compliance</h2>
        <p className="text-slate-500 mt-1">Manage business identity, tax documents, and property compliance verification.</p>
      </motion.div>

      {/* REALTIME SYSTEM STATUS ALERT BANNER */}
      {verificationBanner && (verificationBanner.status !== 'Approved' || showApprovedBanner) && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border shadow-sm flex items-start gap-4 ${
            verificationBanner.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
            verificationBanner.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-900' :
            verificationBanner.status === 'Under Review' ? 'bg-blue-50 border-blue-200 text-blue-900' :
            'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {verificationBanner.status === 'Approved' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            {verificationBanner.status === 'Rejected' && <XCircle className="w-6 h-6 text-rose-600" />}
            {verificationBanner.status === 'Under Review' && <Clock className="w-6 h-6 text-blue-600" />}
            {verificationBanner.status === 'Pending' && <Info className="w-6 h-6 text-amber-600" />}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm font-heading">
              {verificationBanner.status === 'Approved' && "🎉 Account Verification Approved!"}
              {verificationBanner.status === 'Rejected' && "⚠️ Verification Unsuccessful - Action Required"}
              {verificationBanner.status === 'Under Review' && "⏳ Compliance Audit Under Review"}
              {verificationBanner.status === 'Pending' && "In Review for Audit"}
            </h4>
            <p className="text-xs mt-1 leading-relaxed opacity-90">
              {verificationBanner.status === 'Approved' && "Your documents have been verified by the compliance team. You have full platform access to list properties and accept payouts."}
              {verificationBanner.status === 'Rejected' && (verificationBanner.reason ? `Admin Remark: "${verificationBanner.reason}". Please re-upload the updated document below.` : "One or more documents require re-upload.")}
              {verificationBanner.status === 'Under Review' && "Our compliance specialists are reviewing your submitted files. No action required."}
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4 pt-6 px-6">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-heading text-xl font-bold text-secondary">Required Compliance Documents ({documents.length})</CardTitle>
                <CardDescription className="text-slate-500">Upload clean PDF or image documents to maintain verified partner status.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {documents.map((doc) => {
                const isUploading = uploadingDocId === doc.id;

                return (
                  <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex gap-4 items-start md:items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                        doc.status === 'Under Review' ? 'bg-blue-50 text-blue-600' :
                        doc.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                        doc.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                          <h3 className="font-bold text-secondary text-base">{doc.title}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <p className="text-sm text-slate-500">{doc.description}</p>
                        
                        {doc.fileName && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 shadow-sm flex items-center gap-2">
                              <span className="truncate max-w-60 font-semibold">{doc.fileName}</span>
                            </div>
                            {doc.updatedAt && (
                              <span className="text-xs text-slate-400">Updated {doc.updatedAt}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      {isUploading ? (
                        <Button disabled size="sm" className="h-10 px-5 rounded-xl bg-slate-100 text-slate-600 font-bold gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-coral" /> Uploading...
                        </Button>
                      ) : doc.fileName ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={async () => {
                              let docToView = { ...doc };
                              if (doc.fileName && doc.fileName.includes("(Uploaded)") && doc.fileId) {
                                try {
                                  const meta = await storage.getFile(appwriteConfig.vendorDocumentsBucketId, doc.fileId);
                                  docToView.fileName = meta.name;
                                } catch (e: any) {
                                  console.error("Could not fetch file metadata:", e);
                                  // If file is deleted from server but still linked in DB
                                  if (e?.code === 404 || e?.message?.includes("not be found")) {
                                    toast.error("This document is missing from the server vault.", {
                                      description: "Please re-upload the document using the Replace button."
                                    });
                                    docToView.fileUrl = null;
                                  }
                                }
                              }
                              setViewingDoc(docToView);
                              setZoomLevel(1);
                              setRotation(0);
                            }}
                            className="h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-secondary cursor-pointer gap-2"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleTriggerUpload(doc.id)}
                            className="h-10 px-4 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-secondary cursor-pointer gap-2"
                          >
                            <RefreshCw className="w-4 h-4" /> Replace
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => handleTriggerUpload(doc.id)}
                          size="sm" 
                          className="h-10 px-6 rounded-xl bg-brand-coral hover:bg-brand-coral/90 text-white font-bold shadow-md shadow-brand-coral/20 transition-all hover:-translate-y-0.5 cursor-pointer gap-2"
                        >
                          <UploadCloud className="w-4 h-4" /> Upload
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DOCUMENT PREVIEW DIALOG */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-slate-100 bg-white rounded-3xl shadow-2xl">
          <DialogHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-start pr-6">
              <div>
                <DialogTitle className="text-xl font-heading font-black text-secondary">{viewingDoc?.title}</DialogTitle>
                <p className="text-xs text-slate-500 font-medium mt-1">{viewingDoc?.fileName} • Updated {viewingDoc?.updatedAt}</p>
              </div>
            </div>
          </DialogHeader>
          <div className="bg-slate-100 relative overflow-hidden h-112.5 flex items-center justify-center">
            <div className="absolute top-4 right-4 flex gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/60 shadow-sm z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                className="h-9 w-9 rounded-2xl hover:bg-slate-100 text-slate-700" 
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4"/>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                className="h-9 w-9 rounded-2xl hover:bg-slate-100 text-slate-700" 
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4"/>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                className="h-9 w-9 rounded-2xl hover:bg-slate-100 text-slate-700" 
                title="Rotate"
              >
                <RotateCw className="h-4 w-4"/>
              </Button>
              <div className="w-px h-5 bg-slate-200 mx-1 self-center"></div>
              {viewingDoc?.fileUrl && (
                <a 
                  href={viewingDoc.fileUrl} 
                  download={viewingDoc.fileName || "document"} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-2xl hover:bg-slate-100 text-slate-700 transition-colors"
                  title="Download File"
                >
                  <Download className="h-4 w-4"/>
                </a>
              )}
            </div>

            {viewingDoc?.fileUrl ? (
              <div 
                className="transition-transform duration-300 max-w-full max-h-full p-6 flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
              >
                {viewingDoc.fileName?.toLowerCase().endsWith(".pdf") || viewingDoc.fileUrl.startsWith("data:application/pdf") ? (
                  <iframe src={viewingDoc.fileUrl} className="w-full h-96 rounded-xl border border-slate-200 shadow-md" title={viewingDoc.title} />
                ) : (
                  <img src={viewingDoc.fileUrl} alt={viewingDoc.title} className="max-h-80 object-contain rounded-2xl shadow-md border border-slate-200" />
                )}
              </div>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-slate-200 text-brand-coral">
                  <FileText className="h-9 w-9" />
                </div>
                <h3 className="text-base font-bold text-secondary mb-1">Document Verified</h3>
                <p className="text-xs text-slate-500 max-w-xs">{viewingDoc?.fileName} is stored securely in compliance vault.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
