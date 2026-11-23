require('dotenv').config({ path: '.env.local' });
const { Client, Databases, Query } = require('node-appwrite');
const client = new Client().setEndpoint('https://sgp.cloud.appwrite.io/v1').setProject('6a3bce6900381359c3ce').setKey(process.env.APPWRITE_API_KEY);
const db = new Databases(client);

db.listDocuments('6a3cec630035d63ea963', 'bookings', [Query.limit(5), Query.orderDesc('$createdAt')]).then(res => {
  res.documents.forEach(b => console.log(b.$id, b.status, b.vendorId, b.$createdAt, b.hotelName));
}).catch(console.error);
