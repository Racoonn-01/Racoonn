
import "dotenv/config";
import { Client, Databases } from "node-appwrite";

const client = new Client();
client.setEndpoint("https://sgp.cloud.appwrite.io/v1");
client.setProject("6a3bce6900381359c3ce"); 
const databases = new Databases(client);

async function check() {
  const props = await databases.listDocuments(
    "6a3cec630035d63ea963", 
    "properties"
  );
  console.log(JSON.stringify(props.documents.map(d => ({id: d.$id, photos: d.photos})).slice(0, 5), null, 2));
}
check().catch(console.error);

