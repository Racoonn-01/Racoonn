import { databases, appwriteConfig } from './config';
import { Query, ID } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROPERTY_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_COLLECTION_ID || 'properties';

export async function getProperties() {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      PROPERTY_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching properties from Appwrite:', error);
    return [];
  }
}

export async function getProperty(id: string) {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      PROPERTY_COLLECTION_ID,
      id
    );
    return response;
  } catch (error) {
    console.error('Error fetching property from Appwrite:', error);
    return null;
  }
}

export async function getReviews(propertyId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      appwriteConfig.reviewCollectionId,
      [Query.equal('propertyId', propertyId), Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function createReview(data: { propertyId: string, vendorId: string, userName: string, rating: number, text: string, category?: string }) {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      appwriteConfig.reviewCollectionId,
      ID.unique(),
      data
    );
    return response;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
}

export async function getUserBookings(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'bookings',
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
}

export async function getBookingPayments(bookingIds: string[]) {
  if (!bookingIds.length) return [];
  try {
    // Because Appwrite doesn't support equal with arrays of >100 in old versions, or we can just fetch all or use multiple queries.
    // Assuming < 100 bookings for a user
    const response = await databases.listDocuments(
      DATABASE_ID,
      'booking_payments',
      [Query.equal('bookingId', bookingIds), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching booking payments:', error);
    return [];
  }
}
