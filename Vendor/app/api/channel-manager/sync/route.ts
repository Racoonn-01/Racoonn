import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vendorId, roomId, updates } = body;

    if (!vendorId || !roomId || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Connect to Appwrite securely via Admin client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");
    
    const databases = new Databases(client);
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    
    // 1. Verify room belongs to vendor and get its Channel Manager ID
    const room = await databases.getDocument(dbId, process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms", roomId);
    if (!room || !room.propertyId) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    const property = await databases.getDocument(dbId, process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties", room.propertyId);
    if (property.vendorId !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Format payload for Channel Manager (e.g. Channex)
    // If the room isn't mapped yet, we can't sync it
    if (!property.cmPropertyId || !room.cmRoomId) {
      console.warn(`Room ${roomId} is not mapped to Channel Manager`);
      return NextResponse.json({ success: true, message: "Skipped sync: Room not mapped" });
    }

    const channexPayload = {
      values: updates.map((u: any) => ({
        property_id: property.cmPropertyId,
        room_type_id: room.cmRoomId,
        date_from: u.date,
        date_to: u.date,
        availability: u.availableCount,
        price: u.price,
        closed_to_arrival: u.isBlocked,
        closed_to_departure: u.isBlocked
      }))
    };

    // 3. Push to Channel Manager API (Mock request since we don't have a real token yet)
    /*
    const channexToken = process.env.CHANNEX_API_KEY;
    const res = await fetch('https://staging.channex.io/api/v1/restrictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${channexToken}`
      },
      body: JSON.stringify(channexPayload)
    });
    
    if (!res.ok) {
      throw new Error(`CM Sync Failed: ${await res.text()}`);
    }
    */
    
    console.log("Mock synced to Channel Manager:", JSON.stringify(channexPayload, null, 2));

    return NextResponse.json({ success: true, message: "Synced to Channel Manager" });

  } catch (error: any) {
    console.error("Channel Manager Sync Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
