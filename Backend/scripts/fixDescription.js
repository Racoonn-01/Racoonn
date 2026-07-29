const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

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
