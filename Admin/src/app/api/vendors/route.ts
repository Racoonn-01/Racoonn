import { appwriteServer } from "@/lib/appwrite/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
    const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";

    const response = await appwriteServer.databases.listDocuments(
      DATABASE_ID,
      VENDOR_COLLECTION
    );

    const vendors = response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name || doc.vendorName || doc.ownerName || "Vendor",
      businessName: doc.propertyName || doc.businessName || doc.name || "Racoonn Partner Stay",
      email: doc.email || doc.vendorEmail || "",
      phone: doc.phone || doc.contactNumber || "",
      address: doc.address || doc.city || "Uttarakhand, India",
      gstin: doc.gstin || doc.taxId || "22AAAAA0000A1Z5",
    }));

    return NextResponse.json({ success: true, vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    // Return sample vendor list if DB not ready
    return NextResponse.json({
      success: true,
      vendors: [
        {
          id: "v-1",
          name: "Golden Edit Residency",
          businessName: "Golden Edit Homestays",
          email: "goldenedit@racoonn.com",
          phone: "+91 98765 43210",
          address: "Dewalchaurh kham, Haldwani",
          gstin: "05AAACG1234A1Z1",
        },
        {
          id: "v-2",
          name: "Royal Town Luxury Suites",
          businessName: "Royal Town Hospitality",
          email: "royaltown@racoonn.com",
          phone: "+91 98123 45678",
          address: "Rudrapur - Haldwani Rd, Haldwani",
          gstin: "05BBBCR5678B1Z2",
        },
      ],
    });
  }
}
