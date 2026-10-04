import { NextResponse } from "next/server";
import { appwriteServer } from "@/lib/appwrite/server";

export async function GET() {
  const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
  const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
  
  try {
    const response = await appwriteServer.databases.listDocuments(DATABASE_ID, COLLECTION_ID);
    const docs = response.documents.map((d: any) => ({
      id: d.$id,
      propertyName: d.propertyName,
      detailsLength: d.details ? d.details.length : 0
    }));
    return NextResponse.json({ success: true, count: response.total, docs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
