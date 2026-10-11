const fs = require('fs');
const path = 'e:/Racoonn/Admin/src/app/admin/properties/[id]/page.tsx';
let data = fs.readFileSync(path, 'utf8');

if (!data.includes('AdminPhotoManager')) {
  // Add import
  data = data.replace('import PhotosGallery from "./PhotosGallery";', 'import PhotosGallery from "./PhotosGallery";\nimport AdminPhotoManager from "@/components/admin/AdminPhotoManager";');

  // Insert Property Photo Manager below PhotosGallery
  const propertyManager = `
            <PhotosGallery photos={photos} />
            <AdminPhotoManager 
              title="Manage Property Photos" 
              collectionId="properties" 
              documentId={id} 
              photos={rawPhotos} 
              bucketId="${process.env.NEXT_PUBLIC_APPWRITE_PROPERTY_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20'}" 
            />
`;
  data = data.replace('<PhotosGallery photos={photos} />', propertyManager);

  // Insert Room Photo Manager below room amenities
  const roomManager = `
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {room.amenities.slice(0, 4).map((am: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-[10px] py-0">{am}</Badge>
                            ))}
                            {room.amenities.length > 4 && (
                              <Badge variant="outline" className="text-[10px] py-0">+{room.amenities.length - 4} more</Badge>
                            )}
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t">
                           <AdminPhotoManager 
                             title="Manage Room Photos" 
                             collectionId="rooms" 
                             documentId={room.$id} 
                             photos={room.photos || []} 
                             bucketId="${process.env.NEXT_PUBLIC_APPWRITE_ROOM_IMAGES_BUCKET_ID || '6a3e398000280b2b3d20'}" 
                           />
                        </div>
`;
  data = data.replace(/\{room\.amenities && room\.amenities\.length > 0 && \([\s\S]*?\}\)[\s\S]*?\}\)/, roomManager);
  
  fs.writeFileSync(path, data, 'utf8');
  console.log('Injected Photo Managers');
} else {
  console.log('Already injected');
}
