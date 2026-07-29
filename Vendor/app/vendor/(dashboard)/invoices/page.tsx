"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  FileText,
  Eye,
  Printer,
  CheckCircle2,
  Clock,
  Download,
  Plus,
  Send,
  CreditCard,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  CheckSquare,
  Square,
  Calendar,
  ShieldAlert,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { databases, appwriteConfig } from "@/lib/appwrite/client";
import { Query } from "appwrite";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  bookingId?: string;
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
  status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled" | "Rejected";
  notes?: string;
  adminRemarks?: string;
  createdAt?: string;
}

export interface BookingItem {
  id: string;
  guestName: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  completionDate: string;
  grossAmount: number;
  platformFee: number;
  vendorEarnings: number;
  status: "Completed" | "Pending Withdrawal" | "Paid";
  withdrawalInvoiceId?: string;
}

export default function VendorInvoicesPage() {
  const { profile, user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All");
  const effectiveFeePercent = 21.24; // 18% base commission + 18% GST on commission

  // Withdrawal Form State
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  const [vendorBusiness, setVendorBusiness] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorGstin, setVendorGstin] = useState("");

  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");

  const [notes, setNotes] = useState(
    "Please process this payout invoice to the specified bank account / UPI ID. Thank you!"
  );
  
  const [manualGstAmount, setManualGstAmount] = useState<string>("");

  // Fetch Invoices & Real-time Bookings
  const loadInvoicesAndBookings = useCallback(async () => {
    try {
      setLoading(true);
      setIsBookingsLoading(true);

      // 1. Fetch Invoices
      const invRes = await fetch("/api/invoices");
      const invJson = await invRes.json();
      let fetchedInvoices: Invoice[] = [];
      if (invJson.success && Array.isArray(invJson.invoices)) {
        fetchedInvoices = invJson.invoices;
        setInvoices(fetchedInvoices);
      }

      // Collect all booking IDs that have already been attached to withdrawal invoices
      const withdrawnOrPendingBookingIds = new Set<string>();
      const paidBookingIds = new Set<string>();

      fetchedInvoices.forEach((inv) => {
        if (inv.type === "withdrawal" && inv.bookingIds && inv.status !== "Cancelled" && inv.status !== "Rejected") {
          inv.bookingIds.forEach((bId) => {
            withdrawnOrPendingBookingIds.add(bId);
            if (inv.status === "Paid") {
              paidBookingIds.add(bId);
            }
          });
        }
      });

      // 2. Fetch Real-time Appwrite Bookings, Guests, Payments
      try {
        const [bookingsRes, guestsRes, paymentsRes] = await Promise.all([
          databases.listDocuments(appwriteConfig.databaseId, "bookings", [Query.orderDesc("$createdAt")]),
          databases.listDocuments(appwriteConfig.databaseId, "booking_guests"),
          databases.listDocuments(appwriteConfig.databaseId, "booking_payments"),
        ]);

        const now = new Date();
        const mappedBookings: BookingItem[] = [];

        bookingsRes.documents.forEach((b: any) => {
          const guest = guestsRes.documents.find((g: any) => g.bookingId === b.$id);
          const payment = paymentsRes.documents.find((p: any) => p.bookingId === b.$id);

          const checkOutDate = new Date(b.checkOut);
          const isCompleted = b.status === "Completed" || checkOutDate < now;

          // Exclude Cancelled, Pending, or Refunded bookings
          if (isCompleted && b.status !== "Cancelled" && b.status !== "Pending") {
            const gross = payment ? Number(payment.totalAmount || 0) : 12000;
            const fee = Math.round((gross * effectiveFeePercent) / 100);
            const earnings = gross - fee;

            let bStatus: "Completed" | "Pending Withdrawal" | "Paid" = "Completed";
            if (paidBookingIds.has(b.$id)) {
              bStatus = "Paid";
            } else if (withdrawnOrPendingBookingIds.has(b.$id)) {
              bStatus = "Pending Withdrawal";
            }

            mappedBookings.push({
              id: b.$id,
              guestName: guest ? `${guest.firstName} ${guest.lastName}`.trim() : "Guest",
              propertyName: b.hotelName || "Racoonn Property",
              checkIn: new Date(b.checkIn).toLocaleDateString(),
              checkOut: checkOutDate.toLocaleDateString(),
              completionDate: checkOutDate.toLocaleDateString(),
              grossAmount: gross,
              platformFee: fee,
              vendorEarnings: earnings,
              status: bStatus,
            });
          }
        });

        setBookings(mappedBookings);
      } catch (dbErr) {
        console.warn("Appwrite real-time booking fetch warning:", dbErr);
        setBookings([]);
      }
    } catch (err) {
      console.error("Failed to load invoice and booking data:", err);
    } finally {
      setLoading(false);
      setIsBookingsLoading(false);
    }
  }, [effectiveFeePercent]);

  useEffect(() => {
    loadInvoicesAndBookings();
  }, [loadInvoicesAndBookings]);

  // Calculate Weekly Withdrawal Limit (Max 2 requests per week)
  const weeklyWithdrawalStats = useMemo(() => {
    const now = new Date();
    // Get start of current week (Monday)
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diffToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    // Count withdrawal requests submitted in the current week
    const usedThisWeek = invoices.filter((inv) => {
      if (inv.type !== "withdrawal" || inv.status === "Cancelled" || inv.status === "Rejected") return false;
      const invDate = new Date(inv.createdAt || inv.issueDate);
      return invDate >= startOfWeek;
    }).length;

    const limit = 2;
    const remaining = Math.max(0, limit - usedThisWeek);
    const canSubmit = remaining > 0;

    return { usedThisWeek, limit, remaining, canSubmit };
  }, [invoices, profile, user]);

  // Filtered Eligible Completed Bookings
  const eligibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesProperty = propertyFilter === "All" || b.propertyName === propertyFilter;

      return matchesSearch && matchesProperty;
    });
  }, [bookings, searchQuery, propertyFilter]);

  // Distinct properties for dropdown filter
  const distinctProperties = useMemo(() => {
    const props = Array.from(new Set(bookings.map((b) => b.propertyName)));
    return props;
  }, [bookings]);

  // Selected Bookings financial calculations
  const selectedBookings = useMemo(() => {
    return bookings.filter((b) => selectedBookingIds.includes(b.id));
  }, [bookings, selectedBookingIds]);

  const selectedGrossTotal = useMemo(
    () => selectedBookings.reduce((sum, b) => sum + b.grossAmount, 0),
    [selectedBookings]
  );

  const selectedPlatformFeeTotal = useMemo(
    () => Math.round((selectedGrossTotal * effectiveFeePercent) / 100),
    [selectedGrossTotal, effectiveFeePercent]
  );

  const selectedNetEarningsTotal = useMemo(
    () => selectedGrossTotal - selectedPlatformFeeTotal,
    [selectedGrossTotal, selectedPlatformFeeTotal]
  );

  // Overall Financial Summaries
  const totalCompletedBookingsCount = useMemo(() => {
    return bookings.length;
  }, [bookings]);

  const netAvailableBalance = useMemo(() => {
    return bookings
      .filter((b) => b.status === "Completed")
      .reduce((sum, b) => sum + b.vendorEarnings, 0);
  }, [bookings]);

  const pendingWithdrawalTotal = useMemo(() => {
    const fromInvoices = invoices
      .filter((inv) => inv.type === "withdrawal" && (inv.status === "Sent" || inv.status === "Draft"))
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const fromBookings = bookings
      .filter((b) => b.status === "Pending Withdrawal")
      .reduce((sum, b) => sum + b.vendorEarnings, 0);

    return Math.max(fromInvoices, fromBookings);
  }, [invoices, bookings]);

  const totalPaidOutSum = useMemo(() => {
    const fromInvoices = invoices
      .filter((inv) => inv.type === "withdrawal" && inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const fromBookings = bookings
      .filter((b) => b.status === "Paid")
      .reduce((sum, b) => sum + b.vendorEarnings, 0);

    return Math.max(fromInvoices, fromBookings);
  }, [invoices, bookings]);

  // Select / Deselect All logic
  const handleToggleSelectAll = () => {
    const availableEligibleIds = eligibleBookings.filter((b) => b.status === "Completed").map((b) => b.id);
    if (selectedBookingIds.length === availableEligibleIds.length && availableEligibleIds.length > 0) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(availableEligibleIds);
    }
  };

  const handleToggleSelectBooking = (id: string) => {
    if (selectedBookingIds.includes(id)) {
      setSelectedBookingIds(selectedBookingIds.filter((bId) => bId !== id));
    } else {
      setSelectedBookingIds([...selectedBookingIds, id]);
    }
  };

  // Open Create Withdrawal Invoice Modal
  const handleOpenCreateModal = () => {
    if (selectedBookingIds.length === 0) return;

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setInvoiceNumber(`RAC-WD-${new Date().getFullYear()}-${randomSuffix}`);
    setIssueDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    const bName = profile?.businessName || profile?.firstName || "Vendor Partner";
    const name = profile?.firstName ? `${profile.firstName} ${profile.lastName || ""}`.trim() : "Vendor";
    const mail = profile?.email || user?.email || "";
    const ph = profile?.phone || "";
    const addr = profile?.address ? `${profile.address}, ${profile.city || ""}, ${profile.state || ""}` : "India";
    const gst = profile?.gstNumber || "";

    setVendorBusiness(bName);
    setVendorName(name);
    setVendorEmail(mail);
    setVendorPhone(ph);
    setVendorAddress(addr);
    setVendorGstin(gst);

    setBankName(profile?.bankName || "HDFC Bank");
    setAccountHolder(profile?.accountHolder || name || bName);
    setAccountNumber(profile?.accountNumber || "987654321098");
    setIfsc(profile?.ifsc || "HDFC0001234");
    setUpiId(profile?.upiId || `${ph || "vendor"}@upi`);

    setNotes("Please process this payout invoice to the specified bank account / UPI ID. Thank you!");
    setIsCreateOpen(true);
  };

  // Submit Invoice to Admin API
  const handleConfirmSubmitInvoice = async (status: "Draft" | "Sent") => {
    if (!vendorBusiness || !vendorEmail || selectedBookingIds.length === 0) return;

    // Generate Line Items per selected booking + platform fee deduction
    const generatedItems: LineItem[] = [];

    selectedBookings.forEach((b) => {
      generatedItems.push({
        id: `gross-${b.id}`,
        description: `Booking #${b.id} Revenue (${b.guestName} · ${b.propertyName})`,
        quantity: 1,
        unitPrice: b.grossAmount,
        amount: b.grossAmount,
        bookingId: b.id,
      });
    });

    // Add Platform Service Fee deduction line
    generatedItems.push({
      id: `fee-deduction-${Date.now()}`,
      description: `Racoonn Platform Commission Fee (18% + 18% GST Deduction)`,
      quantity: 1,
      unitPrice: -selectedPlatformFeeTotal,
      amount: -selectedPlatformFeeTotal,
    });

    const invoiceObj: Invoice = {
      id: `inv-wd-${Date.now()}`,
      invoiceNumber,
      type: "withdrawal",
      vendorId: profile?.$id || user?.$id || "v-1",
      vendorName,
      vendorBusiness,
      vendorEmail,
      vendorPhone,
      vendorAddress,
      vendorGstin,
      bankName,
      accountHolder,
      accountNumber,
      ifsc,
      upiId,
      bookingIds: selectedBookingIds,
      grossAmount: selectedGrossTotal,
      platformFeeRate: effectiveFeePercent,
      platformFeeAmount: selectedPlatformFeeTotal,
      issueDate,
      dueDate,
      items: generatedItems,
      subtotal: selectedGrossTotal,
      taxRate: Number(manualGstAmount) > 0 ? 24 : 0,
      taxAmount: Number(manualGstAmount) || 0,
      discount: 0,
      totalAmount: selectedNetEarningsTotal + (Number(manualGstAmount) || 0),
      status,
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceObj),
      });
      const json = await res.json();
      if (json.success) {
        setIsConfirmOpen(false);
        setIsCreateOpen(false);
        setSelectedBookingIds([]);
        loadInvoicesAndBookings();
      }
    } catch (err) {
      console.error("Failed to submit withdrawal invoice:", err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Weekly Limit Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <FileText className="text-rose-600" size={32} /> Real-Time Vendor Withdrawal & Invoice System
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select completed bookings, calculate net earnings, and submit payout invoices to Racoonn Admin.
          </p>
        </div>

        {/* Weekly Quota Badge */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-xs">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weekly Requests Limit</div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                className={`font-black rounded-lg px-2.5 py-0.5 text-xs ${
                  weeklyWithdrawalStats.canSubmit
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-rose-100 text-rose-800 border-rose-200"
                }`}
              >
                {weeklyWithdrawalStats.usedThisWeek} / {weeklyWithdrawalStats.limit} Used This Week
              </Badge>
              <span className="text-xs text-gray-500 font-medium">
                ({weeklyWithdrawalStats.remaining} Remaining)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="rounded-3xl border border-gray-200 shadow-xs bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Completed Stays</span>
              <div className="p-2 rounded-xl bg-gray-100 text-gray-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900 mt-2">{totalCompletedBookingsCount} Bookings</div>
            <p className="text-xs text-gray-400 mt-1">Eligible for payout withdrawal</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-emerald-100 shadow-xs bg-emerald-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Available Net Balance</span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Banknote size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2">₹{netAvailableBalance.toLocaleString("en-IN")}</div>
            <p className="text-xs text-emerald-600 mt-1">Ready for current withdrawal</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-amber-100 shadow-xs bg-amber-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Admin Approval</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <Clock size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 mt-2">₹{pendingWithdrawalTotal.toLocaleString("en-IN")}</div>
            <p className="text-xs text-amber-600 mt-1">Submitted invoices pending payment</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border border-blue-100 shadow-xs bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Total Paid Out</span>
              <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-blue-700 mt-2">₹{totalPaidOutSum.toLocaleString("en-IN")}</div>
            <p className="text-xs text-blue-600 mt-1">Total transferred to vendor bank</p>
          </CardContent>
        </Card>
      </div>

      {/* STEP 1: Multi-Booking Selection Table Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckSquare className="text-rose-600" size={20} /> Select Completed Bookings For Withdrawal Invoice
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Check completed bookings below to automatically calculate revenue, platform fees, and net vendor payout.
            </p>
          </div>
        </div>

        {/* Filters & Actions Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search guest or booking ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl text-xs h-9 bg-gray-50/50"
              />
            </div>

            {/* Property Filter */}
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="p-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-700 h-9"
            >
              <option value="All">All Properties</option>
              {distinctProperties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSelectAll}
              className="rounded-xl text-xs font-bold gap-1.5 border-gray-200"
            >
              {selectedBookingIds.length > 0 && selectedBookingIds.length === eligibleBookings.filter((b) => b.status === "Completed").length ? (
                <>
                  <CheckSquare size={14} className="text-rose-600" /> Deselect All
                </>
              ) : (
                <>
                  <Square size={14} /> Select All Eligible ({eligibleBookings.filter((b) => b.status === "Completed").length})
                </>
              )}
            </Button>

            {/* Submit Withdrawal Request Button */}
            <Button
              onClick={handleOpenCreateModal}
              disabled={selectedBookingIds.length === 0 || !weeklyWithdrawalStats.canSubmit}
              className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs px-5 py-2 shadow-md gap-2"
            >
              <Plus size={16} /> Generate & Send Invoice ({selectedBookingIds.length})
            </Button>
          </div>
        </div>

        {/* Selected Summary Live Banner */}
        {selectedBookingIds.length > 0 && (
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-600 text-white font-black">
                {selectedBookingIds.length}
              </div>
              <div>
                <span className="font-bold text-gray-900 block text-sm">
                  {selectedBookingIds.length} Bookings Selected For Payout
                </span>
                <span className="text-gray-500">
                  Gross Revenue: ₹{selectedGrossTotal.toLocaleString("en-IN")} · Platform Fee (18% + GST): -₹
                  {selectedPlatformFeeTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-gray-500 block text-[10px] uppercase font-bold">Net Vendor Earnings</span>
              <span className="text-lg font-black text-rose-600">
                ₹{selectedNetEarningsTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* Completed Bookings Selection Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 pl-4 w-10"></th>
                <th className="p-3">Booking ID</th>
                <th className="p-3">Guest Name</th>
                <th className="p-3">Property</th>
                <th className="p-3">Completion Date</th>
                <th className="p-3 text-right">Gross Amount</th>
                <th className="p-3 text-right">Fee (18%+GST)</th>
                <th className="p-3 text-right">Net Earnings</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {eligibleBookings.map((b) => {
                const isSelected = selectedBookingIds.includes(b.id);
                const isLocked = b.status === "Pending Withdrawal" || b.status === "Paid";
                return (
                  <tr
                    key={b.id}
                    onClick={() => !isLocked && handleToggleSelectBooking(b.id)}
                    className={`transition-colors ${
                      isLocked
                        ? "bg-gray-50/60 opacity-60 cursor-not-allowed"
                        : isSelected
                        ? "bg-rose-50/40 hover:bg-rose-50/70 cursor-pointer"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    <td className="p-3 pl-4 text-center">
                      {isLocked ? (
                        <Lock size={14} className="text-gray-400 mx-auto" />
                      ) : (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectBooking(b.id)}
                          className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                        />
                      )}
                    </td>
                    <td className="p-3 font-bold text-gray-900 font-mono">{b.id}</td>
                    <td className="p-3 font-semibold text-gray-900">{b.guestName}</td>
                    <td className="p-3 text-gray-600">{b.propertyName}</td>
                    <td className="p-3 text-gray-500">{b.completionDate}</td>
                    <td className="p-3 text-right font-bold text-gray-900">₹{b.grossAmount.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-semibold text-rose-600">-₹{b.platformFee.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-black text-emerald-700">₹{b.vendorEarnings.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-center">
                      <Badge
                        className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                          b.status === "Paid"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : b.status === "Pending Withdrawal"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}

              {!isBookingsLoading && eligibleBookings.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <CheckSquare className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="font-semibold text-gray-700">No Eligible Completed Bookings Found</p>
                    <p className="text-xs text-gray-400 mt-1">Bookings must be completed and checked out to be eligible for withdrawal.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STEP 2: Submitted Invoices & Withdrawal Requests List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-rose-600" size={20} /> Withdrawal Invoices & Platform Statements
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Track submitted payout requests, admin approval status, and download official invoices.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="p-4 pl-6 whitespace-nowrap">Invoice Ref #</th>
                <th className="p-4 whitespace-nowrap">Type</th>
                <th className="p-4 whitespace-nowrap">Date / Due</th>
                <th className="p-4 whitespace-nowrap">Bookings Count</th>
                <th className="p-4 whitespace-nowrap">Net Payout Payable</th>
                <th className="p-4 whitespace-nowrap">Destination Account</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const isWithdrawal = inv.type === "withdrawal";
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6 font-bold text-gray-900 font-mono text-xs">
                      <div className="whitespace-nowrap">{inv.invoiceNumber}</div>
                      {inv.adminRemarks && (
                        <div className="mt-1 max-w-60 truncate text-[11px] font-normal text-amber-800 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/80" title={inv.adminRemarks}>
                          Note: {inv.adminRemarks}
                        </div>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {isWithdrawal ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold rounded-lg px-2.5 py-0.5 gap-1 text-[10px]">
                          <ArrowUpRight size={12} /> Money Withdrawal
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold rounded-lg px-2.5 py-0.5 gap-1 text-[10px]">
                          <ArrowDownLeft size={12} /> Platform Bill
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap">
                      <div className="font-semibold text-gray-900 whitespace-nowrap">{inv.issueDate}</div>
                      <div className="text-gray-400 text-[11px] whitespace-nowrap">Due: {inv.dueDate}</div>
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-800 whitespace-nowrap">
                      {inv.bookingIds ? `${inv.bookingIds.length} Bookings` : "1 Service"}
                    </td>
                    <td className="p-4 font-black text-gray-900 text-base whitespace-nowrap">
                      ₹{inv.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-xs whitespace-nowrap">
                      {inv.bankName ? (
                        <div>
                          <p className="font-semibold text-gray-800 whitespace-nowrap">{inv.bankName}</p>
                          <p className="text-gray-400 whitespace-nowrap">A/C: •••• {inv.accountNumber?.slice(-4) || "N/A"}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 whitespace-nowrap">Standard Payout</span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <Badge
                        className={`rounded-lg px-3 py-1 font-bold whitespace-nowrap ${
                          inv.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : inv.status === "Sent"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : inv.status === "Rejected"
                            ? "bg-rose-100 text-rose-700 border-rose-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                        }`}
                      >
                        {inv.status === "Sent" ? "Pending Admin Approval" : inv.status}
                      </Badge>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPreviewOpen(true);
                          }}
                          className="rounded-xl gap-1 font-semibold hover:bg-gray-100 text-xs"
                        >
                          <Eye size={14} /> View Invoice
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPreviewOpen(true);
                            setTimeout(() => {
                              window.print();
                            }, 300);
                          }}
                          className="rounded-xl gap-1 border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs"
                        >
                          <Download size={14} /> Download
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <FileText className="mx-auto text-gray-300 mb-2" size={36} />
                    <p className="font-semibold text-gray-700">No Withdrawal Invoices Generated Yet</p>
                    <p className="text-xs text-gray-400 mt-1">Select completed bookings above to request your payout.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE WITHDRAWAL INVOICE MODAL */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Banknote className="text-rose-600" size={24} /> Withdrawal Payout Invoice & Request
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Generating payout invoice for {selectedBookingIds.length} selected completed bookings.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-gray-900">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-rose-50/60 p-4 rounded-2xl border border-rose-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-white rounded-xl p-2 shadow-xs border border-rose-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <Image src="/racoonn-logo-icon.png" alt="Racoonn Icon" width={32} height={32} className="object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Vendor Money Withdrawal Invoice</h4>
                  <p className="text-xs text-gray-500">Issued by {vendorBusiness} to Racoonn Admin</p>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto">
                <span className="text-xs font-semibold text-gray-400 uppercase">Invoice Ref #</span>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="rounded-xl font-bold text-rose-600 bg-white text-right h-8 w-full sm:w-48"
                />
              </div>
            </div>

            {/* Vendor Profile & Recipient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-200">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Vendor Partner Details
                </label>
                <div className="space-y-2">
                  <Input
                    placeholder="Business Name"
                    value={vendorBusiness}
                    onChange={(e) => setVendorBusiness(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                  <Input
                    placeholder="Owner Contact Name"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Email Address"
                      value={vendorEmail}
                      onChange={(e) => setVendorEmail(e.target.value)}
                      className="rounded-xl text-xs bg-white"
                    />
                    <Input
                      placeholder="Phone Number"
                      value={vendorPhone}
                      onChange={(e) => setVendorPhone(e.target.value)}
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                  Dates & Recipient Admin
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Issue Date</label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Expected Payout Date</label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs space-y-1">
                  <p className="font-bold text-gray-800">Recipient Admin:</p>
                  <p className="text-gray-600">Racoonn Hospitality Technologies Pvt. Ltd.</p>
                </div>
              </div>
            </div>

            {/* Destination Bank Details */}
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CreditCard size={16} /> Destination Bank Account / UPI (For Admin Payout Transfer)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Bank Name</label>
                  <Input
                    placeholder="e.g. HDFC Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Account Holder</label>
                  <Input
                    placeholder="Account Holder Name"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">Account Number</label>
                  <Input
                    placeholder="Account Number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 mb-1">IFSC Code</label>
                  <Input
                    placeholder="IFSC Code"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-600 mb-1">UPI ID (Optional)</label>
                  <Input
                    placeholder="e.g. vendor@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Selected Bookings Itemized Table */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Itemized Selected Bookings & Platform Commission ({selectedBookingIds.length} Bookings)
              </label>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                    <tr>
                      <th className="p-3">Booking ID & Details</th>
                      <th className="p-3 text-right">Gross Booking (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {selectedBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="p-3">
                          <span className="font-bold text-gray-900 font-mono mr-2">#{b.id}</span>
                          <span className="text-gray-700">{b.guestName}</span>
                          <span className="text-gray-400 text-[11px] block">{b.propertyName} · {b.completionDate}</span>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          ₹{b.grossAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-rose-50/50 font-bold">
                      <td className="p-3 text-rose-700">
                        Racoonn Platform Service Fee Deduction (18% + GST)
                      </td>
                      <td className="p-3 text-right text-rose-600 font-black">
                        -₹{selectedPlatformFeeTotal.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pt-2">
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Notes for Admin
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="w-full md:w-80 bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Gross Booking Revenue:</span>
                  <span className="font-bold text-gray-900">₹{selectedGrossTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Platform Fee (18% + GST):</span>
                  <span className="font-bold">-₹{selectedPlatformFeeTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-indigo-600 items-center">
                  <span>Add GST (24%) Manual Amount:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-indigo-600">₹</span>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={manualGstAmount}
                      onChange={(e) => setManualGstAmount(e.target.value)}
                      className="w-20 h-7 text-right rounded font-bold text-indigo-600 bg-indigo-50 border-indigo-200 p-1"
                    />
                  </div>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-base font-black text-emerald-700">
                  <span>Net Payable To Vendor:</span>
                  <span>₹{(selectedNetEarningsTotal + (Number(manualGstAmount) || 0)).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleConfirmSubmitInvoice("Draft")}
              className="rounded-xl font-semibold border-gray-300"
            >
              Save Draft
            </Button>
            <Button
              onClick={() => setIsConfirmOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md font-bold gap-2"
            >
              <Send size={16} /> Request Withdrawal (₹{selectedNetEarningsTotal.toLocaleString("en-IN")})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="text-rose-600" size={24} /> Confirm Withdrawal Invoice Submission
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 mt-2 space-y-2">
              <p>
                You are submitting a payout withdrawal request for <strong>{selectedBookingIds.length} completed bookings</strong> totaling <strong>₹{selectedNetEarningsTotal.toLocaleString("en-IN")}</strong>.
              </p>
              <p className="text-amber-700 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Weekly Request Counter: This will use request <strong>{weeklyWithdrawalStats.usedThisWeek + 1} of {weeklyWithdrawalStats.limit}</strong> for this week.
              </p>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="rounded-xl">
              Back
            </Button>
            <Button
              onClick={() => handleConfirmSubmitInvoice("Sent")}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold gap-1.5"
            >
              <Send size={16} /> Confirm & Send To Admin
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
                  <div className="relative w-40 h-12 mb-2">
                    <Image src="/racoonn-logo-text.png" alt="Racoonn Logo" fill className="object-contain object-left" unoptimized />
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Racoonn Hospitality Technologies Private Limited</p>
                  <p className="text-xs text-gray-500">Devbhoomi Uttarakhand, India</p>
                  <p className="text-xs text-gray-500">support@racoonn.com</p>
                </div>

                <div className="text-right">
                  <h2 className="text-2xl font-black text-rose-600 uppercase tracking-tight">
                    {selectedInvoice.type === "withdrawal" ? "WITHDRAWAL INVOICE" : "TAX INVOICE"}
                  </h2>
                  <p className="text-sm font-bold text-gray-900 mt-1">#{selectedInvoice.invoiceNumber}</p>
                  <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                    <p><span className="font-semibold text-gray-700">Issue Date:</span> {selectedInvoice.issueDate}</p>
                    <p><span className="font-semibold text-gray-700">Due / Payout Date:</span> {selectedInvoice.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Vendor & Admin details */}
              <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {selectedInvoice.type === "withdrawal" ? "Issued By (Vendor Partner)" : "Billed To (Vendor Partner)"}
                  </h4>
                  <p className="text-sm font-bold text-gray-900">{selectedInvoice.vendorBusiness}</p>
                  <p className="text-gray-600 mt-0.5">Attn: {selectedInvoice.vendorName}</p>
                  <p className="text-gray-600">{selectedInvoice.vendorAddress}</p>
                  <p className="text-gray-600">Email: {selectedInvoice.vendorEmail}</p>
                  <p className="text-gray-600">Phone: {selectedInvoice.vendorPhone}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {selectedInvoice.type === "withdrawal" ? "Billed To (Platform Admin)" : "Issued By (Platform Admin)"}
                  </h4>
                  <p className="text-sm font-bold text-gray-900">Racoonn Hospitality Technologies</p>
                  <p className="text-gray-600 mt-0.5">Admin Finance Team</p>
                  <p className="text-gray-600">Devbhoomi Uttarakhand, India</p>
                  <p className="text-gray-600">Email: admin@racoonn.com</p>
                  <div className="mt-3">
                    <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Status</span>
                    <Badge
                      className={`rounded-lg px-3 py-1 font-bold text-xs ${
                        selectedInvoice.status === "Paid"
                          ? "bg-emerald-600 text-white"
                          : selectedInvoice.status === "Sent"
                          ? "bg-amber-600 text-white"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {selectedInvoice.status === "Sent" ? "Pending Admin Approval" : selectedInvoice.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Vendor Bank Details */}
              {selectedInvoice.type === "withdrawal" && (selectedInvoice.bankName || selectedInvoice.upiId) && (
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard size={16} /> Vendor Destination Bank Details For Payout Transfer
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

              {/* Itemized Bookings Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-900 text-white font-bold uppercase">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Price (₹)</th>
                      <th className="p-3 text-right">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-gray-900">{item.description}</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-right">
                          {item.unitPrice < 0
                            ? `-₹${Math.abs(item.unitPrice).toLocaleString("en-IN")}`
                            : `₹${item.unitPrice.toLocaleString("en-IN")}`}
                        </td>
                        <td className={`p-3 text-right font-bold ${item.amount < 0 ? "text-rose-600" : "text-gray-900"}`}>
                          {item.amount < 0
                            ? `-₹${Math.abs(item.amount).toLocaleString("en-IN")}`
                            : `₹${item.amount.toLocaleString("en-IN")}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-between items-end text-xs">
                <div className="max-w-xs text-gray-500">
                  {selectedInvoice.notes && (
                    <div>
                      <span className="font-bold text-gray-700 block mb-1">Notes:</span>
                      <p className="bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>

                <div className="w-64 bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                  {selectedInvoice.grossAmount && (
                    <div className="flex justify-between text-gray-600">
                      <span>Gross Booking Revenue:</span>
                      <span className="font-bold text-gray-900">₹{selectedInvoice.grossAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {selectedInvoice.platformFeeAmount && (
                    <div className="flex justify-between text-rose-600">
                      <span>Platform Fee ({selectedInvoice.platformFeeRate}%):</span>
                      <span className="font-bold">-₹{selectedInvoice.platformFeeAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between text-sm font-black text-emerald-700">
                    <span>Net Payable To Vendor:</span>
                    <span>₹{selectedInvoice.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
