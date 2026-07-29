const { Client, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function setupBlogsStorage() {
    console.log("Setting up Appwrite storage bucket for Blogs...");
    
    const bucketId = 'blog_images';

    try {
        // Create bucket if it doesn't exist
        try {
            await storage.getBucket(bucketId);
            console.log(`Bucket ${bucketId} already exists.`);
        } catch (e) {
            if (e.code === 404) {
                console.log(`Creating bucket ${bucketId}...`);
                await storage.createBucket(
                    bucketId, 
                    'Blog Images',
                    [
                        Permission.read(Role.any()), // Anyone can read images
                        Permission.create(Role.users()), // Admins/Users can create
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ],
                    false,
                    undefined,
                    undefined,
                    ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp']
                );
                console.log("Bucket created successfully.");
            } else {
                throw e;
            }
        }

        console.log("Finished setting up Blogs storage bucket!");
    } catch (error) {
        console.error("Error setting up Blogs storage:", error);
    }
}

setupBlogsStorage();
