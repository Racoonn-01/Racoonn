require('dotenv').config({ path: '.env.local' });
const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
  try {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    // find vendor by email
    const { Query } = require('node-appwrite');
    const docs = await databases.listDocuments(dbId, '6a3e0fd9da7df0d38588', [
      Query.equal('email', 'itzsameero19917488969@gmail.com')
    ]);
    
    if (docs.documents.length === 0) {
      console.log("No vendor found");
      return;
    }
    const vendorId = docs.documents[0].$id;
    console.log("Updating vendor:", vendorId);
    
    const res = await databases.updateDocument(dbId, '6a3e0fd9da7df0d38588', vendorId, {
      allow24PercentGst: true
    });
    console.log("SUCCESS!", res);
  } catch (err) {
    console.error(err);
  }
}
run();
