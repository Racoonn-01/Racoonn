require('dotenv').config({ path: '.env.local' });
async function run() {
  const { Client, Databases } = require('node-appwrite');
  const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const databases = new Databases(client);
  
  try {
    const res = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      'packages'
    );
    console.log("Packages collection documents count:", res.documents.length);
    if (res.documents.length > 0) {
      console.log("Titles:", res.documents.map(d => d.title).join(", "));
    }
  } catch (err) {
    console.error("Error querying packages:", err.message);
  }
}
run();
