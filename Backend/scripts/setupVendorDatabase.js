const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupVendorDatabase() {
    console.log("Setting up Appwrite database attributes for Vendors...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    
    let collectionId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || process.env.APPWRITE_VENDOR_COLLECTION_ID; 

    try {
        if (!collectionId) {
            // Try to find it by name or create it
            const res = await databases.listCollections(dbId);
            const vendorCol = res.collections.find(c => c.name === 'Vendors');
            if (vendorCol) {
                collectionId = vendorCol.$id;
            } else {
                console.log("Creating Vendors collection...");
                const newCol = await databases.createCollection(dbId, 'unique()', 'Vendors');
                collectionId = newCol.$id;
                console.log(`Created Vendors collection with ID: ${collectionId}`);
                // Update .env file for future use? We'll just output it.
                console.log(`Please add NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID=${collectionId} to your Vendor/.env.local`);
            }
        }

        const createAttr = async (key, size = 255, required = true) => {
            try {
                await databases.createStringAttribute(dbId, collectionId, key, size, required);
                console.log(`Created string attr ${key}`);
            } catch (e) {
                console.log(`Skipped string ${key}: ${e.message}`);
            }
        };

        const createBoolAttr = async (key, required = false, defaultValue = false) => {
            try {
                await databases.createBooleanAttribute(dbId, collectionId, key, required, defaultValue);
                console.log(`Created boolean attr ${key}`);
            } catch (e) {
                console.log(`Skipped boolean ${key}: ${e.message}`);
            }
        };

        const createIntAttr = async (key, required = false, min = 0, max = 15, defaultValue = 1) => {
            try {
                await databases.createIntegerAttribute(dbId, collectionId, key, required, min, max, defaultValue);
                console.log(`Created integer attr ${key}`);
            } catch (e) {
                console.log(`Skipped integer ${key}: ${e.message}`);
            }
        };

        await createAttr('userId', 50, true);
        await createAttr('email', 100, true);
        await createAttr('firstName', 100, false);
        await createAttr('lastName', 100, false);
        await createAttr('phone', 20, false);
        await createAttr('altPhone', 20, false);
        await createAttr('businessName', 255, false);
        await createAttr('gstNumber', 50, false);
        await createAttr('panNumber', 50, false);
        await createAttr('status', 50, true); // 'Pending' | 'Approved' | 'Rejected' | 'Suspended'
        await createAttr('address', 255, false);
        await createAttr('city', 100, false);
        await createAttr('state', 100, false);
        await createAttr('country', 100, false);
        await createAttr('pincode', 20, false);
        await createAttr('role', 50, true);
        
        // New Step 3 Attributes
        await createAttr('bizType', 50, false);
        await createAttr('idType', 50, false);
        await createAttr('aadharNumber', 50, false);
        
        // File Upload Attributes
        await createAttr('idProofFront', 100, false);
        await createAttr('idProofBack', 100, false);
        await createAttr('businessProof', 100, false);

        // Verification Flags
        await createBoolAttr('isEmailVerified', false, false);
        await createBoolAttr('isPhoneVerified', false, false);

        // Progress Tracking
        await createIntAttr('onboardingStep', false, 0, 15, 1);

        console.log("✅ Vendor attributes configured successfully! It takes a few seconds for Appwrite to fully provision them.");
    } catch (error) {
        console.error("❌ Error setting up attributes:", error.message);
    }
}

setupVendorDatabase();
