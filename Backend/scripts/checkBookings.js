const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function listBookings() {
    const dbId = '6a3cec630035d63ea963';
    const bookingColId = 'bookings';

    try {
        const response = await databases.listDocuments(dbId, bookingColId, [
            require('node-appwrite').Query.orderDesc('$createdAt'),
            require('node-appwrite').Query.limit(5)
        ]);
        console.log("Latest Bookings:");
        response.documents.forEach(doc => {
            console.log(`Booking: ID=${doc.$id}, Hotel=${doc.hotelId}, Room=${doc.roomId}, Status=${doc.status}, Rooms=${doc.rooms}, CheckIn=${doc.checkIn}, CheckOut=${doc.checkOut}`);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

listBookings();
