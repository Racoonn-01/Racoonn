/* eslint-disable @typescript-eslint/no-require-imports */
const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    try {
        const prop = await databases.listDocuments('6a3cec630035d63ea963', 'properties', []);
        console.log('Property 1:', JSON.stringify(prop.documents[0], null, 2));
        
        try {
            const rooms = await databases.listDocuments('6a3cec630035d63ea963', 'rooms', []);
            console.log('Rooms sample:', JSON.stringify(rooms.documents[0], null, 2));
        } catch(e) {
            console.log("No rooms collection or error", e.message);
        }
    } catch(e) { console.error(e); }
}
run();
