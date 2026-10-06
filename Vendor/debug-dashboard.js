const { Client, Databases, Query } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);

const dbId = '6a3cec630035d63ea963'; 

async function run() {
    try {
        const bookings = await databases.listDocuments(dbId, 'bookings', [Query.limit(5), Query.orderDesc('$createdAt')]);
        console.log("Recent Bookings:");
        bookings.documents.forEach(b => console.log(`ID: ${b.$id}, hotelId: ${b.hotelId}, createdAt: ${b.$createdAt}`));
        
        const now = new Date();
        const date = new Date(bookings.documents[0].$createdAt);
        console.log("Today is:", now.toDateString(), now.toISOString());
        console.log("Booking 0 date is:", date.toDateString(), date.toISOString());
        console.log("isToday?:", date.toDateString() === now.toDateString());
    } catch(e) {
        console.error(e);
    }
}
run();
