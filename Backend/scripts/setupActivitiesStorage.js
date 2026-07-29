const { Client, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function setupStorage() {
    console.log("Setting up Appwrite activities storage bucket...");
    
    try {
        let bucketId = "activities-images";
        
        try {
            await storage.getBucket(bucketId);
            console.log(`Bucket ${bucketId} already exists.`);
        } catch (err) {
            if (err.code === 404) {
                const bucket = await storage.createBucket(
                    bucketId,
                    'Activities Images',
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ],
                    false, // fileSecurity
                    true, // enabled
                    5242880, // 5MB max size
                    ['jpg', 'jpeg', 'png', 'webp', 'heic'] // allowed extensions
                );
                console.log("Created bucket: Activities Images with ID: " + bucket.$id);
            } else {
                throw err;
            }
        }
        
        console.log(`\n✅ Activities Bucket ID is: ${bucketId}`);
        console.log("Make sure to add NEXT_PUBLIC_APPWRITE_ACTIVITIES_BUCKET_ID=" + bucketId + " to Admin/.env.local and User/.env.local");
        
    } catch (e) {
        console.error("Error creating bucket:", e);
    }
}

setupStorage();
