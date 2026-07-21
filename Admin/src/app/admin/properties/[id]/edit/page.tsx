import { appwriteServer } from "@/lib/appwrite/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EditPropertyForm from "./EditPropertyForm";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export default async function PropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let property = null;

  try {
    const db = appwriteServer.databases;
    const doc = await db.getDocument(DATABASE_ID, 'properties', id);
    
    property = {
      id: doc.$id,
      propertyName: doc.propertyName || doc.title || "",
      propertyType: doc.propertyType || "",
      location: [doc.city, doc.state].filter(Boolean).join(", ") || doc.location || "",
      status: doc.status || "Pending",
    };

  } catch (error) {
    console.error("Error fetching property for edit:", error);
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Property Not Found</h2>
        <Link href="/admin/properties">
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  return <EditPropertyForm property={property} />;
}
