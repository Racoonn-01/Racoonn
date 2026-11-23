const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '/Users/haldwani/Documents/Working/Working/Racoonn/Admin/.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || 'vendors';

async function addAttributes() {
    const attrs = [
        'gstCertificate',
        'bankCheque',
        'fssaiLicense',
        'aadhaarCardBack'
    ];
    
    for (const attr of attrs) {
        try {
            await databases.createStringAttribute(dbId, collectionId, attr, 255, false);
            console.log(`Added attribute: ${attr}`);
        } catch (e) {
            console.error(`Failed to add ${attr}:`, e.message || e);
        }
    }
}
addAttributes();
