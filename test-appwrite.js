const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6a3cec4e0026e680a6b4')
  .setKey(process.env.APPWRITE_API_KEY || "YOUR_API_KEY");

const databases = new Databases(client);

async function run() {
  try {
    const docs = await databases.listDocuments(
      "6a3cec630035d63ea963",
      "6a3e0fd9da7df0d38588"
    );
    console.log(docs.documents[0]);
  } catch (err) {
    console.error(err);
  }
}

run();
