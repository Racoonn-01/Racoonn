"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export async function getAllBookings() {
  try {
    const { databases } = appwriteServer;
    
    // Fetch bookings
    const bookings = await databases.listDocuments(
      DATABASE_ID,
      'bookings',
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    
    // Extract booking IDs
    const bookingIds = bookings.documents.map(b => b.$id);
    
    if (bookingIds.length === 0) return [];
    
    // Fetch payments
    const payments = await databases.listDocuments(
      DATABASE_ID,
      'booking_payments',
      [Query.equal('bookingId', bookingIds), Query.limit(100)]
    );
    
    // Fetch guests
    const guests = await databases.listDocuments(
      DATABASE_ID,
      'booking_guests',
      [Query.equal('bookingId', bookingIds), Query.limit(100)]
    );
    
    // Map them together
    return bookings.documents.map(booking => {
      const payment = payments.documents.find(p => p.bookingId === booking.$id);
      const guest = guests.documents.find(g => g.bookingId === booking.$id);
      
      const totalAmount = payment ? Number(payment.totalAmount) : (Number(booking.price || 0) * Number(booking.nights || 1));
      const roomPrice = payment ? Number(payment.roomPrice) : (totalAmount > 0 ? Math.round(totalAmount / 1.05) : 0);
      const taxes = payment ? Number(payment.taxes) : (totalAmount - roomPrice);
      const serviceFees = payment ? Number(payment.serviceFees) : 0;
      const discount = payment ? Number(payment.discount) : 0;

      const customerName = guest ? `${guest.firstName} ${guest.lastName}`.trim() : (booking.guestName || 'Guest User');
      
      return {
        id: `BK-${booking.$id.substring(0, 6).toUpperCase()}`,
        realId: booking.$id,
        customer: customerName,
        guestEmail: guest?.email || booking.guestEmail || 'N/A',
        guestPhone: guest?.phone || booking.phone || 'N/A',
        guestCountry: guest?.country || 'India',
        specialRequests: guest?.specialRequests || booking.specialRequests || 'No special requests',
        property: booking.hotelName || 'Racoonn Property',
        hotelLocation: booking.hotelLocation || 'India',
        amount: `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
        roomPrice,
        taxes,
        serviceFees,
        discount,
        totalAmountNum: totalAmount,
        nights: booking.nights || 1,
        adults: booking.adults || 1,
        children: booking.children || 0,
        status: booking.status?.toLowerCase() || 'confirmed',
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        bookedAt: new Date(booking.$createdAt).toISOString().split('T')[0]
      };
    });
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}
