const sdk = require('node-appwrite');
const client = new sdk.Client();
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);
const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const colId = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties";
const docId = "cms_packages_v1";

async function run() {
    try {
        const doc = await databases.getDocument(dbId, colId, docId);
        console.log("details length:", doc.details ? doc.details.length : 0);
    } catch (err) {
        console.error(err);
    }
}
run();
