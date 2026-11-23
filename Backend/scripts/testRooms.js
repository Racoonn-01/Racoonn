const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '../.env' });
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
const DATABASE_ID = '6a3cec630035d63ea963';
async function run() {
    const res = await databases.listDocuments(DATABASE_ID, 'rooms', [
        Query.equal('propertyId', '6a4645d500061bbfb3d1')
    ]);
    console.log(res.documents.map(r => ({ name: r.name, totalRooms: r.totalRooms })));
}
run();
