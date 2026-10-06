/* eslint-disable @typescript-eslint/no-require-imports */
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DB_ID = '6a3cec630035d63ea963';

async function run() {
    try {
        const rooms = await databases.listDocuments(DB_ID, 'rooms', [Query.limit(5)]);
        console.log(JSON.stringify(rooms.documents.map(r => ({ id: r.$id, photos: r.photos })), null, 2));
    } catch(e) { console.error(e); }
}
run();
