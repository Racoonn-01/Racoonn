const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupDatabase() {
    console.log("Setting up Appwrite database attributes...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    const profilesCol = 'userprofiles';

    try {
        const createAttr = async (key, size = 255, required = true) => {
            try {
                await databases.createStringAttribute(dbId, profilesCol, key, size, required);
                console.log(`Created ${key}`);
            } catch (e) {
                console.log(`Skipped ${key}: ${e.message}`);
            }
        };

        await createAttr('userId');
        await createAttr('email');
        await createAttr('name');
        await createAttr('role');
        
        // New Profile Fields
        await createAttr('phone', 20, false);
        await createAttr('dob', 20, false);
        await createAttr('gender', 20, false);
        await createAttr('bio', 1000, false);
        await createAttr('nationality', 50, false);
        await createAttr('maritalStatus', 50, false);
        await createAttr('anniversary', 50, false);
        await createAttr('city', 100, false);
        await createAttr('state', 100, false);
        
        // Document Fields
        await createAttr('passportNo', 50, false);
        await createAttr('passportExpiry', 50, false);
        await createAttr('passportCountry', 50, false);
        await createAttr('panCard', 50, false);

        // Array Fields
        try {
            await databases.createStringAttribute(dbId, profilesCol, 'savedHotels', 100, false, undefined, true); // true for array
            console.log(`Created savedHotels array`);
        } catch (e) {
            console.log(`Skipped savedHotels: ${e.message}`);
        }

        console.log("✅ Attributes created successfully! It takes a few seconds for Appwrite to fully provision them.");
    } catch (error) {
        console.error("❌ Error setting up attributes:", error.message);
    }
}

setupDatabase();
