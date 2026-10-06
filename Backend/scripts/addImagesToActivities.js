const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../.env' }); 

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addImagesAttribute() {
    console.log("Adding 'images' attribute to Activities collection...");
    
    const dbId = '6a3cec630035d63ea963'; // Hardcoding to avoid dotenv issue
    const collectionId = 'activities';

    try {
        await databases.createStringAttribute(dbId, collectionId, 'images', 1024, false, undefined, true);
        console.log(`Successfully added 'images' attribute to collection ${collectionId}.`);
    } catch (error) {
        console.error("Error updating Activities database:", error);
    }
}

addImagesAttribute();