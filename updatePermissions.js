const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '/Users/haldwani/Documents/Working/Working/Racoonn/Admin/.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || 'activities';

async function updatePermissions() {
    try {
        await databases.updateCollection(dbId, collectionId, collectionId, [
            Permission.read(Role.any()),
            Permission.create(Role.any()),
            Permission.update(Role.any()),
            Permission.delete(Role.any()),
        ]);
        console.log(`Updated permissions for ${collectionId} to allow Any.`);
    } catch (e) {
        console.error("Error updating permissions:", e);
    }
}
updatePermissions();
