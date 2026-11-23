const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

async function run() {
    try {
        await databases.updateCollection('6a3cec630035d63ea963', 'properties', 'properties', [
            'read("any")',
            'create("users")',
            'update("users")',
            'delete("users")'
        ]);
        console.log("Collection permissions updated to allow read(any)");
    } catch (err) {
        console.error("Error updating collection permissions:", err.message);
    }
}
run();
