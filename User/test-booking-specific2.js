const { Client, Databases } = require('node-appwrite');
const fetch = require('node-fetch');

const client = new Client()
  .setEndpoint('https://sgp.cloud.appwrite.io/v1')
  .setProject('6a3bce6900381359c3ce')
  .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const db = new Databases(client);

(async () => {
  try {
    const booking = await db.getDocument('6a3cec630035d63ea963', 'bookings', '6aca785d0009c7e0f685');
    console.log('Hotel ID from booking:', booking.hotelId);
    
    console.log('Sending webhook...');
    const res = await fetch('http://localhost:3000/api/email/booking-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotelName: booking.hotelName || 'Royal Hotel',
        hotelLocation: booking.hotelLocation || 'Unknown',
        price: booking.totalAmount || 1000,
        nights: booking.nights || 1,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults || 2,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        bookingId: booking.$id,
        displayBookingId: booking.$id.substring(0,8).toUpperCase(),
        addonsList: [],
        gstRate: 0.18,
        gstAmount: 180,
        hotelId: booking.hotelId,
        isPackage: false
      })
    });
    
    console.log('Webhook Status:', res.status);
    console.log('Webhook Response:', await res.text());
  } catch (e) {
    console.error(e);
  }
})();
