const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    try {
        await databases.createIntegerAttribute(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_TICKETS_COLLECTION_ID,
            'rating',
            false,
            1, // min
            5, // max
            null // default
        );
        console.log("Created rating attribute.");
    } catch (e) { console.log(e.message); }

    try {
        await databases.createStringAttribute(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_TICKETS_COLLECTION_ID,
            'review',
            5000,
            false,
            null
        );
        console.log("Created review attribute.");
    } catch (e) { console.log(e.message); }
}
run();
