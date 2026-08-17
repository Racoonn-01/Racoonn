const { Client, Databases, Query } = require('node-appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');
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
