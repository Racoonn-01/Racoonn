import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '');

export const appwriteConfig = {
    roomCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "",
    bookingCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "",
    reviewCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || "",
};

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
