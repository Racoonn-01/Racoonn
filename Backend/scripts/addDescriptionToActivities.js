const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addDescriptionAttribute() {
    console.log("Adding 'description' attribute to Activities collection...");
    
    const dbId = '6a3cec630035d63ea963';
    const collectionId = 'activities';

    try {
        await databases.createStringAttribute(dbId, collectionId, 'description', 5000, false, undefined, true);
        console.log(`Successfully added 'description' attribute to collection ${collectionId}.`);
    } catch (error) {
        console.error("Error updating Activities database:", error);
    }
}

addDescriptionAttribute();