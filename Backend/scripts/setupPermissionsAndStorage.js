const { Client, Databases, Storage, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

async function setupPermissionsAndStorage() {
    console.log("Setting up Appwrite Permissions and Storage...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;

    try {
        // 1. Update Database Permissions
        const publicReadPerms = [
            Permission.read(Role.any())
        ];
        
        const userWritePerms = [
            Permission.create(Role.users()),
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
        ];

        console.log("Updating collection permissions...");

        const collectionsWithPublicRead = ['Hotels', 'Properties', 'Packages'];
        const collectionsWithDLS = ['Bookings', 'Wishlists', 'UserProfiles', 'ContactRequests'];

        const res = await databases.listCollections(dbId);
        
        for (const col of res.collections) {
            if (collectionsWithPublicRead.includes(col.name)) {
                await databases.updateCollection(dbId, col.$id, col.name, publicReadPerms, false);
                console.log(`Updated permissions for ${col.name} (Public Read)`);
            } else if (collectionsWithDLS.includes(col.name)) {
                // Ensure documentSecurity is true for DLS
                await databases.updateCollection(dbId, col.$id, col.name, userWritePerms, true);
                console.log(`Updated permissions for ${col.name} (User Write, DLS Enabled)`);
            }
        }

        // 2. Create Storage Bucket
        console.log("Setting up UserAvatars Storage Bucket...");
        let bucketId = 'userAvatars';
        try {
            await storage.getBucket(bucketId);
            console.log("Bucket userAvatars already exists.");
        } catch (e) {
            if (e.code === 404) {
                const bucketPerms = [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ];
                await storage.createBucket(
                    bucketId, 
                    'User Avatars', 
                    bucketPerms, 
                    false, 
                    true,  
                    5242880, 
                    ['jpg', 'jpeg', 'png', 'webp'], 
                    'gzip', 
                    true,   
                    true    
                );
                console.log(`Created bucket User Avatars with ID: ${bucketId}`);
            } else {
                throw e;
            }
        }

        console.log("✅ Permissions and Storage configured successfully!");
        console.log(`\n--- Add this to your env ---`);
        console.log(`NEXT_PUBLIC_APPWRITE_AVATARS_BUCKET_ID=${bucketId}`);
        
    } catch (error) {
        console.error("❌ Error setting up permissions and storage:", error.message);
    }
}

setupPermissionsAndStorage();
