const { Client, Databases, Permission, Role } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('6a3bce6900381359c3ce')
    .setKey('standard_bf0a7ce8e1bcadfa9811b580a6204a79169ccd6145f742f5d8da23c0eee0736b3ceb64239d5a188a4945132839023a4c536a74d5f3c3cec88d83e886822286b4f8675e69c0f9bdb03d368db9eca97c85d85ce2a88297c6048322b5241472183acc144485ab9ebc5dd1972f7f12b3a2604925ddc7925f2b4909f6c3423f451d31');

const databases = new Databases(client);
const dbId = '6a3cec630035d63ea963';

async function run() {
    try {
        console.log("Setting up Channel Manager DB Schema...");

        // 1. Create room_availability collection
        try {
            await databases.createCollection(
                dbId,
                'room_availability',
                'RoomAvailability',
                [Permission.read(Role.any()), Permission.write(Role.users())]
            );
            console.log("Created room_availability collection");

            // Add attributes to room_availability
            await databases.createStringAttribute(dbId, 'room_availability', 'roomId', 255, true);
            await databases.createStringAttribute(dbId, 'room_availability', 'date', 255, true); // YYYY-MM-DD
            await databases.createIntegerAttribute(dbId, 'room_availability', 'availableCount', true);
            await databases.createFloatAttribute(dbId, 'room_availability', 'price', false, 0, null, 0);
            await databases.createBooleanAttribute(dbId, 'room_availability', 'isBlocked', false, false);
            console.log("Added attributes to room_availability");
        } catch (e) {
            console.log("room_availability might already exist: " + e.message);
        }

        const addStringAttr = async (colId, key) => {
            try {
                await databases.createStringAttribute(dbId, colId, key, 255, false);
                console.log(`Created ${key} in ${colId}`);
            } catch (e) {
                console.log(`Skipped ${key} in ${colId}: ${e.message}`);
            }
        };

        // 2. Modify bookings
        await addStringAttr('bookings', 'bookingSource');
        await addStringAttr('bookings', 'otaReferenceId');

        // 3. Modify properties & rooms
        await addStringAttr('properties', 'cmPropertyId');
        await addStringAttr('rooms', 'cmRoomId');

        console.log("Done");
    } catch (err) {
        console.error("Error setting up DB:", err);
    }
}
run();
