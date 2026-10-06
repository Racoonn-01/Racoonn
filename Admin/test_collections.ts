import { Client, Databases } from "node-appwrite";

const client = new Client();
client
  .setEndpoint("https://sgp.cloud.appwrite.io/v1")
  .setProject("6a3bce6900381359c3ce")
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

async function run() {
  try {
    const res = await db.listCollections("6a3cec630035d63ea963");
    console.log(JSON.stringify(res.collections.map(c => ({ id: c.$id, name: c.name })), null, 2));
  } catch (err) {
    console.error(err);
  }
}
run();
