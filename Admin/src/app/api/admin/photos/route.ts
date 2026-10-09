import { NextRequest, NextResponse } from "next/server";
import { appwriteServer } from "@/lib/appwrite/server";

export async function PATCH(request: NextRequest) {
  try {
    const { collectionId, documentId, photos } = await request.json();

    if (!collectionId || !documentId || !Array.isArray(photos)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const db = appwriteServer.databases;

    await db.updateDocument(DATABASE_ID, collectionId, documentId, {
      photos: photos
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update photos:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
