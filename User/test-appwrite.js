const { Client, Databases } = require('appwrite');
const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');
const databases = new Databases(client);

async function run() {
    const res = await databases.listDocuments('6a3cec630035d63ea963', 'bookings');
    res.documents.forEach(doc => {
        console.log(`Booking ${doc.$id}: hotelName="${doc.hotelName}", hotelImage="${doc.hotelImage ? doc.hotelImage.substring(0, 80) + '...' : 'none'}"`);
    });
}
run().catch(console.error);
