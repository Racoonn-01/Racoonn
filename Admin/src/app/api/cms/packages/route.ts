export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { appwriteServer } from "@/lib/appwrite/server";
import { Permission, Role, Query } from "node-appwrite";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/packages_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "6a4372ef7ff33f643071";

export async function GET() {
  noStore();
  try {
    const docs = await appwriteServer.databases.listDocuments(
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
    console.warn("Appwrite read failed, trying local file:", err);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const packages = body.packages || [];
    const jsonStr = JSON.stringify(packages, null, 2);

    // 1. Save to shared file
    try {
      fs.writeFileSync(SHARED_FILE_PATH, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Shared file write warning:", fileErr);
    }

    // 2. Sync to Appwrite DB
    const existing = await appwriteServer.databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100)]);
    const existingIds = existing.documents.map((d: any) => d.$id);
    const incomingIds = packages.map((p: any) => p.id);

    const toDelete = existingIds.filter((id: string) => !incomingIds.includes(id));
    for (const id of toDelete) {
      try {
        await appwriteServer.databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      } catch (err) {
        console.warn("Failed to delete removed package", id);
      }
    }

    for (const pkg of packages) {
      const data = {
        title: pkg.title || '',
        location: pkg.location || '',
        duration: pkg.duration || '',
        features: pkg.features ? [pkg.features] : [],
        badge: pkg.badge || '',
        badgeColor: pkg.badgeColor || '',
        images: pkg.images || [],
        price: pkg.pricing && pkg.pricing[0] ? pkg.pricing[0].pricePerPerson : 0,
        pricing: JSON.stringify(pkg.pricing || []),
        hotelOptions: JSON.stringify(pkg.hotelOptions || []),
        activityOptions: JSON.stringify(pkg.activityOptions || []),
        itinerary: JSON.stringify(pkg.itinerary || []),
        metaTitle: pkg.metaTitle || '',
        metaDescription: pkg.metaDescription || '',
        metaKeywords: pkg.metaKeywords || [],
        status: pkg.status || 'draft',
        videoTestimonials: pkg.videoTestimonials || []
      };

      try {
        await appwriteServer.databases.updateDocument(DATABASE_ID, COLLECTION_ID, pkg.id, data);
      } catch (err: any) {
        if (err?.code === 404) {
          try {
            await appwriteServer.databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              pkg.id,
              data,
              [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
            );
          } catch (createErr) {
            console.warn("Appwrite DB doc create warning for package:", pkg.id, createErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, packages });
  } catch (err: unknown) {
    console.error("Error saving CMS packages:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
