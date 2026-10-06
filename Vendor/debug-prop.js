const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

const dbId = '6a3cec630035d63ea963'; 

async function run() {
    try {
        const prop = await databases.getDocument(dbId, 'properties', '6a82bf9e003cf09088dc');
        console.log(`Property vendorId: ${prop.vendorId}, name: ${prop.name}`);
        
        // Let's also check who is the logged in vendor by looking at the first 5 user profiles?
        // Let's list the vendors from "userprofiles" that have role "vendor"
    } catch(e) {
        console.error(e);
    }
}
run();
