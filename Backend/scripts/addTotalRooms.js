const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const roomColId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID;

async function addTotalRooms() {
    try {
        console.log("Updating Rooms Collection...");
        await databases.createIntegerAttribute(dbId, roomColId, 'totalRooms', false, 1, 10000, 1);
        console.log("totalRooms added!");
    } catch(e) { console.log("Room error:", e.message); }
}
addTotalRooms();
