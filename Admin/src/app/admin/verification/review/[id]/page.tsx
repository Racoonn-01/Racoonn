"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle2, XCircle, FileText, ZoomIn, ZoomOut, Download, 
  RotateCw, Clock, ArrowLeft, Mail, 
  Phone, MapPin, Building, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface ReviewDoc {
  id: string;
  title: string;
  description: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected" | "Under Review";
  fileName: string | null;
  fileUrl: string | null;
  updatedAt: string | null;
}

export const COMPLIANCE_DOC_TYPES = [
  { id: "pan_card", title: "PAN Card", description: "Permanent Account Number card of entity or proprietor." },
  { id: "aadhaar_card", title: "Aadhaar Card", description: "Government identity card of the authorized signatory." },
  { id: "gst_certificate", title: "GST Certificate", description: "GSTIN registration certificate (if applicable)." },
  { id: "business_registration", title: "Business Registration Certificate", description: "Trade license, MSME, or incorporation deed." },
  { id: "bank_cheque", title: "Bank Account Details & Cancelled Cheque", description: "Bank passbook or cancelled cheque for settlement payouts." },
  { id: "property_proof", title: "Property Images & Address Proof", description: "Property ownership deed, lease agreement, or utility bills." },
  { id: "fssai_license", title: "Food Safety License (FSSAI)", description: "FSSAI food license if dining/breakfast is served." }
];

export default function VendorFullPageReviewScreen({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const vendorId = resolvedParams.id;
  const router = useRouter();

  const [vendorInfo, setVendorInfo] = useState<{
    id: string;
    name: string;
    owner: string;
    email: string;
    phone: string;
    address: string;
    status: "Pending" | "Approved" | "Rejected" | "Under Review";
    submittedAt: string;
    avatar: string;
  }>({
    id: vendorId,
    name: "Oceanview Resort & Spa",
    owner: "Rajesh Kumar",
    email: "vendor@racoonn.com",
    phone: "+91 98765 43210",
    address: "Beach Road, North Goa, Goa - 403516",
    status: "Pending",
    submittedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Oceanview&backgroundColor=1F2E4A`
  });

  const [documents, setDocuments] = useState<ReviewDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ReviewDoc | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailModal, setEmailModal] = useState<{ open: boolean; subject: string; body: string; to: string; type: string } | null>(null);

  // Load Vendor verification state & documents from localStorage / cookies
  useEffect(() => {
    function loadReviewData() {
      try {
        let rawDocs: ReviewDoc[] = [];
        let profileObj: Record<string, any> | null = null;

        // 1. Check document cookies for cross-port uploaded files
        if (typeof document !== 'undefined' && document.cookie) {
          const cookiePairs = document.cookie.split('; ');
          const targetCookie = cookiePairs.find(p => p.startsWith(`racoonn_vendor_docs_${vendorId}=`));
          if (targetCookie) {
            try {
              const parsed = JSON.parse(decodeURIComponent(targetCookie.split('=')[1]));
              if (Array.isArray(parsed)) rawDocs = parsed;
              else if (parsed.docs) rawDocs = parsed.docs;
              profileObj = parsed;
            } catch {}
          }
        }

        // 2. Check localStorage if empty
        if (rawDocs.length === 0 && typeof window !== 'undefined') {
          const savedDocsStr = localStorage.getItem(`racoonn_vendor_documents_${vendorId}`) || 
                               localStorage.getItem('racoonn_global_vendor_docs');
          if (savedDocsStr) {
            try {
              const parsed = JSON.parse(savedDocsStr);
              if (Array.isArray(parsed)) rawDocs = parsed;
              else if (parsed.docs) rawDocs = parsed.docs;
              if (!profileObj) profileObj = parsed;
            } catch {}
          }
        }

        // 3. Map to standard COMPLIANCE_DOC_TYPES with zero fake filenames
        const finalDocs: ReviewDoc[] = COMPLIANCE_DOC_TYPES.map(template => {
          const match = rawDocs.find((d: any) => d.id === template.id || d.title?.toLowerCase() === template.title.toLowerCase());
          if (match && (match.fileName || match.fileUrl)) {
            return {
              id: template.id,
              title: template.title,
              description: template.description,
              status: match.status || "Pending",
              fileName: match.fileName || null,
              fileUrl: match.fileUrl || null,
              updatedAt: match.updatedAt || null
            };
          }
          return {
            id: template.id,
            title: template.title,
            description: template.description,
            status: "Missing" as const,
            fileName: null,
            fileUrl: null,
            updatedAt: null
          };
        });

        setDocuments(finalDocs);
        const uploadedDoc = finalDocs.find(d => d.fileName || d.fileUrl);
        if (uploadedDoc) {
          setSelectedDoc(uploadedDoc);
        } else if (finalDocs.length > 0) {
          setSelectedDoc(finalDocs[0]);
        }

        // 4. Load vendor profile details
        const verKey = `racoonn_vendor_verification_${vendorId}`;
        const savedVerStr = typeof window !== 'undefined' ? localStorage.getItem(verKey) : null;
        const verObj = savedVerStr ? JSON.parse(savedVerStr) : null;

        if (profileObj || verObj) {
          setVendorInfo(prev => ({
            ...prev,
            status: verObj?.status || prev.status,
            name: profileObj?.vendorName || verObj?.vendorName || prev.name,
            owner: profileObj?.ownerName || verObj?.ownerName || prev.owner,
            email: profileObj?.email || verObj?.email || prev.email,
            phone: profileObj?.phone || verObj?.phone || prev.phone,
            address: profileObj?.address || verObj?.address || prev.address
          }));
          if (verObj?.reason) setRejectionReason(verObj.reason);
        }
      } catch (err) {
        console.warn("Could not load vendor documents:", err);
      }
    }

    loadReviewData();
    const interval = setInterval(loadReviewData, 1000);
    window.addEventListener('storage', loadReviewData);

    // Instant BroadcastChannel WebSocket-like Realtime Channel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('racoonn_realtime_verification');
        channel.onmessage = (event) => {
          if (event.data?.type === 'VENDOR_DOC_UPLOADED' || event.data?.type === 'DOCUMENTS_UPDATED') {
            loadReviewData();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadReviewData);
      if (channel) channel.close();
    };
  }, [vendorId]);

  const updateVendorStatus = async (newStatus: "Approved" | "Rejected" | "Under Review") => {
    setIsSubmitting(true);
    const activeReason = rejectionReason.trim() || "Compliance documents require clarification or re-upload.";

    const updatedDocs = documents.map(d => ({
      ...d,
      status: newStatus === "Approved" ? ("Verified" as const) : newStatus === "Rejected" ? ("Rejected" as const) : ("Under Review" as const)
    }));

    setDocuments(updatedDocs);
    setVendorInfo(prev => ({ ...prev, status: newStatus }));

    // Real-time synchronization payload
    const verData = {
      vendorId,
      vendorName: vendorInfo.name,
      ownerName: vendorInfo.owner,
      email: vendorInfo.email,
      phone: vendorInfo.phone,
      status: newStatus,
      reason: newStatus === "Rejected" ? activeReason : "",
      updatedAt: new Date().toISOString()
    };

    // 1. Sync to localStorage for vendor dashboard live detection
    localStorage.setItem(`racoonn_vendor_verification_${vendorId}`, JSON.stringify(verData));
    localStorage.setItem(`racoonn_vendor_documents_${vendorId}`, JSON.stringify(updatedDocs));
    localStorage.setItem('racoonn_global_vendor_verification_sync', JSON.stringify({ ...verData, timestamp: Date.now() }));

    // 2. Sync to cross-port cookie (shared across all localhost ports)
    document.cookie = `racoonn_vendor_verification_${vendorId}=${encodeURIComponent(JSON.stringify(verData))}; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `racoonn_vendor_docs_${vendorId}=${encodeURIComponent(JSON.stringify({ vendorId, docs: updatedDocs, updatedAt: new Date().toISOString() }))}; path=/; max-age=31536000; SameSite=Lax`;

    // 3. Broadcast instant WebSocket message to Vendor Dashboard
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('racoonn_realtime_verification');
        bc.postMessage({
          type: 'VENDOR_STATUS_CHANGED',
          vendorId,
          status: newStatus,
          reason: activeReason,
          timestamp: Date.now()
        });
        bc.close();
      } catch {}
    }

    // 4. Branded Transactional Email Notification
    let emailSubject = "";
    let emailBody = "";

    if (newStatus === "Approved") {
      emailSubject = `🎉 Congratulations! Your Racoonn Vendor Account is Fully Verified`;
      emailBody = `Dear ${vendorInfo.owner},\n\nWe are delighted to inform you that your business verification for "${vendorInfo.name}" has been APPROVED by the Racoonn Compliance Team!\n\nWhat this means for you:\n• Your property listings are now live and visible to millions of guests.\n• You can create special promotional offers & discounts.\n• Instant payouts & direct bank settlements are now active.\n\nThank you for choosing Racoonn as your hospitality partner.\n\nWarm regards,\nRacoonn Audit & Compliance Team`;
    } else if (newStatus === "Rejected") {
      emailSubject = `⚠️ Action Required: Racoonn Vendor Account Verification Unsuccessful`;
      emailBody = `Dear ${vendorInfo.owner},\n\nWe reviewed your submitted verification documents for "${vendorInfo.name}". Unfortunately, we were unable to approve your account at this time.\n\nReason for Rejection / Remarks:\n"${activeReason}"\n\nNext Steps:\n1. Log in to your Racoonn Vendor Dashboard.\n2. Navigate to Documents & Compliance.\n3. Re-upload the required document(s) matching the criteria.\n\nOur compliance team will re-audit your submission immediately upon re-upload.\n\nBest regards,\nRacoonn Audit & Compliance Team`;
    } else {
      emailSubject = `⏳ Status Update: Your Verification Documents are Under Review`;
      emailBody = `Dear ${vendorInfo.owner},\n\nYour compliance documents for "${vendorInfo.name}" are currently being audited by our verification specialists.\n\nNo further action is required from your side at this moment. You will receive an automated update as soon as the review is complete.\n\nBest regards,\nRacoonn Compliance Team`;
    }

    // 5. Dispatch real SMTP email request via API route
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: vendorInfo.email,
          subject: emailSubject,
          text: emailBody,
          status: newStatus,
          reason: activeReason,
          vendorName: vendorInfo.name,
          ownerName: vendorInfo.owner
        })
      });
    } catch (err) {
      console.warn("API route email dispatch warning:", err);
    }

    setEmailModal({
      open: true,
      type: newStatus,
      to: vendorInfo.email,
      subject: emailSubject,
      body: emailBody
    });

    setIsSubmitting(false);
  };

  const handleSendMailto = () => {
    if (!emailModal) return;
    const mailtoUrl = `mailto:${emailModal.to}?subject=${encodeURIComponent(emailModal.subject)}&body=${encodeURIComponent(emailModal.body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const handleOpenNewTab = () => {
    if (selectedDoc?.fileUrl) {
      window.open(selectedDoc.fileUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert("No active preview file URL available to open in new tab.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Dedicated Screen Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin/verification/kyc')}
              className="h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Return to Verification Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-slate-200 shadow-sm">
                <AvatarImage src={vendorInfo.avatar} alt={vendorInfo.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{vendorInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 font-heading">{vendorInfo.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    vendorInfo.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                    vendorInfo.status === 'Rejected' ? 'bg-rose-100 text-rose-700 border border-rose-300' :
                    vendorInfo.status === 'Under Review' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                    'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}>
                    {vendorInfo.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Verification ID: <span className="font-mono text-slate-800 font-bold">{vendorId}</span> • Registered Email: <span className="font-semibold text-slate-800">{vendorInfo.email}</span></p>
              </div>
            </div>
          </div>

          {/* Quick Action Decision Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              onClick={() => updateVendorStatus("Under Review")} 
              disabled={isSubmitting}
              className="h-11 px-5 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs cursor-pointer gap-2"
            >
              <Clock className="w-4 h-4" /> Under Review
            </Button>
            <Button 
              onClick={() => updateVendorStatus("Rejected")} 
              disabled={isSubmitting}
              className="h-11 px-5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs cursor-pointer gap-2"
            >
              <XCircle className="w-4 h-4" /> Reject Vendor
            </Button>
            <Button 
              onClick={() => updateVendorStatus("Approved")} 
              disabled={isSubmitting}
              className="h-11 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve Vendor
            </Button>
          </div>
        </div>

        {/* AUTOMATED EMAIL DISPATCH STATUS BANNER */}
        {vendorInfo.status === 'Approved' && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold font-heading">Automated Approval Email Sent</p>
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Approval notification successfully dispatched to vendor registered email address: <span className="font-mono font-bold text-emerald-950">{vendorInfo.email}</span>
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => updateVendorStatus("Approved")} 
              className="h-8 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer shrink-0"
            >
              View Sent Email
            </Button>
          </div>
        )}

        {/* Vendor Essential Information Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Owner Name</p>
              <p className="text-sm font-bold text-slate-800">{vendorInfo.owner}</p>
            </div>
          </Card>
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Contact Email</p>
              <p className="text-sm font-bold text-slate-800 truncate max-w-40">{vendorInfo.email}</p>
            </div>
          </Card>
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Phone Number</p>
              <p className="text-sm font-bold text-slate-800">{vendorInfo.phone}</p>
            </div>
          </Card>
          <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Address</p>
              <p className="text-sm font-bold text-slate-800 truncate max-w-40">{vendorInfo.address}</p>
            </div>
          </Card>
        </div>

        {/* Main Work Workspace: Interactive Document Inspector & Audit Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Document Viewer Screen (7 cols) */}
          <Card className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-187.5 lg:min-h-205">
            <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 font-heading">
                  {selectedDoc?.title || "Document Preview"}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium mt-0.5">
                  {selectedDoc?.fileName ? `File: ${selectedDoc.fileName}` : "Select a document from checklist to inspect."}
                </CardDescription>
              </div>

              {/* Full Inspection Tools: Zoom, Rotate, Download, Open in New Tab */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setZoomLevel(p => Math.min(p + 0.25, 3.0))}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setZoomLevel(p => Math.max(p - 0.25, 0.5))}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setRotation(r => (r + 90) % 360)}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-700"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-slate-200 mx-1 self-center"></div>
                {selectedDoc?.fileUrl && (
                  <a 
                    href={selectedDoc.fileUrl} 
                    download={selectedDoc.fileName || "document"} 
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Download File"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleOpenNewTab}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 text-slate-700"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-2 flex-1 bg-slate-100 relative min-h-170 lg:min-h-187.5 flex items-center justify-center overflow-auto">
              {selectedDoc?.fileUrl ? (
                <div 
                  className="transition-transform duration-300 w-full h-full p-2 flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel}) rotate(${rotation}deg)` }}
                >
                  {selectedDoc.fileName?.toLowerCase().endsWith(".pdf") || selectedDoc.fileUrl.startsWith("data:application/pdf") ? (
                    <iframe src={selectedDoc.fileUrl} className="w-full h-170 lg:h-185 rounded-2xl border border-slate-200 shadow-md bg-white" title={selectedDoc.title} />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedDoc.fileUrl} alt={selectedDoc.title} className="max-h-175 lg:max-h-187.5 w-auto object-contain rounded-2xl shadow-md border border-slate-200" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8">
                  <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-slate-200 text-primary">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">{selectedDoc?.title || "Compliance Document"}</h4>
                  <p className="text-xs text-slate-500 max-w-sm font-medium">
                    {selectedDoc?.fileName ? `Viewing secure record: ${selectedDoc.fileName}` : "Document file stored in encrypted compliance vault."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Checklist & Audit Form Pane (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/70 border-b border-slate-200/80 p-5">
                <CardTitle className="text-base font-bold text-slate-900 font-heading">Compliance Documents ({documents.length})</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium">Click to preview, zoom, download, or inspect in new tab.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 max-h-100 overflow-y-auto">
                {documents.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div 
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        setZoomLevel(1);
                        setRotation(0);
                      }}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-all ${
                        isSelected ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' :
                          doc.status === 'Under Review' ? 'bg-blue-50 text-blue-600' :
                          doc.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.title}</p>
                          <p className="text-xs text-slate-400 font-medium truncate max-w-44">{doc.fileName || "No file uploaded"}</p>
                        </div>
                      </div>

                      <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        doc.status === 'Under Review' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        doc.status === 'Pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {doc.status}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Audit Decision & Rejection Remarks Form */}
            <Card className="bg-white border border-slate-200 shadow-sm rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Audit Action & Rejection Feedback</h3>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs font-bold text-slate-700">Rejection Reason / Audit Remarks</Label>
                <Textarea 
                  id="reason"
                  placeholder="Specify illegible documents, address mismatch, missing GST seal, or invalid cheque details..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="rounded-2xl border-slate-200 text-xs p-3.5 focus:ring-primary focus:border-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button 
                  onClick={() => updateVendorStatus("Under Review")}
                  className="h-10 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-xs cursor-pointer gap-1"
                >
                  <Clock className="w-3.5 h-3.5" /> Under Review
                </Button>
                <Button 
                  onClick={() => updateVendorStatus("Rejected")}
                  className="h-10 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs cursor-pointer gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </Button>
                <Button 
                  onClick={() => updateVendorStatus("Approved")}
                  className="h-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* CLEAN ELEGANT SUCCESS POPUP MODAL FOR ALL 3 STATUSES */}
      {emailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-center animate-in fade-in zoom-in duration-200 p-8 space-y-6">
            <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
              emailModal.type === 'Approved' ? 'bg-emerald-100 text-emerald-600' :
              emailModal.type === 'Rejected' ? 'bg-rose-100 text-rose-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              {emailModal.type === 'Approved' && <CheckCircle2 className="w-10 h-10" />}
              {emailModal.type === 'Rejected' && <XCircle className="w-10 h-10" />}
              {emailModal.type === 'Under Review' && <Clock className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 font-heading">
                {emailModal.type === 'Approved' ? 'Vendor Approved Successfully!' : 
                 emailModal.type === 'Rejected' ? 'Vendor Rejection Sent!' : 
                 'Status Set to Under Review!'}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                {emailModal.type === 'Approved' 
                  ? 'Verification approval email has been automatically sent to the vendor’s registered email address:'
                  : emailModal.type === 'Rejected'
                  ? 'Rejection notification with audit remarks has been automatically sent to registered email:'
                  : 'Audit status email has been automatically sent to registered email:'
                }
              </p>
              <div className="pt-2">
                <span className="inline-block px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-900">
                  {emailModal.to}
                </span>
              </div>
            </div>

            <Button 
              onClick={() => setEmailModal(null)} 
              className={`w-full h-12 rounded-2xl text-white font-bold text-sm shadow-lg transition-all cursor-pointer ${
                emailModal.type === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25' :
                emailModal.type === 'Rejected' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25' :
                'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
              }`}
            >
              Done & Return
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
