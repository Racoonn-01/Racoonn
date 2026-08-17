const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6a3bce6900381359c3ce')
  .setKey(process.env.APPWRITE_API_KEY || 'test'); // We might not need a key for reading if it's public.

const databases = new Databases(client);

async function test() {
  try {
    const doc = await databases.getDocument(
      '6a3cec630035d63ea963',
      'properties',
      'cms_packages_v1'
    );
    console.log("Document found:", doc.details.substring(0, 100));
  } catch (e) {
    console.log("Error:", e.message);
  }
}

test();
