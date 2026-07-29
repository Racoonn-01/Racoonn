import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";
import VendorsClient, { VendorData, VendorsKPI } from "./VendorsClient";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const VENDOR_COLLECTION = "6a3e0fd9da7df0d38588";

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `₹${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
};

export default async function VendorsPage() {
  let formattedVendors: VendorData[] | null = null;
  let kpi: VendorsKPI | null = null;

  try {
    const db = appwriteServer.databases;

    // Fetch all required collections
    const [vendorsReq, propertiesReq, bookingsReq, paymentsReq] = await Promise.all([
      db.listDocuments(DATABASE_ID, VENDOR_COLLECTION, [Query.limit(500), Query.orderDesc('$createdAt')]),
      db.listDocuments(DATABASE_ID, 'properties', [Query.limit(1000)]),
      db.listDocuments(DATABASE_ID, 'bookings', [Query.limit(1000)]),
      db.listDocuments(DATABASE_ID, 'booking_payments', [Query.limit(1000)])
    ]);

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let activePropertiesCount = 0;
    let pendingApprovalCount = 0;
    let newVendorsThisWeek = 0;
    let newPropertiesThisWeek = 0;
    let totalPayouts = 0;

    // Pre-calculate mappings for efficiency
    const vendorPropertiesMap: Record<string, number> = {};
    const propertyToVendorMap: Record<string, string> = {};
    
    propertiesReq.documents.forEach(prop => {
      const vendorId = prop.vendorId || prop.userId; // fallback if needed
      if (vendorId) {
        if (!vendorPropertiesMap[vendorId]) vendorPropertiesMap[vendorId] = 0;
        vendorPropertiesMap[vendorId]++;
        propertyToVendorMap[prop.$id] = vendorId;
      }
      
      if (prop.status?.toLowerCase() === 'approved' || prop.status?.toLowerCase() === 'active') {
        activePropertiesCount++;
      }
      if (new Date(prop.$createdAt) >= oneWeekAgo) {
        newPropertiesThisWeek++;
      }
    });

    const bookingToVendorMap: Record<string, string> = {};
    bookingsReq.documents.forEach(booking => {
      const vendorId = propertyToVendorMap[booking.hotelId];
      if (vendorId) {
        bookingToVendorMap[booking.$id] = vendorId;
      }
    });

    const vendorRevenueMap: Record<string, number> = {};
    paymentsReq.documents.forEach(payment => {
      const vendorId = bookingToVendorMap[payment.bookingId];
      const amount = payment.totalAmount || 0;
      totalPayouts += amount;
      if (vendorId) {
        if (!vendorRevenueMap[vendorId]) vendorRevenueMap[vendorId] = 0;
        vendorRevenueMap[vendorId] += amount;
      }
    });

    formattedVendors = vendorsReq.documents.map(vendor => {
      if (vendor.status?.toLowerCase() === 'pending') {
        pendingApprovalCount++;
      }
      if (new Date(vendor.$createdAt) >= oneWeekAgo) {
        newVendorsThisWeek++;
      }

      return {
        id: vendor.$id,
        name: vendor.businessName || vendor.firstName || "Unknown Vendor",
        email: vendor.email || "No email",
        properties: vendorPropertiesMap[vendor.$id] || 0,
        revenue: formatCurrency(vendorRevenueMap[vendor.$id] || 0),
        status: vendor.status || "Pending",
        joined: vendor.$createdAt
      };
    });

    kpi = {
      totalVendors: vendorsReq.total,
      activeProperties: activePropertiesCount,
      totalPayouts: formatCurrency(totalPayouts),
      pendingApproval: pendingApprovalCount,
      newVendorsThisWeek,
      newPropertiesThisWeek
    };

  } catch (error) {
    console.error("Error fetching vendors data:", error);
  }

  if (!formattedVendors || !kpi) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold mb-4">Error loading vendors data</h2>
        <p>Please check your database connection and credentials.</p>
      </div>
    );
  }

  return <VendorsClient vendors={formattedVendors} kpi={kpi} />;
}
