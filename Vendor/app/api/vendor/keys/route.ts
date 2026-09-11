import { NextResponse } from "next/server";
import { Client, Databases, ID } from "node-appwrite";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { vendorId, businessName } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ error: "Missing vendorId" }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
      .setKey(process.env.APPWRITE_API_KEY || "");
    
    const databases = new Databases(client);
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
    
    // Generate Vendor Keys
    const newApiKey = "pk_live_" + crypto.randomBytes(12).toString("hex");
    const newSecretKey = "sk_live_" + crypto.randomBytes(24).toString("hex");

    // 1. Update Vendor Collection
    await databases.updateDocument(
      dbId,
      process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "vendors",
      vendorId,
      {
        apiKey: newApiKey,
        apiSecret: newSecretKey
      }
    );

    // 2. Add to Integration API Keys so Admin can see it
    const keyPrefix = newSecretKey.substring(0, 16);
    const keyHash = crypto.createHash('sha256').update(newSecretKey.trim()).digest('hex');

    await databases.createDocument(
      dbId,
      "integration_api_keys",
      ID.unique(),
      {
        name: `${businessName || 'Vendor'} API Key`,
        partner: vendorId,
        keyPrefix: keyPrefix,
        keyHash: keyHash,
        environment: "production",
        status: "active",
        permissions: ["properties:read", "properties:write", "rooms:read", "rooms:write", "availability:read", "availability:write", "rates:read", "rates:write", "reservations:read", "reservations:write", "reservations:create", "reservations:update", "reservations:cancel", "webhooks:read", "webhooks:write"],
        createdBy: "Vendor",
        expiresAt: "",
        lastUsedAt: "",
        rateLimit: 1000
      }
    );

    return NextResponse.json({ success: true, apiKey: newApiKey, apiSecret: newSecretKey });
  } catch (error: any) {
    console.error("Generate API Key Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}
