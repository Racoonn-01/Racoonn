const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '../.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function testApiQuery() {
    const DATABASE_ID = '6a3cec630035d63ea963';
    const hotelId = '6a4645d500061bbfb3d1';
    
    try {
        console.log("Querying for hotelId:", hotelId);
        const response = await databases.listDocuments(
            DATABASE_ID, 
            'bookings', 
            [
                Query.equal('hotelId', hotelId),
                Query.equal('status', ['Confirmed', 'Completed'])
            ]
        );
        console.log("Returned total:", response.total);
        console.log("Documents:", response.documents.map(d => ({id: d.$id, room: d.roomId, in: d.checkIn, out: d.checkOut, status: d.status})));
    } catch (error) {
        console.error("Error:", error);
    }
}

testApiQuery();
