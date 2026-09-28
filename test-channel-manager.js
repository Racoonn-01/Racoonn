// test-channel-manager.js
// This script simulates a 3rd-party Channel Manager integrating with your local API.

const API_BASE_URL = "http://localhost:3000/api/v1"; // Now hosted on the Vendor (partner) app
const MOCK_API_KEY = "rac_live_partner_4349e782ff22ab2aa15a8649dd049d239c3f3747cbfcee5e"; // Replace with a real test key from your database if authentication is enforced

async function runChannelManagerSimulation() {
  console.log("🚀 Starting Mock Channel Manager Integration Test...\n");

  const headers = {
    "Authorization": `Bearer ${MOCK_API_KEY}`,
    "Content-Type": "application/json"
  };

  try {
    // ---------------------------------------------------------
    // PHASE 1: MAPPING (Fetch Properties)
    // ---------------------------------------------------------
    console.log("📡 [PHASE 1] Fetching properties for mapping...");
    const propertiesRes = await fetch(`${API_BASE_URL}/properties`, { headers });
    
    // Note: If you haven't implemented this route yet, it might return 404.
    let properties = { data: [] };
    if (propertiesRes.ok) {
        properties = await propertiesRes.json();
        console.log("✅ Successfully fetched properties:", properties);
    } else {
        console.log(`⚠️  /properties returned ${propertiesRes.status}. (If you haven't built this endpoint yet, that's normal!)`);
    }

    // ---------------------------------------------------------
    // PHASE 2: INITIAL SYNC (Push Availability)
    // ---------------------------------------------------------
    console.log("\n📡 [PHASE 2] Pushing availability to Racoonn...");
    const availabilityPayload = {
        roomId: "TEST_ROOM_001",
        date: "2026-10-15",
        available: 5
    };
    
    // We wrap this in a try/catch in case the route doesn't exist yet
    const availRes = await fetch(`${API_BASE_URL}/availability`, {
        method: "PUT",
        headers,
        body: JSON.stringify(availabilityPayload)
    });
    
    if (availRes.ok) {
        console.log("✅ Successfully updated availability!");
    } else {
        console.log(`⚠️  /availability returned ${availRes.status}.`);
    }

    // ---------------------------------------------------------
    // PHASE 3: RESERVATION (Create a Booking)
    // ---------------------------------------------------------
    console.log("\n📡 [PHASE 3] Simulating an OTA Booking (Pushing Reservation to Racoonn)...");
    
    // Generate a random Idempotency Key so it's unique every time we run the script
    const idempotencyKey = "PMS-BOOKING-" + Math.floor(Math.random() * 100000);
    
    const reservationPayload = {
      propertyId: "TEST_PROPERTY_001",
      roomId: "TEST_ROOM_001",
      externalReference: "CHANNEX-REF-7711",
      checkIn: "2026-10-15",
      checkOut: "2026-10-18",
      adults: 2,
      guest: {
        firstName: "Rohit",
        lastName: "Sharma",
        email: "rohit@example.com",
        phone: "+919876543210"
      }
    };

    const resHeaders = { ...headers, "Idempotency-Key": idempotencyKey };

    const reservationRes = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: resHeaders,
        body: JSON.stringify(reservationPayload)
    });

    if (reservationRes.ok) {
        const data = await reservationRes.json();
        console.log(`✅ Successfully created reservation! Racoonn ID:`, data);
    } else {
        const errorText = await reservationRes.text();
        console.log(`⚠️  /reservations returned ${reservationRes.status}. Message:`, errorText);
    }

    console.log("\n📡 [PHASE 4] Fetching all reservations from Racoonn (to sync back to Channel Manager)...");
    
    // We will use the actual property ID fetched from Phase 1 so you can see your manual bookings!
    const realPropertyId = properties.data.length > 0 ? properties.data[0].id : "TEST_PROPERTY_001";
    
    const fetchReservationsRes = await fetch(`${API_BASE_URL}/reservations?propertyId=${realPropertyId}`, {
        method: "GET",
        headers: headers
    });

    if (fetchReservationsRes.ok) {
        const data = await fetchReservationsRes.json();
        console.log(`✅ Successfully fetched ${data.meta.total} reservations for property ${realPropertyId}!`);
        if (data.data.length > 0) {
            console.log(`📋 Most recent booking:`, data.data[0]);
        }
    } else {
        const errorText = await fetchReservationsRes.text();
        console.log(`⚠️  /reservations (GET) returned ${fetchReservationsRes.status}. Message:`, errorText);
    }

    console.log("\n🎉 Simulation Complete!");

  } catch (error) {
    console.error("❌ Network Error: Could not connect to localhost. Is your Next.js server running on port 3000?", error.message);
  }
}

runChannelManagerSimulation();
