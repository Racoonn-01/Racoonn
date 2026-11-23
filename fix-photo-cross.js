const fs = require('fs');
const p = 'e:/Racoonn/Vendor/components/onboarding/Step5Rooms.tsx';
let data = fs.readFileSync(p, 'utf8');

const removePhotoCode = `
  const removeRoomPhoto = (roomId: number, photoIndex: number) => {
    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        const newPhotos = [...(room.photos || [])];
        const removedPhotoUrl = newPhotos[photoIndex];
        newPhotos.splice(photoIndex, 1);
        
        const newPhotoFiles = [...(room.photoFiles || [])];
        if (removedPhotoUrl && removedPhotoUrl.startsWith('blob:')) {
            const blobIndex = (room.photos || []).filter(p => p.startsWith('blob:')).indexOf(removedPhotoUrl);
            if (blobIndex !== -1 && blobIndex < newPhotoFiles.length) {
                newPhotoFiles.splice(blobIndex, 1);
            }
        }
        
        return {
          ...room,
          photos: newPhotos,
          photoFiles: newPhotoFiles
        };
      }
      return room;
    }));
  };
`;
data = data.replace('  return (\n    <motion.div ', removePhotoCode + '\n  return (\n    <motion.div ');
data = data.replace('  return (\r\n    <motion.div ', removePhotoCode + '\r\n  return (\r\n    <motion.div ');

data = data.replace(
  '                        {/* eslint-disable-next-line @next/next/no-img-element */}\n                        <img src={photo} alt="Room" className="w-full h-full object-cover" />\n                      </div>',
  '                        {/* eslint-disable-next-line @next/next/no-img-element */}\n                        <img src={photo} alt="Room" className="w-full h-full object-cover" />\n                        <button onClick={() => removeRoomPhoto(room.id, idx)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"><Trash2 className="w-3 h-3" /></button>\n                      </div>'
);
data = data.replace(
  '                        {/* eslint-disable-next-line @next/next/no-img-element */}\r\n                        <img src={photo} alt="Room" className="w-full h-full object-cover" />\r\n                      </div>',
  '                        {/* eslint-disable-next-line @next/next/no-img-element */}\r\n                        <img src={photo} alt="Room" className="w-full h-full object-cover" />\r\n                        <button onClick={() => removeRoomPhoto(room.id, idx)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors"><Trash2 className="w-3 h-3" /></button>\r\n                      </div>'
);

fs.writeFileSync(p, data, 'utf8');

const p2 = 'e:/Racoonn/Vendor/components/onboarding/Step6Media.tsx';
let data2 = fs.readFileSync(p2, 'utf8');

const removeMediaCode = `
  const removePhoto = (photoUrl: string) => {
    setPhotos(prev => prev.filter(p => p !== photoUrl));
    
    // Cleanup category mapping if needed
    setPhotoCategories(prev => {
      const newCats = { ...prev };
      delete newCats[photoUrl];
      return newCats;
    });
  };
`;
data2 = data2.replace('  return (\n    <motion.div ', removeMediaCode + '\n  return (\n    <motion.div ');
data2 = data2.replace('  return (\r\n    <motion.div ', removeMediaCode + '\r\n  return (\r\n    <motion.div ');

data2 = data2.replace(
  '                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">\n                    <span className="text-white text-xs font-bold">Cover</span>\n                  </div>\n                )}',
  '                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">\n                    <span className="text-white text-xs font-bold">Cover</span>\n                  </div>\n                )}\n                <button onClick={() => removePhoto(photo)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>'
);
data2 = data2.replace(
  '                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">\r\n                    <span className="text-white text-xs font-bold">Cover</span>\r\n                  </div>\r\n                )}',
  '                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">\r\n                    <span className="text-white text-xs font-bold">Cover</span>\r\n                  </div>\r\n                )}\r\n                <button onClick={() => removePhoto(photo)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>'
);
data2 = data2.replace(
  'import { ArrowRight, ArrowLeft, UploadCloud, Image as ImageIcon, CheckCircle, Loader2, AlertCircle } from "lucide-react";',
  'import { ArrowRight, ArrowLeft, UploadCloud, Image as ImageIcon, CheckCircle, Loader2, AlertCircle, Trash2 } from "lucide-react";'
);

fs.writeFileSync(p2, data2, 'utf8');

console.log('done');
