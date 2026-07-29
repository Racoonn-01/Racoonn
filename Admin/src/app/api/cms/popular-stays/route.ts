import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { appwriteServer } from "@/lib/appwrite/server";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_stays_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
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
    console.warn("File read failed, trying Appwrite DB:", err);
  }

  try {
    // 2. Fallback to Appwrite DB
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const sections = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, sections });
  } catch (err) {
    return NextResponse.json({ success: true, sections: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const sections = body.sections || [];
    const jsonStr = JSON.stringify(sections, null, 2);

    // 1. Save to shared file
    try {
      fs.writeFileSync(SHARED_FILE_PATH, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Shared file write warning:", fileErr);
    }

    // 2. Sync to Appwrite DB
    try {
      await appwriteServer.databases.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        DOC_ID,
        { details: jsonStr }
      );
    } catch (err: any) {
      if (err.code === 404) {
        try {
          await appwriteServer.databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            DOC_ID,
            {
              propertyName: "CMS Popular Stays Configuration",
              title: "CMS Popular Stays Configuration",
              details: jsonStr,
            }
          );
        } catch (createErr) {
          console.warn("Appwrite DB doc create warning:", createErr);
        }
      }
    }

    return NextResponse.json({ success: true, sections });
  } catch (err: any) {
    console.error("Error saving CMS popular stays:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
