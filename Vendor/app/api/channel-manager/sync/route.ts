import { NextResponse } from "next/server";
import { Client, Databases, Query } from "node-appwrite";

export async function POST(req: Request) {
  try {
    // 0. Extract and validate Authorization Header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }
    const apiSecret = authHeader.split(" ")[1];

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body provided" }, { status: 400 });
    }
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
    const vendorCollectionId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "vendors";
    
    // 1. Authenticate API Key against Vendor Collection
    const vendorDocs = await databases.listDocuments(dbId, vendorCollectionId, [
      Query.equal("apiSecret", apiSecret)
    ]);

    if (vendorDocs.documents.length === 0) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const authenticatedVendor = vendorDocs.documents[0];
    
    // Ensure the vendor making the request is modifying their own data
    if (authenticatedVendor.$id !== vendorId) {
      return NextResponse.json({ error: "Unauthorized: API key does not match vendorId" }, { status: 403 });
    }
    
    // 2. Verify room belongs to vendor and get its Channel Manager ID
    const room = await databases.getDocument(dbId, process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms", roomId);
    if (!room || !room.propertyId) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    const property = await databases.getDocument(dbId, process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties", room.propertyId);
    if (property.vendorId !== vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Format payload for Channel Manager (e.g. Channex)
    // If the room isn't mapped yet, use mock IDs so local testing can proceed
    const cmPropertyId = property.cmPropertyId || "mock_channex_prop_" + property.$id;
    const cmRoomId = room.cmRoomId || "mock_channex_room_" + room.$id;

    if (!property.cmPropertyId || !room.cmRoomId) {
      console.warn(`Room ${roomId} is not mapped to Channel Manager. Using mock mapping for testing.`);
    }

    const channexPayload = {
      values: updates.map((u: any) => ({
        property_id: cmPropertyId,
        room_type_id: cmRoomId,
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
    
    // Check if error is an Appwrite database error (e.g. invalid document ID)
    if (error?.code === 404 || error?.code === 400) {
      return NextResponse.json({ error: "Resource not found or invalid ID provided" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal Server Error", details: error?.message || String(error) }, { status: 500 });
  }
}
