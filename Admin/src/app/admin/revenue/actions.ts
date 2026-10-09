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
  addons?: number;
  discounts?: number;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  adults?: number;
  email?: string;
  rawBookingId?: string;
  hotelLocation?: string;
  gstRate?: number;
  rawAddonsList?: any;
  commission: number;
  status: string;
  date: string;
  createdAt: string;
  paymentMethod?: string;
}

export async function getRevenueData() {
  try {
    const db = appwriteServer.databases;

    const [paymentsReq, bookingsReq, guestsReq, propsReq, profilesReq] = await Promise.all([
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
      ).catch(() => ({ documents: [] })),
      db.listDocuments(
        DATABASE_ID,
        'properties',
        [Query.limit(500)]
      ).catch(() => ({ documents: [] })),
      db.listDocuments(
        DATABASE_ID,
        'vendor_profiles',
        [Query.limit(500)]
      ).catch(() => ({ documents: [] }))
    ]);

    let totalRevenue = 0;
    let monthlyRecurring = 0;
    let platformCommissions = 0;
    const refundLosses = 0;
    const transactions: TransactionItem[] = [];

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    bookingsReq.documents.forEach((booking: any) => {
      const payment = paymentsReq.documents.find((p: any) => p.bookingId === booking.$id);
      const guest = guestsReq.documents.find((g: any) => g.bookingId === booking.$id);
      const property = propsReq.documents.find((p: any) => p.$id === booking.hotelId);
      const vendorProfile = property ? profilesReq.documents.find((vp: any) => vp.userId === property.vendorId || vp.vendorId === property.vendorId) : null;
      
      const isCancelled = booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'canceled';

      let totalPaidNum = payment ? Number(payment.totalAmount) : (booking.totalAmount ? Number(booking.totalAmount) : (booking.priceAfterTax ? Number(booking.priceAfterTax) : 0));
      let baseRoomAmount = payment ? Number(payment.roomPrice) : (booking.priceBeforeTax ? Number(booking.priceBeforeTax) : 0);
      const addonsNum = payment ? Number(payment.serviceFees) : (booking.addons ? Number(booking.addons) : 0);
      const discountNum = payment ? Number(payment.discount) : (booking.discount ? Number(booking.discount) : 0);
      let taxes = payment ? Number(payment.taxes) : (booking.gstAmount ? Number(booking.gstAmount) : 0);

      let deducedRate = 18;
      if (!baseRoomAmount && totalPaidNum) {
        if (totalPaidNum <= 1000) deducedRate = 0;
        else if (totalPaidNum <= 7875) deducedRate = 5;
        else deducedRate = 18;
        baseRoomAmount = Math.round((totalPaidNum / (1 + deducedRate / 100)) * 100) / 100;
        taxes = Math.round((totalPaidNum - baseRoomAmount) * 100) / 100;
      } else if (baseRoomAmount && taxes) {
        deducedRate = Math.round((taxes / baseRoomAmount) * 100);
      }

      let vendorDiscount = 0;
      if (booking.specialRequests) {
        const vdMatch = booking.specialRequests.match(/VendorDiscount=₹?([0-9.]+)/);
        if (vdMatch) vendorDiscount = parseFloat(vdMatch[1]);
      } else {
        vendorDiscount = discountNum;
      }

      const vendorGross = baseRoomAmount + addonsNum - vendorDiscount;
      const feePercent = vendorProfile?.allow24PercentGst ? 24 : 18;
      const commission = Math.round(vendorGross * (feePercent / 100) * 100) / 100;

      const date = new Date(booking.$createdAt);

      if (!isCancelled) {
        totalRevenue += totalPaidNum;
        platformCommissions += commission;

        if (date >= currentMonthStart) {
          monthlyRecurring += totalPaidNum;
        }
      }

      const bookingCode = `BK-${booking.$id.substring(0, 6).toUpperCase()}`;
      const customerName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (booking.guestName || 'Guest User');
      const propertyName = property?.name || booking.hotelName || 'Racoonn Property';

      transactions.push({
        id: payment?.transactionId || `REV-${booking.$id.slice(-4).toUpperCase()}`,
        realId: payment?.$id || booking.$id,
        type: commission > 0 ? "Commission" : "Booking Payment",
        source: `Booking ${bookingCode}`,
        bookingCode,
        customerName,
        propertyName,
        amount: totalPaidNum,
        roomPrice: baseRoomAmount,
        taxes,
        addons: addonsNum,
        discounts: discountNum,
        checkIn: booking.checkIn || booking.checkInDate || booking.startDate || 'N/A',
        checkOut: booking.checkOut || booking.checkOutDate || booking.endDate || 'N/A',
        nights: booking.nights || booking.totalNights || booking.numberOfDays || 1,
        adults: booking.adults || booking.guests || 1,
        email: guest?.email || booking.email || '',
        rawBookingId: booking.$id,
        hotelLocation: property?.city || booking.hotelLocation || '',
        gstRate: deducedRate,
        rawAddonsList: booking.snapshotRoomConfig ? JSON.parse(booking.snapshotRoomConfig).addonsList : null,
        commission,
        status: isCancelled ? 'Cancelled' : 'Completed',
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        createdAt: payment?.$createdAt || booking.$createdAt,
        paymentMethod: payment?.paymentMethod || 'Online Payment'
      });
    });

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
