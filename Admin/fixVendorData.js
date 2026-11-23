const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '/Users/haldwani/Documents/Working/Working/Racoonn/Admin/.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || 'vendors';

async function fixData() {
    try {
        await databases.updateDocument(dbId, collectionId, '6a44e9d4003015938636', {
            idProofFront: '6a4660b600087e35d001', // random real file ID
            idProofBack: '6a4660b600087e35d001',
            businessProof: '6a4660b600087e35d001'
        });
        console.log("Updated DB successfully");
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}
fixData();
