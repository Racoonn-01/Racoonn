import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Verify webhook source (in production, verify Channex signature/token)
    // if (req.headers.get('x-channex-signature') !== 'expected_sig') ...

    console.log("Received Channel Manager Webhook:", JSON.stringify(payload, null, 2));

    // Handle Booking Creation Webhook (Mock Implementation)
    if (payload.event === "booking.created") {
      const { booking } = payload;
      const { property_id, room_type_id, guest_name, check_in, check_out, total_amount, source } = booking;

      // Connect to Appwrite securely
      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
        .setKey(process.env.APPWRITE_API_KEY || ""); // Ensure APPWRITE_API_KEY is set in User app .env
      
      const databases = new Databases(client);
      const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
      
      // 1. Look up our local property and room by the external cm IDs
      const propsRes = await databases.listDocuments(dbId, process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties", [
        Query.equal("cmPropertyId", property_id)
      ]);
      
      if (propsRes.total === 0) {
        return NextResponse.json({ error: "Unmapped Property" }, { status: 404 });
      }
      const localProperty = propsRes.documents[0];

      const roomsRes = await databases.listDocuments(dbId, process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms", [
        Query.equal("cmRoomId", room_type_id)
      ]);

      if (roomsRes.total === 0) {
        return NextResponse.json({ error: "Unmapped Room" }, { status: 404 });
      }
      const localRoom = roomsRes.documents[0];

      // 2. Create the booking locally
      const nights = Math.round((new Date(check_out).getTime() - new Date(check_in).getTime()) / (1000 * 60 * 60 * 24));
      
      const newBookingId = ID.unique();
      await databases.createDocument(dbId, process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "bookings", newBookingId, {
        hotelId: localProperty.$id,
        roomId: localRoom.$id,
        checkIn: check_in,
        checkOut: check_out,
        nights: nights,
        status: "Confirmed",
        bookingSource: source || "Channel Manager", // e.g. "Booking.com"
        otaReferenceId: booking.booking_id || payload.id
      });

      // 3. Create guest details (Optional, assuming booking_guests collection)
      await databases.createDocument(dbId, "booking_guests", ID.unique(), {
        bookingId: newBookingId,
        firstName: guest_name.split(' ')[0] || "OTA",
        lastName: guest_name.split(' ').slice(1).join(' ') || "Guest",
        email: booking.guest_email || "ota_guest@example.com",
        phone: booking.guest_phone || ""
      });

      // 4. Create payment record
      await databases.createDocument(dbId, "booking_payments", ID.unique(), {
        bookingId: newBookingId,
        totalAmount: total_amount,
        paymentStatus: "Paid", // Or however CM sends it
        paymentMethod: "OTA Collection"
      });

      console.log(`Created OTA Booking ${newBookingId} for ${localProperty.name}`);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });

  } catch (error: any) {
    console.error("Channel Manager Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
