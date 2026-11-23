const { Client, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function setupStorage() {
    console.log("Setting up Appwrite storage buckets...");
    
    try {
        // Create Vendor Documents Bucket
        let bucketId = "vendor-documents";
        
        try {
            await storage.getBucket(bucketId);
            console.log(`Bucket ${bucketId} already exists.`);
        } catch (err) {
            if (err.code === 404) {
                const bucket = await storage.createBucket(
                    bucketId,
                    'Vendor Documents',
                    [
                        Permission.read(Role.any()),
                        Permission.create(Role.users()),
                        Permission.update(Role.users()),
                        Permission.delete(Role.users()),
                    ],
                    false, // fileSecurity
                    true, // enabled
                    5242880, // 5MB max size
                    ['jpg', 'jpeg', 'png', 'pdf'] // allowed extensions
                );
                console.log("Created bucket: Vendor Documents with ID: " + bucket.$id);
            } else {
                throw err;
            }
        }
        
        console.log(`\n✅ Bucket ID is: ${bucketId}`);
        console.log("Make sure to add NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID=" + bucketId + " to Vendor/.env.local");
        
    } catch (e) {
        console.error("Error creating bucket:", e);
    }
}

setupStorage();
