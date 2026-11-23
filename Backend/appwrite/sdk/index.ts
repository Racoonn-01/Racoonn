import { Client, Databases, Users, Storage, Functions, Messaging } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT as string)
    .setProject(process.env.APPWRITE_PROJECT_ID as string)
    .setKey(process.env.APPWRITE_API_KEY as string);

export const databases = new Databases(client);
export const users = new Users(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const messaging = new Messaging(client);

export default client;
