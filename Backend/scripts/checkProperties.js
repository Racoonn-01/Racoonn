const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function check() {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const propColId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';

    try {
        const res = await databases.listDocuments(dbId, propColId);
        console.log(`Found ${res.total} properties.`);
        res.documents.forEach(doc => {
            console.log(`- ${doc.propertyName} (vendorId: ${doc.vendorId})`);
        });
    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}
check();
