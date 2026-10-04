import { appwriteServer } from "./src/lib/appwrite/server";

async function checkCollections() {
  const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3bce92000dd667f573";
  try {
    const categories = await appwriteServer.databases.listDocuments(dbId, "cab_categories");
    console.log("cab_categories exists:", categories.total);
  } catch (e: any) {
    console.error("cab_categories error:", e.message);
  }
  try {
    const cabs = await appwriteServer.databases.listDocuments(dbId, "cabs");
    console.log("cabs exists:", cabs.total);
  } catch (e: any) {
    console.error("cabs error:", e.message);
  }
}

checkCollections();
