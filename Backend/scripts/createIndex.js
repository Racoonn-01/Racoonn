const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function createIndex() {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const propColId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';

    try {
        await databases.createIndex(
            dbId, 
            propColId, 
            'vendorId_index', 
            'key', 
            ['vendorId'], 
            ['ASC']
        );
        console.log(`✅ Created index for vendorId`);
    } catch (e) {
        if (e.code === 409) {
            console.log("Index already exists.");
        } else {
            console.log(`❌ Failed to create index: ${e.message}`);
        }
    }
}

createIndex();
