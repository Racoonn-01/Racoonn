"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!;

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
      
      const totalAmount = payment ? payment.totalAmount : (booking.price * booking.nights);
      const customerName = guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Customer';
      
      return {
        id: `BK-${booking.$id.substring(0, 6).toUpperCase()}`,
        realId: booking.$id,
        customer: customerName,
        property: booking.hotelName || 'Unknown Property',
        amount: `₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`,
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
