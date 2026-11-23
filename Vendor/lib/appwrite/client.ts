import { Client, Account, Databases, Storage, Functions, Avatars } from "appwrite";

export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1",
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "6a3bce6900381359c3ce",
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963",
    // Collections
    vendorCollectionId: process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "6a3e0fd9da7df0d38588",
    propertyCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "properties",
    roomCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "rooms",
    bookingCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "bookings",
    reviewCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || "6a59c6f526bfcf71ddbf",
    ticketsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || "support_tickets",
    roomAvailabilityCollectionId: "room_availability",
    // Buckets
    vendorDocumentsBucketId: process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "6a3e398000280b2b3d20",
    propertyImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_IMAGES_BUCKET_ID || "6a3e398000280b2b3d20",
    roomImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_IMAGES_BUCKET_ID || "6a3e398000280b2b3d20",
    profileImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || "6a3e398000280b2b3d20",
};

export const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);
