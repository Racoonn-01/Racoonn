const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixPermissions() {
    const dbId = process.env.APPWRITE_DATABASE_ID;
    const collections = [
        process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties',
        process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || process.env.APPWRITE_VENDOR_COLLECTION_ID,
        'userprofiles'
    ];

    const permissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ];

    for (const col of collections) {
        if (!col) continue;
        try {
            const collection = await databases.getCollection(dbId, col);
            await databases.updateCollection(dbId, col, collection.name, permissions);
            console.log(`✅ Updated permissions for ${col}`);
        } catch (e) {
            console.log(`❌ Failed to update ${col}: ${e.message}`);
        }
    }
}

fixPermissions();
