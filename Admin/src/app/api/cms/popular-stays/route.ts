export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { appwriteServer } from "@/lib/appwrite/server";
import { Permission, Role, Query } from "node-appwrite";

const SHARED_FILE_PATH = "/Users/haldwani/Documents/Working/Working/Racoonn/popular_stays_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "popular_stays";

export async function GET() {
  noStore();
  try {
    const docs = await appwriteServer.databases.listDocuments(
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
    console.warn("Appwrite read failed, trying local file:", err);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stays = body.sections || [];
    const jsonStr = JSON.stringify(stays, null, 2);

    try {
      fs.writeFileSync(SHARED_FILE_PATH, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Shared file write warning:", fileErr);
    }

    const existing = await appwriteServer.databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100)]);
    const existingIds = existing.documents.map((d: any) => d.$id);
    const incomingIds = stays.map((p: any) => p.id);

    const toDelete = existingIds.filter((id: string) => !incomingIds.includes(id));
    for (const id of toDelete) {
      try {
        await appwriteServer.databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      } catch (err) {
        console.warn("Failed to delete removed stay", id);
      }
    }

    for (const stay of stays) {
      const data = {
        title: stay.title || '',
        subtitle: stay.subtitle || '',
        location: stay.location || '',
        isActive: stay.isActive !== undefined ? stay.isActive : true,
        order: stay.order || 0,
        propertyIds: stay.propertyIds || []
      };

      try {
        await appwriteServer.databases.updateDocument(DATABASE_ID, COLLECTION_ID, stay.id, data);
      } catch (err: any) {
        if (err?.code === 404) {
          try {
            await appwriteServer.databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              stay.id,
              data,
              [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
            );
          } catch (createErr) {
            console.warn("Appwrite DB doc create warning for stay:", stay.id, createErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, sections: stays });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error saving CMS popular stays:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
