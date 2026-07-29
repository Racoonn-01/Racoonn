import { Client, Account, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce');

export const appwriteConfig = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963',
    roomCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms",
    bookingCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "bookings",
    reviewCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || "6a59c6f526bfcf71ddbf",
    activitiesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || "activities",
};

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
