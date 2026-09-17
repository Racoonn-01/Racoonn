const { Client, Databases, ID } = require('appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID);

const databases = new Databases(client);

async function test() {
  try {
    const res = await fetch('http://localhost:3001/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelName: 'Test Hotel',
        price: 1000,
        nights: 1,
        checkIn: '2023-10-01',
        checkOut: '2023-10-02',
        adults: 2,
        email: 'blackrolex1144@gmail.com', // user's email from screenshot
        firstName: 'Test',
        bookingId: 'TEST1234',
        addonsList: [],
        gstRate: 18,
        gstAmount: 180
      })
    });
    const data = await res.json();
    console.log("Email API response:", data);
  } catch (err) {
    console.error(err);
  }
}
test();
