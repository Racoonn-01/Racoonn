"use server";
import { appwriteServer } from "@/lib/appwrite/server";
import { revalidatePath } from "next/cache";

export type CabOwnerData = {
  id: string;
  name: string;
  contactNo: string;
  address: string;
  status: 'active' | 'suspended';
  category?: string;
  joined: string;
  customData?: Record<string, string>;
};

export interface CabCategory {
  id?: string;
  name: string;
  customFields: string[];
}

export async function getAllCabs(): Promise<CabOwnerData[]> {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const colId = "cabs";
    
    if (!dbId) {
      console.warn("Database ID is missing.");
      return [];
    }
    
    const response = await databases.listDocuments(dbId, colId);
    
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name || 'Unknown',
      contactNo: doc.contactNo || 'N/A',
      address: doc.address || 'N/A',
      status: doc.status?.toLowerCase() === 'suspended' ? 'suspended' : 'active',
      category: doc.category,
      joined: doc.$createdAt,
      customData: doc.customData ? JSON.parse(doc.customData) : {}
    }));
  } catch (err) {
    console.error("Error fetching vendors:", err);
    return [];
  }
}

import { ID } from "node-appwrite";

export async function getCabCategories(): Promise<{ name: string, customFields: string[] }[]> {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) return [];
    
    const response = await databases.listDocuments(dbId, "cab_categories");
    
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name,
      customFields: doc.customFields || []
    }));
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export async function createCabCategory(name: string, customFields: string[]) {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) throw new Error("Database ID missing");
    
    await databases.createDocument(dbId, "cab_categories", ID.unique(), {
      name,
      customFields
    });
    
    revalidatePath("/admin/cabs");
    return { success: true };
  } catch (err) {
    console.error("Error creating category:", err);
    return { success: false, error: err };
  }
}

export async function updateCabCategory(id: string, name: string, customFields: string[]) {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) throw new Error("Database ID missing");
    
    await databases.updateDocument(dbId, "cab_categories", id, {
      name,
      customFields
    });
    
    revalidatePath("/admin/cabs");
    return { success: true };
  } catch (err) {
    console.error("Error updating category:", err);
    return { success: false, error: err };
  }
}

export async function deleteCabCategory(id: string) {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) throw new Error("Database ID missing");
    
    await databases.deleteDocument(dbId, "cab_categories", id);
    revalidatePath("/admin/cabs");
    return { success: true };
  } catch (err) {
    console.error("Error deleting category:", err);
    return { success: false, error: err };
  }
}

export async function createCab(data: Omit<CabOwnerData, 'id' | 'status' | 'joined'>) {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) throw new Error("Database ID missing");
    
    await databases.createDocument(dbId, "cabs", ID.unique(), {
      name: data.name,
      contactNo: data.contactNo,
      address: data.address,
      category: data.category || '',
      status: 'active',
      customData: data.customData ? JSON.stringify(data.customData) : null
    });
    
    revalidatePath("/admin/cabs");
    return { success: true };
  } catch (err) {
    console.error("Error creating cab:", err);
    return { success: false, error: err };
  }
}

export async function deleteCab(id: string) {
  try {
    const { databases } = appwriteServer;
    const dbId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    
    if (!dbId) throw new Error("Database ID missing");
    
    await databases.deleteDocument(dbId, "cabs", id);
    revalidatePath("/admin/cabs");
    return { success: true };
  } catch (err) {
    console.error("Error deleting cab:", err);
    return { success: false, error: err };
  }
}
