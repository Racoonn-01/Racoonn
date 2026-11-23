const fs = require('fs');
const path = 'e:/Racoonn/Vendor/app/vendor/(dashboard)/bookings/page.tsx';
let data = fs.readFileSync(path, 'utf8');

const target = `const parts = selectedBooking.specialRequests.split('--- Additional Travelers ---');
                      const specialReqs = parts[0]?.trim();
                      const travelers = parts[1]?.trim();`;

const replacement = `const parts = selectedBooking.specialRequests.split('--- Additional Travelers ---');
                      let specialReqs = parts[0]?.trim() || '';
                      specialReqs = specialReqs.replace(/\\[GST Info:.*?\\]/g, '').trim();
                      const travelers = parts[1]?.trim();`;

if (data.includes(target)) {
  data = data.replace(target, replacement);
  fs.writeFileSync(path, data, 'utf8');
  console.log('Fixed special requests display');
} else {
  console.log('Target string not found');
}
