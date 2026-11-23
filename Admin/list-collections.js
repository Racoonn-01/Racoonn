const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function list() {
    try {
        const resp = await databases.listCollections(process.env.APPWRITE_DATABASE_ID);
        console.log("Collections:", resp.collections.map(c => c.$id));
    } catch(e) {
        console.error(e);
    }
}
list();
