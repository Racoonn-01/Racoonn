const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY || process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    try {
        const collections = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
        const ticketsCol = collections.collections.find(c => c.name.toLowerCase().includes('ticket'));
        if (ticketsCol) {
            console.log('Found tickets collection:', ticketsCol.$id, ticketsCol.name);
        } else {
            console.log('No tickets collection found.');
        }
    } catch (error) {
        console.error(error);
    }
}
run();
