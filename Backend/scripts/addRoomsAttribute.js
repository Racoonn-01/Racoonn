const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function updateMissingSchema() {
    console.log("Updating Appwrite database attributes for Bookings rooms field...");
    
    const dbId = '6a3cec630035d63ea963';
    const bookingColId = 'bookings';

    const createIntAttr = async (collectionId, key, required = false, min = 0, max = 99999999, defaultValue = 1) => {
        try {
            await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, defaultValue);
            console.log(`Created int attribute: ${key} in ${collectionId}`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped int ${key} in ${collectionId}: ${e.message}`);
        }
    };

    try {
        console.log("\n--- Updating Bookings Collection ---");
        await createIntAttr(bookingColId, 'rooms', false);

        console.log(`\n✅ Database attributes for rooms added successfully!`);
    } catch (error) {
        console.error("❌ Error setting up attributes:", error);
    }
}

updateMissingSchema();
