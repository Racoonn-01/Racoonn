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
      // Exclude internal CMS system/storage documents (e.g. cms_invoices_v1, cms_packages_v1, CMS Invoices Storage)
      const validDocs = response.documents.filter((doc: any) => {
        const id = String(doc?.$id || doc?.id || '').toLowerCase().trim();
        const name = String(doc?.name || doc?.title || doc?.propertyName || '').toLowerCase().trim();
        if (
          id.startsWith('cms_') ||
          id.includes('invoices') ||
          id.includes('popular_stays') ||
          id.includes('packages') ||
          name.startsWith('cms') ||
          name.includes('cms invoices') ||
          name.includes('invoices storage') ||
          name.includes('cms storage')
        ) {
          return false;
        }
        return true;
      });

      // Map minimum room prices per property from DB
      const roomsMap: Record<string, number> = {};
      try {
        const roomsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.limit(500)]
        );
        if (roomsRes.documents && roomsRes.documents.length > 0) {
          roomsRes.documents.forEach((r: any) => {
            const pId = String(r.propertyId || '');
            const raw = Number(r.price || r.roomPrice || r.basePrice || r.pricePerNight || 0);
            const disc = Number(r.discountPrice || 0);
            const effective = (disc > 0 && disc < raw) ? disc : (raw > 0 ? raw : disc);
            if (pId && effective > 0) {
              if (!roomsMap[pId] || effective < roomsMap[pId]) {
                roomsMap[pId] = effective;
              }
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch rooms for price mapping:', err);
      }

      // Map real reviews count and average rating per property from reviewCollection
      const reviewsMap: Record<string, { totalRating: number; count: number }> = {};
      try {
        const reviewsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.reviewCollectionId,
          [Query.limit(500)]
        );
        if (reviewsRes.documents && reviewsRes.documents.length > 0) {
          reviewsRes.documents.forEach((rev: any) => {
            const pId = String(rev.propertyId || '');
            const ratingVal = Number(rev.rating || 0);
            if (pId && ratingVal > 0) {
              if (!reviewsMap[pId]) {
                reviewsMap[pId] = { totalRating: ratingVal, count: 1 };
              } else {
                reviewsMap[pId].totalRating += ratingVal;
                reviewsMap[pId].count += 1;
              }
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch reviews for rating mapping:', err);
      }

      return validDocs.map((doc: any) => {
        const roomMin = roomsMap[String(doc.$id)];
        const docPrice = Number(doc.price || doc.startingPrice || doc.basePrice || doc.pricePerNight || 0);
        const resolved = (roomMin && roomMin > 0) ? roomMin : (docPrice > 0 ? docPrice : 0);

        const revData = reviewsMap[String(doc.$id)];
        const calculatedRating = (revData && revData.count > 0)
          ? Number((revData.totalRating / revData.count).toFixed(1))
          : (Number(doc.rating || 0) > 0 ? Number(doc.rating) : 0);
        const calculatedReviewsCount = revData ? revData.count : Number(doc.reviewsCount || 0);

        return {
          ...doc,
          price: resolved,
          startingPrice: resolved,
          minPrice: resolved,
          rating: calculatedReviewsCount > 0 && calculatedRating > 0 ? calculatedRating : undefined,
          reviewsCount: calculatedReviewsCount,
        };
      });
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
  if (!id || String(id).toLowerCase().startsWith('cms_') || String(id).toLowerCase().includes('invoices')) {
    return null;
  }
  try {
    const response = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.propertyCollectionId,
      id
    );
    if (response) {
      try {
        const roomsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.roomCollectionId,
          [Query.equal('propertyId', id), Query.limit(50)]
        );
        if (roomsRes.documents && roomsRes.documents.length > 0) {
          let minPrice = Infinity;
          roomsRes.documents.forEach((r: any) => {
            const raw = Number(r.price || r.roomPrice || r.basePrice || r.pricePerNight || 0);
            const disc = Number(r.discountPrice || 0);
            const effective = (disc > 0 && disc < raw) ? disc : (raw > 0 ? raw : disc);
            if (effective > 0 && effective < minPrice) minPrice = effective;
          });
          if (minPrice !== Infinity && minPrice > 0) {
            response.price = minPrice;
            response.startingPrice = minPrice;
            response.minPrice = minPrice;
          }
        }
      } catch (err) {
        console.warn('Could not fetch rooms for property price mapping:', err);
      }

      try {
        const revsRes = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.reviewCollectionId,
          [Query.equal('propertyId', id), Query.limit(100)]
        );
        if (revsRes.documents && revsRes.documents.length > 0) {
          const totalRating = revsRes.documents.reduce((acc, r: any) => acc + Number(r.rating || 0), 0);
          const computedAvg = Number((totalRating / revsRes.documents.length).toFixed(1));
          response.rating = computedAvg;
          response.reviewsCount = revsRes.documents.length;
        }
      } catch (err) {
        console.warn('Could not fetch reviews for single property:', err);
      }
    }
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
      [Query.equal('propertyId', propertyId), Query.limit(50)]
    );
    return response.documents as any[];
  } catch (error) {
    console.error('Error fetching rooms from Appwrite:', error);
    return [];
  }
}

export async function getOccupiedRooms(hotelId: string, checkIn: string | Date, checkOut: string | Date): Promise<Record<string, number>> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.bookingCollectionId,
      [
        Query.equal('hotelId', hotelId),
        Query.equal('status', ['Confirmed', 'Completed']),
        Query.limit(100),
      ]
    );

    const parseDateMs = (d: string | Date): number => {
      if (d instanceof Date) return d.getTime();
      if (!d) return 0;
      const t = new Date(d).getTime();
      if (!isNaN(t)) return t;
      const parts = String(d).split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const mStr = parts[1].replace(',', '').slice(0, 3).toLowerCase();
        const year = parseInt(parts[2], 10);
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const mIdx = months.indexOf(mStr);
        if (!isNaN(day) && mIdx !== -1 && !isNaN(year)) {
          return new Date(year, mIdx, day).getTime();
        }
      }
      return 0;
    };

    const targetCheckIn = parseDateMs(checkIn);
    const targetCheckOut = parseDateMs(checkOut);
    const occupiedByRoom: Record<string, number> = {};

    for (const booking of response.documents) {
      const bIn = parseDateMs(booking.checkIn);
      const bOut = parseDateMs(booking.checkOut);

      if (targetCheckIn < bOut && targetCheckOut > bIn) {
        const roomNameKey = (booking.roomId || booking.roomName || '').trim();
        if (roomNameKey) {
          occupiedByRoom[roomNameKey] = (occupiedByRoom[roomNameKey] || 0) + (Number(booking.rooms) || 1);
        }
      }
    }

    return occupiedByRoom;
  } catch (err) {
    console.warn('Could not fetch occupied rooms from bookings:', err);
    return {};
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
  roomId?: string;
  roomName?: string;
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
    country?: string;
    state?: string;
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

  const gstCalc = calculateHotelGST(
    calculatedPerNight,
    nightsCount,
    roomsCount,
    input.payment.serviceFees || 0,
    input.payment.discount || 0
  );

  await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.bookingCollectionId,
    bookingId,
    {
      userId: input.userId,
      hotelId: input.hotelId,
      roomId: input.roomId || input.roomName || 'Standard Room',
      rooms: roomsCount,
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
      country: input.guest.country || 'India',
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

  // 🌟 Ensure user confirmation email with invoice PDF & vendor invoice for Vendor & Admin Dashboards are generated
  try {
    await sendBookingConfirmationAndGenerateInvoice({
      hotelName: input.hotelName,
      hotelLocation: input.hotelLocation,
      price: gstCalc.priceAfterTax,
      nights: nightsCount,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adults: input.adults || 1,
      email: input.guest.email,
      firstName: input.guest.firstName,
      lastName: input.guest.lastName,
      bookingId,
      displayBookingId: bookingId.substring(0, 8).toUpperCase(),
      addonsList: input.payment.serviceFees
        ? [{ name: 'Additional Services', price: input.payment.serviceFees }]
        : [],
      gstRate: gstCalc.gstPercentage,
      gstAmount: gstCalc.gstAmount,
      hotelId: input.hotelId,
      isPackage:
        (input.roomId || '').startsWith('Package:') ||
        (input.roomName || '').toLowerCase().includes('package') ||
        (input.hotelId || '').startsWith('pkg-'),
    });
  } catch {
    // Intentionally silent so booking completion is never blocked
  }

  return bookingId;
}

export async function sendBookingConfirmationAndGenerateInvoice(data: {
  hotelName: string;
  hotelLocation?: string;
  price: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  email: string;
  firstName: string;
  lastName: string;
  bookingId: string;
  displayBookingId?: string;
  addonsList?: any[];
  gstRate?: number;
  gstAmount?: number;
  hotelId?: string;
  isPackage?: boolean;
}): Promise<boolean> {
  try {
    const payload = {
      ...data,
      displayBookingId: data.displayBookingId || (data.bookingId ? data.bookingId.substring(0, 8).toUpperCase() : 'BK-RES'),
      addonsList: data.addonsList || [],
      gstRate: data.gstRate ?? 18,
      gstAmount: data.gstAmount ?? 0,
      isPackage: !!data.isPackage,
    };

    const candidateUrls: string[] = [];
    if (process.env.EXPO_PUBLIC_API_BASE_URL) {
      candidateUrls.push(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/email/booking-confirmation`);
    }
    candidateUrls.push(
      'https://racoonn.com/api/email/booking-confirmation',
      'http://192.168.1.7:5005/api/email/booking-confirmation',
      'http://10.0.2.2:5005/api/email/booking-confirmation',
      'http://localhost:5005/api/email/booking-confirmation',
      'http://192.168.1.7:3000/api/email/booking-confirmation',
      'http://localhost:3000/api/email/booking-confirmation'
    );

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(candidateUrls));

    for (const url of uniqueUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          console.log('[Booking Confirmation] Invoice & email processed successfully via:', url);
          return true;
        }
      } catch {
        // Try next candidate silently without triggering LogBox UI
      }
    }

    console.log('[Booking Confirmation] Background email/invoice endpoints were not reached.');
    return false;
  } catch {
    return false;
  }
}

export async function checkRoomAvailability(
  hotelId: string,
  checkInDate: string,
  checkOutDate: string,
  requestedRooms: number = 1,
  roomName: string = ''
): Promise<{ isAvailable: boolean; message?: string }> {
  try {
    let TOTAL_INVENTORY = 5;
    if (roomName) {
      const roomRes = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.roomCollectionId,
        [
          Query.equal('propertyId', hotelId),
          Query.equal('name', roomName),
          Query.limit(1),
        ]
      );
      if (roomRes.documents.length > 0) {
        TOTAL_INVENTORY = Number(roomRes.documents[0].totalRooms) || 1;
      }
    }

    const occupiedByRoom = await getOccupiedRooms(hotelId, checkInDate, checkOutDate);
    const occupiedRooms = (roomName && occupiedByRoom[roomName]) ? occupiedByRoom[roomName] : 0;
    const availableRooms = Math.max(0, TOTAL_INVENTORY - occupiedRooms);

    if (availableRooms >= requestedRooms) {
      return { isAvailable: true };
    } else {
      return {
        isAvailable: false,
        message: `Sorry, only ${availableRooms} ${roomName || 'room'}(s) left for these dates.`,
      };
    }
  } catch (error) {
    console.warn('Room availability check failed:', error);
    return { isAvailable: true }; // graceful fallback
  }
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.bookingCollectionId,
      bookingId,
      {
        status: 'Cancelled',
      }
    );
    return true;
  } catch (err) {
    console.error('Failed to cancel booking:', err);
    throw err;
  }
}

export async function createPackageLead(data: {
  packageId: string;
  packageTitle: string;
  name: string;
  phone: string;
  email: string;
  destination?: string;
  departureCity?: string;
  message?: string;
}): Promise<boolean> {
  try {
    await databases.createDocument(
      appwriteConfig.databaseId,
      'custom_package_leads',
      ID.unique(),
      {
        packageId: data.packageId,
        packageTitle: data.packageTitle,
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: data.message || '',
        destination: data.destination || '',
        departureCity: data.departureCity || '',
        status: 'New Lead',
      }
    );
    return true;
  } catch (err) {
    console.warn('Could not save lead to Appwrite collection:', err);
    // Fallback: try support tickets or return true if collection has schema constraint
    return true;
  }
}

export async function getCMSPackages(): Promise<any[]> {
  try {
    const packagesCollectionId =
      appwriteConfig.packagesCollectionId ||
      process.env.EXPO_PUBLIC_APPWRITE_PACKAGES_COLLECTION_ID ||
      '6a4372ef7ff33f643071';

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      packagesCollectionId,
      [Query.limit(100), Query.orderDesc('$createdAt')]
    );

    if (response.documents && response.documents.length > 0) {
      const safeParse = (val: any, fallback: any) => {
        if (!val) return fallback;
        if (typeof val !== 'string') return val;
        try {
          return JSON.parse(val);
        } catch {
          return fallback;
        }
      };

      return response.documents.map((doc: any) => {
        const pricing = safeParse(doc.pricing, []);
        const firstPricing = Array.isArray(pricing) && pricing.length > 0 ? pricing[0] : null;
        const resolvedPrice = Number(firstPricing?.pricePerPerson || doc.price || 0);

        return {
          id: String(doc.$id),
          title: String(doc.title || 'Tour Package'),
          location: String(doc.location || doc.metaTitle || 'Uttarakhand'),
          duration: String(doc.duration || '3 Days / 2 Nights'),
          features: Array.isArray(doc.features)
            ? doc.features.join(' | ')
            : String(doc.features || 'Meals | Stay | Transfer'),
          badge: String(doc.badge || 'Featured'),
          badgeColor: String(doc.badgeColor || ''),
          images: Array.isArray(doc.images) && doc.images.length > 0
            ? doc.images
            : ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800&auto=format&fit=crop'],
          price: resolvedPrice,
          pricing,
          hotelOptions: safeParse(doc.hotelOptions, []),
          activityOptions: safeParse(doc.activityOptions, []),
          itinerary: safeParse(doc.itinerary, []),
          departureCities: safeParse(doc.departureCities, []),
          metaTitle: String(doc.metaTitle || ''),
          metaDescription: String(doc.metaDescription || ''),
          status: String(doc.status || 'published'),
        };
      });
    }
  } catch (err) {
    console.warn('Error fetching packages from Appwrite packages collection:', err);
  }

  // Fallback: check cms_packages_v1 in property collection
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
  } catch {}

  return [];
}

export async function getCMSPopularStays() {
  // 1. Try listing documents directly from Appwrite 'popular_stays' collection
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      'popular_stays',
      [Query.limit(100)]
    );
    if (res && res.documents.length > 0) {
      return res.documents.map((doc: any) => ({
        id: doc.$id,
        title: doc.title || '',
        subtitle: doc.subtitle || '',
        location: doc.location || '',
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        order: doc.order || 0,
        propertyIds: doc.propertyIds || [],
      }));
    }
  } catch {}

  // 2. Try fetching from Backend /api/cms/popular-stays (LAN or local)
  const candidateUrls = [
    `${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.7:5005'}/api/cms/popular-stays`,
    'http://192.168.1.7:5005/api/cms/popular-stays',
    'http://10.0.2.2:5005/api/cms/popular-stays',
    'http://localhost:5005/api/cms/popular-stays',
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.sections) && data.sections.length > 0) {
          return data.sections;
        }
      }
    } catch {}
  }

  // 3. Fallback: check cms_popular_stays_v1 in property collection
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
  } catch {}

  return [];
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
