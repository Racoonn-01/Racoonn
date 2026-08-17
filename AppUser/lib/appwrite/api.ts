import { databases, appwriteConfig, storage } from './config';
import { Query, ID } from 'react-native-appwrite';
import { calculateHotelGST } from '../../utils/gst';

export async function getProperties(): Promise<any[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    if (response.documents && response.documents.length > 0) {
      return response.documents as any[];
    }
  } catch (error) {
    console.error('Error fetching properties from Appwrite:', error);
  }

  return [];
}

export function getImageUrl(imageId: string): string {
  if (!imageId) return '';
  if (imageId.startsWith('http') || imageId.startsWith('data:')) return imageId;
  try {
    return storage.getFileViewURL(appwriteConfig.roomBucketId, imageId).toString();
  } catch {
    return '';
  }
}

export async function getProperty(id: string): Promise<any> {
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      id
    );
    return response;
  } catch (error) {
    console.error('Error fetching property by id from Appwrite:', error);
    return null;
  }
}

export async function getRooms(propertyId: string): Promise<any[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.roomCollectionId,
      [Query.equal('propertyId', propertyId), Query.limit(20)]
    );
    return response.documents as any[];
  } catch (error) {
    console.error('Error fetching rooms from Appwrite:', error);
    return [];
  }
}

export async function getReviews(propertyId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewCollectionId,
      [Query.equal('propertyId', propertyId), Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function createReview(data: { propertyId: string; vendorId: string; userName: string; rating: number; text: string; category?: string }) {
  try {
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
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
      appwriteConfig.databaseId,
      appwriteConfig.bookingCollectionId,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt'), Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
}

export interface BookingInput {
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelImage?: string;
  hotelLocation: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms?: number;
  adults: number;
  roomPricePerNight?: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  payment: {
    roomPrice: number;
    taxes: number;
    serviceFees: number;
    discount: number;
    totalAmount: number;
    gstPercentage?: number;
    gstAmount?: number;
    gstType?: string;
    priceBeforeTax?: number;
    priceAfterTax?: number;
    taxableAmount?: number;
    roomPricePerNight?: number;
  };
}

export async function createBooking(input: BookingInput) {
  const bookingId = ID.unique();
  const roomsCount = Math.max(1, Number(input.rooms) || 1);
  const nightsCount = Math.max(1, Number(input.nights) || 1);

  // Compute per night rate if not passed explicitly
  const calculatedPerNight = input.roomPricePerNight ||
    input.payment.roomPricePerNight ||
    (input.payment.roomPrice > 0 ? Math.round(input.payment.roomPrice / (roomsCount * nightsCount)) : 3500);

  const gstCalc = calculateHotelGST(calculatedPerNight, nightsCount, roomsCount);

  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.bookingCollectionId,
    bookingId,
    {
      userId: input.userId,
      hotelId: input.hotelId,
      roomId: 'standard-room',
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights: nightsCount,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      hotelName: input.hotelName,
      hotelImage: input.hotelImage || '',
      hotelLocation: input.hotelLocation,
      adults: input.adults,
      roomPricePerNight: gstCalc.roomPricePerNight,
      gstPercentage: gstCalc.gstPercentage,
      gstAmount: gstCalc.gstAmount,
      gstType: gstCalc.gstType,
      priceBeforeTax: gstCalc.priceBeforeTax,
      priceAfterTax: gstCalc.priceAfterTax,
      taxableAmount: gstCalc.taxableAmount,
    }
  );

  await databases.createDocument(
    appwriteConfig.databaseId,
    'booking_guests',
    ID.unique(),
    {
      bookingId,
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      email: input.guest.email,
      phone: input.guest.phone,
      country: 'India',
      specialRequests: input.guest.specialRequests || '',
    }
  );

  await databases.createDocument(
    appwriteConfig.databaseId,
    'booking_payments',
    ID.unique(),
    {
      bookingId,
      roomPrice: gstCalc.priceBeforeTax,
      taxes: gstCalc.gstAmount,
      serviceFees: input.payment.serviceFees || 0,
      discount: input.payment.discount || 0,
      totalAmount: gstCalc.priceAfterTax,
      roomPricePerNight: gstCalc.roomPricePerNight,
      gstPercentage: gstCalc.gstPercentage,
      gstAmount: gstCalc.gstAmount,
      gstType: gstCalc.gstType,
      priceBeforeTax: gstCalc.priceBeforeTax,
      priceAfterTax: gstCalc.priceAfterTax,
      taxableAmount: gstCalc.taxableAmount,
    }
  );

  return bookingId;
}

export async function getCMSPackages() {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      'cms_packages_v1'
    );
    if (doc && doc.details) {
      const parsed = JSON.parse(doc.details);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function getCMSPopularStays() {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      'cms_popular_stays_v1'
    );
    if (doc && doc.details) {
      const parsed = JSON.parse(doc.details);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}

export async function getCMSPopularDestinations() {
  try {
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      'cms_popular_destinations_v1'
    );
    if (doc && doc.details) {
      const parsed = JSON.parse(doc.details);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return [];
  } catch {
    return [];
  }
}
