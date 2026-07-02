const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

async function check() {
    try {
        const vendorCol = await databases.listAttributes(dbId, process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID);
        console.log("Vendor Attributes:", vendorCol.attributes.map(a => `${a.key} (${a.type})`).join(", "));
        
        const propCol = await databases.listAttributes(dbId, process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID);
        console.log("Property Attributes:", propCol.attributes.map(a => `${a.key} (${a.type})`).join(", "));
    } catch(e) {
        console.error(e);
    }
}
check();
