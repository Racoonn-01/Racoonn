import { NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

export const dynamic = 'force-dynamic';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hotelId = searchParams.get('hotelId');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!hotelId || !checkIn || !checkOut) {
    return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID, 
      'bookings', 
      [
        Query.equal('hotelId', hotelId),
        Query.equal('status', ['Confirmed', 'Completed'])
      ]
    );

    const targetCheckIn = new Date(checkIn).getTime();
    const targetCheckOut = new Date(checkOut).getTime();

    // Map of roomName/roomId to occupied count
    const occupiedByRoom: Record<string, number> = {};

    for (const booking of response.documents) {
      const bookingCheckIn = new Date(booking.checkIn).getTime();
      const bookingCheckOut = new Date(booking.checkOut).getTime();

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (targetCheckIn < bookingCheckOut && targetCheckOut > bookingCheckIn) {
        // Use roomId which we saved as roomName from checkout flow
        const roomIdentifier = booking.roomId;
        if (roomIdentifier) {
          occupiedByRoom[roomIdentifier] = (occupiedByRoom[roomIdentifier] || 0) + (booking.rooms || 1);
        }
      }
    }

    return NextResponse.json({ success: true, occupied: occupiedByRoom });
  } catch (err: unknown) {
    console.error("Failed to fetch real-time availability:", err);
    return NextResponse.json({ success: false, error: 'Failed to fetch availability' }, { status: 500 });
  }
}
