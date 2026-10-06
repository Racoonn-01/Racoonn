const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const databaseId = '6a3cec630035d63ea963';

async function main() {
    try {
        console.log("Creating collection...");
        const collection = await databases.createCollection(
            databaseId,
            'custom_package_leads',
            'Custom Package Leads'
        );
        console.log("Collection created:", collection.$id);

        console.log("Creating attributes...");
        await databases.createStringAttribute(databaseId, collection.$id, 'packageId', 255, true);
        await databases.createStringAttribute(databaseId, collection.$id, 'packageTitle', 255, true);
        await databases.createStringAttribute(databaseId, collection.$id, 'name', 255, true);
        await databases.createStringAttribute(databaseId, collection.$id, 'phone', 255, true);
        await databases.createStringAttribute(databaseId, collection.$id, 'email', 255, true);
        await databases.createStringAttribute(databaseId, collection.$id, 'message', 5000, false);
        await databases.createStringAttribute(databaseId, collection.$id, 'destination', 255, false);
        await databases.createStringAttribute(databaseId, collection.$id, 'departureCity', 255, false);
        await databases.createStringAttribute(databaseId, collection.$id, 'status', 255, false, 'New Lead');
        
        console.log("Success!");
    } catch (err) {
        console.error(err);
    }
}
main();
