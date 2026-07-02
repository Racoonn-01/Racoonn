const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function listProfiles() {
    try {
        const dbId = process.env.APPWRITE_DATABASE_ID;
        const colId = 'userprofiles';
        const docList = await databases.listDocuments(dbId, colId);
        console.log("Total profiles:", docList.total);
        docList.documents.forEach(d => {
            console.log(`- ID: ${d.$id}, Email: ${d.email}, Name: ${d.name}, DOB: ${d.dob}`);
        });
    } catch (e) {
        console.error("Error listing profiles:", e.message);
    }
}

listProfiles();
