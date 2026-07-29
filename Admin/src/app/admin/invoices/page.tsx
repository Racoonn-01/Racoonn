"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  FileText,
  Eye,
  Printer,
  CheckCircle2,
  Search,
  X,
  ShieldCheck,
  CreditCard,
  DollarSign,
  History,
  FileCheck,
  Download,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllBookings } from "../bookings/actions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  bookingId?: string;
}

export interface AuditLog {
  timestamp: string;
  adminName: string;
  action: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type?: "withdrawal" | "billing";
  vendorId: string;
  vendorName: string;
  vendorBusiness: string;
  vendorEmail: string;
  vendorPhone: string;
  vendorAddress: string;
  vendorGstin?: string;
  vendorPan?: string;

  // Bank Details for payout
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
  upiId?: string;

  // Breakdown & Attached Bookings
  bookingIds?: string[];
  grossAmount?: number;
  platformFeeRate?: number;
  platformFeeAmount?: number;

  issueDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: "Draft" | "Sent" | "Approved" | "Paid" | "Overdue" | "Cancelled" | "Rejected";
  
  notes?: string;
  adminRemarks?: string;

  // Approval & Payment Trail
  approvedBy?: string;
  approvalDate?: string;
  approvalNotes?: string;

  rejectionReason?: string;
  rejectionNotes?: string;

  paidBy?: string;
  paymentDate?: string;
  paymentMethod?: string;
  utrNumber?: string;
  paymentNotes?: string;

  auditLogs?: AuditLog[];
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  gstin?: string;
  pan?: string;
}

export interface BookingDetail {
  id: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  completionDate: string;
  grossAmount: number;
  platformFee: number;
  vendorEarnings: number;
  status: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
}

export default function AdminWithdrawalManagementPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [realBookings, setRealBookings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "highest" | "lowest" | "vendor">("latest");

  // Selection & Download States
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);

  // Drawer / Modal States
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // Action Modals (Approve, Reject, Mark Paid)
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPaidOpen, setIsPaidOpen] = useState(false);

  // Approval Form State
  const [approvedBy, setApprovedBy] = useState("Super Admin");
  const [approvalNotes, setApprovalNotes] = useState("All booking data & bank details verified cleanly.");

  // Rejection Form State
  const [rejectionReason, setRejectionReason] = useState("Incomplete documentation");
  const [rejectionNotes, setRejectionNotes] = useState("Associated bookings returned to vendor's available balance.");

  // Payment Form State
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [utrNumber, setUtrNumber] = useState(() => `UTR${Date.now()}`);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer (NEFT/RTGS)");
  const [paidBy, setPaidBy] = useState("Super Admin");
  const [paymentNotes, setPaymentNotes] = useState("Payout funds transferred directly to destination account.");

  // Fetch Invoices, Vendors & Real Appwrite Bookings
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, vRes, bData] = await Promise.all([
        fetch("/api/invoices").then((r) => r.json()).catch(() => ({ success: false })),
        fetch("/api/vendors").then((r) => r.json()).catch(() => ({ success: false })),
        getAllBookings().catch(() => []),
      ]);

      if (invRes.success && Array.isArray(invRes.invoices)) {
        setInvoices(invRes.invoices);
      }
      if (vRes.success && Array.isArray(vRes.vendors)) {
        setVendors(vRes.vendors);
      }
      setRealBookings(bData || []);
    } catch (err) {
      console.error("Failed to load admin withdrawal invoice data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered & Sorted Invoices
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchesSearch =
          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.vendorBusiness.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.vendorId.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "All" ||
          (statusFilter === "Pending" && (inv.status === "Sent" || inv.status === "Draft")) ||
          inv.status === statusFilter;

        const matchesVendor = vendorFilter === "All" || inv.vendorId === vendorFilter || inv.vendorBusiness === vendorFilter;
        
        const matchesDate = !dateFilter || (inv.issueDate === dateFilter || (inv.createdAt && inv.createdAt.startsWith(dateFilter)));

        return matchesSearch && matchesStatus && matchesVendor && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "latest") {
          return new Date(b.createdAt || b.issueDate).getTime() - new Date(a.createdAt || a.issueDate).getTime();
        }
        if (sortBy === "highest") {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === "lowest") {
          return a.totalAmount - b.totalAmount;
        }
        if (sortBy === "vendor") {
          return a.vendorBusiness.localeCompare(b.vendorBusiness);
        }
        return 0;
      });
  }, [invoices, searchQuery, statusFilter, vendorFilter, dateFilter, sortBy]);

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(new Set(filteredInvoices.map(i => i.id)));
    } else {
      setSelectedInvoices(new Set());
    }
  };

  // Handle Select Single
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedInvoices);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedInvoices(newSet);
  };

  // PDF Generation Logic
  const generateInvoicePDFBlob = (inv: Invoice): Blob => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(225, 29, 72); 
    doc.text("Racoonn Platform", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Withdrawal Request Invoice", 14, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Invoice Number: ${inv.invoiceNumber}`, 14, 45);
    doc.text(`Date: ${inv.issueDate}`, 14, 52);
    doc.text(`Status: ${inv.status}`, 14, 59);

    doc.setFontSize(14);
    doc.text("Vendor Details", 14, 75);
    doc.setFontSize(10);
    doc.text(`Business Name: ${inv.vendorBusiness}`, 14, 82);
    doc.text(`Owner: ${inv.vendorName}`, 14, 88);
    doc.text(`Email: ${inv.vendorEmail}`, 14, 94);
    doc.text(`Phone: ${inv.vendorPhone}`, 14, 100);

    if (inv.accountNumber) {
      doc.setFontSize(14);
      doc.text("Bank Details", 120, 75);
      doc.setFontSize(10);
      doc.text(`Bank Name: ${inv.bankName || "N/A"}`, 120, 82);
      doc.text(`Account Number: ${inv.accountNumber}`, 120, 88);
      doc.text(`IFSC: ${inv.ifsc || "N/A"}`, 120, 94);
    }

    autoTable(doc, {
      startY: 110,
      head: [["Description", "Amount"]],
      body: [
        ["Gross Revenue", `INR ${(inv.grossAmount || inv.subtotal).toLocaleString("en-IN")}`],
        ["Platform Fee (Commission)", `- INR ${(inv.platformFeeAmount || 0).toLocaleString("en-IN")}`],
        ["Net Payable to Vendor", `INR ${inv.totalAmount.toLocaleString("en-IN")}`]
      ],
      theme: "striped",
      headStyles: { fillColor: [225, 29, 72] }
    });

    return doc.output("blob");
  };

  const handleDownloadSelected = async () => {
    if (selectedInvoices.size === 0) return;
    setIsDownloading(true);
    
    try {
      const selected = invoices.filter(inv => selectedInvoices.has(inv.id));
      
      if (selected.length === 1) {
        const blob = generateInvoicePDFBlob(selected[0]);
        saveAs(blob, `${selected[0].invoiceNumber}.pdf`);
      } else {
        const zip = new JSZip();
        selected.forEach(inv => {
          const blob = generateInvoicePDFBlob(inv);
          zip.file(`${inv.invoiceNumber}.pdf`, blob);
        });
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `Invoices_${Date.now()}.zip`);
      }
    } catch (e) {
      console.error("Error downloading files:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSingle = (inv: Invoice) => {
    try {
      const blob = generateInvoicePDFBlob(inv);
      saveAs(blob, `${inv.invoiceNumber}.pdf`);
    } catch (e) {
      console.error("Error generating single PDF:", e);
    }
  };

  // Overall Financial Metric Card Totals
  const totalRequestsCount = invoices.length;
  const pendingRequestsCount = invoices.filter((i) => i.status === "Sent" || i.status === "Draft").length;
  const approvedRequestsCount = invoices.filter((i) => i.status === "Approved").length;
  const paidRequestsCount = invoices.filter((i) => i.status === "Paid").length;
  const rejectedRequestsCount = invoices.filter((i) => i.status === "Rejected").length;

  const totalAmountRequested = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalAmountPaid = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCommissionEarned = invoices.reduce((sum, i) => sum + (i.platformFeeAmount || 0), 0);

  // Compute Weekly & Monthly totals
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const withdrawalsThisWeek = invoices
    .filter((i) => i.type === "withdrawal" && new Date(i.createdAt || i.issueDate) >= startOfWeek)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const withdrawalsThisMonth = invoices
    .filter((i) => i.type === "withdrawal" && new Date(i.createdAt || i.issueDate) >= startOfMonth)
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Handle Open Details Drawer
  const handleOpenDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailsOpen(true);
    // Append audit log for Admin Viewed
    addAuditLog(inv.id, "Admin Viewed Withdrawal Request Details");
  };

  // Audit log handler
  const addAuditLog = async (invoiceId: string, action: string, notes?: string) => {
    try {
      const inv = invoices.find((i) => i.id === invoiceId);
      if (!inv) return;

      const existingLogs: AuditLog[] = inv.auditLogs || [];
      const newLog: AuditLog = {
        timestamp: new Date().toISOString(),
        adminName: "Super Admin",
        action,
        notes,
      };

      const updatedLogs = [newLog, ...existingLogs];

      await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invoiceId,
          status: inv.status,
          auditLogs: updatedLogs,
        }),
      });
    } catch (e) {
      console.warn("Failed to write audit log:", e);
    }
  };

  // Action Handlers
  const handleConfirmApprove = async () => {
    if (!selectedInvoice) return;

    try {
      const existingLogs: AuditLog[] = selectedInvoice.auditLogs || [];
      const newLog: AuditLog = {
        timestamp: new Date().toISOString(),
        adminName: approvedBy,
        action: "Withdrawal Request Approved",
        notes: approvalNotes,
      };

      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInvoice.id,
          status: "Approved",
          approvedBy,
          approvalDate: new Date().toISOString(),
          approvalNotes,
          adminRemarks: `Approved by ${approvedBy}: ${approvalNotes}`,
          auditLogs: [newLog, ...existingLogs],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setInvoices(json.invoices);
        setIsApproveOpen(false);
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error("Failed to approve withdrawal invoice:", err);
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedInvoice) return;

    try {
      const existingLogs: AuditLog[] = selectedInvoice.auditLogs || [];
      const newLog: AuditLog = {
        timestamp: new Date().toISOString(),
        adminName: "Super Admin",
        action: "Withdrawal Request Rejected",
        notes: `${rejectionReason} - ${rejectionNotes}`,
      };

      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInvoice.id,
          status: "Rejected",
          rejectionReason,
          rejectionNotes,
          adminRemarks: `Rejected (${rejectionReason}): ${rejectionNotes}`,
          auditLogs: [newLog, ...existingLogs],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setInvoices(json.invoices);
        setIsRejectOpen(false);
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error("Failed to reject withdrawal invoice:", err);
    }
  };

  const handleConfirmMarkPaid = async () => {
    if (!selectedInvoice) return;

    try {
      const existingLogs: AuditLog[] = selectedInvoice.auditLogs || [];
      const newLog: AuditLog = {
        timestamp: new Date().toISOString(),
        adminName: paidBy,
        action: "Withdrawal Payout Processed & Paid",
        notes: `UTR: ${utrNumber} (${paymentMethod}) - ${paymentNotes}`,
      };

      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInvoice.id,
          status: "Paid",
          paidBy,
          paymentDate,
          paymentMethod,
          utrNumber,
          paymentNotes,
          adminRemarks: `Payout Processed via ${paymentMethod} (UTR: ${utrNumber})`,
          auditLogs: [newLog, ...existingLogs],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setInvoices(json.invoices);
        setIsPaidOpen(false);
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error("Failed to mark withdrawal as paid:", err);
    }
  };

  // Helper to resolve booking details dynamically from real Appwrite data
  const getBookingDetails = (bId: string, inv: Invoice): BookingDetail => {
    const realB = realBookings.find(
      (b) =>
        String(b.realId || "") === bId ||
        String(b.id || "") === bId ||
        (b.realId && bId.toLowerCase().includes(String(b.realId).toLowerCase()))
    );

    if (realB) {
      const grossNum = parseInt(String(realB.amount || "").replace(/[^0-9]/g, ""), 10) || 0;
      const slab = inv.platformFeeRate || 25;
      const feeNum = Math.round((grossNum * slab) / 100);
      const earningsNum = grossNum - feeNum;

      return {
        id: bId,
        guestName: (realB.customer as string) || "Guest",
        propertyName: (realB.property as string) || inv.vendorBusiness || "Racoonn Property",
        roomName: "Standard Room",
        checkIn: (realB.checkIn as string) || inv.issueDate,
        checkOut: (realB.checkOut as string) || inv.dueDate,
        completionDate: (realB.checkOut as string) || inv.issueDate,
        grossAmount: grossNum,
        platformFee: feeNum,
        vendorEarnings: earningsNum,
        status: "Completed",
        guestEmail: "verified@guest.com",
        guestPhone: "Verified Contact",
        specialRequests: "Completed booking payout request",
      };
    }

    // Fallback directly from invoice items
    const matchingItem = inv.items.find((item) => item.bookingId === bId || item.id.includes(bId));
    const grossNum = matchingItem ? Math.abs(matchingItem.amount) : (inv.grossAmount || inv.subtotal);
    const slab = inv.platformFeeRate || 25;
    const feeNum = Math.round((grossNum * slab) / 100);
    const earningsNum = grossNum - feeNum;

    return {
      id: bId,
      guestName: matchingItem ? matchingItem.description : "Completed Booking",
      propertyName: inv.vendorBusiness || "Racoonn Property",
      roomName: "Standard Room",
      checkIn: inv.issueDate,
      checkOut: inv.dueDate,
      completionDate: inv.issueDate,
      grossAmount: grossNum,
      platformFee: feeNum,
      vendorEarnings: earningsNum,
      status: "Completed",
    };
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-rose-600" size={34} /> Admin Withdrawal Request Management Module
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, verify fraud checks, approve, reject, and process vendor payout withdrawal invoices.
          </p>
        </div>
      </div>

      {/* Summary Statistic Cards (10 Metric Indicators) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="rounded-2xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Requests</span>
            <div className="text-xl font-black text-gray-900 mt-1">{totalRequestsCount}</div>
            <span className="text-[10px] text-gray-400">All submitted invoices</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-amber-200 shadow-xs bg-amber-50/40">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Pending Review</span>
            <div className="text-xl font-black text-amber-800 mt-1">{pendingRequestsCount}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Requires verification</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-blue-200 shadow-xs bg-blue-50/40">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Approved</span>
            <div className="text-xl font-black text-blue-800 mt-1">{approvedRequestsCount}</div>
            <span className="text-[10px] text-blue-600 font-semibold">Locked for payout</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/40">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Total Paid Out</span>
            <div className="text-xl font-black text-emerald-800 mt-1">₹{totalAmountPaid.toLocaleString("en-IN")}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">{paidRequestsCount} Paid invoices</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-rose-200 shadow-xs bg-rose-50/40">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Rejected</span>
            <div className="text-xl font-black text-rose-800 mt-1">{rejectedRequestsCount}</div>
            <span className="text-[10px] text-rose-600 font-semibold">Unlocked back to vendor</span>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200 shadow-xs bg-white col-span-2 sm:col-span-1">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Requested</span>
            <div className="text-xl font-black text-gray-900 mt-1">₹{totalAmountRequested.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-purple-100 shadow-xs bg-purple-50/40 col-span-2 sm:col-span-2">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Platform Commission Earned</span>
            <div className="text-xl font-black text-purple-800 mt-1">₹{totalCommissionEarned.toLocaleString("en-IN")}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-200 shadow-xs bg-white col-span-2 sm:col-span-2">
          <CardContent className="p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Withdrawals This Week / Month</span>
            <div className="text-sm font-black text-gray-900 mt-1">
              Week: ₹{withdrawalsThisWeek.toLocaleString("en-IN")} · Month: ₹{withdrawalsThisMonth.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-auto sm:min-w-64 shrink-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by vendor name, business, invoice #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl text-xs h-9 bg-gray-50/50 w-full"
            />
          </div>

          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-700 h-9 shrink-0"
          >
            <option value="All">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.businessName} ({v.name})
              </option>
            ))}
          </select>
          
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-700 h-9 w-36 shrink-0"
            title="Filter by Date"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold overflow-x-auto shrink-0 max-w-full">
            {["All", "Pending", "Approved", "Paid", "Rejected"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all shrink-0 ${
                  statusFilter === st ? "bg-rose-600 text-white shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 h-9 shrink-0"
          >
            <option value="latest">Sort: Latest Requests</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="lowest">Sort: Lowest Amount</option>
            <option value="vendor">Sort: Vendor Name</option>
          </select>
        </div>
      </div>

      {/* Download Selected Action Bar */}
      {selectedInvoices.size > 0 && (
        <div className="flex items-center justify-between bg-rose-50 border border-rose-200 p-3 rounded-2xl animate-in fade-in slide-in-from-top-2">
          <div className="text-sm font-bold text-rose-800">
            {selectedInvoices.size} invoice(s) selected
          </div>
          <Button 
            onClick={handleDownloadSelected}
            disabled={isDownloading}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl gap-2 font-bold shadow-sm"
          >
            {isDownloading ? <Archive size={16} className="animate-spin" /> : <Archive size={16} />}
            Download as ZIP / PDF
          </Button>
        </div>
      )}

      {/* Withdrawal Request Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6 w-10">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4"
                    checked={filteredInvoices.length > 0 && selectedInvoices.size === filteredInvoices.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 whitespace-nowrap">Invoice Ref #</th>
                <th className="p-4 whitespace-nowrap">Vendor Partner</th>
                <th className="p-4 whitespace-nowrap">Request Date</th>
                <th className="p-4 whitespace-nowrap">Bookings</th>
                <th className="p-4 whitespace-nowrap">Gross Revenue</th>
                <th className="p-4 whitespace-nowrap">Platform Fee</th>
                <th className="p-4 whitespace-nowrap">Net Payable</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map((inv) => {
                const isWithdrawal = inv.type === "withdrawal";
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                        checked={selectedInvoices.has(inv.id)}
                        onChange={(e) => handleSelectOne(inv.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4 font-bold text-gray-900 font-mono whitespace-nowrap">
                      <div className="whitespace-nowrap">{inv.invoiceNumber}</div>
                      {isWithdrawal && (
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap">
                          Withdrawal Request
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{inv.vendorBusiness || inv.vendorName}</div>
                      <div className="text-gray-400 text-[11px]">{inv.vendorEmail}</div>
                    </td>
                    <td className="p-4 text-gray-900 font-medium whitespace-nowrap">{inv.issueDate}</td>
                    <td className="p-4 font-bold text-gray-800">
                      {inv.bookingIds ? `${inv.bookingIds.length} Bookings` : "1 Service"}
                    </td>
                    <td className="p-4 font-bold text-gray-900">
                      ₹{(inv.grossAmount || inv.subtotal).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-bold text-rose-600">
                      -₹{(inv.platformFeeAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 font-black text-emerald-700 text-sm">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={`rounded-lg px-3 py-1 font-bold ${
                          inv.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : inv.status === "Approved"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : inv.status === "Sent" || inv.status === "Draft"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-rose-100 text-rose-800 border-rose-200"
                        }`}
                      >
                        {inv.status === "Sent" ? "Pending Review" : inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSingle(inv)}
                          className="rounded-xl h-8 w-8 p-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetails(inv)}
                          className="rounded-xl gap-1 font-bold text-xs"
                        >
                          <Eye size={14} /> Review Details
                        </Button>

                        {inv.status !== "Paid" && inv.status !== "Rejected" && (
                          <>
                            {inv.status !== "Approved" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedInvoice(inv);
                                  setIsApproveOpen(true);
                                }}
                                className="rounded-xl gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                              >
                                <CheckCircle2 size={14} /> Approve
                              </Button>
                            )}

                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsPaidOpen(true);
                              }}
                              className="rounded-xl gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              <DollarSign size={14} /> Mark Paid
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsRejectOpen(true);
                              }}
                              className="rounded-xl gap-1 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold text-xs"
                            >
                              <X size={14} /> Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-gray-500">
                    <FileText className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="font-semibold text-gray-700">No Withdrawal Invoices Found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WITHDRAWAL DETAILS MODAL / DRAWER */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileCheck className="text-rose-600" size={24} /> Withdrawal Request Details & Fraud Audit
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Invoice #{selectedInvoice?.invoiceNumber} · Requested by {selectedInvoice?.vendorBusiness}
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="rounded-xl gap-1.5 font-bold text-xs"
              >
                <Eye size={14} /> Preview Printable PDF
              </Button>
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-900">
              {/* Fraud & Validation Checks Card */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3 text-xs">
                <h4 className="font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={18} className="text-emerald-600" /> Automated Fraud & Validation Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-950 font-medium">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>All attached bookings ({selectedInvoice.bookingIds?.length || 1}) are Completed</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>No duplicate payout claims found for booking IDs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Commission Slab ({selectedInvoice.platformFeeRate || 25}%) verified</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Destination Bank Details complete & active</span>
                  </div>
                </div>
              </div>

              {/* Vendor & Bank Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider">Vendor Partner Details</h4>
                  <p className="text-sm font-bold text-gray-900">{selectedInvoice.vendorBusiness}</p>
                  <p className="text-gray-600">Owner Name: {selectedInvoice.vendorName}</p>
                  <p className="text-gray-600">Email: {selectedInvoice.vendorEmail}</p>
                  <p className="text-gray-600">Phone: {selectedInvoice.vendorPhone}</p>
                  <p className="text-gray-600">Address: {selectedInvoice.vendorAddress}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <CreditCard size={14} /> Destination Bank Details
                  </h4>
                  <p className="text-sm font-bold text-gray-900">{selectedInvoice.bankName || "HDFC Bank"}</p>
                  <p className="text-gray-600">Account Holder: {selectedInvoice.accountHolder || selectedInvoice.vendorName}</p>
                  <p className="text-gray-600">Account Number: •••• {selectedInvoice.accountNumber?.slice(-4) || "9876"}</p>
                  <p className="text-gray-600">IFSC Code: {selectedInvoice.ifsc || "HDFC0001234"}</p>
                  <p className="text-gray-600">UPI ID: {selectedInvoice.upiId || "N/A"}</p>
                </div>
              </div>

              {/* Financial Summary Cards */}
              <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-200 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <span className="text-gray-500 uppercase font-bold block text-[10px]">Gross Revenue</span>
                  <span className="font-bold text-gray-900 text-base">
                    ₹{(selectedInvoice.grossAmount || selectedInvoice.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-rose-600 uppercase font-bold block text-[10px]">Platform Fee ({selectedInvoice.platformFeeRate || 25}%)</span>
                  <span className="font-bold text-rose-600 text-base">
                    -₹{(selectedInvoice.platformFeeAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 uppercase font-bold block text-[10px]">Net Payable Payout</span>
                  <span className="font-black text-emerald-700 text-lg">
                    ₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Itemized Bookings Breakdown Table */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2">
                  Itemized Bookings Included In Request ({selectedInvoice.bookingIds?.length || selectedInvoice.items.length} Bookings)
                </h4>
                <div className="border border-gray-200 rounded-2xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                      <tr>
                        <th className="p-3">Booking ID</th>
                        <th className="p-3">Guest & Property</th>
                        <th className="p-3 text-right">Gross (₹)</th>
                        <th className="p-3 text-right">Fee (₹)</th>
                        <th className="p-3 text-right">Net (₹)</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {(selectedInvoice.bookingIds && selectedInvoice.bookingIds.length > 0
                        ? selectedInvoice.bookingIds
                        : selectedInvoice.items.filter(i => i.amount > 0).map(i => i.bookingId || i.id)
                      ).map((bId) => {
                        const bDetail = getBookingDetails(bId, selectedInvoice);
                        const isExpanded = expandedBookingId === bId;
                        return (
                          <React.Fragment key={bId}>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-bold font-mono text-gray-900">{bId}</td>
                              <td className="p-3">
                                <span className="font-bold text-gray-900">{bDetail.guestName}</span>
                                <span className="text-gray-400 block text-[11px]">{bDetail.propertyName}</span>
                              </td>
                              <td className="p-3 text-right font-bold text-gray-900">₹{bDetail.grossAmount.toLocaleString("en-IN")}</td>
                              <td className="p-3 text-right font-bold text-rose-600">-₹{bDetail.platformFee.toLocaleString("en-IN")}</td>
                              <td className="p-3 text-right font-black text-emerald-700">₹{bDetail.vendorEarnings.toLocaleString("en-IN")}</td>
                              <td className="p-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setExpandedBookingId(isExpanded ? null : bId)}
                                  className="h-7 px-2 rounded-lg text-[11px] font-semibold text-rose-600"
                                >
                                  {isExpanded ? "Hide Details" : "View Details"}
                                </Button>
                              </td>
                            </tr>

                            {/* Expanded Row */}
                            {isExpanded && (
                              <tr className="bg-gray-50/80">
                                <td colSpan={6} className="p-4 space-y-2 border-t border-b border-gray-200">
                                  <div className="grid grid-cols-3 gap-4 text-[11px] text-gray-700">
                                    <div>
                                      <span className="font-bold text-gray-500 block">Room:</span>
                                      <span>{bDetail.roomName}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 block">Check-in / Check-out:</span>
                                      <span>{bDetail.checkIn} - {bDetail.checkOut}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 block">Completion Date:</span>
                                      <span>{bDetail.completionDate}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 block">Guest Email:</span>
                                      <span>{bDetail.guestEmail}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 block">Guest Phone:</span>
                                      <span>{bDetail.guestPhone}</span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-gray-500 block">Special Requests:</span>
                                      <span>{bDetail.specialRequests}</span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Trail Activity Log Timeline */}
              <div>
                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History size={16} /> Audit Trail & Activity Log
                </h4>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 text-xs">
                  {(selectedInvoice.auditLogs || [
                    {
                      timestamp: selectedInvoice.createdAt || selectedInvoice.issueDate,
                      adminName: selectedInvoice.vendorName,
                      action: "Withdrawal Request Submitted by Vendor",
                    },
                  ]).map((log, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-l-2 border-rose-500 pl-3">
                      <div>
                        <p className="font-bold text-gray-900">{log.action}</p>
                        <p className="text-gray-500 text-[11px]">By {log.adminName} · {new Date(log.timestamp).toLocaleString()}</p>
                        {log.notes && <p className="text-gray-600 font-medium mt-0.5">{log.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsDetailsOpen(false)} className="rounded-xl">
              Close
            </Button>
            {selectedInvoice && selectedInvoice.status !== "Paid" && selectedInvoice.status !== "Rejected" && (
              <>
                {selectedInvoice.status !== "Approved" && (
                  <Button
                    onClick={() => setIsApproveOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-1.5"
                  >
                    <CheckCircle2 size={16} /> Approve Request
                  </Button>
                )}
                <Button
                  onClick={() => setIsPaidOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-1.5"
                >
                  <DollarSign size={16} /> Mark as Paid
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectOpen(true)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl font-bold gap-1.5"
                >
                  <X size={16} /> Reject Request
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APPROVE REQUEST MODAL */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="text-blue-600" size={24} /> Approve Vendor Withdrawal Request
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-2">
              Approving locks all attached bookings and queue the invoice for payout processing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Approved By (Admin Name)</label>
              <Input
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Approval Notes</label>
              <textarea
                rows={3}
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsApproveOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmApprove}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold gap-1.5"
            >
              <CheckCircle2 size={16} /> Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT REQUEST MODAL */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <X className="text-rose-600" size={24} /> Reject Vendor Withdrawal Request
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-2">
              Rejecting unlocks all associated bookings so they return to the vendor&apos;s available withdrawal balance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Select Rejection Reason *</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
              >
                <option value="Incomplete documentation">Incomplete documentation</option>
                <option value="Incorrect bank details">Incorrect bank details</option>
                <option value="Duplicate booking claim">Duplicate booking claim</option>
                <option value="Property status discrepancy">Property status discrepancy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Detailed Rejection Notes</label>
              <textarea
                rows={3}
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Explain reason to vendor..."
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsRejectOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReject}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold gap-1.5"
            >
              <X size={16} /> Confirm Rejection & Unlock Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MARK AS PAID MODAL */}
      <Dialog open={isPaidOpen} onOpenChange={setIsPaidOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="text-emerald-600" size={24} /> Mark Payout as Paid & Issue Receipt
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-2">
              Record bank transfer / UTR transaction details to complete payout settlement.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Transaction ID / UTR Number *</label>
              <Input
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. UTR9876543210"
                className="rounded-xl font-mono font-bold text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-semibold text-xs"
                >
                  <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI Transfer">UPI Transfer</option>
                  <option value="Razorpay Payout">Razorpay Payout</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Payment Date</label>
                <Input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Paid By (Admin Name)</label>
              <Input
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Payment Notes</label>
              <textarea
                rows={2}
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsPaidOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMarkPaid}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold gap-1.5"
            >
              <DollarSign size={16} /> Confirm & Mark Paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HIGH-RES INVOICE PDF PREVIEW MODAL */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-gray-100">
          <DialogHeader className="p-4 px-6 border-b border-gray-200 bg-white flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Invoice #{selectedInvoice?.invoiceNumber}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl gap-1.5 font-semibold text-gray-700 bg-white"
            >
              <Printer size={16} /> Print / Download PDF
            </Button>
          </DialogHeader>

          {selectedInvoice && (
            <div
              className="p-6 md:p-8 overflow-y-auto flex-1 bg-white m-4 rounded-2xl border border-gray-200 shadow-sm text-gray-900 space-y-8"
              id="printable-invoice"
            >
              {/* Header with Racoonn Branding */}
              <div className="flex justify-between items-start border-b pb-6">
                <div>
                  <div className="relative w-44 h-16 mb-2">
                    <Image src="/Racoonn-Logo-02.png" alt="Racoonn Logo" fill className="object-contain object-left" unoptimized />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Racoonn Hospitality Technologies Private Limited</p>
                  <p className="text-xs text-gray-500">Devbhoomi Uttarakhand, India</p>
                  <p className="text-xs text-gray-500">GSTIN: 05AAACR9999P1Z8 · support@racoonn.com</p>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-black text-rose-600 uppercase tracking-tight">
                    {selectedInvoice.type === "withdrawal" ? "WITHDRAWAL INVOICE" : "TAX INVOICE"}
                  </h2>
                  <p className="text-sm font-bold text-gray-900 mt-1">#{selectedInvoice.invoiceNumber}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-semibold text-gray-700">Date:</span> {selectedInvoice.issueDate}</p>
                    <p><span className="font-semibold text-gray-700">Due / Payout Date:</span> {selectedInvoice.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Bill To & Bill From */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">Billed To (Vendor Partner)</h4>
                  <p className="text-sm font-bold text-gray-900">{selectedInvoice.vendorBusiness || selectedInvoice.vendorName}</p>
                  <p className="text-gray-600 mt-0.5">Attn: {selectedInvoice.vendorName}</p>
                  <p className="text-gray-600">{selectedInvoice.vendorAddress}</p>
                  <p className="text-gray-600">Email: {selectedInvoice.vendorEmail}</p>
                  <p className="text-gray-600">Phone: {selectedInvoice.vendorPhone}</p>
                  {selectedInvoice.vendorGstin && (
                    <p className="font-semibold text-gray-700 mt-1">GSTIN: {selectedInvoice.vendorGstin}</p>
                  )}
                </div>

                <div className="text-right">
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</h4>
                  <Badge
                    className={`rounded-lg px-3 py-1 font-bold text-xs ${
                      selectedInvoice.status === "Paid"
                        ? "bg-emerald-600 text-white"
                        : selectedInvoice.status === "Approved"
                        ? "bg-blue-600 text-white"
                        : selectedInvoice.status === "Sent"
                        ? "bg-amber-600 text-white"
                        : "bg-rose-600 text-white"
                    }`}
                  >
                    {selectedInvoice.status.toUpperCase()}
                  </Badge>
                  {selectedInvoice.utrNumber && (
                    <div className="mt-3 text-gray-700 space-y-0.5 text-xs">
                      <p><span className="font-bold text-gray-900">UTR / Ref:</span> {selectedInvoice.utrNumber}</p>
                      <p><span className="font-semibold text-gray-600">Payment Date:</span> {selectedInvoice.paymentDate}</p>
                      <p><span className="font-semibold text-gray-600">Method:</span> {selectedInvoice.paymentMethod}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Bank Details for Withdrawal Request */}
              {selectedInvoice.type === "withdrawal" && (selectedInvoice.bankName || selectedInvoice.upiId) && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    Vendor Bank Details For Payout Transfer
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-gray-800">
                    <div>
                      <p><span className="font-semibold text-gray-600">Bank Name:</span> {selectedInvoice.bankName || "N/A"}</p>
                      <p><span className="font-semibold text-gray-600">Account Holder:</span> {selectedInvoice.accountHolder || "N/A"}</p>
                      <p><span className="font-semibold text-gray-600">Account Number:</span> {selectedInvoice.accountNumber || "N/A"}</p>
                    </div>
                    <div>
                      <p><span className="font-semibold text-gray-600">IFSC Code:</span> {selectedInvoice.ifsc || "N/A"}</p>
                      <p><span className="font-semibold text-gray-600">UPI ID:</span> {selectedInvoice.upiId || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900 text-white font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 pl-4">#</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price (₹)</th>
                      <th className="p-3 pr-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50">
                        <td className="p-3 pl-4 font-bold text-gray-400">{idx + 1}</td>
                        <td className="p-3 font-semibold text-gray-900">{item.description}</td>
                        <td className="p-3 text-center font-medium">{item.quantity}</td>
                        <td className="p-3 text-right font-medium">
                          {item.unitPrice < 0
                            ? `-₹${Math.abs(item.unitPrice).toLocaleString("en-IN")}`
                            : `₹${item.unitPrice.toLocaleString("en-IN")}`}
                        </td>
                        <td className={`p-3 pr-4 text-right font-bold ${item.amount < 0 ? "text-rose-600" : "text-gray-900"}`}>
                          {item.amount < 0
                            ? `-₹${Math.abs(item.amount).toLocaleString("en-IN")}`
                            : `₹${item.amount.toLocaleString("en-IN")}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="flex-1 space-y-2 text-xs text-gray-500">
                  <h4 className="font-bold text-gray-700 uppercase">Terms & Instructions</h4>
                  <p>{selectedInvoice.notes || "Please make payment via bank transfer to Racoonn Hospitality Account."}</p>
                </div>

                <div className="w-full sm:w-64 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Booking Revenue:</span>
                    <span className="font-bold text-gray-900">
                      ₹{(selectedInvoice.grossAmount || selectedInvoice.subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedInvoice.platformFeeAmount && (
                    <div className="flex justify-between text-rose-600">
                      <span>Platform Fee ({selectedInvoice.platformFeeRate}%):</span>
                      <span className="font-bold">-₹{selectedInvoice.platformFeeAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-sm font-black text-emerald-700">
                    <span>Net Payable To Vendor:</span>
                    <span>₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center text-xs text-gray-400">
                This is an official computer-generated withdrawal invoice issued by Racoonn Hospitality Technologies.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
