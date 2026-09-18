export const dynamic = "force-dynamic";

import { databases } from "@/lib/appwrite/config";
import { NextResponse } from "next/server";
import { Query } from "appwrite";

export async function GET() {
  try {
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const ACTIVITY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || "activities";

    const response = await databases.listDocuments(
      DATABASE_ID,
      ACTIVITY_COLLECTION_ID,
      [Query.limit(100), Query.orderDesc("$createdAt")]
    );

    const activities = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title || "Activity",
      description: doc.description || "Enjoy this beautiful activity.",
      image: doc.image || doc.images?.[0] || "https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=600&auto=format&fit=crop",
      pricePerPerson: Number(String(doc.price || "0").replace(/[^0-9.-]+/g, "")) || 0,
    }));

    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("Error fetching activities for CMS modal:", error);
    return NextResponse.json({ success: false, activities: [] }, { status: 500 });
  }
}
