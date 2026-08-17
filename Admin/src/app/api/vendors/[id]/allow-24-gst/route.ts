import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { allow24PercentGst } = body;

    if (allow24PercentGst === undefined) {
      return NextResponse.json(
        { error: "allow24PercentGst is required" },
        { status: 400 }
      );
    }

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";

    const updatedVendor = await appwriteServer.databases.updateDocument(
      DATABASE_ID,
      VENDOR_COLLECTION,
      id,
      { allow24PercentGst }
    );

    return NextResponse.json({ success: true, vendor: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor gst access:", error);
    return NextResponse.json(
      { error: "Failed to update vendor gst access" },
      { status: 500 }
    );
  }
}
