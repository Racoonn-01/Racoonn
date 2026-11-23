const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupPropertiesDatabase() {
    console.log("Setting up Appwrite database attributes for Properties...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    
    let collectionId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties"; 

    try {
        try {
            await databases.getCollection(dbId, collectionId);
            console.log(`Collection ${collectionId} already exists.`);
        } catch (err) {
            if (err.code === 404) {
                console.log(`Creating collection ${collectionId}...`);
                const res = await databases.createCollection(
                    dbId, 
                    collectionId, 
                    'Properties',
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ]
                );
                collectionId = res.$id;
                console.log("Created collection: Properties");
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

        // Define Schema
        await createAttr('vendorId', 50, true);
        await createAttr('propertyName', 255, true);
        await createAttr('propertyType', 100, true);
        await createAttr('city', 100, true);
        await createAttr('state', 100, true);
        await createAttr('description', 5000, false);
        await createAttr('status', 50, false); // Pending, Approved, Rejected

        console.log(`\n✅ Properties collection configured successfully!`);
        console.log(`Make sure to add NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID=${collectionId} to your Vendor/.env.local`);
    } catch (error) {
        console.error("❌ Error setting up attributes:", error);
    }
}

setupPropertiesDatabase();
