const { Client, Databases, Query } = require('node-appwrite');
require('dotenv').config({ path: '../Vendor/.env.local' });
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function run() {
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    // Get packages
    const fs = require('fs');
    let packages = [];
    try {
        const pkgData = fs.readFileSync('/Users/haldwani/Documents/Working/Working/Racoonn/packages_cms.json', 'utf8');
        packages = JSON.parse(pkgData);
    } catch(e) {}
    
    // Get all bookings
    const res = await databases.listDocuments(dbId, 'bookings', [Query.limit(100)]);
    console.log(`Found ${res.documents.length} bookings`);
    
    for (const doc of res.documents) {
        if (doc.hotelImage && doc.hotelImage.includes('unsplash.com')) {
            console.log(`Booking ${doc.$id} has unsplash image. hotelId: ${doc.hotelId}, roomId: ${doc.roomId}`);
            let newImage = null;
            
            // Is it a package?
            if (doc.hotelId && doc.hotelId.startsWith('pkg-')) {
                const pkgId = doc.hotelId.replace('pkg-', '');
                const pkg = packages.find(p => String(p.id) === pkgId);
                if (pkg && pkg.images && pkg.images.length > 0) {
                    newImage = pkg.images[0];
                }
            } else {
                // It's a hotel/room
                try {
                    const hotel = await databases.getDocument(dbId, 'properties', doc.hotelId);
                    if (hotel && hotel.images && hotel.images.length > 0) {
                        newImage = hotel.images[0];
                    }
                } catch(e) {
                    console.log(`Could not find hotel ${doc.hotelId}`);
                }
            }
            
            if (newImage) {
                console.log(`Updating booking ${doc.$id} with new image: ${newImage.substring(0, 50)}...`);
                await databases.updateDocument(dbId, 'bookings', doc.$id, { hotelImage: newImage });
            }
        }
    }
    console.log("Done");
}
run().catch(console.error);
