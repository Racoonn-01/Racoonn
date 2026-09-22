const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '/Users/haldwani/Documents/Working/Working/Racoonn/Admin/.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || 'vendors';

async function getData() {
    try {
        const res = await databases.getDocument(dbId, collectionId, '6a44e9d4003015938636');
        console.log("gstCertificate:", res.gstCertificate);
        console.log("aadhaarCardBack:", res.aadhaarCardBack);
        console.log("fssaiLicense:", res.fssaiLicense);
        console.log("bankCheque:", res.bankCheque);
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}
getData();
