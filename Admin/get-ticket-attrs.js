const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function check() {
    try {
        const resp = await databases.listAttributes(process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_TICKETS_COLLECTION_ID);
        console.log("Attributes:", resp.attributes.map(a => a.key));
    } catch(e) {
        console.error(e);
    }
}
check();
