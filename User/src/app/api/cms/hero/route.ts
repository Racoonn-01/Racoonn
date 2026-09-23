export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/hero_section_cms.json";
// In a real production setup without shared filesystem, we would fetch from Appwrite DB here as fallback.
// Since this is a shared environment demo structure, reading the shared file is the primary way.

export async function GET() {
  noStore();
  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const images = JSON.parse(fileData);
      return NextResponse.json({ success: true, images });
    }
  } catch (err) {
    console.warn("File read failed:", err);
  }

  // Return empty array if file doesn't exist yet
  return NextResponse.json({ success: true, images: [] });
}
