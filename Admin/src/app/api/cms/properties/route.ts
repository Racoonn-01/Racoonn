import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET() {
  try {
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const PROPERTY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";

    const response = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      PROPERTY_COLLECTION_ID,
      [Query.limit(100), Query.orderDesc("$createdAt")]
    );

    const properties = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.propertyName || doc.title || "Property",
      location: [doc.location, doc.city, doc.state].filter(Boolean).join(", ") || doc.city || "",
      city: doc.city || "",
      image: doc.photos && doc.photos[0] ? doc.photos[0] : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800&q=80",
    }));

    return NextResponse.json({ success: true, properties });
  } catch (error) {
    console.error("Error fetching properties for CMS modal:", error);
    return NextResponse.json({ success: false, properties: [] }, { status: 500 });
  }
}
