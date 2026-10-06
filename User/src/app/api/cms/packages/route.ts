export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { databases } from "@/lib/appwrite/config";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/packages_cms.json";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_packages_v1";

export async function GET() {
  noStore();
  try {
    // 1. Try reading from Appwrite DB first
    const doc = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const packages = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, packages });
  } catch (err) {
    console.warn("Appwrite read failed in User app, trying local file:", err);
  }

  try {
    // 2. Fallback to local file
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
