const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setPermissions() {
    console.log("Setting up Appwrite Bookings collections permissions...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;
    
    const permissions = [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
    ];

    try {
        await databases.updateCollection(dbId, 'bookings', 'Bookings', permissions, true); // true = document level security enabled
        console.log("✅ Updated permissions for 'bookings' collection.");
        
        await databases.updateCollection(dbId, 'booking_guests', 'BookingGuests', permissions, true);
        console.log("✅ Updated permissions for 'booking_guests' collection.");
        
        await databases.updateCollection(dbId, 'booking_payments', 'BookingPayments', permissions, true);
        console.log("✅ Updated permissions for 'booking_payments' collection.");
        
    } catch (error) {
        console.error("❌ Error setting up permissions:", error.message);
    }
}

setPermissions();
