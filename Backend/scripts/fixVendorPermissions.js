const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixPermissions() {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const vendorColId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID;

    const permissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
    ];

    try {
        const collection = await databases.getCollection(dbId, vendorColId);
        await databases.updateCollection(dbId, vendorColId, collection.name, permissions);
        console.log(`✅ Updated permissions for Vendors (${vendorColId})`);
    } catch (e) {
        console.log(`❌ Failed to update Vendors: ${e.message}`);
    }
}

fixPermissions();
