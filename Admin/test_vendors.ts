import { Client, Databases } from "node-appwrite";

const client = new Client();
client
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("6a3bce6900381359c3ce")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function run() {
  try {
    const res = await db.listDocuments("6a3cec630035d63ea963", "6a3e0fd9da7df0d38588");
    console.log(JSON.stringify(res.documents.slice(0, 2), null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
