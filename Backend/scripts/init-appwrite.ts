import { databases } from '../appwrite/sdk';
import { ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID as string;
const DATABASE_NAME = 'RacoonnDB';

const collectionsToCreate = [
    // Authentication Extensions (Appwrite handles core Auth, but these extend it)
    'UserProfiles', 'Sessions', 'Roles',
    
    // Vendor
    'Vendors', 'VendorDocuments', 'VendorBankAccounts', 'VendorStaff',
    
    // Hotels
    'Properties', 'PropertyImages', 'PropertyAmenities', 'PropertyPolicies', 'PropertyFacilities',
    
    // Rooms
    'RoomTypes', 'Rooms', 'RoomImages', 'RoomAvailability', 'RoomPricing',
    
    // Bookings
    'Bookings', 'BookingGuests', 'BookingHistory', 'BookingInvoices', 'BookingPayments',
    
    // Payments
    'Transactions', 'Refunds', 'Payouts', 'CommissionLogs',
    
    // Customers
    'CustomerProfiles', 'Wishlists', 'SavedHotels',
    
    // Reviews
    'Reviews', 'ReviewReplies',
    
    // Support
    'Tickets', 'TicketReplies',
    
    // Marketing
    'Coupons', 'Campaigns', 'Notifications',
    
    // CMS
    'Pages', 'Blogs', 'Destinations', 'Banners',
    
    // Reports
    'RevenueReports', 'BookingReports', 'VendorReports',
    
    // Settings
    'PlatformSettings',
    
    // Logs
    'ActivityLogs', 'AuditLogs'
];

async function initAppwrite() {
    try {
        console.log(`Starting Appwrite Initialization...`);
        
        let database;
        try {
            database = await databases.get(DATABASE_ID);
            console.log(`Database ${DATABASE_NAME} (${DATABASE_ID}) already exists.`);
        } catch (error: any) {
            if (error.code === 404) {
                console.log(`Creating Database: ${DATABASE_NAME}...`);
                database = await databases.create(DATABASE_ID, DATABASE_NAME);
            } else {
                throw error;
            }
        }

        // Create collections
        for (const collectionName of collectionsToCreate) {
            try {
                // In production you might want to map these to specific IDs or generate them
                const collection = await databases.createCollection(
                    DATABASE_ID,
                    ID.unique(),
                    collectionName
                );
                console.log(`✅ Created Collection: ${collectionName} (${collection.$id})`);
                
                // Here we would typically also add attributes and indexes
                // Example:
                // await databases.createStringAttribute(DATABASE_ID, collection.$id, 'name', 255, true);
                
            } catch (error: any) {
                console.error(`❌ Failed to create collection ${collectionName}:`, error.message);
            }
        }
        
        console.log(`Appwrite Initialization Complete!`);
    } catch (error) {
        console.error('Fatal Error during initialization:', error);
    }
}

// Run if called directly
if (require.main === module) {
    initAppwrite();
}

export default initAppwrite;
