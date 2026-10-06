const { Client, Databases } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    try {
        await databases.createStringAttribute(
            '6a3cec630035d63ea963', 
            'promotions', 
            'assignedUserEmail', 
            255, 
            false, 
            null
        );
        console.log("Attribute created successfully.");
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
