const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const vendorColId = process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID;
const propColId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID;

async function updateSchema() {
    try {
        console.log("Updating Vendor Collection...");
        // Vendor fields
        await databases.createStringAttribute(dbId, vendorColId, 'bankName', 100, false);
        await databases.createStringAttribute(dbId, vendorColId, 'accountHolder', 200, false);
        await databases.createStringAttribute(dbId, vendorColId, 'accountNumber', 50, false);
        await databases.createStringAttribute(dbId, vendorColId, 'ifsc', 20, false);
        await databases.createStringAttribute(dbId, vendorColId, 'upiId', 100, false);
        await databases.createStringAttribute(dbId, vendorColId, 'currentPropertyId', 50, false);
        console.log("Vendor schema updated!");
    } catch(e) { console.log("Vendor error:", e.message); }

    try {
        console.log("Updating Property Collection...");
        // Property fields
        await databases.createStringAttribute(dbId, propColId, 'amenities', 100, false, undefined, true); // array
        await databases.createStringAttribute(dbId, propColId, 'photos', 1000, false, undefined, true); // array
        await databases.createStringAttribute(dbId, propColId, 'cancellationPolicy', 200, false);
        await databases.createStringAttribute(dbId, propColId, 'checkInTime', 20, false);
        await databases.createStringAttribute(dbId, propColId, 'checkOutTime', 20, false);
        console.log("Property schema updated!");
    } catch(e) { console.log("Property error:", e.message); }
}
updateSchema();
