const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cron/abandoned-checkout',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test_secret_123'
  }
};

console.log('Simulating Vercel Cron Job...');
console.log('Hitting http://localhost:3000/api/cron/abandoned-checkout');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\nStatus Code: ${res.statusCode}`);
    console.log(`Response: ${data}`);
  });
});

req.on('error', (error) => {
  console.error('\nError hitting API (Is your Next.js server running on port 3000?):');
  console.error(error.message);
});

req.end();
