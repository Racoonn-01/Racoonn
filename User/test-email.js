const http = require('http');
fetch('http://localhost:3000/api/email/booking-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hotelName: 'Test Hotel',
    hotelLocation: 'Test Location',
    price: 1000,
    nights: 1,
    checkIn: '2023-10-01',
    checkOut: '2023-10-02',
    adults: 2,
    email: 'test@example.com',
    firstName: 'Test',
    bookingId: 'TEST1234',
    addonsList: [],
    gstRate: 18,
    gstAmount: 180
  })
}).then(res => res.json()).then(console.log).catch(console.error);
