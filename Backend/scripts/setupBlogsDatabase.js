const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupBlogsDatabase() {
    console.log("Setting up Appwrite database attributes for Blogs...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = 'blogs';

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
                    'Blogs', 
                    [
                        Permission.read(Role.any()), // Anyone can read published blogs
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
        await createAttr('string', 'slug', 255, true);
        await createAttr('string', 'category', 255, true);
        await createAttr('string', 'excerpt', 1000, true);
        await createAttr('string', 'content', 100000, false); // Massive string for content
        await createAttr('string', 'imageId', 255, false); // For the featured image (legacy)
        await createAttr('string', 'images', 500, false, true); // Array of images
        await createAttr('string', 'status', 50, true);
        await createAttr('string', 'date', 255, true); // Storing formatted date or ISO string
        await createAttr('string', 'readTime', 50, false);
        await createAttr('integer', 'views', 0, false);

        console.log("Finished setting up Blogs collection attributes!");
    } catch (error) {
        console.error("Error setting up Blogs database:", error);
    }
}

setupBlogsDatabase();
