const fs = require('fs');
const p = 'e:/Racoonn/Vendor/components/onboarding/Step5Rooms.tsx';
let data = fs.readFileSync(p, 'utf8');

data = data.replace('photos: uploadedPhotoUrls', 'photos: [...(room.photos || []).filter(p => !p.startsWith(\'blob:\')), ...uploadedPhotoUrls]');

data = data.replace('  const addRoom = () => {', '  const removeRoom = (id: number) => {\n    if (rooms.length > 1) {\n      setRooms(rooms.filter(room => room.id !== id));\n    }\n  };\n\n  const addRoom = () => {');

data = data.replace('<button className=\"w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500\"><Edit2 className=\"w-4 h-4\" /></button>', '');
data = data.replace('<button className=\"w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-500\"><Trash2 className=\"w-4 h-4\" /></button>', '{rooms.length > 1 && <button onClick={() => removeRoom(room.id)} className=\"w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-500\"><Trash2 className=\"w-4 h-4\" /></button>}');

fs.writeFileSync(p, data, 'utf8');
console.log('done');
