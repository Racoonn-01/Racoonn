const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function updatePricingSchema() {
    console.log("Updating Appwrite database attributes for Room Occupancy & Pricing...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const roomColId = process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms';
    const bookingColId = 'bookings';

    const createIntAttr = async (collectionId, key, required = false, min = 0, max = 99999999, defaultValue = 0) => {
        try {
            await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, defaultValue);
            console.log(`Created integer attribute: ${key} in ${collectionId}`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped integer ${key} in ${collectionId}: ${e.message}`);
        }
    };

    const createBoolAttr = async (collectionId, key, required = false, defaultValue = false) => {
        try {
            await databases.createBooleanAttribute(dbId, collectionId, key, required, defaultValue);
            console.log(`Created boolean attribute: ${key} in ${collectionId}`);
        } catch (e) {
            if (e.code !== 409) console.log(`Skipped boolean ${key} in ${collectionId}: ${e.message}`);
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
        // --- Rooms Collection Updates ---
        console.log("\n--- Updating Rooms Collection ---");
        await createIntAttr(roomColId, 'standardCapacity', false, 1, 50, 2);
        await createIntAttr(roomColId, 'maximumCapacity', false, 1, 50, 4);
        await createIntAttr(roomColId, 'extraPersonCharge', false, 0, 99999999, 0);
        await createBoolAttr(roomColId, 'extraBedAvailable', false, false);
        
        // --- Bookings Collection Updates ---
        console.log("\n--- Updating Bookings Collection ---");
        await createIntAttr(bookingColId, 'standardCapacity', false, 1, 50, 2);
        await createIntAttr(bookingColId, 'maximumCapacity', false, 1, 50, 4);
        await createIntAttr(bookingColId, 'totalGuests', false, 1, 1000, 2);
        await createIntAttr(bookingColId, 'extraGuests', false, 0, 1000, 0);
        await createIntAttr(bookingColId, 'extraPersonCharge', false, 0, 99999999, 0);
        await createIntAttr(bookingColId, 'baseRoomAmount', false, 0, 99999999, 0);
        await createIntAttr(bookingColId, 'extraGuestAmount', false, 0, 99999999, 0);
        await createStringAttr(bookingColId, 'pricingBreakdown', 5000, false);
        await createStringAttr(bookingColId, 'snapshotRoomConfig', 5000, false);

        console.log(`\n✅ Database attributes for Dynamic Pricing added successfully!`);
    } catch (error) {
        console.error("❌ Error setting up attributes:", error);
    }
}

updatePricingSchema();
