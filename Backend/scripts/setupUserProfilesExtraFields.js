const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function addExtraFields() {
    console.log("Adding missing frontend fields to UserProfiles collection...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    const collectionId = 'userprofiles';

    const createAttr = async (key, size = 255, required = false) => {
        try {
            await databases.createStringAttribute(dbId, collectionId, key, size, required);
            console.log(`Created string attr ${key}`);
        } catch (e) {
            console.log(`Skipped string ${key}: ${e.message}`);
        }
    };

    const createStringArrayAttr = async (key, size = 255, required = false) => {
        try {
            await databases.createStringAttribute(dbId, collectionId, key, size, required, undefined, true);
            console.log(`Created string array attr ${key}`);
        } catch (e) {
            console.log(`Skipped string array ${key}: ${e.message}`);
        }
    };

    try {
        await createAttr('name', 255, false);
        await createAttr('email', 255, false);
        await createAttr('role', 50, false);
        await createAttr('gender', 50, false);
        await createAttr('dob', 100, false);
        await createAttr('nationality', 100, false);
        await createAttr('maritalStatus', 50, false);
        await createAttr('anniversary', 100, false);
        await createAttr('city', 100, false);
        await createAttr('state', 100, false);
        await createAttr('phone', 50, false);
        await createAttr('passportNo', 100, false);
        await createAttr('passportExpiry', 100, false);
        await createAttr('passportCountry', 100, false);
        await createAttr('panCard', 100, false);
        await createAttr('bio', 5000, false);
        
        await createStringArrayAttr('savedHotels', 100, false);

        console.log("✅ Missing attributes configured successfully!");
    } catch (error) {
        console.error("❌ Error setting up attributes:", error.message);
    }
}

addExtraFields();
