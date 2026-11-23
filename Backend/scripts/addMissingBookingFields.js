const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../../User/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function updateMissingSchema() {
    console.log("Updating Appwrite database attributes for Bookings   fields...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const bookingColId = 'bookings';

    const createFloatAttr = async (collectionId, key, required = false) => {
        try {
            await databases.createFloatAttribute(dbId, collectionId, key, required);
            console.log(`Created float attribute: ${key} in ${collectionId}`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped float ${key} in ${collectionId}: ${e.message}`);
        }
    };

    const createStringAttr = async (collectionId, key, size, required = false) => {
        try {
            await databases.createStringAttribute(dbId, collectionId, key, size, required);
            console.log(`Created string attribute: ${key} in ${collectionId}`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped string ${key} in ${collectionId}: ${e.message}`);
        }
    };

    try {
        console.log("\n--- Updating Bookings Collection ---");
        // Float fields
        await createFloatAttr(bookingColId, 'roomPricePerNight', false);
        await createFloatAttr(bookingColId, 'gstPercentage', false);
        await createFloatAttr(bookingColId, 'gstAmount', false);
        await createFloatAttr(bookingColId, 'priceBeforeTax', false);
        await createFloatAttr(bookingColId, 'priceAfterTax', false);
        await createFloatAttr(bookingColId, 'taxableAmount', false);
        
        // String fields
        await createStringAttr(bookingColId, 'gstType', 100, false);

        console.log(`\n✅ Database attributes for GST and Pricing added successfully!`);
    } catch (error) {
        console.error("❌ Error setting up attributes:", error);
    }
}

updateMissingSchema();
