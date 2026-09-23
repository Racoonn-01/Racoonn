export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";

import { databases } from "@/lib/appwrite/config";

const SHARED_FILE_PATH = "/tmp/racoonn_hero_section_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_hero_section_v1";

export async function GET() {
  noStore();
  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const images = JSON.parse(fileData);
      return NextResponse.json({ success: true, images });
    }
  } catch (err) {
    console.warn("File read failed, trying Appwrite DB:", err);
  }

  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const images = doc.details ? JSON.parse(doc.details) : [];
    
    // Auto-create the cache file for next time
    try {
      fs.writeFileSync(SHARED_FILE_PATH, JSON.stringify(images), "utf-8");
    } catch (e) {}

    return NextResponse.json({ success: true, images });
  } catch {
    return NextResponse.json({ success: true, images: [] });
  }
}
