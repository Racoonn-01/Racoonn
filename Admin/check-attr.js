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
    const attrs = await databases.listAttributes(dbId, '6a3e0fd9da7df0d38588');
    const hasAttr = attrs.attributes.find(a => a.key === 'allow24PercentGst');
    console.log(hasAttr ? "EXISTS" : "MISSING");
    if (!hasAttr) {
      console.log("CREATING...");
      await databases.createBooleanAttribute(dbId, '6a3e0fd9da7df0d38588', 'allow24PercentGst', false, false);
      console.log("CREATED! Note: it takes time to process.");
    }
  } catch (err) {
    console.error(err);
  }
}
run();
