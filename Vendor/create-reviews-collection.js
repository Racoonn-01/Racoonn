const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function createReviewsCollection() {
    try {
        const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
        
        console.log("Creating Reviews Collection...");
        const collection = await databases.createCollection(
            dbId,
            'unique()',
            'Reviews',
            ['read("any")', 'create("users")', 'update("users")', 'delete("users")'] // Let's use standard permission strings
        );
        
        console.log("Collection created! ID:", collection.$id);
        const colId = collection.$id;

        console.log("Creating attributes...");
        // propertyId (string, required)
        await databases.createStringAttribute(dbId, colId, 'propertyId', 255, true);
        // vendorId (string, required)
        await databases.createStringAttribute(dbId, colId, 'vendorId', 255, true);
        // userName (string, required)
        await databases.createStringAttribute(dbId, colId, 'userName', 255, true);
        // category (string, optional)
        await databases.createStringAttribute(dbId, colId, 'category', 255, false);
        // rating (integer, required)
        await databases.createIntegerAttribute(dbId, colId, 'rating', true, 1, 5);
        // text (string, required, up to 5000 chars)
        await databases.createStringAttribute(dbId, colId, 'text', 5000, true);
        // vendorReply (string, optional, up to 5000 chars)
        await databases.createStringAttribute(dbId, colId, 'vendorReply', 5000, false);
        // date (string, optional)
        await databases.createStringAttribute(dbId, colId, 'date', 255, false);
        
        console.log("Attributes creation initiated. Waiting for processing...");
        
        // Wait for attributes to be ready (usually takes a few seconds)
        await new Promise(r => setTimeout(r, 4000));
        
        console.log("Creating indexes...");
        await databases.createIndex(dbId, colId, 'propertyId_idx', 'key', ['propertyId'], ['ASC']);
        await databases.createIndex(dbId, colId, 'vendorId_idx', 'key', ['vendorId'], ['ASC']);
        
        console.log("Indexes creation initiated.");
        console.log("\n=================================");
        console.log(`Add this to your .env files:\nNEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID=${colId}`);
        console.log("=================================\n");
        
    } catch (err) {
        console.error("Error creating collection:", err);
    }
}

createReviewsCollection();
