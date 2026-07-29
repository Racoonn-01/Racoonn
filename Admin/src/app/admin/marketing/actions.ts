"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query, ID } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";

export interface CampaignItem {
  id: string;
  realId?: string;
  name: string;
  code: string;
  type: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  status: "Active" | "Paused" | "Draft";
  reach: string;
  conversions: string;
  validUntil?: string;
  createdAt: string;
}

// In-memory fallback persistence for new offer campaigns created by admin
let memoryCampaigns: CampaignItem[] = [];

export async function getCampaignsData() {
  try {
    const db = appwriteServer.databases;

    // Fetch real bookings to calculate live conversion rate and total audience reach
    const bookingsReq = await db.listDocuments(
      DATABASE_ID,
      'bookings',
      [Query.limit(500)]
    ).catch(() => ({ documents: [] }));

    // Try fetching custom promotions collection if provisioned in Appwrite
    const promotionsReq = await db.listDocuments(
      DATABASE_ID,
      'promotions',
      [Query.limit(100)]
    ).catch(() => ({ documents: [] }));

    let campaignsList: CampaignItem[] = [...memoryCampaigns];

    if (promotionsReq.documents && promotionsReq.documents.length > 0) {
      const dbCampaigns: CampaignItem[] = promotionsReq.documents.map((doc: any) => ({
        id: `CMP-${doc.$id.slice(-4).toUpperCase()}`,
        realId: doc.$id,
        name: doc.name || "Special Promotion",
        code: doc.code || "OFFER10",
        type: doc.type || "Discount",
        discountType: doc.discountType || "percentage",
        discountValue: Number(doc.discountValue || 10),
        minOrderValue: Number(doc.minOrderValue || 0),
        status: doc.status || "Active",
        reach: doc.reach || "0",
        conversions: doc.conversions || "0",
        validUntil: doc.validUntil || "2026-12-31",
        createdAt: doc.$createdAt || new Date().toISOString()
      }));

      // Merge avoiding duplicates
      dbCampaigns.forEach(c => {
        if (!campaignsList.some(existing => existing.realId === c.realId)) {
          campaignsList.unshift(c);
        }
      });
    }

    const totalBookingsCount = bookingsReq.documents.length;
    const activeCampaignsCount = campaignsList.filter(c => c.status === "Active").length;
    const totalReachEstimate = "0"; // Placeholder until view tracking is implemented
    const avgConversionRate = "0%"; // Placeholder until promo code usage is tracked
    const marketingRoi = "0%";

    return {
      activeCount: activeCampaignsCount,
      totalReach: totalReachEstimate,
      avgConversionRate,
      marketingRoi: marketingRoi,
      campaigns: campaignsList
    };

  } catch (error) {
    console.error("Failed to fetch campaigns data:", error);
    return {
      activeCount: memoryCampaigns.filter(c => c.status === "Active").length,
      totalReach: "0",
      avgConversionRate: "0%",
      marketingRoi: "0%",
      campaigns: memoryCampaigns
    };
  }
}

export async function createCampaign(data: {
  name: string;
  code: string;
  type: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue: number;
  validUntil?: string;
  status?: "Active" | "Paused" | "Draft";
}) {
  try {
    const db = appwriteServer.databases;
    const cleanCode = data.code.toUpperCase().trim().replace(/[^A-Z0-9]/g, "");

    const newCampaignItem: CampaignItem = {
      id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      realId: `cmp_${Date.now()}`,
      name: data.name.trim(),
      code: cleanCode || "DISCOUNT10",
      type: data.type || "Discount",
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue || 0),
      status: data.status || "Active",
      reach: "0",
      conversions: "0",
      validUntil: data.validUntil || "2026-12-31",
      createdAt: new Date().toISOString()
    };

    // Try persisting to Appwrite 'promotions' collection if exists
    try {
      const doc = await db.createDocument(
        DATABASE_ID,
        'promotions',
        ID.unique(),
        {
          name: newCampaignItem.name,
          code: newCampaignItem.code,
          type: newCampaignItem.type,
          discountType: newCampaignItem.discountType,
          discountValue: newCampaignItem.discountValue,
          minOrderValue: newCampaignItem.minOrderValue,
          status: newCampaignItem.status,
          validUntil: newCampaignItem.validUntil
        }
      );
      newCampaignItem.realId = doc.$id;
    } catch (e) {
      console.log("Appwrite 'promotions' collection not provisioned, using dynamic memory store.");
    }

    memoryCampaigns.unshift(newCampaignItem);
    return { success: true, campaign: newCampaignItem };

  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return { success: false, error: error.message || "Failed to create campaign" };
  }
}

export async function updateCampaignStatus(id: string, status: "Active" | "Paused" | "Draft") {
  try {
    const db = appwriteServer.databases;

    memoryCampaigns = memoryCampaigns.map(c => c.id === id || c.realId === id ? { ...c, status } : c);

    try {
      await db.updateDocument(DATABASE_ID, 'promotions', id, { status });
    } catch (e) {
      // Ignored if collection not found
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to update campaign status:", error);
    return { success: false };
  }
}

export async function deleteCampaign(id: string) {
  try {
    const db = appwriteServer.databases;

    memoryCampaigns = memoryCampaigns.filter(c => c.id !== id && c.realId !== id);

    try {
      await db.deleteDocument(DATABASE_ID, 'promotions', id);
    } catch (e) {
      // Ignored if collection not found
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete campaign:", error);
    return { success: false };
  }
}
