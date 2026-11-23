const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../.env' }); // Adjust if needed to find .env

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupActivitiesDatabase() {
    console.log("Setting up Appwrite database attributes for Activities...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = 'activities';

    try {
        // Create collection if it doesn't exist
        try {
            await databases.getCollection(dbId, collectionId);
            console.log(`Collection ${collectionId} already exists.`);
        } catch (e) {
            if (e.code === 404) {
                console.log(`Creating collection ${collectionId}...`);
                const res = await databases.createCollection(
                    dbId, 
                    collectionId, 
                    'Activities', 
                    [
                        Permission.read(Role.any()), // Anyone can read published activities
                        Permission.create(Role.users()), // Admins/Users can create
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ]
                );
                console.log("Collection created successfully.");
            } else {
                throw e;
            }
        }

        const createAttr = async (type, key, size, required = false, array = false) => {
            try {
                if (type === 'string') {
                    await databases.createStringAttribute(dbId, collectionId, key, size, required, undefined, array);
                } else if (type === 'integer') {
                    await databases.createIntegerAttribute(dbId, collectionId, key, required, 0, 999999999, undefined, array);
                }
                console.log(`Created ${key}`);
            } catch (e) {
                console.log(`Skipped ${key}: ${e.message}`);
            }
        };

        // Create Attributes
        await createAttr('string', 'title', 255, true);
        await createAttr('string', 'location', 255, true);
        await createAttr('string', 'duration', 255, true);
        await createAttr('string', 'groupSize', 255, true);
        await createAttr('string', 'price', 255, true);
        await createAttr('string', 'image', 1024, true); 
        await createAttr('string', 'category', 255, true);

        console.log("Finished setting up Activities collection attributes!");
    } catch (error) {
        console.error("Error setting up Activities database:", error);
    }
}

setupActivitiesDatabase();
