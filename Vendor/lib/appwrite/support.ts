import { ID, Query } from "appwrite";
import { appwriteConfig, databases } from "./client";

export async function createSupportTicket(data: {
    subject: string;
    category: string;
    description: string;
    vendorId: string;
}) {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ticketsCollectionId,
            ID.unique(),
            {
                ...data,
                status: "Open"
            }
        );
        return response;
    } catch (error) {
        console.error("Error creating support ticket:", error);
        throw error;
    }
}

export async function getVendorTickets(vendorId: string) {
    if (!vendorId) return [];
    
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ticketsCollectionId,
            [
                Query.equal("vendorId", vendorId),
                Query.orderDesc("$createdAt"),
                Query.limit(100)
            ]
        );
        return response.documents;
    } catch (error) {
        console.error("Error fetching vendor tickets:", error);
        return [];
    }
}

export async function submitTicketReview(ticketId: string, rating: number, review: string) {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ticketsCollectionId,
            ticketId,
            {
                rating,
                review
            }
        );
        return response;
    } catch (error) {
        console.error("Error submitting ticket review:", error);
        throw error;
    }
}
