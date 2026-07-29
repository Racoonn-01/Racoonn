"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Search, 
  MoreHorizontal, 
  UserX, 
  UserCheck, 
  Trash2, 
  Eye, 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp,
  Filter,
  Plus,
  FileText
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuGroup } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { client, appwriteConfig } from "@/lib/appwrite/client"
import { Databases, Query } from "appwrite"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface VendorData {
  id: string;
  name: string;
  email: string;
  properties: number;
  revenue: string;
  status: string;
  joined: string;
}

export interface VendorsKPI {
  totalVendors: number;
  activeProperties: number;
  totalPayouts: string;
  pendingApproval: number;
  newVendorsThisWeek: number;
  newPropertiesThisWeek: number;
}

interface VendorsClientProps {
  vendors: VendorData[];
  kpi: VendorsKPI;
}

export default function VendorsClient({ vendors: initialVendors, kpi }: VendorsClientProps) {
  const [vendors, setVendors] = useState<VendorData[]>(initialVendors);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [selectedGstVendor, setSelectedGstVendor] = useState<VendorData | null>(null);
  const [isSendingGst, setIsSendingGst] = useState(false);
  
  // Bookings state for GST invoice
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const handleOpenGstModal = async (vendor: VendorData) => {
    setSelectedGstVendor(vendor);
    setSelectedBookingIds([]);
    setVendorBookings([]);
    setIsGstModalOpen(true);
    
    // Fetch bookings for this vendor
    try {
      setIsLoadingBookings(true);
      const db = new Databases(client);
      const dbId = appwriteConfig.databaseId;
      
      // 1. Get properties for this vendor
      const propsRes = await db.listDocuments(
        dbId,
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties',
        [Query.equal('vendorId', vendor.id), Query.limit(100)]
      );
      
      const propertyIds = propsRes.documents.map(p => p.$id);
      
      if (propertyIds.length > 0) {
        // 2. Get bookings for these properties
        const bookingsRes = await db.listDocuments(
          dbId,
          'bookings',
          [Query.equal('hotelId', propertyIds), Query.orderDesc('$createdAt'), Query.limit(100)]
        );
        
        // 3. Get payments to calculate gross amount
        const bookingIds = bookingsRes.documents.map(b => b.$id);
        let paymentsRes = { documents: [] as any[] };
        
        if (bookingIds.length > 0) {
          paymentsRes = await db.listDocuments(
            dbId,
            'booking_payments',
            [Query.equal('bookingId', bookingIds), Query.limit(100)]
          );
        }
        
        const mapped = bookingsRes.documents.map(b => {
          const payment = paymentsRes.documents.find(p => p.bookingId === b.$id);
          const gross = payment ? Number(payment.totalAmount || 0) : 12000;
          const fee = Math.round((gross * 18) / 100); // 18% platform fee
          return {
            id: b.$id,
            hotelName: b.hotelName || "Property",
            checkIn: new Date(b.checkIn).toLocaleDateString(),
            checkOut: new Date(b.checkOut).toLocaleDateString(),
            grossAmount: gross,
            platformFee: fee,
            status: b.status
          };
        });
        
        // Filter out non-completed bookings (optional, but usually GST is sent on completed/paid bookings)
        // We'll just show all so admin can decide
        setVendorBookings(mapped);
      }
    } catch (err) {
      console.error("Error fetching vendor bookings", err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleToggleBooking = (id: string) => {
    setSelectedBookingIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const toggleAllBookings = () => {
    if (selectedBookingIds.length === vendorBookings.length && vendorBookings.length > 0) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(vendorBookings.map(b => b.id));
    }
  };

  const selectedBookingsTotalFee = vendorBookings
    .filter(b => selectedBookingIds.includes(b.id))
    .reduce((sum, b) => sum + b.platformFee, 0);

  const handleSendGstInvoice = async () => {
    if (!selectedGstVendor || selectedBookingIds.length === 0) return;
    setIsSendingGst(true);
    
    const baseAmount = selectedBookingsTotalFee;
    const taxAmt = baseAmount * 0.24;
    const totalAmount = baseAmount + taxAmt;
    
    // Format line items
    const selectedBookingsItems = vendorBookings
      .filter(b => selectedBookingIds.includes(b.id))
      .map(b => ({
        id: `fee-${b.id}`,
        description: `Platform Fee (18%) for Booking #${b.id.substring(0, 8)} at ${b.hotelName}`,
        quantity: 1,
        unitPrice: b.platformFee,
        amount: b.platformFee,
        bookingId: b.id
      }));
    
    const invoiceObj = {
      id: `inv-admin-${Date.now()}`,
      invoiceNumber: `RAC-GST-${Date.now()}`,
      type: "billing",
      vendorId: selectedGstVendor.id,
      vendorName: selectedGstVendor.name,
      vendorEmail: selectedGstVendor.email,
      vendorPhone: "",
      vendorAddress: "",
      vendorGstin: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: selectedBookingsItems,
      subtotal: baseAmount,
      taxRate: 24,
      taxAmount: taxAmt,
      totalAmount: totalAmount,
      status: "Sent",
      createdAt: new Date().toISOString(),
    };

    // Generate PDF Data URI for attachment
    let pdfDataUri = "";
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(79, 70, 229); // Indigo
      doc.text("Racoonn Platform", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("GST Invoice (Platform Services)", 14, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice Number: ${invoiceObj.invoiceNumber}`, 14, 45);
      doc.text(`Date: ${invoiceObj.issueDate}`, 14, 52);
      doc.text(`Status: ${invoiceObj.status}`, 14, 59);

      doc.setFontSize(14);
      doc.text("Billed To:", 14, 75);
      doc.setFontSize(10);
      doc.text(`Vendor: ${invoiceObj.vendorName}`, 14, 82);
      doc.text(`Email: ${invoiceObj.vendorEmail}`, 14, 88);

      const tableBody: any[] = selectedBookingsItems.map(item => [
        item.description,
        `INR ${item.amount.toLocaleString("en-IN")}`
      ]);
      
      tableBody.push(["", ""]);
      tableBody.push(["Platform Fees (Base Amount)", `INR ${baseAmount.toLocaleString("en-IN")}`]);
      tableBody.push(["GST (24%)", `INR ${taxAmt.toLocaleString("en-IN")}`]);
      tableBody.push(["Total Amount", `INR ${totalAmount.toLocaleString("en-IN")}`]);

      autoTable(doc, {
        startY: 100,
        head: [["Description", "Amount"]],
        body: tableBody,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }
      });
      
      pdfDataUri = doc.output("datauristring");
    } catch (e) {
      console.error("Error generating PDF invoice", e);
    }

    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceObj),
      });
      // Send email to vendor
      try {
        const payload: any = {
          to: selectedGstVendor.email,
          subject: `GST Invoice (24%) Generated - Racoonn Platform`,
          text: `Dear ${selectedGstVendor.name},\n\nA GST Invoice for platform services has been generated. Total Amount: ₹${totalAmount.toLocaleString('en-IN')}.\n\nThank you,\nRacoonn Admin`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #4f46e5;">GST Invoice Generated</h2>
              <p>Dear <strong>${selectedGstVendor.name}</strong>,</p>
              <p>A new GST invoice has been generated for platform services (18% Commission + 24% GST) regarding your recent bookings.</p>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Invoice Reference:</strong> ${invoiceObj.invoiceNumber}</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 10px 0;" />
                <h3 style="margin: 10px 0; font-size: 14px; color: #374151;">Selected Bookings</h3>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px; color: #4b5563;">
                  ${selectedBookingsItems.map(item => `<li>${item.description}: <strong>₹${item.amount.toLocaleString('en-IN')}</strong></li>`).join('')}
                </ul>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 10px 0;" />
                <p style="margin: 5px 0;"><strong>Base Amount (Platform Fees):</strong> ₹${baseAmount.toLocaleString('en-IN')}</p>
                <p style="margin: 5px 0;"><strong>GST (24%):</strong> ₹${taxAmt.toLocaleString('en-IN')}</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 10px 0;" />
                <p style="margin: 5px 0; font-size: 18px; color: #10b981;"><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <p>The PDF invoice is attached to this email.</p>
              <p>You can also view the full details in your vendor dashboard.</p>
              <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">Thank you for partnering with Racoonn!</p>
            </div>
          `
        };

        if (pdfDataUri) {
          payload.attachments = [
            {
              filename: `${invoiceObj.invoiceNumber}.pdf`,
              path: pdfDataUri
            }
          ];
        }

        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (emailErr) {
        console.error("Failed to send GST invoice email", emailErr);
      }

      setIsGstModalOpen(false);
    } catch (err) {
      console.error("Failed to send GST invoice", err);
      alert("Failed to send GST invoice");
    } finally {
      setIsSendingGst(false);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesTab = activeTab === "all" || vendor.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleUpdateStatus = async (vendorId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/vendors/${vendorId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      // Update local state
      setVendors(prev => prev.map(v => 
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));

      if (selectedVendor && selectedVendor.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status: newStatus });
      }
      
    } catch (error) {
      console.error(error);
      alert("Error updating vendor status");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active' || s === 'approved') return { variant: 'default' as const, classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    if (s === 'suspended' || s === 'blocked') return { variant: 'destructive' as const, classes: 'bg-red-500/10 text-red-600 border-red-500/20' };
    return { variant: 'secondary' as const, classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">Vendor Management</h2>
          <p className="text-muted-foreground mt-1 text-lg">Oversee all your partners, properties, and revenue shares.</p>
        </div>
        <Button className="h-11 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-5 w-5" /> Invite New Vendor
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-3xl font-bold">{kpi.totalVendors}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" /> +{kpi.newVendorsThisWeek} this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Properties</p>
                <p className="text-3xl font-bold">{kpi.activeProperties}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-emerald-500 font-medium">
              <TrendingUp className="mr-1 h-4 w-4" /> +{kpi.newPropertiesThisWeek} new this week
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue (YTD)</p>
                <p className="text-3xl font-bold">{kpi.totalPayouts}</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-muted-foreground">
              Across all vendors
            </div>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-card to-card/50 border-muted/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold">{kpi.pendingApproval}</p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <UserCheck className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-amber-500 font-medium">
              Requires your attention
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="rounded-2xl border bg-card/40 shadow-sm backdrop-blur-xl overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search vendors by name or email..." 
                className="w-full pl-9 bg-background border-muted-foreground/20 rounded-full h-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <div className="flex p-1 bg-muted/50 rounded-full">
              {['all', 'active', 'pending', 'suspended'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-full border-muted-foreground/20">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold h-12">Vendor Info</TableHead>
                <TableHead className="font-semibold h-12">Properties</TableHead>
                <TableHead className="font-semibold h-12">Revenue (YTD)</TableHead>
                <TableHead className="font-semibold h-12">Status</TableHead>
                <TableHead className="font-semibold h-12">Joined Date</TableHead>
                <TableHead className="text-right font-semibold h-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => {
                const badgeStyle = getStatusBadge(vendor.status);
                return (
                  <TableRow key={vendor.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${vendor.name}&backgroundColor=E86A70`} alt={vendor.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">{vendor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{vendor.name}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">{vendor.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {vendor.properties}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">{vendor.revenue}</span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={badgeStyle.variant}
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeStyle.classes}`}
                      >
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(vendor.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 opacity-0 group-hover:opacity-100">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-muted/50">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="cursor-pointer rounded-md" onClick={() => setSelectedVendor(vendor)}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {vendor.status.toLowerCase() === 'active' || vendor.status.toLowerCase() === 'approved' ? (
                              <DropdownMenuItem 
                                className="text-orange-600 focus:text-orange-600 cursor-pointer rounded-md"
                                onClick={() => handleUpdateStatus(vendor.id, 'Suspended')}
                                disabled={isUpdating}
                              >
                                <UserX className="mr-2 h-4 w-4" /> Suspend Vendor
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="text-emerald-600 focus:text-emerald-600 cursor-pointer rounded-md"
                                onClick={() => handleUpdateStatus(vendor.id, 'Approved')}
                                disabled={isUpdating}
                              >
                                <UserCheck className="mr-2 h-4 w-4" /> Activate Vendor
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-indigo-600 focus:text-indigo-600 cursor-pointer rounded-md"
                              onClick={() => handleOpenGstModal(vendor)}
                            >
                              <FileText className="mr-2 h-4 w-4" /> Send 24% GST Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer rounded-md">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Vendor
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination/Footer */}
        <div className="p-4 border-t border-muted/30 bg-muted/5 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing 1 to {Math.min(filteredVendors.length, 100)} of {vendors.length} vendors</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="rounded-full h-8 px-4">Next</Button>
          </div>
        </div>
      </div>

      {/* Vendor Details Modal */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>Vendor Details</DialogTitle>
                <DialogDescription>
                  Manage {selectedVendor.name}&apos;s account and status.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedVendor.name}&backgroundColor=E86A70`} />
                    <AvatarFallback>{selectedVendor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedVendor.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedVendor.email}</p>
                    <Badge 
                      variant={getStatusBadge(selectedVendor.status).variant}
                      className={`mt-2 ${getStatusBadge(selectedVendor.status).classes}`}
                    >
                      {selectedVendor.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Properties</p>
                    <p className="font-semibold">{selectedVendor.properties}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-xl">
                    <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                    <p className="font-semibold">{selectedVendor.revenue}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-medium">Update Status</h4>
                  <Select 
                    value={selectedVendor.status} 
                    onValueChange={(val) => handleUpdateStatus(selectedVendor.id, val || "Pending")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved / Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                  {isUpdating && <p className="text-xs text-muted-foreground animate-pulse">Updating status...</p>}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* GST Invoice Modal */}
      <Dialog open={isGstModalOpen} onOpenChange={setIsGstModalOpen}>
        <DialogContent className="sm:max-w-175 rounded-2xl max-h-[85vh] flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-muted">
            <DialogTitle>Send 24% GST Invoice</DialogTitle>
            <DialogDescription>
              Select completed bookings to calculate platform fee and 24% GST for {selectedGstVendor?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {isLoadingBookings ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : vendorBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">
                No bookings found for this vendor.
              </div>
            ) : (
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-12.5 text-center">
                        <Checkbox 
                          checked={selectedBookingIds.length === vendorBookings.length && vendorBookings.length > 0}
                          onCheckedChange={toggleAllBookings}
                        />
                      </TableHead>
                      <TableHead>Booking Details</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Platform Fee (18%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorBookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-center">
                          <Checkbox 
                            checked={selectedBookingIds.includes(b.id)}
                            onCheckedChange={() => handleToggleBooking(b.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{b.hotelName}</p>
                          <p className="text-xs text-muted-foreground uppercase">{b.id.substring(0, 8)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{b.checkIn} - {b.checkOut}</p>
                          <Badge variant="outline" className="mt-1 text-[10px]">{b.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{b.platformFee.toLocaleString('en-IN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {selectedBookingIds.length > 0 && (
              <div className="bg-muted/30 p-4 rounded-xl text-sm space-y-2 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Bookings:</span>
                  <span className="font-semibold">{selectedBookingIds.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Amount (Total Fees):</span>
                  <span>₹{selectedBookingsTotalFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-indigo-600">
                  <span>GST (24%):</span>
                  <span>₹{(selectedBookingsTotalFee * 0.24).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t text-base">
                  <span>Total Invoice Amount:</span>
                  <span>₹{(selectedBookingsTotalFee * 1.24).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="px-6 py-4 border-t border-muted bg-muted/10">
            <Button variant="outline" onClick={() => setIsGstModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendGstInvoice} disabled={selectedBookingIds.length === 0 || isSendingGst}>
              {isSendingGst ? "Sending..." : "Send Invoice & Email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
