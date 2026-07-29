"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export interface TransactionItem {
  id: string;
  realId: string;
  type: string;
  source: string;
  bookingCode?: string;
  customerName?: string;
  propertyName?: string;
  amount: number;
  roomPrice: number;
  taxes: number;
  commission: number;
  status: string;
  date: string;
  createdAt: string;
  paymentMethod?: string;
}

export async function getRevenueData() {
  try {
    const db = appwriteServer.databases;

    const [paymentsReq, bookingsReq, guestsReq] = await Promise.all([
      db.listDocuments(
        DATABASE_ID,
        'booking_payments',
        [Query.limit(500), Query.orderDesc('$createdAt')]
      ).catch(() => ({ documents: [] })),
      db.listDocuments(
        DATABASE_ID,
        'bookings',
        [Query.limit(500), Query.orderDesc('$createdAt')]
      ).catch(() => ({ documents: [] })),
      db.listDocuments(
        DATABASE_ID,
        'booking_guests',
        [Query.limit(500)]
      ).catch(() => ({ documents: [] }))
    ]);

    let totalRevenue = 0;
    let monthlyRecurring = 0;
    let platformCommissions = 0;
    let refundLosses = 0;
    let transactions: TransactionItem[] = [];

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Process payments
    paymentsReq.documents.forEach((payment: any) => {
      const booking = bookingsReq.documents.find((b: any) => b.$id === payment.bookingId);
      const guest = guestsReq.documents.find((g: any) => g.bookingId === payment.bookingId);
      
      const amt = Number(payment.totalAmount || payment.amount || 0);
      const roomPrice = Number(payment.roomPrice || Math.round(amt / 1.05));
      const taxes = Number(payment.taxes || (amt - roomPrice));
      const commission = Number(payment.serviceFees || payment.commission || Math.round(roomPrice * 0.18));
      const status = payment.status || 'Completed';
      const date = new Date(payment.$createdAt);

      if (status.toLowerCase() !== 'failed' && status.toLowerCase() !== 'cancelled') {
        totalRevenue += amt;
        platformCommissions += commission;

        if (date >= currentMonthStart) {
          monthlyRecurring += amt;
        }
      }

      const bookingCode = booking ? `BK-${booking.$id.substring(0, 6).toUpperCase()}` : (payment.bookingId ? `#${payment.bookingId.slice(-4).toUpperCase()}` : 'Direct');
      const customerName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (booking?.guestName || 'Guest User');
      const propertyName = booking?.hotelName || 'Racoonn Property';

      transactions.push({
        id: payment.transactionId || `REV-${payment.$id.slice(-4).toUpperCase()}`,
        realId: payment.$id,
        type: payment.type || (commission > 0 ? "Commission" : "Booking Payment"),
        source: `Booking ${bookingCode}`,
        bookingCode,
        customerName,
        propertyName,
        amount: amt,
        roomPrice,
        taxes,
        commission,
        status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: payment.$createdAt,
        paymentMethod: payment.paymentMethod || 'Online (Razorpay / UPI)'
      });
    });

    // Process bookings fallback if payments were empty
    if (paymentsReq.documents.length === 0) {
      bookingsReq.documents.forEach((b: any) => {
        const guest = guestsReq.documents.find((g: any) => g.bookingId === b.$id);
        const date = new Date(b.$createdAt);
        const isCancelled = b.status?.toLowerCase() === 'cancelled' || b.status?.toLowerCase() === 'canceled';

        let bookingAmt = 0;
        if (typeof b.totalAmount === 'number') bookingAmt = b.totalAmount;
        else if (typeof b.amount === 'number') bookingAmt = b.amount;
        else if (typeof b.amount === 'string') bookingAmt = parseFloat(b.amount.replace(/[^0-9.]/g, '')) || 0;
        else if (typeof b.price === 'number') bookingAmt = b.price;

        const roomPrice = Math.round(bookingAmt / 1.05);
        const taxes = bookingAmt - roomPrice;
        const commission = Math.round(roomPrice * 0.18);

        if (!isCancelled) {
          totalRevenue += bookingAmt;
          platformCommissions += commission;
          if (date >= currentMonthStart) monthlyRecurring += bookingAmt;

          const bookingCode = `BK-${b.$id.substring(0, 6).toUpperCase()}`;
          const customerName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (b.guestName || 'Guest User');

          transactions.push({
            id: `REV-${b.$id.slice(-4).toUpperCase()}`,
            realId: b.$id,
            type: "Commission",
            source: `Booking ${bookingCode}`,
            bookingCode,
            customerName,
            propertyName: b.hotelName || 'Racoonn Property',
            amount: bookingAmt,
            roomPrice,
            taxes,
            commission,
            status: b.status === 'confirmed' || b.status === 'completed' ? 'Completed' : 'Pending',
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
            createdAt: b.$createdAt,
            paymentMethod: 'Online Payment'
          });
        }
      });
    }

    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      totalRevenue,
      monthlyRecurring,
      platformCommissions,
      refundLosses,
      transactions
    };
  } catch (error) {
    console.error("Failed to fetch revenue data:", error);
    return {
      totalRevenue: 0,
      monthlyRecurring: 0,
      platformCommissions: 0,
      refundLosses: 0,
      transactions: []
    };
  }
}
