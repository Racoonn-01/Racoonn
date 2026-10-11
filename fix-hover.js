const fs = require('fs');

const p2 = 'e:/Racoonn/Vendor/components/onboarding/Step6Media.tsx';
let data2 = fs.readFileSync(p2, 'utf8');

data2 = data2.replace('opacity-0 group-hover:opacity-100', 'opacity-100');
data2 = data2.replace('opacity-0 group-hover:opacity-100', 'opacity-100'); // in case of multiples

fs.writeFileSync(p2, data2, 'utf8');
console.log('done');
