export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { databases } from "@/lib/appwrite/config";
import { Query } from "appwrite";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/packages_cms.json";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "6a4372ef7ff33f643071";

export async function GET() {
  noStore();
  try {
    const docs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(100)]
    );

    if (!docs || docs.documents.length === 0) {
      throw new Error("No packages found in new Appwrite collection");
    }

    const packages = docs.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title || "",
      location: doc.location || "",
      duration: doc.duration || "",
      features: doc.features ? (Array.isArray(doc.features) ? doc.features.join(" | ") : doc.features) : "",
      badge: doc.badge || "",
      badgeColor: doc.badgeColor || "",
      images: doc.images || [],
      price: doc.price || 0,
      pricing: doc.pricing ? JSON.parse(doc.pricing) : [],
      hotelOptions: doc.hotelOptions ? JSON.parse(doc.hotelOptions) : [],
      activityOptions: doc.activityOptions ? JSON.parse(doc.activityOptions) : [],
      itinerary: doc.itinerary ? JSON.parse(doc.itinerary) : [],
      metaTitle: doc.metaTitle || "",
      metaDescription: doc.metaDescription || "",
      metaKeywords: doc.metaKeywords || [],
      status: doc.status || "draft",
      videoTestimonials: doc.videoTestimonials || []
    }));

    return NextResponse.json({ success: true, packages });
  } catch (err) {
    console.warn("Appwrite read failed in User app, trying local file:", err);
  }

  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const packages = JSON.parse(fileData);
      return NextResponse.json({ success: true, packages });
    }
    return NextResponse.json({ success: true, packages: [] });
  } catch {
    return NextResponse.json({ success: true, packages: [] });
  }
}
