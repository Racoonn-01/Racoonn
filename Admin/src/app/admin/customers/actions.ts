"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export async function getAllCustomers() {
  try {
    const { databases } = appwriteServer;
    
    // Fetch all bookings (in a real app, use pagination or aggregation)
    const bookings = await databases.listDocuments(
      DATABASE_ID,
      'bookings',
      [Query.orderDesc('$createdAt'), Query.limit(500)]
    );
    
    if (bookings.documents.length === 0) return [];
    
    const bookingIds = bookings.documents.map(b => b.$id);
    
    const payments = await databases.listDocuments(
      DATABASE_ID,
      'booking_payments',
      [Query.equal('bookingId', bookingIds), Query.limit(500)]
    );
    
    const guests = await databases.listDocuments(
      DATABASE_ID,
      'booking_guests',
      [Query.equal('bookingId', bookingIds), Query.limit(500)]
    );

    // Group by userId
    type CustomerMapData = {
      id: string;
      name: string;
      email: string;
      bookings: number;
      activeBookings: number;
      totalSpentNum: number;
      status: string;
      joined: string;
    };
    const customerMap = new Map<string, CustomerMapData>();
    
    bookings.documents.forEach(booking => {
      const userId = booking.userId || 'guest';
      
      if (!customerMap.has(userId)) {
        // Find guest info for name/email
        const guest = guests.documents.find(g => g.bookingId === booking.$id);
        const name = guest ? `${guest.firstName} ${guest.lastName}` : 'Unknown Customer';
        const email = guest?.email || 'unknown@example.com';
        
        customerMap.set(userId, {
          id: userId === 'guest' ? `guest-${booking.$id}` : userId,
          name,
          email,
          bookings: 0,
          activeBookings: 0,
          totalSpentNum: 0,
          status: 'active', // Default, will override below if found in Appwrite
          joined: new Date(booking.$createdAt).toISOString().split('T')[0] // Approximation
        });
      }
      
      const customer = customerMap.get(userId);
      if (customer) {
        customer.bookings++;
        
        if (booking.status === 'confirmed' || booking.status === 'completed' || booking.paymentStatus === 'Paid') {
          const payment = payments.documents.find(p => p.bookingId === booking.$id);
          const amount = payment ? payment.totalAmount : (booking.price * booking.nights);
          customer.totalSpentNum += amount;
          
          if (booking.status !== 'completed' && booking.status !== 'cancelled') {
             customer.activeBookings++;
          }
        }
      }
    });

    try {
      const usersList = await appwriteServer.users.list();
      const appwriteUsers = new Map(usersList.users.map(u => [u.$id, u]));
      
      Array.from(customerMap.values()).forEach(c => {
        if (!c.id.startsWith('guest-') && appwriteUsers.has(c.id)) {
          const user = appwriteUsers.get(c.id);
          c.status = user?.status ? 'active' : 'suspended';
        }
      });
    } catch (err) {
      console.warn("Could not fetch Appwrite users for status check:", err);
    }

    const customers = Array.from(customerMap.values()).map(c => ({
      ...c,
      totalSpent: `₹${c.totalSpentNum.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
    }));
    
    return customers.sort((a, b) => b.totalSpentNum - a.totalSpentNum);
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
}

export async function toggleCustomerStatus(userId: string, suspend: boolean) {
  try {
    if (userId.startsWith('guest-')) {
      throw new Error("Cannot suspend guest users.");
    }
    // In Appwrite, status true = active, false = blocked
    await appwriteServer.users.updateStatus(userId, !suspend);
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to toggle customer status:", error);
    return { success: false, error: (error as Error).message };
  }
}
