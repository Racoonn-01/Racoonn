import { Client, Databases } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a3bce6900381359c3ce');

const databases = new Databases(client);

async function run() {
    const bookings = await databases.listDocuments(
        '6a3cec630035d63ea963', // dbId
        'bookings'
    );
    console.log("Bookings:", bookings.documents.map(b => ({
        id: b.$id,
        hotelId: b.hotelId,
        status: b.status,
        checkIn: b.checkIn,
        checkOut: b.checkOut
    })));
}

run();
