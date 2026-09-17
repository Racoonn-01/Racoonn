"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, ExternalLink, Mail, Phone, Loader2, Inbox } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Client, Databases, Query } from "appwrite"

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
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  // Appwrite Realtime WebSockets & Storage Sync Loader
  useEffect(() => {
    let isMounted = true;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a3bce6900381359c3ce";
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const vendorColId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "6a3e0fd9da7df0d38588";
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "6a3e398000280b2b3d20";

    const client = new Client().setEndpoint(endpoint).setProject(projectId);
    const databases = new Databases(client);

    async function loadRealtimeVendorDocs() {
      try {
        const response = await databases.listDocuments(dbId, vendorColId, [
          Query.orderDesc("$updatedAt"),
          Query.limit(100)
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const vendorList: RealtimeVendorRequest[] = response.documents.map((doc: any) => {
          const ownerName = `${doc.firstName || ''} ${doc.lastName || ''}`.trim() || "Property Owner";
          const vendorName = doc.businessName || ownerName || "Vendor Partner";
          // Check Appwrite document fields
          let uploadedCount = [doc.idProofFront, doc.idProofBack, doc.businessProof, doc.bankCheque].filter(Boolean).length;
          
          // Fallback to legacy/sync cookies if count is 0
          if (uploadedCount === 0 && typeof document !== 'undefined') {
            const cookiePairs = document.cookie.split('; ');
            const targetCookie = cookiePairs.find(p => p.startsWith(`racoonn_vendor_docs_${doc.$id}=`));
            if (targetCookie) {
              try {
                const parsed = JSON.parse(decodeURIComponent(targetCookie.split('=')[1]));
                const docsArr = Array.isArray(parsed) ? parsed : (parsed.docs || []);
                uploadedCount = docsArr.filter((d: { fileUrl?: string; fileName?: string }) => d.fileUrl || d.fileName).length;
              } catch {}
            }
          }
          
          let avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(vendorName)}&backgroundColor=1F2E4A`;
          if (doc.profileImage) {
             avatarUrl = `${endpoint}/storage/buckets/${bucketId}/files/${doc.profileImage}/view?project=${projectId}`;
          }

          let docStatus = "pending";
          if (doc.status) {
            docStatus = doc.status.toLowerCase();
          }

          return {
            id: doc.$id,
            vendor: vendorName,
            owner: ownerName,
            email: doc.email || "No Email",
            phone: doc.phone || "No Phone",
            address: doc.address || "No Address",
            type: doc.bizType === "individual" ? "Individual/Proprietor" : "Company/Business",
            status: docStatus as RealtimeVendorRequest["status"],
            date: new Date(doc.$updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
            uploadedCount: uploadedCount,
            avatar: avatarUrl,
            documents: []
          };
        });

        if (!isMounted) return;

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
        console.error("Failed to load vendors from Appwrite:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadRealtimeVendorDocs();

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
      isMounted = false;
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
      <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Connecting to Appwrite Realtime & loading vendor documents...</p>
      </div>
    );
  }

  // EMPTY REALTIME STATE
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-card rounded-2xl border border-muted/30 text-center">
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

  // Filter requests based on search query
  const filteredRequests = requests.filter(req => {
    if (!searchQuery) return true;
    return req.vendor.toLowerCase().includes(searchQuery) || 
           req.email.toLowerCase().includes(searchQuery) ||
           req.owner.toLowerCase().includes(searchQuery);
  });

  // REALTIME LIST GRID VIEW
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredRequests.map((req) => (
        <Card 
          key={req.id} 
          className="group bg-card border-muted/30 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
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
