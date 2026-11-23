const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupBookingsDatabase() {
    console.log("Setting up Appwrite Bookings collections...");
    
    const dbId = process.env.APPWRITE_DATABASE_ID;

    // Helper functions
    const createCollectionIfMissing = async (colId, name) => {
        try {
            await databases.createCollection(dbId, colId, name);
            console.log(`Created collection: ${name}`);
        } catch (e) {
            if (e.code === 409) {
                console.log(`Collection ${name} already exists.`);
            } else {
                throw e;
            }
        }
    };

    const createAttrStr = async (colId, key, size = 255, required = true) => {
        try {
            await databases.createStringAttribute(dbId, colId, key, size, required);
            console.log(`Created String ${key} in ${colId}`);
        } catch (e) {
            console.log(`Skipped ${key}: ${e.message}`);
        }
    };

    const createAttrInt = async (colId, key, required = true) => {
        try {
            await databases.createIntegerAttribute(dbId, colId, key, required);
            console.log(`Created Int ${key} in ${colId}`);
        } catch (e) {
            console.log(`Skipped ${key}: ${e.message}`);
        }
    };
    
    const createAttrFloat = async (colId, key, required = true) => {
        try {
            await databases.createFloatAttribute(dbId, colId, key, required);
            console.log(`Created Float ${key} in ${colId}`);
        } catch (e) {
            console.log(`Skipped ${key}: ${e.message}`);
        }
    };

    try {
        // 1. Bookings Collection
        await createCollectionIfMissing('bookings', 'Bookings');
        await createAttrStr('bookings', 'userId', 50, true);
        await createAttrStr('bookings', 'hotelId', 50, true);
        await createAttrStr('bookings', 'roomId', 50, true);
        await createAttrStr('bookings', 'checkIn', 50, true);
        await createAttrStr('bookings', 'checkOut', 50, true);
        await createAttrInt('bookings', 'nights', true);
        await createAttrStr('bookings', 'status', 50, true); // Pending, Confirmed, Completed, Cancelled
        await createAttrStr('bookings', 'paymentStatus', 50, true); // Pending, Paid, Failed
        await createAttrStr('bookings', 'hotelName', 255, true);
        await createAttrStr('bookings', 'hotelImage', 1000, true);
        await createAttrStr('bookings', 'hotelLocation', 255, true);
        await createAttrInt('bookings', 'adults', true);
        await createAttrInt('bookings', 'children', false);

        // 2. Booking Guests Collection
        await createCollectionIfMissing('booking_guests', 'BookingGuests');
        await createAttrStr('booking_guests', 'bookingId', 50, true);
        await createAttrStr('booking_guests', 'firstName', 255, true);
        await createAttrStr('booking_guests', 'lastName', 255, true);
        await createAttrStr('booking_guests', 'email', 255, true);
        await createAttrStr('booking_guests', 'phone', 50, true);
        await createAttrStr('booking_guests', 'country', 100, true);
        await createAttrStr('booking_guests', 'specialRequests', 2000, false);

        // 3. Booking Payments Collection
        await createCollectionIfMissing('booking_payments', 'BookingPayments');
        await createAttrStr('booking_payments', 'bookingId', 50, true);
        await createAttrFloat('booking_payments', 'roomPrice', true);
        await createAttrFloat('booking_payments', 'taxes', true);
        await createAttrFloat('booking_payments', 'serviceFees', true);
        await createAttrFloat('booking_payments', 'discount', true);
        await createAttrFloat('booking_payments', 'totalAmount', true);

        console.log("✅ Bookings collections and attributes created successfully!");
    } catch (error) {
        console.error("❌ Error setting up bookings database:", error.message);
    }
}

setupBookingsDatabase();
