const { Client, Storage, Databases, ID, Query } = require('node-appwrite');
const { InputFile } = require('node-appwrite/file');
const sharp = require('sharp');

// Client for database (uses API Key for write access)
const dbClient = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

// Client for storage (anonymous, because bucket allows any, but API key lacks files.read/write)
const storageClient = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce');

const storage = new Storage(storageClient);
const databases = new Databases(dbClient);

const DB_ID = '6a3cec630035d63ea963';
const ROOM_COL_ID = 'rooms'; // Collection ID for rooms might be 'rooms', let's check .env
const BUCKET_ID = '6a3e398000280b2b3d20'; // Assuming room images are in the same bucket

const TARGET_PROPERTY_ID = '6ac620a5000dd74d0c0e';

async function compressImage(buffer) {
    return sharp(buffer)
        .webp({ quality: 80, effort: 4 })
        .resize({ width: 1920, withoutEnlargement: true })
        .toBuffer();
}

async function processRoom(room) {
    let photos = [...room.photos];
    let updated = false;

    console.log(`\n============================\nRoom: ${room.name} (${photos.length} photos)`);

    for (let i = 0; i < photos.length; i++) {
        let fileId = photos[i];
        
        // Extract fileId if it's a full URL
        if (fileId.startsWith('http')) {
            const match = fileId.match(/\/files\/([a-zA-Z0-9]+)\//);
            if (match && match[1]) {
                fileId = match[1];
            } else {
                continue;
            }
        }

        try {
            const fileMeta = await storage.getFile(BUCKET_ID, fileId);
            const sizeMB = fileMeta.sizeOriginal / (1024 * 1024);
            
            if (sizeMB > 5) {
                console.log(`[${i+1}/${photos.length}] Processing large file: ${fileId} (${sizeMB.toFixed(2)} MB)`);
                
                const fileArrayBuffer = await storage.getFileView(BUCKET_ID, fileId);
                const originalBuffer = Buffer.from(fileArrayBuffer);
                
                const compressedBuffer = await compressImage(originalBuffer);
                const compressedSizeMB = compressedBuffer.length / (1024 * 1024);
                
                console.log(`Compressed to ${compressedSizeMB.toFixed(2)} MB! Uploading...`);
                
                const newFilename = fileMeta.name.replace(/\.[^/.]+$/, "") + ".webp";
                const inputFile = InputFile.fromBuffer(compressedBuffer, newFilename);
                const newFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
                
                photos[i] = newFile.$id;
                updated = true;
            } else {
                console.log(`[${i+1}/${photos.length}] Skipping ${fileId} (${sizeMB.toFixed(2)} MB) - within limits.`);
            }
        } catch (err) {
            console.error(`Error processing ${fileId}:`, err.message);
        }
    }

    if (updated) {
        console.log(`Updating room document ${room.name}...`);
        await databases.updateDocument(DB_ID, ROOM_COL_ID, room.$id, {
            photos: photos
        });
        console.log(`Room updated successfully!`);
    } else {
        console.log(`No updates needed for room ${room.name}.`);
    }
}

async function run() {
    console.log(`Fetching rooms for property: ${TARGET_PROPERTY_ID}`);
    // Query rooms for this property
    let rooms = [];
    try {
        const res = await databases.listDocuments(DB_ID, ROOM_COL_ID, [
            Query.equal('propertyId', TARGET_PROPERTY_ID)
        ]);
        rooms = res.documents;
    } catch (e) {
        // If propertyId query fails, just list all rooms
        console.log('Query failed, listing all rooms. ' + e.message);
        const res = await databases.listDocuments(DB_ID, ROOM_COL_ID, [Query.limit(100)]);
        rooms = res.documents.filter(r => r.propertyId === TARGET_PROPERTY_ID || r.propertyId?.$id === TARGET_PROPERTY_ID);
    }
    
    console.log(`Found ${rooms.length} rooms for this property.`);
    
    for (const room of rooms) {
        if (!room.photos || room.photos.length === 0) continue;
        await processRoom(room);
    }
    console.log('\nAll rooms processed!');
}

run().catch(console.error);
