import { Client, Account, Databases, Storage, Functions, Avatars } from "appwrite";

export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
    // Collections
    vendorCollectionId: process.env.NEXT_PUBLIC_APPWRITE_VENDOR_COLLECTION_ID || "",
    propertyCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || "",
    roomCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_COLLECTION_ID || "",
    bookingCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKING_COLLECTION_ID || "",
    reviewCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEW_COLLECTION_ID || "",
    ticketsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_TICKETS_COLLECTION_ID || "",
    // Buckets
    vendorDocumentsBucketId: process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "",
    propertyImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_IMAGES_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "",
    roomImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_ROOM_IMAGES_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "",
    profileImagesBucketId: process.env.NEXT_PUBLIC_APPWRITE_PROFILE_IMAGES_BUCKET_ID || process.env.NEXT_PUBLIC_APPWRITE_VENDOR_DOCUMENTS_BUCKET_ID || "",
};

export const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);
