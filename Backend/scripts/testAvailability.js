const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function testAvailability() {
    const dbId = '6a3cec630035d63ea963';
    
    try {
        // Find Golden Edit property
        const props = await databases.listDocuments(dbId, 'properties');
        const goldenEdit = props.documents.find(p => p.title === 'Golden Edit');
        if (!goldenEdit) {
            console.log("Golden Edit not found");
            return;
        }
        const propertyId = goldenEdit.$id;
        console.log("Found Property ID:", propertyId);

        // Fetch bookings for this property
        const bookings = await databases.listDocuments(dbId, 'bookings', [
            Query.equal('hotelId', propertyId),
            Query.equal('status', ['Confirmed', 'Completed'])
        ]);
        console.log("Bookings:", bookings.documents.map(b => ({ id: b.$id, room: b.roomId, in: b.checkIn, out: b.checkOut, rooms: b.rooms })));

        const targetCheckInStr = '2026-09-18';
        const targetCheckOutStr = '2026-09-19';
        
        const targetCheckIn = new Date(targetCheckInStr).getTime();
        const targetCheckOut = new Date(targetCheckOutStr).getTime();
        
        console.log("Target In:", targetCheckIn, "Out:", targetCheckOut);
        
        for (const booking of bookings.documents) {
            const bookingCheckIn = new Date(booking.checkIn).getTime();
            const bookingCheckOut = new Date(booking.checkOut).getTime();
            console.log("Booking:", booking.roomId, "In:", bookingCheckIn, "Out:", bookingCheckOut);
            console.log("Overlap logic:", targetCheckIn < bookingCheckOut, targetCheckOut > bookingCheckIn);
        }

        // Try hitting the local API route
        const url = `http://localhost:3000/api/rooms/availability?hotelId=${propertyId}&checkIn=2026-09-18&checkOut=2026-09-19`;
        console.log("Fetching API:", url);
        const res = await fetch(url);
        const json = await res.json();
        console.log("API Response:", json);
    } catch (error) {
        console.error("Error:", error);
    }
}

testAvailability();
