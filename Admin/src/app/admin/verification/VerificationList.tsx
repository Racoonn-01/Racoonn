"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, ExternalLink, Mail, Phone, Loader2, Inbox } from "lucide-react"
import { useRouter } from "next/navigation"
import { Client } from "appwrite"

export interface ReviewDoc {
  id: string;
  title: string;
  description: string;
  status: "Verified" | "Pending" | "Missing" | "Rejected" | "Under Review";
  fileName: string | null;
  fileUrl: string | null;
  updatedAt: string | null;
}

export interface RealtimeVendorRequest {
  id: string;
  vendor: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "under review";
  date: string;
  uploadedCount: number;
  avatar: string;
  documents: ReviewDoc[];
}

export default function VerificationList({ type }: { type?: string }) {
  const [requests, setRequests] = useState<RealtimeVendorRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Appwrite Realtime WebSockets & Storage Sync Loader
  useEffect(() => {
    function loadRealtimeVendorDocs() {
      try {
        const detectedVendors = new Map<string, RealtimeVendorRequest>();

        // 1. Scan document.cookie for cross-port uploaded vendor docs
        if (typeof document !== 'undefined' && document.cookie) {
          const cookiePairs = document.cookie.split('; ');
          cookiePairs.forEach(pair => {
            const [key, val] = pair.split('=');
            if (key && key.startsWith('racoonn_vendor_docs_')) {
              const vendorId = key.replace('racoonn_vendor_docs_', '');
              try {
                const parsed = JSON.parse(decodeURIComponent(val));
                const rawDocs: ReviewDoc[] = Array.isArray(parsed) ? parsed : parsed.docs || [];
                const uploadedDocs = rawDocs.filter(d => d.fileName || d.status !== 'Missing');
                
                if (uploadedDocs.length > 0) {
                  let vendorName = parsed.vendorName || "Registered Vendor Partner";
                  let ownerName = parsed.ownerName || "Property Owner";
                  let email = parsed.email || "vendor@racoonn.com";
                  let phone = parsed.phone || "+91 98765 43210";
                  const address = parsed.address || "Registered Business Address";
                  let status: "pending" | "approved" | "rejected" | "under review" = "pending";

                  const verCookie = cookiePairs.find(p => p.startsWith(`racoonn_vendor_verification_${vendorId}=`));
                  if (verCookie) {
                    try {
                      const verObj = JSON.parse(decodeURIComponent(verCookie.split('=')[1]));
                      if (verObj.status) status = verObj.status.toLowerCase() as "pending" | "approved" | "rejected" | "under review";
                      if (verObj.vendorName) vendorName = verObj.vendorName;
                      if (verObj.ownerName) ownerName = verObj.ownerName;
                      if (verObj.email) email = verObj.email;
                      if (verObj.phone) phone = verObj.phone;
                    } catch {}
                  }

                  const primaryDoc = uploadedDocs[0]?.title || "GST & Business Registration";
                  const submissionDate = uploadedDocs[0]?.updatedAt || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

                  detectedVendors.set(vendorId, {
                    id: vendorId,
                    vendor: vendorName,
                    owner: ownerName,
                    email: email,
                    phone: phone,
                    address: address,
                    type: primaryDoc,
                    status,
                    date: submissionDate,
                    uploadedCount: uploadedDocs.length,
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vendorName)}&backgroundColor=1F2E4A`,
                    documents: rawDocs
                  });
                }
              } catch {}
            }
          });
        }

        // 2. Scan localStorage for same-origin uploads
        if (typeof window !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key) continue;

            if (key.startsWith('racoonn_vendor_documents_')) {
              const vendorId = key.replace('racoonn_vendor_documents_', '');
              const docsStr = localStorage.getItem(key);
              if (!docsStr) continue;

              try {
                const parsedDocs: ReviewDoc[] = JSON.parse(docsStr);
                const uploadedDocs = parsedDocs.filter(d => d.fileName || d.status !== 'Missing');
                if (uploadedDocs.length > 0 && !detectedVendors.has(vendorId)) {
                  const profStr = localStorage.getItem(`racoonn_vendor_profile_${vendorId}`) || localStorage.getItem('racoonn_global_vendor_docs');
                  let vendorName = "Registered Vendor Partner";
                  let ownerName = "Property Owner";
                  let email = "vendor@racoonn.com";
                  let phone = "+91 98765 43210";
                  let address = "Registered Address";

                  if (profStr) {
                    try {
                      const profObj = JSON.parse(profStr);
                      if (profObj.vendorName) vendorName = profObj.vendorName;
                      if (profObj.ownerName) ownerName = profObj.ownerName;
                      if (profObj.email) email = profObj.email;
                      if (profObj.phone) phone = profObj.phone;
                      if (profObj.address) address = profObj.address;
                    } catch {}
                  }

                  const verKey = `racoonn_vendor_verification_${vendorId}`;
                  const verStr = localStorage.getItem(verKey);
                  let status: "pending" | "approved" | "rejected" | "under review" = "pending";
                  if (verStr) {
                    const verObj = JSON.parse(verStr);
                    if (verObj.status) status = verObj.status.toLowerCase() as "pending" | "approved" | "rejected" | "under review";
                  }

                  const primaryDoc = uploadedDocs[0]?.title || "Compliance Documents";
                  const submissionDate = uploadedDocs[0]?.updatedAt || new Date().toLocaleDateString();

                  detectedVendors.set(vendorId, {
                    id: vendorId,
                    vendor: vendorName,
                    owner: ownerName,
                    email: email,
                    phone: phone,
                    address: address,
                    type: primaryDoc,
                    status,
                    date: submissionDate,
                    uploadedCount: uploadedDocs.length,
                    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vendorName)}&backgroundColor=1F2E4A`,
                    documents: parsedDocs
                  });
                }
              } catch {}
            }
          }
        }

        // Deduplicate vendors by vendor name & email to prevent duplicate cards
        const uniqueVendorsMap = new Map<string, RealtimeVendorRequest>();
        detectedVendors.forEach((v) => {
          const uniqueKey = `${v.vendor.toLowerCase().trim()}_${v.email.toLowerCase().trim()}`;
          if (!uniqueVendorsMap.has(uniqueKey)) {
            uniqueVendorsMap.set(uniqueKey, v);
          }
        });

        const vendorList = Array.from(uniqueVendorsMap.values());

        // Apply Tab Filtering
        let filtered = vendorList;
        if (type === 'approved') {
          filtered = vendorList.filter(r => r.status === 'approved');
        } else if (type === 'rejected') {
          filtered = vendorList.filter(r => r.status === 'rejected');
        } else if (type === 'pending') {
          filtered = vendorList.filter(r => r.status === 'pending' || r.status === 'under review');
        }

        setRequests(filtered);
      } catch (err) {
        console.error("Failed to load realtime vendor documents:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRealtimeVendorDocs();
    const interval = setInterval(loadRealtimeVendorDocs, 1000);
    window.addEventListener('storage', loadRealtimeVendorDocs);

    // Instant BroadcastChannel WebSocket-like Realtime Channel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel('racoonn_realtime_verification');
        channel.onmessage = (event) => {
          if (event.data?.type === 'VENDOR_DOC_UPLOADED' || event.data?.type === 'DOCUMENTS_UPDATED') {
            loadRealtimeVendorDocs();
          }
        };
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    // Appwrite Realtime WebSocket subscription listener setup
    let appwriteUnsubscribe: (() => void) | undefined;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a3bce6900381359c3ce";
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const vendorColId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "6a3e0fd9da7df0d38588";

    if (projectId && dbId && vendorColId) {
      try {
        const client = new Client().setEndpoint(endpoint).setProject(projectId);
        appwriteUnsubscribe = client.subscribe(
          `databases.${dbId}.collections.${vendorColId}.documents`,
          () => {
            loadRealtimeVendorDocs();
          }
        );
      } catch (err) {
        console.warn("Appwrite Realtime WebSocket subscription notice:", err);
      }
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadRealtimeVendorDocs);
      if (appwriteUnsubscribe) appwriteUnsubscribe();
      if (channel) channel.close();
    };
  }, [type]);

  const handleNavigateToReviewPage = (vendorId: string) => {
    router.push(`/admin/verification/review/${vendorId}`);
  };

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card/60 backdrop-blur-md rounded-2xl border border-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Connecting to Appwrite Realtime & loading vendor documents...</p>
      </div>
    );
  }

  // EMPTY REALTIME STATE
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card/60 backdrop-blur-md rounded-2xl border border-muted/30 text-center">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold font-heading text-foreground">No verification requests found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          When vendors upload compliance files in their dashboard, their profile and documents will automatically appear here in real time.
        </p>
      </div>
    );
  }

  // REALTIME LIST GRID VIEW
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((req) => (
        <Card 
          key={req.id} 
          className="group bg-card/60 backdrop-blur-md border-muted/30 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
          onClick={() => handleNavigateToReviewPage(req.id)}
        >
          <div className={`h-2 w-full ${
            req.status === 'approved' ? 'bg-emerald-500' :
            req.status === 'rejected' ? 'bg-rose-500' :
            req.status === 'under review' ? 'bg-blue-500' :
            'bg-amber-500/80'
          }`}></div>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-background shadow-sm">
                  <AvatarImage src={req.avatar} alt={req.vendor} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{req.vendor.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{req.vendor}</CardTitle>
                  <p className="text-xs font-semibold text-muted-foreground">Owner: {req.owner}</p>
                </div>
              </div>
              <Badge className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                req.status === 'rejected' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                req.status === 'under review' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}>
                {req.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col flex-1 space-y-4">
            <div className="space-y-1 bg-muted/20 p-3 rounded-xl border border-muted/10">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-semibold"><FileText className="w-3.5 h-3.5 text-primary" /> {req.type}</span>
                <span className="font-mono text-[11px] font-bold">{req.uploadedCount} Docs</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-muted/20">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {req.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {req.phone}</span>
              </div>
            </div>

            <div className="mt-auto">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigateToReviewPage(req.id);
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white h-10 px-4 py-2 transition-all cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Review Vendor Profile & Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
