export const dynamic = "force-dynamic";

import { databases } from "@/lib/appwrite/config";
import { NextResponse } from "next/server";
import { Query } from "appwrite";

export async function GET() {
  try {
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const PROPERTY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";

    const response = await databases.listDocuments(
      DATABASE_ID,
      PROPERTY_COLLECTION_ID,
      [Query.limit(100), Query.orderDesc("$createdAt")]
    );

    const ROOM_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms";
    const roomsMap: Record<string, number> = {};
    try {
      const roomsRes = await databases.listDocuments(DATABASE_ID, ROOM_COLLECTION_ID, [Query.limit(500)]);
      roomsRes.documents.forEach((r: any) => {
        const pId = String(r.propertyId || '');
        const raw = Number(r.price || r.roomPrice || r.basePrice || r.pricePerNight || 0);
        const disc = Number(r.discountPrice || 0);
        const effective = (disc > 0 && disc < raw) ? disc : (raw > 0 ? raw : disc);
        if (pId && effective > 0) {
          if (!roomsMap[pId] || effective < roomsMap[pId]) {
            roomsMap[pId] = effective;
          }
        }
      });
    } catch (e) {
      console.warn("Could not fetch rooms for price mapping in CMS API:", e);
    }

    const properties = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.propertyName || doc.title || "Property",
      location: [doc.location, doc.city, doc.state].filter(Boolean).join(", ") || doc.city || "",
      city: doc.city || "",
      image: doc.photos && doc.photos[0] ? doc.photos[0] : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
      price: Number(roomsMap[doc.$id] || doc.price || doc.startingPrice || doc.minPrice || doc.basePrice || doc.pricePerNight || 0)
    }));

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching properties for CMS modal:", error);
    return NextResponse.json({ success: false, properties: [] }, { status: 500 });
  }
}
