const fs = require('fs');

const p2 = 'e:/Racoonn/Vendor/components/onboarding/Step6Media.tsx';
let data2 = fs.readFileSync(p2, 'utf8');

data2 = data2.replace(
  '<span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Min 10 Photos</span>',
  ''
);

data2 = data2.replace(
  /\{\/\* Empty slots \*\/\}[\s\S]*?\)\)\}/g,
  ''
);

fs.writeFileSync(p2, data2, 'utf8');
console.log('done');
