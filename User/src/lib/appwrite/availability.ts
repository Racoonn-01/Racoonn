import { databases } from './config';
import { Query } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export async function checkAvailability(
  hotelId: string, 
  checkInDate: string, 
  checkOutDate: string,
  requestedRooms: number = 1
): Promise<{ isAvailable: boolean; message?: string }> {
  try {
    // Assuming a standard physical inventory of 5 rooms per property for this demo
    const TOTAL_INVENTORY = 5;

    // Fetch all confirmed or completed bookings for this hotel
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

    // Count how many rooms are occupied during the requested dates
    let occupiedRooms = 0;

    for (const booking of response.documents) {
      const bookingCheckIn = new Date(booking.checkIn).getTime();
      const bookingCheckOut = new Date(booking.checkOut).getTime();

      // Check if dates overlap
      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (targetCheckIn < bookingCheckOut && targetCheckOut > bookingCheckIn) {
        // We assume 1 room per booking for now
        occupiedRooms += 1;
      }
    }

    const availableRooms = TOTAL_INVENTORY - occupiedRooms;

    if (availableRooms >= requestedRooms) {
      return { isAvailable: true };
    } else {
      return { 
        isAvailable: false, 
        message: `Sorry, this property only has ${availableRooms} room(s) left for these dates.` 
      };
    }
  } catch (error) {
    console.error('Availability check failed:', error);
    // Fail closed or open? Let's fail open (allow booking) if DB is down, or fail closed. 
    // Usually better to fail closed in inventory, but for demo we will allow it if error happens
    return { isAvailable: false, message: 'Could not verify availability at this time.' };
  }
}
