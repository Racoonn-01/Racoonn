export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { databases } from "@/lib/appwrite/config";
import { Query } from "appwrite";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_stays_cms.json";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "popular_stays";

export async function GET() {
  noStore();
  try {
    const docs = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(100)]
    );

    if (!docs || docs.documents.length === 0) {
      throw new Error("No stays found in Appwrite collection");
    }

    const stays = docs.documents.map((doc: any) => ({
      id: doc.$id,
      title: doc.title || "",
      subtitle: doc.subtitle || "",
      location: doc.location || "",
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      order: doc.order || 0,
      propertyIds: doc.propertyIds || []
    }));

    return NextResponse.json({ success: true, sections: stays });
  } catch (err) {
    console.warn("Appwrite read failed in User app, trying local file:", err);
  }

  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const stays = JSON.parse(fileData);
      return NextResponse.json({ success: true, sections: stays });
    }
    return NextResponse.json({ success: true, sections: [] });
  } catch {
    return NextResponse.json({ success: true, sections: [] });
  }
}
