import { databases } from './config';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export async function checkAvailability(
  hotelId: string, 
  checkInDate: string, 
  checkOutDate: string,
  requestedRooms: number = 1,
  roomName: string = ''
): Promise<{ isAvailable: boolean; message?: string }> {
  try {
    // 1. Find the specific room to get its total inventory
    let TOTAL_INVENTORY = 5; // Fallback
    if (roomName) {
      const roomRes = await databases.listDocuments(
        DATABASE_ID,
        'rooms',
        [
          Query.equal('propertyId', hotelId),
          Query.equal('name', roomName)
        ]
      );
      if (roomRes.documents.length > 0) {
        TOTAL_INVENTORY = Number(roomRes.documents[0].totalRooms) || 1;
      }
    }

    // 2. Fetch all confirmed or completed bookings for this hotel
    const response = await databases.listDocuments(
      DATABASE_ID, 
      'bookings', 
      [
        Query.equal('hotelId', hotelId),
        Query.equal('status', ['Confirmed', 'Completed'])
      ]
    );

    const targetCheckIn = new Date(checkInDate).getTime();
    const targetCheckOut = new Date(checkOutDate).getTime();

    // 3. Count how many of THIS specific room are occupied
    let occupiedRooms = 0;

    for (const booking of response.documents) {
      // Only count bookings for the same room type (if roomName is provided)
      if (roomName && booking.roomId !== roomName) {
        continue;
      }

      const bookingCheckIn = new Date(booking.checkIn).getTime();
      const bookingCheckOut = new Date(booking.checkOut).getTime();

      // Check if dates overlap: (StartA < EndB) and (EndA > StartB)
      if (targetCheckIn < bookingCheckOut && targetCheckOut > bookingCheckIn) {
        occupiedRooms += (Number(booking.rooms) || 1);
      }
    }

    const availableRooms = Math.max(0, TOTAL_INVENTORY - occupiedRooms);

    if (availableRooms >= requestedRooms) {
      return { isAvailable: true };
    } else {
      return { 
        isAvailable: false, 
        message: `Sorry, only ${availableRooms} ${roomName || 'room'}(s) left for these dates.` 
      };
    }
  } catch (error) {
    console.error('Availability check failed:', error);
    return { isAvailable: false, message: 'Could not verify availability at this time.' };
  }
}
