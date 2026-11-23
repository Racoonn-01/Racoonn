import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { Client, Databases, Query, Models } from "node-appwrite";

export async function GET() {
  noStore();
  try {
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");
    const databases = new Databases(client);

    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const response = await databases.listDocuments(dbId, "custom_package_leads", [
      Query.orderDesc("$createdAt"),
      Query.limit(100)
    ]);
    
    // Map Appwrite documents back to exactly what Admin frontend expects
    const leads = response.documents.map((doc: Models.Document) => ({
      ...doc,
      id: doc.$id,
      createdAt: doc.$createdAt
    }));

    return NextResponse.json({ success: true, leads });
  } catch (err: unknown) {
    console.error("Error reading custom package leads:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) return NextResponse.json({ success: false, error: "Missing id or status" }, { status: 400 });

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");
    const databases = new Databases(client);
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

    const updatedDoc = await databases.updateDocument(dbId, "custom_package_leads", id, { status });

    return NextResponse.json({ success: true, lead: { ...updatedDoc, id: updatedDoc.$id } });
  } catch (err: unknown) {
    console.error("Error updating custom package lead:", err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
