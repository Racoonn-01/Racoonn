const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupUserDatabase() {
    console.log("Setting up Appwrite database attributes for User Portal...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;

    // Helper functions
    const createAttr = async (collectionId, key, size = 255, required = true) => {
        try {
            await databases.createStringAttribute(dbId, collectionId, key, size, required);
            console.log(`Created string attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped string ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const createBoolAttr = async (collectionId, key, required = false, defaultValue = false) => {
        try {
            await databases.createBooleanAttribute(dbId, collectionId, key, required, defaultValue);
            console.log(`Created boolean attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped boolean ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const createIntAttr = async (collectionId, key, required = false, min = 0, max = 1000000, defaultValue = 0) => {
        try {
            await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, required ? undefined : defaultValue);
            console.log(`Created integer attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped integer ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const createFloatAttr = async (collectionId, key, required = false, min = 0, max = 1000000, defaultValue = 0) => {
        try {
            await databases.createFloatAttribute(dbId, collectionId, key, required, min, max, required ? undefined : defaultValue);
            console.log(`Created float attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped float ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const createDatetimeAttr = async (collectionId, key, required = false) => {
        try {
            await databases.createDatetimeAttribute(dbId, collectionId, key, required);
            console.log(`Created datetime attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped datetime ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const createEnumAttr = async (collectionId, key, elements, required = false, defaultValue = '') => {
        try {
            await databases.createEnumAttribute(dbId, collectionId, key, elements, required, required ? undefined : defaultValue);
            console.log(`Created enum attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped enum ${key} for ${collectionId}: ${e.message}`);
        }
    };
    
    const createStringArrayAttr = async (collectionId, key, size = 255, required = false) => {
        try {
            await databases.createStringAttribute(dbId, collectionId, key, size, required, undefined, true);
            console.log(`Created string array attr ${key} for ${collectionId}`);
        } catch (e) {
            console.log(`Skipped string array ${key} for ${collectionId}: ${e.message}`);
        }
    };

    const getOrCreateCollection = async (name) => {
        let collectionId = '';
        try {
            const res = await databases.listCollections(dbId);
            const col = res.collections.find(c => c.name === name);
            if (col) {
                collectionId = col.$id;
                console.log(`Found existing ${name} collection with ID: ${collectionId}`);
            } else {
                console.log(`Creating ${name} collection...`);
                const newCol = await databases.createCollection(dbId, 'unique()', name);
                collectionId = newCol.$id;
                console.log(`Created ${name} collection with ID: ${collectionId}`);
            }
        } catch (e) {
            console.error(`Error with collection ${name}:`, e.message);
        }
        return collectionId;
    };

    try {
        // 1. UserProfiles
        const userProfilesColId = await getOrCreateCollection('UserProfiles');
        if (userProfilesColId) {
            await createAttr(userProfilesColId, 'userId', 50, true);
            await createAttr(userProfilesColId, 'firstName', 100, false);
            await createAttr(userProfilesColId, 'lastName', 100, false);
            await createAttr(userProfilesColId, 'phoneNumber', 20, false);
            await createAttr(userProfilesColId, 'avatarUrl', 1000, false);
            await createDatetimeAttr(userProfilesColId, 'createdAt', false);
        }

        // 2. Hotels
        const hotelsColId = await getOrCreateCollection('Hotels');
        if (hotelsColId) {
            await createAttr(hotelsColId, 'name', 255, true);
            await createAttr(hotelsColId, 'location', 255, true);
            await createFloatAttr(hotelsColId, 'rating', false, 0, 5, 0);
            await createIntAttr(hotelsColId, 'reviewsCount', false, 0, 1000000, 0);
            await createFloatAttr(hotelsColId, 'price', true, 0, 1000000, 0);
            await createAttr(hotelsColId, 'imageUrl', 1000, false);
            await createAttr(hotelsColId, 'details', 5000, false);
            await createStringArrayAttr(hotelsColId, 'amenities', 100, false);
        }

        // 3. Properties
        const propertiesColId = await getOrCreateCollection('Properties');
        if (propertiesColId) {
            await createAttr(propertiesColId, 'title', 255, true);
            await createAttr(propertiesColId, 'location', 255, true);
            await createAttr(propertiesColId, 'details', 5000, false);
            await createFloatAttr(propertiesColId, 'price', true, 0, 1000000, 0);
            await createFloatAttr(propertiesColId, 'rating', false, 0, 5, 0);
            await createIntAttr(propertiesColId, 'reviewsCount', false, 0, 1000000, 0);
            await createAttr(propertiesColId, 'imageUrl', 1000, false);
            await createBoolAttr(propertiesColId, 'isFeatured', false, false);
        }

        // 4. Packages
        const packagesColId = await getOrCreateCollection('Packages');
        if (packagesColId) {
            await createAttr(packagesColId, 'title', 255, true);
            await createAttr(packagesColId, 'location', 255, true);
            await createAttr(packagesColId, 'duration', 100, true);
            await createStringArrayAttr(packagesColId, 'features', 255, false);
            await createFloatAttr(packagesColId, 'price', true, 0, 1000000, 0);
            await createAttr(packagesColId, 'badge', 100, false);
            await createAttr(packagesColId, 'badgeColor', 50, false);
            await createStringArrayAttr(packagesColId, 'images', 1000, false);
        }

        // 5. Bookings
        const bookingsColId = await getOrCreateCollection('Bookings');
        if (bookingsColId) {
            await createAttr(bookingsColId, 'userId', 50, true);
            await createEnumAttr(bookingsColId, 'entityType', ['hotel', 'property', 'package'], true);
            await createAttr(bookingsColId, 'entityId', 50, true);
            await createDatetimeAttr(bookingsColId, 'checkInDate', true);
            await createDatetimeAttr(bookingsColId, 'checkOutDate', true);
            await createIntAttr(bookingsColId, 'guestsCount', true, 1, 100, 1);
            await createFloatAttr(bookingsColId, 'totalAmount', true, 0, 10000000, 0);
            await createEnumAttr(bookingsColId, 'status', ['pending', 'confirmed', 'cancelled', 'completed'], true, 'pending');
            await createAttr(bookingsColId, 'paymentId', 100, false);
            await createDatetimeAttr(bookingsColId, 'createdAt', true);
        }

        // 6. Wishlists
        const wishlistsColId = await getOrCreateCollection('Wishlists');
        if (wishlistsColId) {
            await createAttr(wishlistsColId, 'userId', 50, true);
            await createEnumAttr(wishlistsColId, 'entityType', ['hotel', 'property', 'package'], true);
            await createAttr(wishlistsColId, 'entityId', 50, true);
            await createDatetimeAttr(wishlistsColId, 'createdAt', true);
        }

        // 7. ContactRequests
        const contactRequestsColId = await getOrCreateCollection('ContactRequests');
        if (contactRequestsColId) {
            await createAttr(contactRequestsColId, 'name', 255, true);
            await createAttr(contactRequestsColId, 'email', 255, true);
            await createAttr(contactRequestsColId, 'message', 5000, true);
            await createEnumAttr(contactRequestsColId, 'status', ['new', 'in-progress', 'resolved'], false, 'new');
        }

        console.log("✅ User Portal attributes configured successfully! It takes a few seconds for Appwrite to fully provision them.");
        
        console.log("\n--- Add these to your env ---");
        console.log(`NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID=${userProfilesColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_HOTELS_COLLECTION_ID=${hotelsColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_PROPERTIES_COLLECTION_ID=${propertiesColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_PACKAGES_COLLECTION_ID=${packagesColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID=${bookingsColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_WISHLISTS_COLLECTION_ID=${wishlistsColId}`);
        console.log(`NEXT_PUBLIC_APPWRITE_CONTACT_REQUESTS_COLLECTION_ID=${contactRequestsColId}`);

    } catch (error) {
        console.error("❌ Error setting up attributes:", error.message);
    }
}

setupUserDatabase();
