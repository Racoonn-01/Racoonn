const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixPrice() {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    let collectionId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';
    try {
        await databases.createIntegerAttribute(dbId, collectionId, 'price', true, 0, 99999999);
        console.log(`Created integer attr price`);
    } catch(e) {
        console.log(e.message);
    }
}
fixPrice();
