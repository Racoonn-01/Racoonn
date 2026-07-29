const { Client, Storage, InputFile, ID } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

async function testUpload() {
    const BUCKET_ID = "6a3e398000280b2b3d20";
    console.log("Testing upload to bucket:", BUCKET_ID);
    try {
        const buffer = Buffer.from('hello world', 'utf-8');
        const file = await storage.createFile(
            BUCKET_ID, 
            ID.unique(), 
            InputFile.fromBuffer(buffer, "test.txt")
        );
        console.log("Uploaded file successfully:", file.$id);
    } catch (e) {
        console.error("Failed to upload:", e.message);
    }
}
testUpload();
