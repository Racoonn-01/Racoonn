"use server";

import { appwriteServer } from "@/lib/appwrite/server";
import { Query } from "node-appwrite";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a3cec630035d63ea963";
const REVIEWS_COLLECTION_ID = '6a59c6f526bfcf71ddbf';
const PROPERTIES_COLLECTION_ID = 'properties';

export async function getAllReviews() {
  try {
    const { databases } = appwriteServer;
    
    // Fetch all reviews
    const reviews = await databases.listDocuments(
      DATABASE_ID,
      REVIEWS_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(500)]
    );
    
    if (reviews.documents.length === 0) return [];
    
    // Extract unique property IDs
    const propertyIds = [...new Set(reviews.documents.map(r => r.propertyId))].filter(Boolean);
    
    let properties: { $id: string; name?: string; [key: string]: unknown }[] = [];
    if (propertyIds.length > 0) {
      const propertiesResponse = await databases.listDocuments(
        DATABASE_ID,
        PROPERTIES_COLLECTION_ID,
        [Query.equal('$id', propertyIds), Query.limit(100)]
      );
      properties = propertiesResponse.documents;
    }
    
    // Map reviews with property names
    return reviews.documents.map(review => {
      const prop = properties.find(p => p.$id === review.propertyId);
      const propName = prop ? (prop.propertyName || prop.title) : undefined;
      
      return {
        id: `REV-${review.$id.substring(0, 6).toUpperCase()}`,
        realId: review.$id,
        property: propName || review.propertyName || 'Unknown Property',
        author: review.userName || 'Anonymous',
        rating: review.rating || 0,
        text: review.text || 'No review text provided.',
        status: review.status || "Published", // Assuming all existing are published unless stated otherwise
        date: new Date(review.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    });
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return [];
  }
}
