import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import PropertiesClient, { PropertyData, PropertiesKPI } from "./PropertiesClient";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";

export default async function PropertiesPage() {
  let properties: PropertyData[] | null = null;
  let kpi: PropertiesKPI | null = null;

  try {
    const db = appwriteServer.databases;

    // Fetch properties, vendors, and rooms concurrently
    const [propertiesReq, vendorsReq, roomsReq] = await Promise.all([
      db.listDocuments(DATABASE_ID, 'properties', [Query.limit(1000), Query.orderDesc('$createdAt')]),
      db.listDocuments(DATABASE_ID, VENDOR_COLLECTION, [Query.limit(1000)]),
      db.listDocuments(DATABASE_ID, 'rooms', [Query.limit(5000)])
    ]);

    const vendorMap: Record<string, string> = {};
    vendorsReq.documents.forEach(vendor => {
      vendorMap[vendor.$id] = vendor.businessName || vendor.firstName || "Unknown Vendor";
    });

    const propertyRoomsMap: Record<string, number> = {};
    const propertyPriceMap: Record<string, number> = {};

    roomsReq.documents.forEach(room => {
      const propId = room.propertyId;
      if (propId) {
        if (!propertyRoomsMap[propId]) propertyRoomsMap[propId] = 0;
        propertyRoomsMap[propId] += 1; // Or add occupancy/quantity if a room document represents multiple actual rooms, but usually it's just 1 room type or room.
        
        const price = room.discountPrice && room.discountPrice > 0 ? room.discountPrice : room.price;
        if (price) {
          if (!propertyPriceMap[propId] || price < propertyPriceMap[propId]) {
            propertyPriceMap[propId] = price;
          }
        }
      }
    });

    let totalActiveProperties = 0;
    let pendingReview = 0;
    let newActiveThisWeek = 0;
    let totalRatingSum = 0;
    let ratingCount = 0;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    properties = propertiesReq.documents.map(p => {
      const status = p.status || 'Pending';
      const isApprovedOrActive = status.toLowerCase() === 'approved' || status.toLowerCase() === 'active';
      
      if (isApprovedOrActive) {
        totalActiveProperties++;
        if (new Date(p.$createdAt) >= oneWeekAgo) {
          newActiveThisWeek++;
        }
      }
      if (status.toLowerCase() === 'pending') {
        pendingReview++;
      }
      
      const rating = p.rating || 0;
      if (rating > 0) {
        totalRatingSum += rating;
        ratingCount++;
      }

      const vendorId = p.vendorId || p.userId;
      
      let priceDisplay = "N/A";
      const actualPrice = p.price || propertyPriceMap[p.$id];
      if (actualPrice) {
        priceDisplay = `₹${actualPrice}/night`;
      }

      return {
        id: p.$id,
        name: p.propertyName || p.title || "Unnamed Property",
        vendor: vendorId ? (vendorMap[vendorId] || "Unknown Vendor") : "No Vendor",
        location: [p.city, p.state].filter(Boolean).join(", ") || p.location || "Location not set",
        type: p.propertyType || "Property",
        price: priceDisplay,
        rating: rating,
        status: status,
        rooms: propertyRoomsMap[p.$id] || 0,
        imageUrl: p.imageUrl || (p.photos && p.photos.length > 0 ? p.photos[0] : undefined)
      };
    });

    const avgRating = ratingCount > 0 ? (totalRatingSum / ratingCount).toFixed(2) : "0.00";
    
    kpi = {
      totalActiveProperties,
      newActiveThisWeek,
      pendingReview,
      avgRating,
      totalReviews: 0
    };
    
    // Quick calculate total reviews if reviewsCount exists
    kpi.totalReviews = propertiesReq.documents.reduce((acc, p) => acc + (p.reviewsCount || 0), 0);

  } catch (error) {
    console.error("Error fetching properties data:", error);
  }

  if (!properties || !kpi) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error loading properties data</h2>
        <p>Please check your database connection and credentials.</p>
      </div>
    );
  }

  return <PropertiesClient properties={properties} kpi={kpi} />;
}
