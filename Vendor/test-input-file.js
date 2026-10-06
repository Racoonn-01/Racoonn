const { Client, Storage, ID } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const fs = require('fs');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function run() {
    try {
        fs.writeFileSync('test-image.jpg', 'fake image content');
        const file = InputFile.fromPath('test-image.jpg', 'test-image.jpg');
        const res = await storage.createFile('6a3e398000280b2b3d20', ID.unique(), file);
        console.log("Success:", res.$id);
    } catch(e) {
        console.error(e);
    }
}
run();
