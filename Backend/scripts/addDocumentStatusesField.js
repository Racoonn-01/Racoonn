const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: 'User/.env.local' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    try {
        await databases.createStringAttribute(
            process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
            process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || '6a3e0fd9da7df0d38588',
            'documentStatuses',
            5000,
            false
        );
        console.log('Successfully created documentStatuses attribute');
    } catch (e) {
        console.log(e.message);
    }
}
run();
