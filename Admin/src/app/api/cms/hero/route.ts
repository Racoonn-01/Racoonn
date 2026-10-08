export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import fs from "fs";
import { appwriteServer } from "@/lib/appwrite/server";
import { Permission, Role, Query } from "node-appwrite";

const SHARED_FILE_PATH = "/tmp/racoonn_hero_section_cms.json";
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const COLLECTION_ID = "hero_section";

export async function GET() {
  noStore();
  try {
    const docs = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.limit(100)]
    );
    
    if (!docs || docs.documents.length === 0) {
      throw new Error("No images found in Appwrite collection");
    }

    const images = docs.documents.map((doc: any) => ({
      id: doc.$id,
      url: doc.url || "",
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      order: doc.order || 0
    }));

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.warn("Appwrite read failed, trying local file:", err);
  }

  try {
    if (fs.existsSync(SHARED_FILE_PATH)) {
      const fileData = fs.readFileSync(SHARED_FILE_PATH, "utf-8");
      const images = JSON.parse(fileData);
      return NextResponse.json({ success: true, images });
    }
    return NextResponse.json({ success: true, images: [] });
  } catch {
    return NextResponse.json({ success: true, images: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const images = body.images || [];
    const jsonStr = JSON.stringify(images, null, 2);

    try {
      fs.writeFileSync(SHARED_FILE_PATH, jsonStr, "utf-8");
    } catch (fileErr) {
      console.warn("Shared file write warning:", fileErr);
    }

    const existing = await appwriteServer.databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100)]);
    const existingIds = existing.documents.map((d: any) => d.$id);
    const incomingIds = images.map((p: any) => p.id);

    const toDelete = existingIds.filter((id: string) => !incomingIds.includes(id));
    for (const id of toDelete) {
      try {
        await appwriteServer.databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
      } catch (err) {
        console.warn("Failed to delete removed image", id);
      }
    }

    for (const img of images) {
      const data = {
        url: img.url || '',
        isActive: img.isActive !== undefined ? img.isActive : true,
        order: img.order || 0
      };

      try {
        await appwriteServer.databases.updateDocument(DATABASE_ID, COLLECTION_ID, img.id, data);
      } catch (err: any) {
        if (err?.code === 404) {
          try {
            await appwriteServer.databases.createDocument(
              DATABASE_ID,
              COLLECTION_ID,
              img.id,
              data,
              [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
            );
          } catch (createErr) {
            console.warn("Appwrite DB doc create warning for image:", img.id, createErr);
          }
        }
      }
    }

    return NextResponse.json({ success: true, images });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Error saving CMS hero section:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
