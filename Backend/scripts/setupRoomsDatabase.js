const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupRoomsDatabase() {
    console.log("Setting up Appwrite database attributes for Rooms...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    let collectionId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';

    try {
        try {
            await databases.getCollection(dbId, collectionId);
            console.log(`Collection ${collectionId} already exists. Updating permissions...`);
            await databases.updateCollection(
                dbId, 
                collectionId, 
                'Rooms',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            );
        } catch (err) {
            if (err.code === 404) {
                console.log(`Creating collection ${collectionId}...`);
                const res = await databases.createCollection(
                    dbId, 
                    collectionId, 
                    'Rooms',
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ]
                );
                collectionId = res.$id;
                console.log("Created collection: Rooms");
            } else {
                throw err;
            }
        }

        // Helper functions for attributes
        const createAttr = async (key, size, required) => {
            try {
                await databases.createStringAttribute(dbId, collectionId, key, size, required);
                console.log(`Created string attribute: ${key}`);
            } catch (e) {
                if (e.code !== 409) console.error(`Failed to create ${key}:`, e.message);
            }
        };

        const createIntAttr = async (key, required = false, min = 0, max = 99999999, defaultValue = 0) => {
            try {
                await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, defaultValue);
                console.log(`Created integer attr ${key}`);
            } catch (e) {
                if (e.code !== 409) console.log(`Skipped integer ${key}: ${e.message}`);
            }
        };

        // Define Schema
        await createAttr('vendorId', 50, true);
        await createAttr('propertyId', 50, false);
        await createAttr('name', 255, true);
        await createIntAttr('price', true, 0, 99999999, 0);
        await createIntAttr('occupancy', false, 1, 50, 2);
        await createIntAttr('size', false, 0, 99999, 0);

        try {
            await databases.createStringAttribute(dbId, collectionId, 'photos', 100, false, undefined, true); // array
            console.log(`Created photos array`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped photos: ${e.message}`);
        }

        // Create Index
        try {
            await databases.createIndex(dbId, collectionId, 'vendorId_index', 'key', ['vendorId'], ['ASC']);
            console.log(`✅ Created index for vendorId`);
        } catch (e) {
            if (e.code !== 409) console.log(`❌ Failed to create index: ${e.message}`);
        }

        console.log(`\n✅ Rooms collection configured successfully!`);
        console.log(`Make sure to add NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID=${collectionId} to your Vendor/.env.local if not there`);
    } catch (error) {
        console.error("❌ Error setting up attributes:", error);
    }
}

setupRoomsDatabase();
