"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export interface PaymentItem {
  id: string;
  realId: string;
  customer: string;
  customerEmail?: string;
  customerPhone?: string;
  amount: number;
  roomPrice: number;
  taxes: number;
  gatewayFee: number;
  netSettled: number;
  method: string;
  gateway: string;
  gatewayRef: string;
  bookingCode: string;
  propertyName: string;
  status: string;
  date: string;
  createdAt: string;
}

export async function getPaymentsData() {
  try {
    const db = appwriteServer.databases;

    const [paymentsReq, bookingsReq, guestsReq, usersReq] = await Promise.all([
      db.listDocuments(DATABASE_ID, 'booking_payments', [Query.limit(500), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'bookings', [Query.limit(500), Query.orderDesc('$createdAt')]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'booking_guests', [Query.limit(500)]).catch(() => ({ documents: [] })),
      db.listDocuments(DATABASE_ID, 'userprofiles', [Query.limit(500)]).catch(() => ({ documents: [] })),
    ]);

    let todayVolume = 0;
    let todayCount = 0;
    let gatewayBalance = 0;
    let failedCount = 0;
    let cancelledCount = 0;
    let totalCount = bookingsReq.documents.length || paymentsReq.documents.length || 1;
    let payments: PaymentItem[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Map bookings and guests by ID
    const bookingMap: Record<string, any> = {};
    bookingsReq.documents.forEach((b: any) => {
      bookingMap[b.$id] = b;
      if (b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'canceled') {
        cancelledCount++;
      }
    });

    const guestMap: Record<string, any> = {};
    guestsReq.documents.forEach((g: any) => {
      guestMap[g.bookingId] = g;
    });

    const userMap: Record<string, any> = {};
    usersReq.documents.forEach((u: any) => {
      userMap[u.$id] = u;
    });

    // Process payments
    paymentsReq.documents.forEach((pay: any) => {
      const booking = bookingMap[pay.bookingId] || {};
      const guest = guestMap[pay.bookingId] || {};
      const user = userMap[pay.userId] || {};

      const amt = Number(pay.totalAmount || pay.amount || 0);
      const roomPrice = Number(pay.roomPrice || Math.round(amt / 1.05));
      const taxes = Number(pay.taxes || (amt - roomPrice));
      const gatewayFee = Math.round(amt * 0.02); // 2% gateway processing fee
      const netSettled = Math.max(0, amt - gatewayFee);

      const statusRaw = pay.status || (booking.status === 'cancelled' ? 'Failed' : 'Successful');
      const status = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
      const date = new Date(pay.$createdAt);

      if (status.toLowerCase() === 'failed' || status.toLowerCase() === 'declined') {
        failedCount++;
      } else {
        gatewayBalance += amt;
        if (date >= todayStart) {
          todayVolume += amt;
          todayCount++;
        }
      }

      // Format customer name accurately
      let customerName = "Guest User";
      if (guest.firstName) {
        customerName = `${guest.firstName} ${guest.lastName}`.trim();
      } else if (booking.guestName) {
        customerName = booking.guestName;
      } else if (user.name || user.fullName) {
        customerName = user.name || user.fullName;
      } else if (user.email) {
        customerName = user.email.split('@')[0];
      }

      const bookingCode = booking.$id ? `BK-${booking.$id.substring(0, 6).toUpperCase()}` : (pay.bookingId ? `#${pay.bookingId.slice(-4).toUpperCase()}` : 'N/A');

      payments.push({
        id: pay.transactionId || `PAY-${pay.$id.slice(-5).toUpperCase()}`,
        realId: pay.$id,
        customer: customerName,
        customerEmail: guest.email || booking.guestEmail || user.email || 'N/A',
        customerPhone: guest.phone || booking.phone || user.phone || 'N/A',
        amount: amt,
        roomPrice,
        taxes,
        gatewayFee,
        netSettled,
        method: pay.paymentMethod || pay.method || "UPI / Card",
        gateway: pay.gateway || "Razorpay",
        gatewayRef: pay.razorpayPaymentId || `pay_${pay.$id.substring(0, 10)}`,
        bookingCode,
        propertyName: booking.hotelName || "Racoonn Partner Hotel",
        status: status,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: pay.$createdAt,
      });
    });

    // Fallback if payments table has 0 docs
    if (paymentsReq.documents.length === 0) {
      bookingsReq.documents.forEach((b: any) => {
        const guest = guestMap[b.$id] || {};
        const user = userMap[b.userId] || {};
        const isCancelled = b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'canceled';

        let amt = 0;
        if (typeof b.totalAmount === 'number') amt = b.totalAmount;
        else if (typeof b.amount === 'number') amt = b.amount;
        else if (typeof b.amount === 'string') amt = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
        else if (typeof b.price === 'number') amt = b.price * (b.nights || 1);

        const roomPrice = Math.round(amt / 1.05);
        const taxes = amt - roomPrice;
        const gatewayFee = Math.round(amt * 0.02);
        const date = new Date(b.$createdAt);

        if (isCancelled) {
          failedCount++;
        } else {
          gatewayBalance += amt;
          if (date >= todayStart) {
            todayVolume += amt;
            todayCount++;
          }
        }

        let customerName = "Guest User";
        if (guest.firstName) customerName = `${guest.firstName} ${guest.lastName}`.trim();
        else if (b.guestName) customerName = b.guestName;
        else if (user.name || user.fullName) customerName = user.name || user.fullName;

        const bookingCode = `BK-${b.$id.substring(0, 6).toUpperCase()}`;

        payments.push({
          id: `PAY-${b.$id.slice(-5).toUpperCase()}`,
          realId: b.$id,
          customer: customerName,
          customerEmail: guest.email || b.guestEmail || 'N/A',
          customerPhone: guest.phone || b.phone || 'N/A',
          amount: amt,
          roomPrice,
          taxes,
          gatewayFee,
          netSettled: Math.max(0, amt - gatewayFee),
          method: b.paymentMethod || "UPI / Razorpay",
          gateway: "Razorpay",
          gatewayRef: `pay_${b.$id.substring(0, 10)}`,
          bookingCode,
          propertyName: b.hotelName || "Racoonn Property",
          status: isCancelled ? "Failed" : b.status === 'confirmed' || b.status === 'completed' ? "Successful" : "Processing",
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: b.$createdAt,
        });
      });
    }

    payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const refundRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : "0.0";

    return {
      todayVolume,
      todayCount,
      gatewayBalance,
      refundRate,
      failedCount,
      payments
    };

  } catch (error) {
    console.error("Failed to fetch payments data:", error);
    return {
      todayVolume: 0,
      todayCount: 0,
      gatewayBalance: 0,
      refundRate: "0.0",
      failedCount: 0,
      payments: []
    };
  }
}
