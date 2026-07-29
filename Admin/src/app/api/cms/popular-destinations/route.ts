import { NextResponse } from "next/server";
import fs from "fs";
import { appwriteServer } from "@/lib/appwrite/server";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_destinations_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const DOC_ID = "cms_popular_destinations_v1";

export async function GET() {
  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const destinations = JSON.parse(fileData);
      return NextResponse.json({ success: true, destinations });
    }
  } catch (err) {
    console.warn("File read failed, trying Appwrite DB:", err);
  }

  try {
    const doc = await appwriteServer.databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      DOC_ID
    );
    const destinations = doc.details ? JSON.parse(doc.details) : [];
    return NextResponse.json({ success: true, destinations });
  } catch (err) {
    return NextResponse.json({ success: true, destinations: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const destinations = body.destinations || [];
    const jsonStr = JSON.stringify(destinations, null, 2);

    try {
      fs.writeFileSync(SHARED_FILE_PATH, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Shared file write warning:", fileErr);
    }

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
              propertyName: "CMS Popular Destinations Configuration",
              title: "CMS Popular Destinations Configuration",
              details: jsonStr,
            }
          );
        } catch (createErr) {
          console.warn("Appwrite DB doc create warning:", createErr);
        }
      }
    }

    return NextResponse.json({ success: true, destinations });
  } catch (err: any) {
    console.error("Error saving CMS popular destinations:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
