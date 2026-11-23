const { Client, Storage, ID } = require('node-appwrite');
const fs = require('fs');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function run() {
    try {
        fs.writeFileSync('test-image.txt', 'hello world');
        // Node SDK older versions use a different method, or we can just try to fetch the bucket details
        const res = await storage.getBucket('6a3e398000280b2b3d20');
        console.log("Success:", res);
    } catch(e) {
        console.error(e);
    }
}
run();
