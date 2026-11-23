import { appwriteServer } from "./Admin/src/lib/appwrite/server";
import { Databases } from "node-appwrite";

async function run() {
  const db = new Databases(appwriteServer as any); // wait, appwriteServer is already a Client or Databases? Let's check Admin/src/lib/appwrite/server.ts
}
run();
