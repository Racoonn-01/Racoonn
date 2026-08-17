import { Client, Account, Databases, Storage } from 'react-native-appwrite';
import { Platform } from 'react-native';

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const appwriteConfig = {
  endpoint,
  projectId,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || '6a3cec630035d63ea963',
  profilesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROFILES_COLLECTION_ID || 'userprofiles',
  vendorCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || '6a3e0fd9da7df0d38588',
  propertyCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties',
  roomCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || 'rooms',
  bookingCollectionId: process.env.EXPO_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || 'bookings',
  reviewCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || '6a59c6f526bfcf71ddbf',
  ticketsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || 'support_tickets',
  activitiesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ACTIVITIES_COLLECTION_ID || 'activities',

  propertyBucketId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTY_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20',
  roomBucketId: process.env.EXPO_PUBLIC_APPWRITE_ROOM_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20',
  profileBucketId: process.env.EXPO_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20',
};

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export default client;
