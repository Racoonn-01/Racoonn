const fs = require('fs');
const path = 'e:/Racoonn/Admin/src/app/admin/properties/[id]/page.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(/<div className="w-full sm:w-64 shrink-0 flex gap-3 overflow-x-auto snap-x pb-2"[\s\S]*?<\/div>\s*<div className="flex-1 space-y-2">/g, '<div className="flex-1 space-y-2">');

data = data.replace(/<PhotosGallery photos=\{photos\} \/>/g, '');

fs.writeFileSync(path, data, 'utf8');
console.log('done');
