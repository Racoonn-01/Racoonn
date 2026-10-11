const fs = require('fs');
const path = 'e:/Racoonn/Admin/src/components/admin/AdminPhotoManager.tsx';
let data = fs.readFileSync(path, 'utf8');

// Remove dashed border and make it look cleaner
data = data.replace('Card className="shadow-sm mt-4 border-dashed border-2"', 'Card className="shadow-sm mt-4 bg-muted/30 border-0"');

// Fix delete button visibility (remove hover requirement)
data = data.replace('opacity-0 group-hover:opacity-100', 'opacity-100');

// Make grid slightly larger for better viewing
data = data.replace('grid-cols-4 sm:grid-cols-6 gap-2', 'flex flex-wrap gap-3');
data = data.replace('aspect-square bg-muted rounded-md relative group overflow-hidden border', 'w-24 h-24 sm:w-28 sm:h-28 bg-muted rounded-xl relative group overflow-hidden shadow-sm');

fs.writeFileSync(path, data, 'utf8');
console.log('done');
