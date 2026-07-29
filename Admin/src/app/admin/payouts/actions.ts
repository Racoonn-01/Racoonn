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

    const [bookingsReq, paymentsReq, guestsReq, vendorsReq] = await Promise.all([
      db.listDocuments(DATABASE_ID, 'bookings', [Query.limit(500), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'booking_payments', [Query.limit(500), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'booking_guests', [Query.limit(500)]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, VENDOR_COLLECTION, [Query.limit(500)]).catch(() => ({ documents: [] })),
    ]);

    const vendorMap: Record<string, any> = {};
    vendorsReq.documents.forEach((v: any) => {
      vendorMap[v.$id] = v;
    });

    let pendingCount = 0;
    let pendingTotal = 0;
    let processedThisWeek = 0;
    let vendorCount = vendorsReq.documents.length || 1;
    let escrowBalance = 0;
    let payouts: PayoutItem[] = [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    bookingsReq.documents.forEach((b: any) => {
      const payment = paymentsReq.documents.find((p: any) => p.bookingId === b.$id);
      const guest = guestsReq.documents.find((g: any) => g.bookingId === b.$id);
      const vendorObj = vendorMap[b.vendorId] || {};

      const guestName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (b.guestName || 'Guest User');
      const vendorName = b.hotelName || b.vendorName || vendorObj.hotelName || vendorObj.businessName || "Partner Hotel";

      // Calculate total paid and payout breakdown
      let grossAmount = 0;
      if (payment && Number(payment.totalAmount) > 0) {
        grossAmount = Number(payment.totalAmount);
      } else if (typeof b.totalAmount === 'number' && b.totalAmount > 0) {
        grossAmount = b.totalAmount;
      } else if (typeof b.amount === 'number' && b.amount > 0) {
        grossAmount = b.amount;
      } else if (typeof b.amount === 'string') {
        grossAmount = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
      } else if (typeof b.price === 'number') {
        grossAmount = b.price * (b.nights || 1);
      }

      // Check specialRequests for embedded VendorPayout info
      let extractedPayout = 0;
      if (b.specialRequests && b.specialRequests.includes('VendorPayout=')) {
        const match = b.specialRequests.match(/VendorPayout=₹?([0-9.]+)/);
        if (match && match[1]) {
          extractedPayout = parseFloat(match[1]) || 0;
        }
      }

      // Standard platform commission fee (18% + 18% GST = 21.24%)
      const platformFee = Math.round(grossAmount * 0.2124);
      const netPayout = extractedPayout > 0 ? extractedPayout : (grossAmount > 0 ? Math.max(1, grossAmount - platformFee) : 0);

      const status = (b.status || 'pending').toLowerCase();
      const date = new Date(b.$createdAt);

      let pStatus = "Processing";
      if (status === 'completed' || b.paymentStatus === 'Paid_Vendor') {
        pStatus = "Processed";
        processedThisWeek += netPayout;
        escrowBalance += netPayout;
      } else if (status === 'confirmed') {
        pStatus = "Processing";
        pendingCount++;
        pendingTotal += netPayout;
      } else if (status === 'cancelled' || status === 'canceled') {
        pStatus = "On Hold";
      }

      const pId = `PO-${b.$id.slice(-5).toUpperCase()}`;

      payouts.push({
        id: pId,
        realId: b.$id,
        vendor: vendorName,
        vendorEmail: vendorObj.email || "vendor@racoonn.com",
        propertyName: b.hotelName || "Partner Property",
        guestName,
        grossAmount,
        platformFee,
        netPayout,
        amount: netPayout,
        account: vendorObj.accountNumber ? `••••${vendorObj.accountNumber.slice(-4)}` : "HDFC ••••4019",
        method: b.paymentMethod || "Direct NEFT / Bank",
        status: pStatus,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: b.$createdAt,
        bankName: vendorObj.bankName || "HDFC Bank",
        accountHolder: vendorObj.accountHolder || vendorName,
        accountNumber: vendorObj.accountNumber || "109847562019",
        ifsc: vendorObj.ifsc || "HDFC0001234"
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
