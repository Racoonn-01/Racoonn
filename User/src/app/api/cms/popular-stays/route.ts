import { NextResponse } from "next/server";
import fs from "fs";
import { databases } from "@/lib/appwrite/config";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_stays_cms.json";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_popular_stays_v1";

export async function GET() {
  try {
    // 1. Try reading from shared file
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const sections = JSON.parse(fileData);
      return NextResponse.json({ success: true, sections });
    }
  } catch (err) {
    console.warn("User file read failed, trying Appwrite DB:", err);
  }

  try {
    // 2. Fallback to Appwrite DB
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const sections = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, sections });
  } catch (err: any) {
    return NextResponse.json({ success: true, sections: [] });
  }
}
