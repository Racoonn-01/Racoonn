const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function check() {
    try {
        const resp = await databases.listDocuments(process.env.APPWRITE_DATABASE_ID, 'vendors');
        console.log("First vendor document:");
        console.log(JSON.stringify(resp.documents[0], null, 2));
    } catch(e) {
        console.error(e);
    }
}
check();
