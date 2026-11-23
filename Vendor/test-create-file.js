const { Client, Storage, ID, InputFile } = require('node-appwrite');
const fs = require('fs');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function run() {
    try {
        fs.writeFileSync('test-image.txt', 'hello world');
        const buffer = fs.readFileSync('test-image.txt');
        const file = InputFile.fromBuffer(buffer, 'test-image.txt');
        const res = await storage.createFile('6a3e398000280b2b3d20', ID.unique(), file);
        console.log("Success:", res.$id);
    } catch(e) {
        console.error(e);
    }
}
run();
