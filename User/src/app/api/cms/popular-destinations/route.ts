import { NextResponse } from "next/server";
import fs from "fs";
import { databases } from "@/lib/appwrite/config";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_destinations_cms.json";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_popular_destinations_v1";

export async function GET() {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const destinations = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, destinations });
  } catch (err: any) {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      try {
        const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
        const destinations = JSON.parse(fileData);
        return NextResponse.json({ success: true, destinations });
      } catch (fileErr) {}
    }
    return NextResponse.json({ success: true, destinations: [] });
  }
}
