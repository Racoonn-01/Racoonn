import { Client, Databases } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    const cols = await databases.listCollections(process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
    console.log("Collections:", cols.collections.map(c => c.$id));
}
run();
