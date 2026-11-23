const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function fixDescriptionAttribute() {
    console.log("Fixing 'description' attribute in Activities collection...");
    
    const dbId = '6a3cec630035d63ea963';
    const collectionId = 'activities';

    try {
        // Try to delete the array description attribute
        try {
            await databases.deleteAttribute(dbId, collectionId, 'description');
            console.log("Deleted old array attribute, waiting 5 seconds for Appwrite to process...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (e) {
            console.log("Attribute doesn't exist or already deleted", e.message);
        }

        // Recreate it as a plain string (array = false)
        await databases.createStringAttribute(dbId, collectionId, 'description', 5000, false, undefined, false);
        console.log(`Successfully added 'description' string attribute to collection ${collectionId}.`);
    } catch (error) {
        console.error("Error updating Activities database:", error);
    }
}

fixDescriptionAttribute();
