import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const { documentStatuses } = body;

    if (!documentStatuses) {
      return NextResponse.json(
        { error: "documentStatuses is required" },
        { status: 400 }
      );
    }

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const VENDOR_COLLECTION = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "6a3e0fd9da7df0d38588";

    // Update the document in Appwrite
    const updatedVendor = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      VENDOR_COLLECTION,
      id,
      { documentStatuses }
    );

    return NextResponse.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor docs:", error);
    return NextResponse.json(
      { error: "Failed to update vendor docs" },
      { status: 500 }
    );
  }
}
