import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Extract editable fields
    const { propertyName, propertyType, city, state, location, status } = body;
    
    // Build update object based on what was provided
    const updateData: any = {};
    if (propertyName !== undefined) {
      updateData.propertyName = propertyName;
      updateData.title = propertyName; // Sync title if it exists
    }
    if (propertyType !== undefined) updateData.propertyType = propertyType;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (location !== undefined) updateData.location = location;
    if (status !== undefined) updateData.status = status;

    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const db = appwriteServer.databases;

    const updatedDoc = await db.updateDocument(
      DATABASE_ID,
      'properties',
      id,
      updateData
    );

    return NextResponse.json(updatedDoc);
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}
