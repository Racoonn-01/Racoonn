"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Send, CreditCard, Lock, ShieldAlert } from "lucide-react";

interface SingleWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  profile: any;
  user: any;
  onSuccess: () => void;
}

export default function SingleWithdrawalModal({ isOpen, onClose, booking, profile, user, onSuccess }: SingleWithdrawalModalProps) {
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

  const [notes, setNotes] = useState("Please process this payout invoice to the specified bank account / UPI ID. Thank you!");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
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
    }
  }, [isOpen, booking, profile, user]);

  const handleSubmit = async () => {
    if (!vendorBusiness || !vendorEmail || !booking) return;
    setIsSubmitting(true);

    const baseRoomAmount = booking.baseAmount || parseFloat((booking.amount || "0").replace(/[^0-9.-]+/g, "")) || 0;
    const addonsNum = booking.addons || 0;
    let vendorDiscount = 0;
    if (booking.specialRequests) {
      const vdMatch = booking.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
      if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
    } else {
      vendorDiscount = booking.discount || 0;
    }

    const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
    const effectiveFeePercent = profile?.allow24PercentGst ? 24 : 18;
    const platformFeeAmount = Math.round(vendorGross * (effectiveFeePercent / 100));
    const vendorEarnings = vendorGross - platformFeeAmount;

    const generatedItems = [
      {
        id: `gross-${booking.id}`,
        description: `Booking #${booking.id} Revenue (${booking.guest} · ${booking.property})`,
        quantity: 1,
        unitPrice: vendorGross,
        amount: vendorGross,
        bookingId: booking.id,
      },
      {
        id: `fee-deduction-${Date.now()}`,
        description: `Racoonn Platform Commission Fee (Including GST)`,
        quantity: 1,
        unitPrice: -platformFeeAmount,
        amount: -platformFeeAmount,
      }
    ];

    const invoiceObj = {
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
      bookingIds: [booking.id],
      grossAmount: vendorGross,
      platformFeeRate: effectiveFeePercent,
      platformFeeAmount: platformFeeAmount,
      issueDate,
      dueDate,
      items: generatedItems,
      subtotal: vendorGross,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      totalAmount: vendorEarnings,
      status: "Sent",
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
        onSuccess();
        onClose();
      } else {
        alert("Failed to submit invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-50 p-0 border-0 rounded-3xl gap-0">
        <DialogHeader className="p-6 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-gray-900">Raise Withdrawal Request</DialogTitle>
              <DialogDescription className="text-gray-500 mt-1">Review your details and submit to Racoonn Admin for payout.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 text-sm">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex gap-3 text-xs">
            <ShieldAlert className="shrink-0 text-amber-600" size={18} />
            <p>
              <strong>Important:</strong> You are raising a withdrawal request for booking <strong>{booking.id}</strong>. 
              Ensure your bank details are correct. Admin will process this within the expected payout date.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Col */}
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Vendor Billing Details</label>
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <Input placeholder="Business/Property Name" value={vendorBusiness} onChange={(e) => setVendorBusiness(e.target.value)} className="rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white transition-all" />
                  <Input placeholder="Legal Entity / Full Name" value={vendorName} onChange={(e) => setVendorName(e.target.value)} className="rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white transition-all" />
                  <Input placeholder="GSTIN (Optional)" value={vendorGstin} onChange={(e) => setVendorGstin(e.target.value)} className="rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white transition-all" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Email Address" value={vendorEmail} onChange={(e) => setVendorEmail(e.target.value)} className="rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white transition-all" />
                    <Input placeholder="Phone Number" value={vendorPhone} onChange={(e) => setVendorPhone(e.target.value)} className="rounded-xl text-xs bg-gray-50 border-transparent focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Dates</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Issue Date</label>
                    <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="rounded-xl text-xs bg-white" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Expected Payout Date</label>
                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl text-xs bg-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col */}
            <div className="space-y-6">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CreditCard size={16} /> Destination Bank / UPI
                </label>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Bank Name</label>
                    <Input placeholder="e.g. HDFC Bank" value={bankName} onChange={(e) => setBankName(e.target.value)} className="rounded-xl text-xs bg-white border-emerald-100" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Account Holder</label>
                    <Input placeholder="Account Holder Name" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} className="rounded-xl text-xs bg-white border-emerald-100" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">Account Number</label>
                    <Input placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="rounded-xl text-xs bg-white border-emerald-100" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">IFSC Code</label>
                    <Input placeholder="IFSC Code" value={ifsc} onChange={(e) => setIfsc(e.target.value)} className="rounded-xl text-xs bg-white border-emerald-100" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">UPI ID (Optional)</label>
                    <Input placeholder="e.g. vendor@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="rounded-xl text-xs bg-white border-emerald-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-white border-t border-gray-100 rounded-b-3xl sm:justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
            <Lock size={14} /> End-to-End Encrypted Secure Transfer
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-semibold px-6 hover:bg-gray-100" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gray-900 hover:bg-black text-white font-bold rounded-xl px-6 gap-2 shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.02]">
              {isSubmitting ? "Sending..." : "Submit to Admin"} <Send size={16} />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
