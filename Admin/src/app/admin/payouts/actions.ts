"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";

export interface PayoutItem {
  id: string;
  realId: string;
  vendor: string;
  vendorEmail?: string;
  propertyName: string;
  guestName: string;
  grossAmount: number;
  platformFee: number;
  netPayout: number;
  amount: number; // displayed net payout
  account: string;
  method: string;
  status: string;
  date: string;
  createdAt: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifsc?: string;
}

export async function getPayoutsData() {
  try {
    const db = appwriteServer.databases;

    // Fetch vendors, invoices, bookings, properties, and payments in parallel
    const [vendorsReq, invoicesDoc, bookingsReq, paymentsReq, propertiesReq] = await Promise.all([
      db.listDocuments(DATABASE_ID, VENDOR_COLLECTION, [Query.limit(500)]).catch(() => ({ documents: [] })),
      db.getDocument(DATABASE_ID, 'properties', 'cms_invoices_v1').catch(() => null),
      db.listDocuments(DATABASE_ID, 'bookings', [Query.limit(1000), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'booking_payments', [Query.limit(1000), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'properties', [Query.limit(500)]).catch(() => ({ documents: [] }))
    ]);

    const propertyVendorMap: Record<string, string> = {};
    propertiesReq.documents.forEach((p: any) => {
      if (p.vendorId) {
        propertyVendorMap[p.$id] = p.vendorId;
      }
    });

    const vendorMap: Record<string, any> = {};
    vendorsReq.documents.forEach((v: any) => {
      vendorMap[v.$id] = v;
    });

    let pendingCount = 0;
    let pendingTotal = 0;
    let processedThisWeek = 0;
    const vendorCount = vendorsReq.documents.length || 1;
    let escrowBalance = 0;
    const payouts: PayoutItem[] = [];

    let allInvoices = invoicesDoc?.details ? JSON.parse(invoicesDoc.details) : [];
    const withdrawalInvoices = allInvoices.filter((inv: any) => inv.type === "withdrawal");

    // 1. Collect all already invoiced booking IDs
    const invoicedBookingIds = new Set<string>();
    withdrawalInvoices.forEach((inv: any) => {
      if (inv.bookingIds && Array.isArray(inv.bookingIds)) {
        inv.bookingIds.forEach((id: string) => invoicedBookingIds.add(id));
      }
    });

    // 2. Identify Bookings > 2m old that are not invoiced
    const nowMs = Date.now();
    const TWO_MINUTES_MS = 2 * 60 * 1000;
    let newlyGeneratedInvoices = false;

    // Group eligible bookings by vendorId
    const pendingByVendor: Record<string, any[]> = {};

    bookingsReq.documents.forEach((b: any) => {
      const is2mOld = (nowMs - new Date(b.$createdAt).getTime()) >= TWO_MINUTES_MS;
      const isCompleted = b.status === "completed" || b.status === "Completed" || b.status === "confirmed" || b.status === "Confirmed" || b.status === "Pending Withdrawal" || b.status === "Paid_Vendor" || b.status === "Paid";
      const resolvedVendorId = b.vendorId || propertyVendorMap[b.hotelId] || "unknown_vendor";

      if (is2mOld && isCompleted && !invoicedBookingIds.has(b.$id)) {
        if (!pendingByVendor[resolvedVendorId]) pendingByVendor[resolvedVendorId] = [];
        pendingByVendor[resolvedVendorId].push(b);
      }
    });

    // 3. Auto-generate invoices for each vendor
    for (const [vendorId, bookings] of Object.entries(pendingByVendor)) {
      const vendorObj = vendorMap[vendorId] || {};
      
      let grossTotal = 0;
      let platformFeeTotal = 0;
      let netTotal = 0;
      const bIds: string[] = [];

      bookings.forEach((b: any) => {
        const payment = paymentsReq.documents.find((p: any) => p.bookingId === b.$id);
        let gross = b.totalAmount || b.priceAfterTax || 0;
        if (payment && Number(payment.totalAmount) > 0) gross = Number(payment.totalAmount);
        
        const effectiveFeePercent = vendorObj?.allow24PercentGst ? 24 : 18;
        const fee = Math.round(gross * (effectiveFeePercent / 100));
        const net = Math.max(1, gross - fee);

        grossTotal += gross;
        platformFeeTotal += fee;
        netTotal += net;
        bIds.push(b.$id);
      });

      if (bIds.length > 0) {
        const newInvoiceId = `W-AUTO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const newInvoice = {
          id: newInvoiceId,
          invoiceNumber: newInvoiceId,
          type: "withdrawal",
          vendorId: vendorId,
          vendorName: vendorObj.businessName || vendorObj.hotelName || "Partner Vendor",
          vendorBusiness: vendorObj.businessName || vendorObj.hotelName || "Partner Property",
          vendorEmail: vendorObj.email || "vendor@racoonn.com",
          vendorPhone: vendorObj.phone || "",
          vendorAddress: vendorObj.address || "",
          bookingIds: bIds,
          grossAmount: grossTotal,
          platformFeeRate: vendorObj?.allow24PercentGst ? 24 : 18,
          platformFeeAmount: platformFeeTotal,
          subtotal: grossTotal,
          taxRate: 0,
          taxAmount: 0,
          discount: 0,
          totalAmount: netTotal,
          status: "Sent", // Instantly push to Admin
          bankName: vendorObj.bankName || "",
          accountHolder: vendorObj.accountHolder || "",
          accountNumber: vendorObj.accountNumber || "",
          ifsc: vendorObj.ifsc || "",
          upiId: vendorObj.upiId || "",
          issueDate: new Date().toISOString(),
          dueDate: new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: `item-${Date.now()}`,
              description: `Auto-withdrawal for ${bIds.length} bookings (>2min old)`,
              quantity: 1,
              unitPrice: netTotal,
              amount: netTotal
            }
          ]
        };

        allInvoices.unshift(newInvoice);
        withdrawalInvoices.unshift(newInvoice);
        newlyGeneratedInvoices = true;
      }
    }

    // 4. Save back to Appwrite if we generated new invoices
    if (newlyGeneratedInvoices) {
      try {
        await db.updateDocument(DATABASE_ID, 'properties', 'cms_invoices_v1', {
          details: JSON.stringify(allInvoices)
        });
      } catch (err) {
        console.warn("Could not save auto-generated invoices to Appwrite:", err);
      }
    }

    // 5. Parse UI mapping

    withdrawalInvoices.forEach((inv: any) => {
      const vendorObj = vendorMap[inv.vendorId] || {};
      
      const netPayout = inv.totalAmount || 0;
      const grossAmount = inv.grossAmount || 0;
      const platformFee = inv.platformFeeAmount || 0;
      const status = inv.status || 'Draft';
      const date = new Date(inv.issueDate || new Date().toISOString());

      let pStatus = "Processing";
      if (status === 'Paid' || status === 'Approved') {
        pStatus = "Processed";
        processedThisWeek += netPayout;
      } else if (status === 'Sent' || status === 'Pending Withdrawal') {
        pStatus = "Processing";
        pendingCount++;
        pendingTotal += netPayout;
      } else if (status === 'Cancelled' || status === 'Rejected') {
        pStatus = "On Hold";
      }

      payouts.push({
        id: inv.invoiceNumber || inv.id,
        realId: inv.id,
        vendor: inv.vendorBusiness || inv.vendorName || "Partner Hotel",
        vendorEmail: inv.vendorEmail || vendorObj.email || "vendor@racoonn.com",
        propertyName: inv.vendorBusiness || vendorObj.businessName || "Partner Property",
        guestName: inv.bookingIds?.length ? `${inv.bookingIds.length} Bookings` : "1 Booking",
        grossAmount,
        platformFee,
        netPayout,
        amount: netPayout,
        account: inv.accountNumber ? `••••${inv.accountNumber.slice(-4)}` : (inv.upiId || "Bank / UPI"),
        method: inv.upiId ? "UPI" : "Direct NEFT / Bank",
        status: pStatus,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: inv.issueDate || new Date().toISOString(),
        bankName: inv.bankName || vendorObj.bankName || "N/A",
        accountHolder: inv.accountHolder || vendorObj.accountHolder || "N/A",
        accountNumber: inv.accountNumber || vendorObj.accountNumber || "N/A",
        ifsc: inv.ifsc || vendorObj.ifsc || "N/A"
      });
    });

    payouts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      pendingCount,
      pendingTotal,
      processedThisWeek,
      vendorCount,
      escrowBalance,
      payouts
    };

  } catch (error) {
    console.error("Failed to fetch payouts data:", error);
    return {
      pendingCount: 0,
      pendingTotal: 0,
      processedThisWeek: 0,
      vendorCount: 0,
      escrowBalance: 0,
      payouts: []
    };
  }
}

