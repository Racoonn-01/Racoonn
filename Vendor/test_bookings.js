import { Client, Databases, Query } from 'node-appwrite';
import 'dotenv/config';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

const databases = new Databases(client);

async function run() {
    try {
        const bookings = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            'bookings'
        );
        console.log(`Found ${bookings.documents.length} bookings.`);
        bookings.documents.slice(0, 5).forEach(b => {
             console.log(`- Booking ${b.$id}: createdAt = ${b.$createdAt}`);
        });
    } catch(err) {
        console.error(err);
    }
}
run();
