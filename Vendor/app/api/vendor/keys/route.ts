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
    
    // Generate Vendor Keys using standard format
    const randomSecret = crypto.randomBytes(24).toString('hex');
    const newApiKey = `rac_live_partner_${randomSecret}`;
    
    // We can also generate a webhook secret while we're at it
    const newSecretKey = `whsec_${crypto.randomBytes(24).toString('hex')}`;

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
    const keyPrefix = newApiKey.substring(0, 25);
    const keyHash = crypto.createHash('sha256').update(newApiKey.trim()).digest('hex');

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
        expiresAt: null,
        lastUsedAt: null,
        rateLimit: 1000
      }
    );

    return NextResponse.json({ success: true, apiKey: newApiKey, apiSecret: newSecretKey });
  } catch (error: any) {
    console.error("Generate API Key Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error?.message }, { status: 500 });
  }
}
